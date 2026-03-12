import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.advanced_ai_oracle import oracle_service

async def test_oracle():
    print("Testing Data Oracle Service...")
    query = "What are the top 3 return reasons?"
    context = "We have 100 returns. 50 are for sizing, 30 for quality, 20 for wrong item."
    
    try:
        result = await oracle_service.query_oracle(query, context)
        print("\nOracle Result:")
        print(result)
        if "summary" in result and "key_metric" in result:
            print("\nSUCCESS: Oracle is working!")
        else:
            print("\nFAILURE: Unexpected result format.")
    except Exception as e:
        print(f"\nFAILURE: Oracle error: {e}")

if __name__ == "__main__":
    asyncio.run(test_oracle())
