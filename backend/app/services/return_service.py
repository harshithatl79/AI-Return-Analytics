from app.repositories.return_repository import create_return, get_all_returns

async def add_return(data):
    return await create_return(data)

async def list_returns():
    return await get_all_returns() 