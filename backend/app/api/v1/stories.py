import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import redis

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User, Story
from app.services.storage_service import storage_service
from app.schemas.post_schemas import StoryResponse
from app.core.config import settings

router = APIRouter()

# Initialize Redis client
redis_client = None
try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Redis connection failed in stories router: {e}")

@router.get("/", response_model=List[StoryResponse])
async def get_stories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve active stories that haven't expired yet."""
    now = datetime.utcnow()
    stmt = (
        select(Story)
        .filter(Story.expires_at > now)
        .options(selectinload(Story.user))
        .order_by(Story.created_at.asc())
    )
    result = await db.execute(stmt)
    stories = result.scalars().all()
    
    responses = []
    for story in stories:
        is_viewed = False
        if redis_client:
            try:
                is_viewed = redis_client.sismember(f"user:{current_user.id}:viewed_stories", str(story.id))
            except Exception:
                pass
                
        owner_dict = {
            "id": story.user.id,
            "username": story.user.username,
            "full_name": story.user.full_name,
            "profile_pic_url": story.user.profile_pic_url,
            "is_verified": story.user.is_verified
        }
        
        responses.append(StoryResponse(
            id=story.id,
            user_id=story.user_id,
            media_url=story.media_url,
            media_type=story.media_type,
            created_at=story.created_at,
            expires_at=story.expires_at,
            user=owner_dict,
            is_viewed=is_viewed
        ))
        
    return responses

@router.post("/", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload media and create a new story (active for 24 hours)."""
    file_bytes = await file.read()
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"stories/{uuid.uuid4()}.{file_extension}"
    
    media_url = storage_service.upload_file(file_bytes, unique_filename, file.content_type)
    
    now = datetime.utcnow()
    expires = now + timedelta(hours=24)
    
    db_story = Story(
        user_id=current_user.id,
        media_url=media_url,
        media_type="image",
        created_at=now,
        expires_at=expires
    )
    
    db.add(db_story)
    await db.commit()
    await db.refresh(db_story)
    
    # Load with user info
    stmt = select(Story).filter(Story.id == db_story.id).options(selectinload(Story.user))
    result = await db.execute(stmt)
    story = result.scalars().first()
    
    owner_dict = {
        "id": story.user.id,
        "username": story.user.username,
        "full_name": story.user.full_name,
        "profile_pic_url": story.user.profile_pic_url,
        "is_verified": story.user.is_verified
    }
    
    return StoryResponse(
        id=story.id,
        user_id=story.user_id,
        media_url=story.media_url,
        media_type=story.media_type,
        created_at=story.created_at,
        expires_at=story.expires_at,
        user=owner_dict,
        is_viewed=False
    )

@router.post("/{story_id}/view", response_model=dict)
async def view_story(
    story_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a story as viewed by the current user."""
    stmt = select(Story).filter(Story.id == story_id)
    result = await db.execute(stmt)
    story = result.scalars().first()
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
        
    if redis_client:
        try:
            redis_client.sadd(f"user:{current_user.id}:viewed_stories", str(story_id))
        except Exception as e:
            print(f"Warning: Failed to log story view in Redis: {e}")
            
    return {"viewed": True}
