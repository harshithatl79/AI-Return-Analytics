import os
import json
import io
import httpx
import asyncio
import requests
from dotenv import load_dotenv
from app.services.chroma_service import query_similar_returns, add_return_record

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

class MistralService:
    def __init__(self):
        self.api_key = MISTRAL_API_KEY
        self.url = "https://api.mistral.ai/v1/chat/completions"

    @staticmethod
    def clean_json_content(content: str) -> str:
        """
        Cleans markdown code fences from a string.
        """
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        
        if content.endswith("```"):
            content = content[:-3]
            
        return content.strip()

    async def generate_response(self, prompt: str) -> str:
        """
        Generic helper to call Mistral and return raw text.
        Used by Oracle and Matrix services.
        """
        if not self.api_key:
            return "Mock Response: API Key missing."

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        data = {
            "model": "mistral-small-latest",
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.url, headers=headers, json=data)
                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"MistralService Error: {e}")
            return f"Error: {str(e)}"

async def analyze_return_comment(comment: str):
    if not MISTRAL_API_KEY:
        return {
            "summary": "Mock: API Key missing.",
            "cause": "Mock: N/A",
            "recommendation": "Mock: Setup Mistral API Key.",
            "urgency": "Low"
        }

    similar_records = query_similar_returns(comment, n_results=3)
    
    context_str = ""
    if similar_records:
        context_str = "Here are similar historical returns for context:\n"
        for idx, rec in enumerate(similar_records):
            context_str += f"{idx+1}. Comment: \"{rec['comment']}\", Historical Cause: \"{rec['metadata']['reason']}\", Historical Recommendation: \"{rec['metadata']['recommendation']}\"\n"

    prompt = f"""
    You are an expert Retail Business Consultant analyzing an eCommerce customer return comment.
    
    {context_str}
    
    Analyze the following new return comment: "{comment}"
    
    Extract the core problem and provide a highly actionable structural recommendation for the business.
    Return the output STRICTLY as a JSON object with the following keys:
    - summary (string: brief summary of sentiment)
    - cause (string: the root cause, e.g. "Sizing Issue", "Defective Material")
    - recommendation (string: actionable recommendation for the merchant)
    - urgency (string: "Low", "Medium", or "High")
    
    DO NOT wrap the response in markdown blocks like ```json. Output ONLY the raw JSON object.
    """
    
    try:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}"
        }
        data = {
            "model": "mistral-small-latest",
            "messages": [{"role": "user", "content": prompt}]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            content = response.json()["choices"][0]["message"]["content"].strip()
            content = MistralService.clean_json_content(content)
            
            result_json = json.loads(content)
            add_return_record(comment, result_json.get("cause", "Unknown"), result_json.get("recommendation", "None"))
            
            return result_json
        
    except Exception as e:
        print(f"Error calling Mistral: {e}")
        return {
            "summary": "Failed to analyze comment due to API error.",
            "cause": "Error",
            "recommendation": "Check backend system logs.",
            "urgency": "High"
        }

async def analyze_dataset_trends(records: list):
    """
    Takes a dataset of return records, samples them, and uses Mistral to generate advanced 
    insights based on the 5 requested features.
    """
    if not MISTRAL_API_KEY:
        return _get_mock_advanced_analysis()
        
    # Sample up to 50 records to avoid context limits while getting a good trend
    sample = records[:50]
    data_str = ""
    for i, r in enumerate(sample):
        data_str += f"[{i+1}] SKU:{r.get('sku','Unknown')} Category:{r.get('category','Unknown')} Reason:{r['reason']} Comment:\"{r['comment']}\"\n"

    prompt = f"""
    You are an expert Retail Data Analyst AI. You have been provided with a sample of eCommerce product returns:
    
    <DATA>
    {data_str}
    </DATA>
    
    Based on these records, perform an advanced trend analysis and return STRICTLY a JSON object matching this exact structure:
    {{
        "anomaly_alerts": [
            {{"sku": "string", "issue": "string", "spike_percentage": "string (e.g. '+400%')", "action": "string"}}
        ],
        "sentiment_scores": [
            {{"category": "string", "average_frustration_score": "number 1-10", "driver": "string (main reason for frustration)"}}
        ],
        "workflow_routing": [
            {{"department": "string", "ticket_volume": "string (e.g. 'High')", "top_issue_to_resolve": "string"}}
        ],
        "financial_forecast": [
            {{"category": "string", "projected_q4_loss": "string (e.g. '₹45,000')", "preventable_variable": "string"}}
        ],
        "supplier_scorecards": [
            {{"supplier_type": "string", "grade": "string (A-F)", "primary_defect": "string", "action_required": "string"}}
        ]
    }}
    
    Ensure you generate at least 2-3 items per array. Do not output markdown code blocks. Output ONLY raw JSON.
    """
    
    try:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}"
        }
        data = {
            "model": "mistral-small-latest",
            "messages": [{"role": "user", "content": prompt}]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            content = response.json()["choices"][0]["message"]["content"].strip()
            content = MistralService.clean_json_content(content)
                
            return json.loads(content)
        
    except Exception as e:
        print(f"Error calling Mistral for advanced analysis: {e}")
        return _get_mock_advanced_analysis()

async def generate_strategic_recommendations(records: list):
    """
    Takes records and generates specific actionable business recommendations.
    """
    if not MISTRAL_API_KEY:
        return _get_mock_strategic_recs()
        
    sample = records[:40]
    data_str = ""
    for i, r in enumerate(sample):
        data_str += f"[{i+1}] SKU:{r.get('sku','N/A')} Category:{r.get('category','N/A')} Comment:\"{r['comment']}\"\n"

    prompt = f"""
    You are a world-class Retail Chief Operating Officer (COO) and Supply Chain Strategist.
    Analyze the following recent product return data:
    
    <RETURNS_DATA>
    {data_str}
    </RETURNS_DATA>
    
    Identify the 4 most critical business interventions needed to protect revenue.
    Return ONLY a raw JSON array of objects with this structure:
    [
        {{
            "sku": "string",
            "product": "string",
            "issue": "string",
            "action": "string (specific, e.g. 'Update sizing guide', 'Review batch #X')",
            "urgency": "High | Medium",
            "impact": "string (estimated financial impact, e.g. '-₹42,000')"
        }}
    ]
    
    Do not output markdown code blocks.
    """
    
    try:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}"
        }
        data = {
            "model": "mistral-small-latest",
            "messages": [{"role": "user", "content": prompt}]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            content = response.json()["choices"][0]["message"]["content"].strip()
            
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
                
            return json.loads(content.strip())
        
    except Exception as e:
        print(f"Error generating strategic recs: {e}")
        return _get_mock_strategic_recs()

def _get_mock_strategic_recs():
    return [
        { "sku": "SKU-8812", "product": "Running Shoes - Blue", "issue": "Sole Adhesion failure", "action": "Halt Sales & Alert Manufacturing", "urgency": "High", "impact": "-₹45,000" },
        { "sku": "SKU-4421", "product": "Cotton T-Shirt", "issue": "Sizing (Runs Small)", "action": "Update Size Chart Guide on product page", "urgency": "Medium", "impact": "-₹20,000" }
    ]

def _get_mock_advanced_analysis():
    return {
        "anomaly_alerts": [
            {"sku": "SKU-9921", "issue": "Defective Zipper", "spike_percentage": "+350%", "action": "Halt Sales & Alert QA"}
        ],
        "sentiment_scores": [
            {"category": "Apparel", "average_frustration_score": 8.5, "driver": "Sizing inconsistencies"}
        ],
        "workflow_routing": [
            {"department": "Merchandising", "ticket_volume": "High", "top_issue_to_resolve": "Update Size Guides"}
        ],
        "financial_forecast": [
            {"category": "Footwear", "projected_q4_loss": "₹85,000", "preventable_variable": "Sole Adhesion"}
        ],
        "supplier_scorecards": [
            {"supplier_type": "Knitwear Manufacturer", "grade": "C-", "primary_defect": "Pilling after one wash", "action_required": "Renegotiate contract terms"}
        ]
    }

async def generate_resolution_email(issue_context: dict):
    """
    Generates a professional resolution email draft based on a specific business issue.
    issue_context keys: sku, product, issue, action, recipient_type (supplier, internal, customer)
    """
    if not MISTRAL_API_KEY:
        return _get_mock_email_draft(issue_context)

    sku = issue_context.get("sku", "N/A")
    issue = issue_context.get("issue", "N/A")
    action = issue_context.get("action", "N/A")
    recipient = issue_context.get("recipient_type", "internal team")

    role_instruction = ""
    if recipient == "customer":
        role_instruction = "You are a Customer Experience Specialist. Draft an empathetic, helpful, and professional email to a customer regarding their recent return. Offer a clear resolution (e.g. refund, replacement) and maintain brand loyalty."
    elif recipient == "warehouse":
        role_instruction = "You are an Operations Manager. Draft a firm, clear, and urgent directive to the Warehouse Team to halt sales and shipments for a specific SKU. Highlight the quality issues and mandate an immediate batch inspection."
    else:
        role_instruction = "You are an expert Corporate Communications AI. Draft a professional, firm, yet collaborative email for a retail business issue."

    prompt = f"""
    {role_instruction}
    
    CONTEXT:
    - Target Recipient: {recipient}
    - Product/SKU involved: {sku}
    - The Specific Issue: {issue}
    - The Required Action: {action}
    
    The email should include a clear subject line and a structured body. Use the context provided to make it sound data-backed.
    Return the output STRICTLY as a JSON object with:
    {{
        "subject": "...",
        "body": "..."
    }}
    
    Do not output markdown code blocks. Output ONLY raw JSON.
    """

    try:
        url = "https://api.mistral.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}"
        }
        data = {
            "model": "mistral-small-latest",
            "messages": [{"role": "user", "content": prompt}]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            content = response.json()["choices"][0]["message"]["content"].strip()
            content = MistralService.clean_json_content(content)
                
            return json.loads(content)
        
    except Exception as e:
        print(f"Error calling Mistral for email draft: {e}")
        return _get_mock_email_draft(issue_context)

def _get_mock_email_draft(ctx):
    return {
        "subject": f"Urgent: Resolution Required for {ctx.get('sku', 'Product Issue')}",
        "body": f"Dear {ctx.get('recipient_type', 'Team')},\n\nWe are reaching out to address a recurring issue with SKU {ctx.get('sku', 'N/A')}. Our recent data indicates {ctx.get('issue', 'a defect spike')}.\n\nAs a resolution, we require the following: {ctx.get('action', 'Investigation')}.\n\nPlease acknowledge receipt of this request.\n\nBest regards,\nRetail Operations"
    }

mistral_service = MistralService()
