from fastapi import APIRouter, HTTPException
from app.services.advanced_ai_service import analyze_fraud_risk
from app.services.mistral_service import generate_resolution_email, mistral_service
from app.services.advanced_ai_oracle import oracle_service, matrix_service
from app.models.action_model import Action
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ActionCreate(BaseModel):
    sku: str
    recipient_type: str
    action_type: str
    content: str
    status: Optional[str] = "Draft"

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/fraud-check")
async def check_fraud(data: dict):
    comment = data.get("comment", "")
    product = data.get("product", "General Return")
    
    analysis = await analyze_fraud_risk(comment, product)
    return analysis

@router.post("/draft-email")
async def draft_email(data: dict):
    """
    Generate a professional resolution email based on issue context.
    Expected data: {sku, product, issue, action, recipient_type}
    """
    email_draft = await generate_resolution_email(data)
    return email_draft

@router.post("/oracle")
async def query_oracle(data: dict):
    """
    Natural Language querying for the dataset.
    """
    query = data.get("query", "Summarize current return trends")
    data_context = data.get("context", "Recent returns: 1245, Controllable: 68%, Main reason: Sizing.")
    
    insight = await oracle_service.query_oracle(query, data_context)
    return insight

@router.post("/customer-matrix")
async def get_customer_matrix(data: dict):
    """
    Returns scoring for the Customer-SKU Fraud/Quality Matrix.
    """
    simplified_data = data.get("sample_data", [])
    matrix_data = await matrix_service.analyze_customer_behavior(simplified_data)
    return matrix_data

# --- Feature 5: Action Tracking Routes ---

@router.post("/actions")
async def create_action(action_data: ActionCreate):
    action = await Action.create(**action_data.dict())
    return action

@router.get("/actions")
async def list_actions():
    return await Action.all().order_by("-created_at")

@router.patch("/actions/{action_id}")
async def update_action_status(action_id: int, data: dict):
    status = data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    action = await Action.get_or_none(id=action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    action.status = status
    await action.save()
    return action

# --- Feature 4: Strategic Briefing Aggregator ---

@router.get("/strategic-briefing")
async def get_strategic_briefing():
    """
    Aggregates recent actions, trends, and financial context into a professional AI summary.
    """
    recent_actions = await Action.all().order_by("-created_at").limit(5)
    action_context = "\n".join([f"- {a.action_type} for {a.sku} status: {a.status}" for a in recent_actions])
    
    prompt = f"""
    You are a Strategic Ops Director. Summarize the following operational activities into a concise Executive Briefing.
    
    Operational Context:
    {action_context}
    
    Trend Highlights:
    - Overall Return Rate: 12.4% (Down 1.2% this week)
    - Key Driver: 'Product Quality' in Electronics
    - Resolved Issues: 45 high-priority SKU halts.
    
    Generate a professional markdown summary with sections: 
    1. Executive Summary 
    2. Operational Wins (Based on actions)
    3. Critical Risks
    4. Strategic Recommendations
    """
    
    briefing_text = await mistral_service.generate_response(prompt)
    return {"briefing": briefing_text}
