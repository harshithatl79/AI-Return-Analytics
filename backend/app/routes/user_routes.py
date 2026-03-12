from fastapi import APIRouter
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    return await UserService.create_user(user.dict())

@router.get("/", response_model=list[UserResponse])
async def get_users():
    return await UserService.get_users()