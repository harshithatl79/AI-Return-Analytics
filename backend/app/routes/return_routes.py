from fastapi import APIRouter
from app.schemas.return_schema import ReturnCreate
from app.models.return_model import Return

router = APIRouter()


# Add a new return record
@router.post("/add-return")
async def add_return(data: ReturnCreate):
    new_return = await Return.create(**data.dict())
    return {
        "message": "Return added successfully",
        "data": new_return
    }


# Get all return records
@router.get("/all")
async def get_all_returns():
    returns = await Return.all()
    return returns