from tortoise import fields
from tortoise.models import Model

class Return(Model):
    id = fields.IntField(pk=True)
    product_name = fields.CharField(max_length=200)
    category = fields.CharField(max_length=100)
    return_reason = fields.TextField()
    return_date = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name