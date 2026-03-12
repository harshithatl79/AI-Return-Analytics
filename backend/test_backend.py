import requests
import json

def test_fraud():
    url = "http://127.0.0.1:8001/api/advanced/fraud-check"
    data = {"comment": "This is a test comment for fraud check."}
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_fraud()
