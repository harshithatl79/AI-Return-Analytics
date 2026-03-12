import requests

def test_upload():
    url = "http://127.0.0.1:8001/api/dataset/upload"
    files = {'file': ('test_upload.csv', open('test_upload.csv', 'rb'), 'text/csv')}
    try:
        response = requests.post(url, files=files, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_upload()
