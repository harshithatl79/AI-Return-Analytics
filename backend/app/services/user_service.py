from app.repositories.user_repository import UserRepository

class UserService:

    @staticmethod
    async def create_user(data):
        return await UserRepository.create_user(data)

    @staticmethod
    async def get_users():
        return await UserRepository.get_all_users()