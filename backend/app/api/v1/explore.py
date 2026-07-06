import uuid
import re
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from qdrant_client import QdrantClient

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User, Post
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter()

COLLECTION_NAME = "instagram_posts"
qdrant_client = None

try:
    qdrant_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
except Exception as e:
    print(f"Warning: Qdrant client connection error in explore router: {e}")

@router.get("/")
async def get_explore(
    query: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve explore grid items. Performs Qdrant semantic vector search if a query is provided."""
    
    # 1. Fetch all posts to map them later
    stmt = (
        select(Post)
        .options(
            selectinload(Post.media),
            selectinload(Post.likes),
            selectinload(Post.comments)
        )
    )
    result = await db.execute(stmt)
    all_posts = {str(post.id): post for post in result.scalars().all()}
    
    explore_results = []
    
    # 2. If semantic query is supplied and Qdrant is connected
    if query and query.strip() and qdrant_client:
        try:
            query_vector = ai_service.generate_embeddings(query)
            search_results = qdrant_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=15
            )
            
            for res in search_results:
                post_id = res.payload.get("post_id")
                if post_id in all_posts:
                    post = all_posts[post_id]
                    # Score is typically cosine similarity (0.0 to 1.0)
                    similarity_pct = int(res.score * 100)
                    
                    media_url = post.media[0].media_url if post.media else ""
                    
                    explore_results.append({
                        "id": str(post.id),
                        "imageUrl": media_url,
                        "tags": res.payload.get("tags", []),
                        "likes": len(post.likes),
                        "comments": len(post.comments),
                        "similarity": similarity_pct
                    })
            return explore_results
        except Exception as e:
            print(f"Warning: Semantic search in Qdrant failed: {e}")
            
    # 3. Fallback / Default Explore Feed (No Query, or Qdrant Offline)
    # Sort posts by engagement (likes + comments) descending
    posts_list = list(all_posts.values())
    posts_list.sort(key=lambda p: len(p.likes) + len(p.comments), reverse=True)
    
    for post in posts_list:
        # If fallback text query filtering is needed
        if query and query.strip():
            q = query.lower()
            caption_text = (post.caption or "").lower()
            if q not in caption_text:
                continue
                
        media_url = post.media[0].media_url if post.media else ""
        
        # Try fetching tags from Qdrant if online, otherwise extract from hashtags or use default
        tags = []
        if qdrant_client:
            try:
                pts = qdrant_client.retrieve(collection_name=COLLECTION_NAME, ids=[str(post.id)])
                if pts:
                    tags = pts[0].payload.get("tags", [])
            except Exception:
                pass
                
        if not tags:
            tags = re.findall(r"#(\w+)", post.caption or "")
            if not tags:
                tags = ["explore", "clone"]
                
        explore_results.append({
            "id": str(post.id),
            "imageUrl": media_url,
            "tags": tags,
            "likes": len(post.likes),
            "comments": len(post.comments),
            "similarity": None
        })
        
    return explore_results
