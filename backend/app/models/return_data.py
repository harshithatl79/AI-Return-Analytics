from tortoise import fields, models

class ReturnData(models.Model):
    id = fields.IntField(pk=True)

    user = fields.ForeignKeyField(
        "models.User",
        related_name="returns"
    )

    product_name = fields.CharField(max_length=200)
    return_reason = fields.TextField()
    prediction = fields.CharField(max_length=100)   
    created_at = fields.DatetimeField(auto_now_add=True)