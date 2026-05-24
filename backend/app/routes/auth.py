from datetime import datetime
import uuid
from fastapi import APIRouter, HTTPException, status

from app.models import UserRegister, Token, TokenUserResponse, UserLogin
from app.database import db_manager
from app.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Registers a new standard user on the live db or in-memory fallback."""
    existing_user = await db_manager.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )
    
    user_id = str(uuid.uuid4())
    password_hash = get_password_hash(user_data.password)
    
    new_user = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": password_hash,
        "full_name": user_data.full_name,
        "created_at": datetime.utcnow()
    }
    
    await db_manager.create_user(new_user)
    return {"message": "User successfully registered!"}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticates standard credentials and issues a secure JWT bearer token."""
    user = await db_manager.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["_id"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": TokenUserResponse(email=user["email"], full_name=user["full_name"])
    }


@router.post("/demo", response_model=Token)
async def guest_login():
    """Issues a JWT for a guest session using the pre-seeded guest account (read-only demo mode)."""
    from datetime import datetime
    guest_user = await db_manager.get_user_by_id("guest_demo")
    if not guest_user:
        password_hash = get_password_hash("guest123")
        guest_user = {
            "_id": "guest_demo",
            "email": "guest@fraudshield.ai",
            "password_hash": password_hash,
            "full_name": "Guest User",
            "created_at": datetime.utcnow()
        }
        await db_manager.create_user(guest_user)

    access_token = create_access_token(data={"sub": "guest_demo"})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": TokenUserResponse(
            email=guest_user["email"],
            full_name=guest_user["full_name"]
        )
    }
