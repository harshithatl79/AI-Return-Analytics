from fastapi import APIRouter
from app.models.return_model import Return
from collections import Counter

router = APIRouter()

@router.get("/return-insights")
async def return_insights():

    returns = await Return.all()

    reasons = [r.return_reason for r in returns]
    products = [r.product_name for r in returns]
    categories = [r.category for r in returns]

    reason_count = Counter(reasons).most_common(3)
    product_count = Counter(products).most_common(3)
    category_count = Counter(categories).most_common(3)

    return {
        "top_reasons": reason_count,
        "top_products": product_count,
        "top_categories": category_count
    }