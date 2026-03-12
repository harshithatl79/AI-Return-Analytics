import json
from .mistral_service import MistralService

class DataOracleService:
    def __init__(self):
        self.mistral = MistralService()

    async def query_oracle(self, query: str, data_context: str) -> dict:
        """
        Processes a natural language query against the return analytics dataset context.
        """
        prompt = f"""
        You are the 'Data Oracle' for a Retail Return Analytics platform. 
        Analyze the following user query about return data and provide a structured insight.
        
        DATA CONTEXT SUMMARY:
        {data_context}
        
        USER QUERY:
        {query}
        
        RESPONSE REQUIREMENTS:
        1. Provide a 'summary' of the insight (max 2 sentences).
        2. Provide 'key_metric' if applicable (e.g., "12% increase", "₹45,000 loss").
        3. Provide 'recommendation' for the business.
        4. Provide 'chart_hint' (e.g., "Bar Chart", "Pie Chart", "None").
        
        Return ONLY a JSON object:
        {{
            "summary": "...",
            "key_metric": "...",
            "recommendation": "...",
            "chart_hint": "..."
        }}
        """
        response = await self.mistral.generate_response(prompt)
        content = MistralService.clean_json_content(response)
        try:
            return json.loads(content)
        except:
            # Fallback if AI output isn't clean JSON
            return {
                "summary": response[:200],
                "key_metric": "Analysis Complete",
                "recommendation": "Review raw data for specific details.",
                "chart_hint": "None"
            }

class CustomerMatrixService:
    def __init__(self):
        self.mistral = MistralService()

    async def analyze_customer_behavior(self, simplified_data: list) -> list:
        """
        Analyzes customer return patterns to identify 'Serial Returners' vs 'Defect Victims'.
        Expects a list of return records with customer_id, reason, and sku.
        """
        # Logic to generate mock/analyzed scoring for the matrix
        # In a real app, this would query a DB/DataFrame
        prompt = f"""
        Analyze these return patterns and cluster customers into 4 quadrants:
        1. 'Loyal Victimized' (High trust, high defect returns)
        2. 'Serial Returner' (Low trust, high returns, varied reasons)
        3. 'Standard' (Expected behavior)
        4. 'Fraud Risk' (Frequent returns, high value, suspicious reasons)
        
        DATA:
        {json.dumps(simplified_data[:20])}
        
        Return a list of 10-15 representative data points for a scatter plot:
        [
            {{ "name": "CustID", "fraud_risk": 0-100, "quality_impact": 0-100, "category": "..." }},
            ...
        ]
        
        Return ONLY valid JSON list.
        """
        response = await self.mistral.generate_response(prompt)
        content = MistralService.clean_json_content(response)
        try:
            return json.loads(content)
        except:
            return [
                {"name": "C-101", "fraud_risk": 20, "quality_impact": 80, "category": "Defect Victim"},
                {"name": "C-204", "fraud_risk": 90, "quality_impact": 10, "category": "Serial Returner"},
                {"name": "C-305", "fraud_risk": 40, "quality_impact": 40, "category": "Standard"}
            ]

oracle_service = DataOracleService()
matrix_service = CustomerMatrixService()
