import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch

async def get_auth_headers(client: AsyncClient, username="poster", email="poster@example.com"):
    """Helper to create and login a test user, returning auth headers."""
    user_data = {
        "email": email,
        "username": username,
        "full_name": "Test Poster",
        "password": "password123"
    }
    await client.post("/api/v1/auth/register", json=user_data)
    login_res = await client.post("/api/v1/auth/login", data={"username": username, "password": "password123"})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_post_success(client: AsyncClient, db_session: AsyncSession):
    """Test successful post creation with mocked S3 storage and Qdrant."""
    headers = await get_auth_headers(client, "postmaker", "postmaker@example.com")
    
    # Mocking storage_service and qdrant_client
    with patch("app.api.v1.posts.storage_service.upload_file") as mock_upload, \
         patch("app.api.v1.posts.qdrant_client") as mock_qdrant:
        
        mock_upload.return_value = "http://localhost:9000/instagram-media/posts/test-uuid.jpg"
        mock_qdrant.retrieve.return_value = []
        
        files = {"file": ("test.jpg", b"fakeimagebytes", "image/jpeg")}
        data = {
            "caption": "Hello world! #test",
            "location": "Paris, France",
            "tags": '["test", "first"]',
            "image_desc": "Eiffel Tower at night"
        }
        
        response = await client.post("/api/v1/posts/", files=files, data=data, headers=headers)
        assert response.status_code == 201
        
        resp_data = response.json()
        assert resp_data["caption"] == "Hello world! #test"
        assert resp_data["location"] == "Paris, France"
        assert len(resp_data["media"]) == 1
        assert resp_data["media"][0]["media_url"] == "http://localhost:9000/instagram-media/posts/test-uuid.jpg"

@pytest.mark.asyncio
async def test_get_feed_empty(client: AsyncClient):
    """Test feed retrieval returns empty list when no posts exist."""
    headers = await get_auth_headers(client, "feed_user", "feed_user@example.com")
    
    with patch("app.api.v1.posts.qdrant_client") as mock_qdrant:
        response = await client.get("/api/v1/posts/", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_toggle_like_not_found(client: AsyncClient):
    """Test liking a non-existent post returns 404."""
    headers = await get_auth_headers(client, "liker", "liker@example.com")
    fake_post_id = uuid.uuid4()
    
    response = await client.post(f"/api/v1/posts/{fake_post_id}/like", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Post not found"
