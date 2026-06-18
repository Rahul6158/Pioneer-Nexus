
def optimize_inventory(demand_predictions: dict, current_inventory: dict):
    recommendations = []

    for product, predicted_demand in demand_predictions.items():
        stock = current_inventory.get(product, 0)
        
        if predicted_demand > stock:
            recommendations.append({
                "product": product,
                "action": "increase_inventory",
                "recommended_units": int(predicted_demand - stock)
            })
        elif stock > predicted_demand:
             recommendations.append({
                "product": product,
                "action": "reduce_inventory",
                "recommended_units": int(stock - predicted_demand)
            })
            
    return recommendations
