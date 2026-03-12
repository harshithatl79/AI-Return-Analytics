from pydantic import BaseModel

class ReturnCreate(BaseModel):
    product_name: str
    category: str
    return_reason: str