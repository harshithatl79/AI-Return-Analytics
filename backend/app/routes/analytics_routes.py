from fastapi import APIRouter
from app.models.return_model import Return
from collections import Counter

router = APIRouter()


# Get most common return reasons
@router.get("/top-return-reasons")
async def top_return_reasons():
    returns = await Return.all()

    reasons = [r.return_reason for r in returns]

    result = Counter(reasons).most_common()

    return {
        "top_return_reasons": result
    }


# Get most returned products
@router.get("/top-returned-products")
async def top_returned_products():
    returns = await Return.all()

    products = [r.product_name for r in returns]

    result = Counter(products).most_common()

    return {
        "top_returned_products": result
    }