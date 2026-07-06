import asyncio
import uuid
import json
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, Base, async_engine
from app.core.security import get_password_hash
from app.models.models import User, Post, PostMedia, Like, Comment, SavedPost, Follow, Story
from app.services.ai_service import ai_service
from app.core.config import settings
from qdrant_client import QdrantClient

COLLECTION_NAME = "instagram_posts"

# Define UUIDs for consistent referencing
USER_ALEX = uuid.UUID("11111111-1111-1111-1111-111111111111")
USER_ELENA = uuid.UUID("22222222-2222-2222-2222-222222222222")
USER_TAKAHASHI = uuid.UUID("33333333-3333-3333-3333-333333333333")
USER_MARCUS = uuid.UUID("44444444-4444-4444-4444-444444444444")
USER_AI = uuid.UUID("55555555-5555-5555-5555-555555555555")

# Seed data structures
users_data = [
    {
        "id": USER_ALEX,
        "username": "alex_creative",
        "email": "alex@example.com",
        "full_name": "Alex Mercer",
        "bio": "Digital Creator | Exploring AI Art & Photography 📸 | Based in SF 🌌",
        "profile_pic_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
        "website": "https://alexmercer.dev",
        "is_verified": False
    },
    {
        "id": USER_ELENA,
        "username": "elena_travels",
        "email": "elena@example.com",
        "full_name": "Elena Rostova",
        "bio": "Adventure Seeker 🏔️ | Travel Blogger | Capturing the wild world 🏕️",
        "profile_pic_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        "website": "",
        "is_verified": True
    },
    {
        "id": USER_TAKAHASHI,
        "username": "chef_takahashi",
        "email": "kenji@example.com",
        "full_name": "Kenji Takahashi",
        "bio": "Sushi master 🍣 | Culinary Art & Gastronomy | SF based 🌉",
        "profile_pic_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        "website": "",
        "is_verified": False
    },
    {
        "id": USER_MARCUS,
        "username": "neon_vibes",
        "email": "marcus@example.com",
        "full_name": "Marcus Vance",
        "bio": "Cyberpunk street photography 🌆 | Neon lights & rainy nights 🌃",
        "profile_pic_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        "website": "",
        "is_verified": True
    },
    {
        "id": USER_AI,
        "username": "ai_agent",
        "email": "ai@example.com",
        "full_name": "AI Creative Assistant",
        "bio": "System Co-Pilot 🤖 | Ask me for caption suggestions, moderation scans, or aesthetic reviews!",
        "profile_pic_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop",
        "website": "",
        "is_verified": True
    }
]

posts_data = [
    {
        "id": uuid.UUID("a1111111-1111-1111-1111-111111111111"),
        "user_id": USER_MARCUS,
        "caption": "Lost in the neon currents of Tokyo. Standing under the rainy billboard glow. 🌧️✨",
        "location": "Tokyo, Japan",
        "media_url": "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&h=800&fit=crop",
        "tags": ["neon", "cyberpunk", "tokyo", "rain", "street", "night"],
        "moderation": {"flag": False, "toxicityScore": 2.0, "category": "Clean"},
        "caption_ideas": [
            "Staring into the electric future of Tokyo nights. ⚡🌃",
            "Neon rain makes the concrete shine. 🌧️✨",
            "When the city dreams in cyan and magenta."
        ],
        "comments": [
            {"user_id": USER_ELENA, "text": "This cyberpunk aesthetic is incredible! 🌌"},
            {"user_id": USER_TAKAHASHI, "text": "Lighting is masterclass."}
        ],
        "likes": [USER_ALEX, USER_ELENA]
    },
    {
        "id": uuid.UUID("b2222222-2222-2222-2222-222222222222"),
        "user_id": USER_ELENA,
        "caption": "Golden hour reflections at the alpine lake. Nature never misses. 🏔️🌅",
        "location": "Swiss Alps",
        "media_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop",
        "tags": ["mountain", "sunrise", "clouds", "nature", "landscape", "hiking"],
        "moderation": {"flag": False, "toxicityScore": 1.0, "category": "Clean"},
        "caption_ideas": [
            "Waking up with the mountains. ⛰️🌅",
            "A quiet morning by the water.",
            "Where the sky touches the earth."
        ],
        "comments": [
            {"user_id": USER_ALEX, "text": "Stunning view! Adding this to my bucket list. 🎒"}
        ],
        "likes": [USER_TAKAHASHI, USER_MARCUS]
    },
    {
        "id": uuid.UUID("c3333333-3333-3333-3333-333333333333"),
        "user_id": USER_TAKAHASHI,
        "caption": "The art of simplicity. Fresh salmon and tuna nigiri prepared for service tonight. 🍣🔪",
        "location": "Sushi Takahashi, SF",
        "media_url": "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=800&fit=crop",
        "tags": ["sushi", "food", "chef", "fish", "japanese"],
        "moderation": {"flag": False, "toxicityScore": 1.0, "category": "Clean"},
        "caption_ideas": [
            "Simplicity is the ultimate sophistication. 🍣",
            "Fresh cuts for tonight's guests.",
            "From ocean to table."
        ],
        "comments": [
            {"user_id": USER_MARCUS, "text": "Looks delicious Chef!"}
        ],
        "likes": [USER_ALEX, USER_ELENA]
    }
]

async def seed():
    print("Connecting to database...")
    async with AsyncSessionLocal() as session:
        # Check if users already exist
        res = await session.execute(select(User).limit(1))
        if res.scalars().first():
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding users...")
        hashed_password = get_password_hash("password123")
        for u in users_data:
            user = User(
                id=u["id"],
                username=u["username"],
                email=u["email"],
                full_name=u["full_name"],
                bio=u["bio"],
                profile_pic_url=u["profile_pic_url"],
                website=u["website"],
                hashed_password=hashed_password,
                is_active=True,
                is_verified=u["is_verified"]
            )
            session.add(user)
        
        await session.flush()

        print("Seeding follows...")
        # Alex follows Elena, Marcus, Takahashi, AI
        follows = [
            Follow(follower_id=USER_ALEX, following_id=USER_ELENA),
            Follow(follower_id=USER_ALEX, following_id=USER_MARCUS),
            Follow(follower_id=USER_ALEX, following_id=USER_TAKAHASHI),
            Follow(follower_id=USER_ALEX, following_id=USER_AI),
            # Elena follows Alex, Marcus
            Follow(follower_id=USER_ELENA, following_id=USER_ALEX),
            Follow(follower_id=USER_ELENA, following_id=USER_MARCUS),
        ]
        session.add_all(follows)

        print("Seeding posts...")
        for p in posts_data:
            post = Post(
                id=p["id"],
                user_id=p["user_id"],
                caption=p["caption"],
                location=p["location"]
            )
            session.add(post)
            await session.flush()

            media = PostMedia(
                post_id=post.id,
                media_url=p["media_url"],
                media_type="image",
                order=0
            )
            session.add(media)

            for c in p["comments"]:
                comment = Comment(
                    user_id=c["user_id"],
                    post_id=post.id,
                    text=c["text"]
                )
                session.add(comment)

            for user_id in p["likes"]:
                like = Like(user_id=user_id, post_id=post.id)
                session.add(like)

        print("Seeding stories...")
        now = datetime.utcnow()
        stories = [
            Story(
                id=uuid.uuid4(),
                user_id=USER_ELENA,
                media_url="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=1000&fit=crop",
                media_type="image",
                created_at=now - timedelta(hours=2),
                expires_at=now + timedelta(hours=22)
            ),
            Story(
                id=uuid.uuid4(),
                user_id=USER_TAKAHASHI,
                media_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=1000&fit=crop",
                media_type="image",
                created_at=now - timedelta(hours=4),
                expires_at=now + timedelta(hours=20)
            )
        ]
        session.add_all(stories)

        await session.commit()
        print("Database seeded successfully in PostgreSQL.")

    # Seed Qdrant Vector DB
    print("Connecting to Qdrant...")
    try:
        qdrant_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        collections = qdrant_client.get_collections().collections
        if not any(c.name == COLLECTION_NAME for c in collections):
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config={"size": 384, "distance": "Cosine"}
            )
            print(f"Qdrant collection '{COLLECTION_NAME}' created.")

        points = []
        for p in posts_data:
            search_text = f"{p['caption'] or ''} {p['location'] or ''} {' '.join(p['tags'])}".strip()
            embedding = ai_service.generate_embeddings(search_text)
            points.append({
                "id": str(p["id"]),
                "vector": embedding,
                "payload": {
                    "post_id": str(p["id"]),
                    "caption": p["caption"],
                    "tags": p["tags"],
                    "moderation_flag": p["moderation"]["flag"],
                    "toxicity_score": p["moderation"]["toxicityScore"],
                    "moderation_category": p["moderation"]["category"],
                    "caption_ideas": p["caption_ideas"]
                }
            })
        
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Qdrant collection seeded successfully.")
    except Exception as e:
        print(f"Warning: Could not seed Qdrant (ensure Qdrant container is running): {e}")

if __name__ == "__main__":
    asyncio.run(seed())
