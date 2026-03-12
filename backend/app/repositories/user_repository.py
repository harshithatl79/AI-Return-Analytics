from app.models.return_model import Return

async def create_return(data):
    return await Return.create(**data)

async def get_all_returns():
    return await Return.all()