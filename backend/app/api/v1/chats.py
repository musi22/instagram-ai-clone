import uuid
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import redis

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import User
from app.schemas.post_schemas import ChatResponse, MessageResponse, MessageCreate
from app.core.config import settings
from app.services.ai_service import ai_service

router = APIRouter()

# Initialize Redis client
redis_client = None
try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Redis connection failed in chats router: {e}")

def get_redis_chat_key(user1_id: str, user2_id: str) -> str:
    # Sort IDs to have a consistent chat room key
    ids = sorted([str(user1_id), str(user2_id)])
    return f"chat:{ids[0]}:{ids[1]}:messages"

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    stmt = select(User).filter(User.username == username)
    res = await db.execute(stmt)
    return res.scalars().first()

@router.get("/", response_model=List[ChatResponse])
async def get_chats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve chat threads list, including the AI assistant and other seed users."""
    partners = ["elena_travels", "chef_takahashi", "ai_agent"]
    responses = []
    
    for username in partners:
        partner = await get_user_by_username(db, username)
        if not partner:
            continue
            
        chat_id = f"chat_{partner.username}"
        redis_key = get_redis_chat_key(str(current_user.id), str(partner.id))
        
        # Load messages from Redis
        messages = []
        if redis_client:
            try:
                raw_msgs = redis_client.lrange(redis_key, 0, -1)
                for rm in raw_msgs:
                    m = json.loads(rm)
                    messages.append(MessageResponse(
                        id=uuid.UUID(m["id"]),
                        sender_id=uuid.UUID(m["sender_id"]),
                        text=m["text"],
                        timestamp=datetime.fromisoformat(m["timestamp"]),
                        is_ai_response=m.get("is_ai_response", False)
                    ))
            except Exception as e:
                print(f"Warning: Failed to load chat messages from Redis: {e}")
                
        # If no messages exist yet, seed a default welcome message
        if not messages:
            default_text = f"Hey Alex! Elena here. How are you?"
            if username == "chef_takahashi":
                default_text = "Hey! Let me know when you want to try the new sushi roll."
            elif username == "ai_agent":
                default_text = "Hello! I am your AI assistant. Need some hashtags, caption ideas, or engagement predictions? Just ask! 🤖✨"
                
            now = datetime.utcnow()
            msg_id = uuid.uuid4()
            msg_obj = {
                "id": str(msg_id),
                "sender_id": str(partner.id),
                "text": default_text,
                "timestamp": now.isoformat(),
                "is_ai_response": (username == "ai_agent")
            }
            
            if redis_client:
                try:
                    redis_client.rpush(redis_key, json.dumps(msg_obj))
                except Exception:
                    pass
                    
            messages.append(MessageResponse(
                id=msg_id,
                sender_id=partner.id,
                text=default_text,
                timestamp=now,
                is_ai_response=(username == "ai_agent")
            ))
            
        unread_count = 0
        if redis_client:
            try:
                unread = redis_client.get(f"unread:{current_user.id}:{partner.id}")
                unread_count = int(unread) if unread else 0
            except Exception:
                pass
                
        responses.append(ChatResponse(
            id=chat_id,
            user={
                "id": partner.id,
                "username": partner.username,
                "full_name": partner.full_name,
                "profile_pic_url": partner.profile_pic_url,
                "is_verified": partner.is_verified
            },
            messages=messages,
            unread_count=unread_count
        ))
        
    return responses

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: str,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to a chat partner. Triggers AI response if partner is the AI agent."""
    partner_username = chat_id.replace("chat_", "")
    partner = await get_user_by_username(db, partner_username)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat partner not found")
        
    now = datetime.utcnow()
    msg_id = uuid.uuid4()
    
    msg_obj = {
        "id": str(msg_id),
        "sender_id": str(current_user.id),
        "text": body.text,
        "timestamp": now.isoformat(),
        "is_ai_response": False
    }
    
    redis_key = get_redis_chat_key(str(current_user.id), str(partner.id))
    
    if redis_client:
        try:
            redis_client.rpush(redis_key, json.dumps(msg_obj))
            # Set unread count for partner
            redis_client.incr(f"unread:{partner.id}:{current_user.id}")
        except Exception as e:
            print(f"Warning: Failed to save user message in Redis: {e}")
            
    # Trigger AI Assistant Reply if chatting with AI Agent
    if partner_username == "ai_agent":
        ai_reply_text = "I processed your request, but I'm not sure how to assist. Try saying 'caption', 'moderation', 'ranking' or 'search' for custom walkthroughs! 🤖"
        clean_msg = body.text.lower()
        
        if "hello" in clean_msg or "hi" in clean_msg:
            ai_reply_text = f"Hello {current_user.full_name.split()[0]}! I am your AI assistant. Need some hashtags, caption ideas, or safety scans? Just ask! 🎨✨"
        elif "caption" in clean_msg or "write" in clean_msg:
            ai_reply_text = "Sure! Tell me what is in your image. E.g. 'sunset at mountain lake'. I will write 3 caption drafts with matching hashtags! 📝"
        elif "moderation" in clean_msg or "toxic" in clean_msg or "safe" in clean_msg:
            ai_reply_text = "I automatically scan uploaded images and text. If any toxicity or NSFW content is detected, I flag it. Try uploading a post with caption 'violence' or 'nude' to test it! 🛡️"
        elif "ranking" in clean_msg or "algorithm" in clean_msg:
            ai_reply_text = "Our ranking algorithms score feeds using interest tags, active follow status, and historical engagement. Check out the Recommender widget on your Feed page! 📈"
        elif "search" in clean_msg or "explore" in clean_msg:
            ai_reply_text = "Head to the Explore tab and type concepts like 'tokyo' or 'sushi' to query our Qdrant vector database semantically. 🔍"
        elif any(k in clean_msg for k in ["sunset", "mountain", "lake", "cyberpunk", "tokyo", "sushi"]):
            # Generate custom ideas
            ideas = ai_service.generate_caption_ideas(clean_msg)
            ai_reply_text = f"🤖 AI Suggestion for '{body.text}':\n\n1. \"{ideas[0]}\"\n2. \"{ideas[1]}\"\n\nGenerated tags: #ai #{clean_msg.split()[0]}"
            
        ai_now = datetime.utcnow()
        ai_msg_id = uuid.uuid4()
        ai_msg_obj = {
            "id": str(ai_msg_id),
            "sender_id": str(partner.id),
            "text": ai_reply_text,
            "timestamp": ai_now.isoformat(),
            "is_ai_response": True
        }
        
        if redis_client:
            try:
                redis_client.rpush(redis_key, json.dumps(ai_msg_obj))
                # Set unread count for user
                redis_client.incr(f"unread:{current_user.id}:{partner.id}")
            except Exception as e:
                print(f"Warning: Failed to save AI reply in Redis: {e}")
                
    return MessageResponse(
        id=msg_id,
        sender_id=current_user.id,
        text=body.text,
        timestamp=now,
        is_ai_response=False
    )

@router.post("/{chat_id}/clear-unread", response_model=dict)
async def clear_unread(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear unread messages count for a chat thread."""
    partner_username = chat_id.replace("chat_", "")
    partner = await get_user_by_username(db, partner_username)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat partner not found")
        
    if redis_client:
        try:
            redis_client.set(f"unread:{current_user.id}:{partner.id}", 0)
        except Exception as e:
            print(f"Warning: Failed to reset unread count in Redis: {e}")
            
    return {"cleared": True}
