import uuid
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.models import Post, PostMedia, Like, Comment, SavedPost, Follow

class PostRepository:
    async def get_feed_posts(self, db: AsyncSession) -> List[Post]:
        """Fetch all posts with eager relationships loaded, sorted by creation date."""
        stmt = (
            select(Post)
            .options(
                selectinload(Post.owner),
                selectinload(Post.media),
                selectinload(Post.likes),
                selectinload(Post.comments).selectinload(Comment.user)
            )
            .order_by(Post.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_post_by_id(self, db: AsyncSession, post_id: uuid.UUID) -> Optional[Post]:
        """Fetch a single post by UUID."""
        stmt = (
            select(Post)
            .filter(Post.id == post_id)
            .options(
                selectinload(Post.owner),
                selectinload(Post.media),
                selectinload(Post.likes),
                selectinload(Post.comments).selectinload(Comment.user)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create_post(
        self, db: AsyncSession, user_id: uuid.UUID, caption: Optional[str], location: Optional[str], media_url: str
    ) -> Post:
        """Create a new post and its media entry in the database."""
        db_post = Post(
            user_id=user_id,
            caption=caption,
            location=location
        )
        db.add(db_post)
        await db.flush() # Populate db_post.id
        
        db_media = PostMedia(
            post_id=db_post.id,
            media_url=media_url,
            media_type="image",
            order=0
        )
        db.add(db_media)
        await db.commit()
        
        # Reload with relationships
        return await self.get_post_by_id(db, db_post.id)

    async def toggle_like(self, db: AsyncSession, user_id: uuid.UUID, post_id: uuid.UUID) -> bool:
        """Toggle like state on a post. Returns True if liked, False if unliked."""
        stmt = select(Like).filter(Like.user_id == user_id, Like.post_id == post_id)
        result = await db.execute(stmt)
        db_like = result.scalars().first()
        
        if db_like:
            await db.execute(delete(Like).filter(Like.user_id == user_id, Like.post_id == post_id))
            await db.commit()
            return False
        else:
            db_like = Like(user_id=user_id, post_id=post_id)
            db.add(db_like)
            await db.commit()
            return True

    async def toggle_save(self, db: AsyncSession, user_id: uuid.UUID, post_id: uuid.UUID) -> bool:
        """Toggle saved status of a post. Returns True if saved, False if unsaved."""
        stmt = select(SavedPost).filter(SavedPost.user_id == user_id, SavedPost.post_id == post_id)
        result = await db.execute(stmt)
        db_save = result.scalars().first()
        
        if db_save:
            await db.execute(delete(SavedPost).filter(SavedPost.user_id == user_id, SavedPost.post_id == post_id))
            await db.commit()
            return False
        else:
            db_save = SavedPost(user_id=user_id, post_id=post_id)
            db.add(db_save)
            await db.commit()
            return True

    async def get_saved_post_ids(self, db: AsyncSession, user_id: uuid.UUID) -> List[uuid.UUID]:
        """Fetch list of post UUIDs that a user has saved."""
        stmt = select(SavedPost.post_id).filter(SavedPost.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def add_comment(
        self, db: AsyncSession, user_id: uuid.UUID, post_id: uuid.UUID, text: str, parent_id: Optional[uuid.UUID] = None
    ) -> Comment:
        """Add a comment to a post."""
        db_comment = Comment(
            user_id=user_id,
            post_id=post_id,
            text=text,
            parent_id=parent_id
        )
        db.add(db_comment)
        await db.commit()
        await db.refresh(db_comment)
        
        # Load with user info
        stmt = select(Comment).filter(Comment.id == db_comment.id).options(selectinload(Comment.user))
        result = await db.execute(stmt)
        return result.scalars().first()

    async def toggle_follow(self, db: AsyncSession, follower_id: uuid.UUID, following_id: uuid.UUID) -> bool:
        """Toggle follow/unfollow connection. Returns True if followed, False if unfollowed."""
        stmt = select(Follow).filter(Follow.follower_id == follower_id, Follow.following_id == following_id)
        result = await db.execute(stmt)
        db_follow = result.scalars().first()
        
        if db_follow:
            await db.execute(delete(Follow).filter(Follow.follower_id == follower_id, Follow.following_id == following_id))
            await db.commit()
            return False
        else:
            db_follow = Follow(follower_id=follower_id, following_id=following_id)
            db.add(db_follow)
            await db.commit()
            return True

    async def get_following_ids(self, db: AsyncSession, follower_id: uuid.UUID) -> List[uuid.UUID]:
        """Fetch list of user UUIDs that the user is currently following."""
        stmt = select(Follow.following_id).filter(Follow.follower_id == follower_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

post_repo = PostRepository()
