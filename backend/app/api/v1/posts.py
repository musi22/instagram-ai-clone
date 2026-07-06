import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import json

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User, Post
from app.repositories.post_repo import post_repo
from app.services.storage_service import storage_service
from app.services.ai_service import ai_service
from app.schemas.post_schemas import PostResponse, CommentResponse, CommentCreate
from qdrant_client import QdrantClient
from app.core.config import settings

router = APIRouter()

# Initialize Qdrant collection
qdrant_client = None
COLLECTION_NAME = "instagram_posts"

try:
    qdrant_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    # Ensure collection exists
    collections = qdrant_client.get_collections().collections
    if not any(c.name == COLLECTION_NAME for c in collections):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config={"size": 384, "distance": "Cosine"}
        )
except Exception as e:
    print(f"Warning: Qdrant client connection error in posts router: {e}")

async def build_post_response(
    db: AsyncSession,
    post: Post,
    current_user: User,
    saved_ids: List[uuid.UUID],
    following_ids: List[uuid.UUID],
    qdrant_payloads: Optional[dict] = None
) -> PostResponse:
    """Helper to convert db model and enrich it with Qdrant payloads and AI score."""
    post_id_str = str(post.id)
    
    # Try fetching AI data from Qdrant
    ai_tags = []
    ai_moderation = {"flag": False, "toxicityScore": 2.0, "category": "Clean"}
    ai_caption_ideas = []
    
    if qdrant_payloads is not None:
        payload = qdrant_payloads.get(post_id_str)
        if payload:
            ai_tags = payload.get("tags", [])
            ai_moderation = {
                "flag": payload.get("moderation_flag", False),
                "toxicityScore": payload.get("toxicity_score", 2.0),
                "category": payload.get("moderation_category", "Clean")
            }
            ai_caption_ideas = payload.get("caption_ideas", [])
    elif qdrant_client:
        try:
            points = qdrant_client.retrieve(collection_name=COLLECTION_NAME, ids=[post_id_str])
            if points:
                payload = points[0].payload
                ai_tags = payload.get("tags", [])
                ai_moderation = {
                    "flag": payload.get("moderation_flag", False),
                    "toxicityScore": payload.get("toxicity_score", 2.0),
                    "category": payload.get("moderation_category", "Clean")
                }
                ai_caption_ideas = payload.get("caption_ideas", [])
        except Exception as e:
            print(f"Warning: Failed to fetch Qdrant payload for post {post_id_str}: {e}")
            
    # Fallback if Qdrant didn't have data
    if not ai_tags:
        # Extract hashtags from caption
        ai_tags = re.findall(r"#(\w+)", post.caption or "")
        if not ai_tags:
            ai_tags = ["creative", "lifestyle"]
            
    # Calculate AI recommendation feed score (simulation)
    # Base relevance
    score = 75
    # Follow proximity
    if post.user_id in following_ids:
        score += 15
    # Owner proximity
    if post.user_id == current_user.id:
        score += 10
    # Like engagement
    is_liked = any(like.user_id == current_user.id for like in post.likes)
    if is_liked:
        score += 5
    # Cap between 1 and 99
    score = max(1, min(99, score))
    
    # Transform owner
    owner_dict = {
        "id": post.owner.id,
        "username": post.owner.username,
        "full_name": post.owner.full_name,
        "profile_pic_url": post.owner.profile_pic_url,
        "is_verified": post.owner.is_verified
    }
    
    # Transform media
    media_list = []
    for m in post.media:
        media_list.append({
            "id": m.id,
            "media_url": m.media_url,
            "media_type": m.media_type,
            "order": m.order
        })
        
    # Transform comments
    comments_list = []
    for c in post.comments:
        comments_list.append({
            "id": c.id,
            "user_id": c.user_id,
            "post_id": c.post_id,
            "text": c.text,
            "parent_id": c.parent_id,
            "created_at": c.created_at,
            "user": {
                "id": c.user.id,
                "username": c.user.username,
                "full_name": c.user.full_name,
                "profile_pic_url": c.user.profile_pic_url,
                "is_verified": c.user.is_verified
            }
        })
        
    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        caption=post.caption,
        location=post.location,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner=owner_dict,
        media=media_list,
        comments=comments_list,
        likes_count=len(post.likes),
        is_liked=is_liked,
        is_saved=post.id in saved_ids,
        ai_score=score,
        ai_tags=ai_tags,
        ai_moderation=ai_moderation,
        ai_caption_ideas=ai_caption_ideas
    )

@router.get("/", response_model=List[PostResponse])
async def get_feed(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the main feed of posts."""
    posts = await post_repo.get_feed_posts(db)
    saved_ids = await post_repo.get_saved_post_ids(db, current_user.id)
    following_ids = await post_repo.get_following_ids(db, current_user.id)
    
    # Batch retrieve Qdrant payloads to prevent N+1 queries
    qdrant_payloads = {}
    if qdrant_client and posts:
        try:
            post_ids_str = [str(post.id) for post in posts]
            points = qdrant_client.retrieve(collection_name=COLLECTION_NAME, ids=post_ids_str)
            for p in points:
                if p.payload:
                    qdrant_payloads[p.id] = p.payload
        except Exception as e:
            print(f"Warning: Failed to batch fetch Qdrant payloads: {e}")
            
    responses = []
    for post in posts:
        resp = await build_post_response(db, post, current_user, saved_ids, following_ids, qdrant_payloads)
        responses.append(resp)
        
    # Sort posts by relevance score descending
    responses.sort(key=lambda x: x.ai_score, reverse=True)
    return responses

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    tags: Optional[str] = Form("[]"),
    image_desc: Optional[str] = Form(""),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload post media and save post info, indexing metadata in Qdrant."""
    try:
        tags_list = json.loads(tags or "[]")
    except Exception:
        tags_list = []
        
    # Read file content and upload to MinIO
    file_bytes = await file.read()
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"posts/{uuid.uuid4()}.{file_extension}"
    
    # Upload to storage
    media_url = storage_service.upload_file(file_bytes, unique_filename, file.content_type)
    
    # Run AI safety scan
    moderation = ai_service.moderate_content(caption or "", image_desc or "")
    caption_ideas = ai_service.generate_caption_ideas(image_desc or "")
    
    # Save post in PostgreSQL
    post = await post_repo.create_post(
        db, 
        user_id=current_user.id, 
        caption=caption, 
        location=location, 
        media_url=media_url
    )
    
    # Seed embeddings and metadata payload in Qdrant
    if qdrant_client:
        search_text = f"{caption or ''} {location or ''} {' '.join(tags_list)} {image_desc or ''}".strip()
        embedding = ai_service.generate_embeddings(search_text)
        try:
            qdrant_client.upsert(
                collection_name=COLLECTION_NAME,
                points=[{
                    "id": str(post.id),
                    "vector": embedding,
                    "payload": {
                        "post_id": str(post.id),
                        "caption": caption or "",
                        "tags": tags_list,
                        "moderation_flag": moderation["flag"],
                        "toxicity_score": moderation["toxicityScore"],
                        "moderation_category": moderation["category"],
                        "caption_ideas": caption_ideas
                    }
                }]
            )
        except Exception as e:
            print(f"Warning: Failed to upload post to Qdrant search index: {e}")
            
    saved_ids = await post_repo.get_saved_post_ids(db, current_user.id)
    following_ids = await post_repo.get_following_ids(db, current_user.id)
    
    return await build_post_response(db, post, current_user, saved_ids, following_ids)

@router.post("/{post_id}/like", response_model=dict)
async def toggle_like(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle liking a post."""
    post = await post_repo.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
    liked = await post_repo.toggle_like(db, current_user.id, post_id)
    return {"liked": liked}

@router.post("/{post_id}/save", response_model=dict)
async def toggle_save(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle saving a post to bookmarks."""
    post = await post_repo.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
    saved = await post_repo.toggle_save(db, current_user.id, post_id)
    return {"saved": saved}

@router.post("/{post_id}/comments", response_model=CommentResponse)
async def add_comment(
    post_id: uuid.UUID,
    body: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Comment on a post."""
    post = await post_repo.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
    comment = await post_repo.add_comment(
        db,
        user_id=current_user.id,
        post_id=post_id,
        text=body.text,
        parent_id=body.parent_id
    )
    
    owner_dict = {
        "id": comment.user.id,
        "username": comment.user.username,
        "full_name": comment.user.full_name,
        "profile_pic_url": comment.user.profile_pic_url,
        "is_verified": comment.user.is_verified
    }
    
    return CommentResponse(
        id=comment.id,
        user_id=comment.user_id,
        post_id=comment.post_id,
        text=comment.text,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        user=owner_dict
    )

@router.post("/users/{user_id}/follow", response_model=dict)
async def toggle_follow(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Follow or unfollow a user."""
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself")
        
    followed = await post_repo.toggle_follow(db, current_user.id, user_id)
    return {"followed": followed}
