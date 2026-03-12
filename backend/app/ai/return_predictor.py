import random

def predict_return_risk(product_name, category, price):

    # simple simulated model logic
    risk_score = random.randint(30, 90)

    if risk_score > 70:
        risk = "High"
    elif risk_score > 50:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "product": product_name,
        "category": category,
        "price": price,
        "return_risk": risk,
        "probability": f"{risk_score}%"
    }