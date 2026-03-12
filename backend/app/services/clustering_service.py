import os
import json
import requests
from dotenv import load_dotenv
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
from app.services.chroma_service import _load_db
from collections import defaultdict

load_dotenv()
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Load model lazily to avoid startup delay if not used yet
_embedder = None
_cached_analytics = None
_cached_doc_count = -1

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedder

def label_cluster_with_llm(comments_sample):
    if not MISTRAL_API_KEY:
        return "AI Assessed Label"
        
    prompt = f"""
    You are an expert eCommerce Returns Analyst.
    I have a cluster of semantically similar customer return comments. 
    Here is a sample of the comments:
    {json.dumps(comments_sample, indent=2)}
    
    Provide ONE concise, meaningful label describing the core issue driving these returns (e.g., "Size Issues", "Defective Material", "Late Delivery"). 
    Respond ONLY with the label text, no quotes or markdown.
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
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 15,
            "temperature": 0.3
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        label = response.json()["choices"][0]["message"]["content"].strip()
        label = label.strip('"').strip("'")
        return label
    except Exception as e:
        print(f"Error labeling cluster with Mistral: {e}")
        return "Unclassified Cluster"

def generate_clusters():
    global _cached_analytics, _cached_doc_count
    
    db = _load_db()
    docs = db.get("documents", [])
    
    if not docs:
        return []
        
    original_num_docs = len(docs)
    
    # Return cached ML results if the dataset hasn't changed
    if original_num_docs == _cached_doc_count and _cached_analytics is not None:
        return _cached_analytics
        
    import random
    if len(docs) > 500:
        indices = random.sample(range(len(docs)), 500)
        docs = [docs[i] for i in indices]
        
    num_docs = len(docs)
    
    # We need at least enough docs to cluster.
    n_clusters = min(5, num_docs)
    if n_clusters < 1:
        return []

    # Get embeddings
    embedder = get_embedder()
    embeddings = embedder.encode(docs)
    
    # Perform KMeans Clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    cluster_labels = kmeans.fit_predict(embeddings)
    
    # Group documents by cluster
    clustered_docs = defaultdict(list)
    for i, label in enumerate(cluster_labels):
        clustered_docs[int(label)].append(docs[i])
        
    # Analyze each cluster with LLM and build the response
    analytics = []
    
    for cluster_id, comments in clustered_docs.items():
        # Sample up to 5 comments for the LLM context
        sample_for_llm = comments[:5]
        
        # Get AI label
        ai_label = label_cluster_with_llm(sample_for_llm)
        
        analytics.append({
            "cluster_id": cluster_id,
            "cluster_name": ai_label,
            "count": len(comments),
            "examples": sample_for_llm
        })
        
    _cached_analytics = analytics
    _cached_doc_count = original_num_docs
    
    return analytics
