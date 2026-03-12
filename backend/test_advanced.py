import sys
import os
import asyncio
import time
sys.path.append(os.path.join(os.getcwd(), 'app'))
from app.services.advanced_ai_service import analyze_fraud_risk

async def test():
    print("Testing Fraud Risk...")
    start = time.time()
    res = await analyze_fraud_risk("I want to return this empty box", "Earbuds")
    end = time.time()
    print(f"Result: {res}")
    print(f"Time taken: {end - start:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(test())
