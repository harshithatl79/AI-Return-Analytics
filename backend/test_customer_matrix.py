import asyncio
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.advanced_ai_oracle import matrix_service

async def test_matrix():
    print("Testing Customer Matrix Service...")
    sample_data = [
        {"customer_id": "C-101", "reason": "Sizing", "sku": "SKU-001"},
        {"customer_id": "C-204", "reason": "Defective", "sku": "SKU-005"},
        {"customer_id": "C-305", "reason": "Wrong Item", "sku": "SKU-002"}
    ]
    
    try:
        result = await matrix_service.analyze_customer_behavior(sample_data)
        print("\nMatrix Result:")
        print(json.dumps(result, indent=2))
        
        if isinstance(result, list) and len(result) > 0:
            print("\nSUCCESS: Customer Matrix is working!")
        else:
            print("\nFAILURE: Unexpected result format.")
    except Exception as e:
        print(f"\nFAILURE: Matrix error: {e}")

if __name__ == "__main__":
    asyncio.run(test_matrix())
