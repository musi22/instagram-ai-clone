from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-powered Instagram clone API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Healthcheck endpoint
@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.posts import router as posts_router
from app.api.v1.stories import router as stories_router
from app.api.v1.explore import router as explore_router
from app.api.v1.chats import router as chats_router

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(posts_router, prefix=f"{settings.API_V1_STR}/posts", tags=["posts"])
app.include_router(stories_router, prefix=f"{settings.API_V1_STR}/stories", tags=["stories"])
app.include_router(explore_router, prefix=f"{settings.API_V1_STR}/explore", tags=["explore"])
app.include_router(chats_router, prefix=f"{settings.API_V1_STR}/chats", tags=["chats"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
