import os
import json
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

async def _call_mistral(prompt: str, json_mode: bool = True, stream: bool = False):
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY is missing. Add it to .env")
        
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {MISTRAL_API_KEY}"
    }
    data = {
        "model": "mistral-small-latest",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "stream": stream
    }
    
    async with httpx.AsyncClient(timeout=45.0) as client:
        if stream:
            # For streaming, we return the context manager
            return client.stream("POST", url, headers=headers, json=data)
        
        response = await client.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        content = response.json()["choices"][0]["message"]["content"].strip()
        
        if json_mode:
            # Robust JSON cleaning
            if content.startswith("```json"): content = content[7:]
            if content.startswith("```"): content = content[3:]
            if content.endswith("```"): content = content[:-3]
            try:
                return json.loads(content.strip())
            except json.JSONDecodeError:
                # Fallback if AI skips JSON format but provides a list/dict-like string
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    return json.loads(match.group())
                raise
                
        return content

async def analyze_fraud_risk(comment: str, product_name: str = "Unknown Product"):
    prompt = f"""
    You are an expert internal eCommerce Fraud Investigator AI at mCaffeine. 
    Analyze this customer return comment for potential return abuse (wardrobing, serial empty-box returns, or bracketing).
    
    Product: {product_name}
    Return Comment: "{comment}"
    
    Output a strictly formatted JSON object with these keys:
    - "risk_score": integer 1-100
    - "flag_reason": string explaining the pattern.
    - "suggested_action": business action (e.g. "Require Photo Proof", "Approve Auto-Refund").
    """
    
    try:
        return await _call_mistral(prompt)
    except Exception as e:
        print(f"Mistral Fraud Check failed: {e}")
        return {"risk_score": 0, "flag_reason": "API Error", "suggested_action": "Manual Review Required"}
