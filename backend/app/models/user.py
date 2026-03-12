from tortoise import fields, models

class User(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    email = fields.CharField(max_length=100, unique=True)

    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return self.email