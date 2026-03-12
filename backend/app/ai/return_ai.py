from collections import Counter

def analyze_returns(return_data):

    reasons = [r.return_reason for r in return_data]
    categories = [r.category for r in return_data]
    products = [r.product_name for r in return_data]

    reason_count = Counter(reasons).most_common(3)
    category_count = Counter(categories).most_common(3)
    product_count = Counter(products).most_common(3)

    insights = []

    if reason_count:
        insights.append(f"Most common return reason is '{reason_count[0][0]}'.")

    if product_count:
        insights.append(f"Product '{product_count[0][0]}' has the highest returns.")

    if category_count:
        insights.append(f"Category '{category_count[0][0]}' has the highest return rate.")

    return {
        "top_reasons": reason_count,
        "top_products": product_count,
        "top_categories": category_count,
        "insights": insights
    }