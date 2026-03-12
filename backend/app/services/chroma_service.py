import uuid
import json
import os

DB_FILE = "./chroma_db_mock.json"
_DB_CACHE = None

def _load_db():
    global _DB_CACHE
    if _DB_CACHE is not None:
        return _DB_CACHE
        
    if not os.path.exists(DB_FILE):
        _DB_CACHE = {"documents": [], "metadatas": [], "ids": []}
        return _DB_CACHE
        
    try:
        with open(DB_FILE, "r") as f:
            _DB_CACHE = json.load(f)
            # Validation for corrupted or malformed JSON
            if not isinstance(_DB_CACHE, dict) or "documents" not in _DB_CACHE:
                _DB_CACHE = {"documents": [], "metadatas": [], "ids": []}
    except Exception as e:
        print(f"Error loading mock DB: {e}")
        _DB_CACHE = {"documents": [], "metadatas": [], "ids": []}
        
    return _DB_CACHE

def _save_db(data):
    global _DB_CACHE
    _DB_CACHE = data
    try:
        with open(DB_FILE, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Error saving mock DB: {e}")

def ingest_dataset_records(records):
    db = _load_db()
    
    count = 0
    for record in records:
        db["documents"].append(record.get('comment', ''))
        db["metadatas"].append({
            "reason": record.get('reason', 'Unknown'),
            "recommendation": record.get('recommendation', ''),
            "sku": record.get('sku', 'N/A'),
            "category": record.get('category', 'N/A')
        })
        db["ids"].append(str(uuid.uuid4()))
        count += 1
        
    # Maintain a strict limit of 1000 records for the mock JSON file to ensure search speed
    MAX_RECORDS = 1000
    if len(db["ids"]) > MAX_RECORDS:
        db["documents"] = db["documents"][-MAX_RECORDS:]
        db["metadatas"] = db["metadatas"][-MAX_RECORDS:]
        db["ids"] = db["ids"][-MAX_RECORDS:]
        
    _save_db(db)
    return count

def add_return_record(comment, reason, recommendation):
    db = _load_db()
    db["documents"].append(comment)
    db["metadatas"].append({"reason": reason, "recommendation": recommendation})
    db["ids"].append(str(uuid.uuid4()))
    
    # Prune during single additions too
    if len(db["ids"]) > 1000:
        db["documents"] = db["documents"][-1000:]
        db["metadatas"] = db["metadatas"][-1000:]
        db["ids"] = db["ids"][-1000:]
        
    _save_db(db)

def query_similar_returns(query_text, n_results=3):
    db = _load_db()
    
    if not db["documents"]:
        return []
        
    # Super simple "semantic" fallback exact/substring match logic for the mock
    query_lower = query_text.lower()
    scored = []
    
    for idx, doc in enumerate(db["documents"]):
        score = 0
        doc_lower = doc.lower()
        if query_lower in doc_lower or doc_lower in query_lower:
            score += 10
        
        # Word overlap
        words = set(query_lower.split())
        doc_words = set(doc_lower.split())
        score += len(words.intersection(doc_words))
        
        scored.append((score, idx))
        
    scored.sort(reverse=True)
    
    similar_records = []
    for score, idx in scored[:n_results]:
        similar_records.append({
            "comment": db["documents"][idx],
            "metadata": db["metadatas"][idx]
        })
        
    return similar_records
