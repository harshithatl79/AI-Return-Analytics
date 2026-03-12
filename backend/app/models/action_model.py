from tortoise import fields
from tortoise.models import Model

class Action(Model):
    id = fields.IntField(pk=True)
    sku = fields.CharField(max_length=100)
    recipient_type = fields.CharField(max_length=100) # Customer / Warehouse
    action_type = fields.CharField(max_length=100) # Email / Halt
    status = fields.CharField(max_length=50, default="Draft") # Draft, Sent, Resolved
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action_type} for {self.sku} - {self.status}"
