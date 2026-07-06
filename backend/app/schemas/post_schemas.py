import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class UserMinResponse(BaseModel):
    id: uuid.UUID
    username: str
    full_name: str
    profile_pic_url: Optional[str] = None
    is_verified: bool = False
    
    class Config:
        from_attributes = True

class LikeResponse(BaseModel):
    user_id: uuid.UUID
    post_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1)
    parent_id: Optional[uuid.UUID] = None

class CommentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    post_id: uuid.UUID
    text: str
    parent_id: Optional[uuid.UUID] = None
    created_at: datetime
    user: UserMinResponse
    
    class Config:
        from_attributes = True

class PostMediaResponse(BaseModel):
    id: uuid.UUID
    media_url: str
    media_type: str
    order: int
    
    class Config:
        from_attributes = True

class AiModerationSchema(BaseModel):
    flag: bool = False
    toxicityScore: float = 0.0
    category: str = "Clean"

class PostCreate(BaseModel):
    caption: Optional[str] = None
    location: Optional[str] = None
    image_url: str
    tags: List[str] = []
    image_desc: str = ""

class PostResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    caption: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    owner: UserMinResponse
    media: List[PostMediaResponse] = []
    comments: List[CommentResponse] = []
    likes_count: int = 0
    is_liked: bool = False
    is_saved: bool = False
    ai_score: int = 90
    ai_tags: List[str] = []
    ai_moderation: AiModerationSchema = Field(default_factory=AiModerationSchema)
    ai_caption_ideas: List[str] = []

    class Config:
        from_attributes = True

class StoryCreate(BaseModel):
    media_url: str
    media_type: str = "image"

class StoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    media_url: str
    media_type: str
    created_at: datetime
    expires_at: datetime
    user: UserMinResponse
    is_viewed: bool = False

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    text: str
    timestamp: datetime
    is_ai_response: bool = False

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    id: str
    user: UserMinResponse
    messages: List[MessageResponse] = []
    unread_count: int = 0
    
    class Config:
        from_attributes = True
