import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session: AsyncSession):
    """Test successful user registration."""
    user_data = {
        "email": "testuser@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpassword123"
    }
    
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert data["full_name"] == user_data["full_name"]
    assert "id" in data
    
    # Check user was inserted in DB
    result = await db_session.execute(select(User).filter(User.username == "testuser"))
    user = result.scalars().first()
    assert user is not None
    assert user.email == user_data["email"]

@pytest.mark.asyncio
async def test_register_existing_username(client: AsyncClient, db_session: AsyncSession):
    """Test registration fails when username is already taken."""
    user_data1 = {
        "email": "user1@example.com",
        "username": "duplicate_user",
        "full_name": "User One",
        "password": "password123"
    }
    user_data2 = {
        "email": "user2@example.com",
        "username": "duplicate_user",
        "full_name": "User Two",
        "password": "password123"
    }
    
    response1 = await client.post("/api/v1/auth/register", json=user_data1)
    assert response1.status_code == 201
    
    response2 = await client.post("/api/v1/auth/register", json=user_data2)
    assert response2.status_code == 400
    assert "already taken" in response2.json()["detail"]

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db_session: AsyncSession):
    """Test login works with correct credentials."""
    user_data = {
        "email": "loginuser@example.com",
        "username": "loginuser",
        "full_name": "Login User",
        "password": "securepassword123"
    }
    
    # Register first
    await client.post("/api/v1/auth/register", json=user_data)
    
    # Login with username
    login_data = {
        "username": "loginuser",
        "password": "securepassword123"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login fails with incorrect password."""
    login_data = {
        "username": "nonexistent_user",
        "password": "wrongpassword"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 400
    assert "Incorrect username/email or password" in response.json()["detail"]
