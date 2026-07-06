import uuid
from typing import Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import User
from app.schemas.user_schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash

class UserRepository:
    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        """Fetch a user by their UUID."""
        result = await db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        """Fetch a user by their username."""
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Fetch a user by their email address."""
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_by_username_or_email(self, db: AsyncSession, username_or_email: str) -> Optional[User]:
        """Fetch a user matching either username or email address (case-sensitive)."""
        result = await db.execute(
            select(User).filter(
                or_(
                    User.username == username_or_email,
                    User.email == username_or_email
                )
            )
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, user_in: UserCreate) -> User:
        """Create a new user with hashed password."""
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            username=user_in.username,
            full_name=user_in.full_name,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def update(self, db: AsyncSession, user_db: User, user_in: UserUpdate) -> User:
        """Update fields of an existing user profile."""
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user_db, field, value)
        db.add(user_db)
        await db.commit()
        await db.refresh(user_db)
        return user_db

    async def update_avatar(self, db: AsyncSession, user_db: User, avatar_url: str) -> User:
        """Update user avatar picture url."""
        user_db.profile_pic_url = avatar_url
        db.add(user_db)
        await db.commit()
        await db.refresh(user_db)
        return user_db

user_repo = UserRepository()
