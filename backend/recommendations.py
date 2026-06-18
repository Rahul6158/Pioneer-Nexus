from optimization.inventory_optimizer import optimize_inventory
from optimization.warehouse_optimizer import optimize_warehouse_allocation
from optimization.expiry_optimizer import detect_expiry_risk


def generate_recommendations(df, demand_predictions, inventory):
    inventory_recs = optimize_inventory(demand_predictions, inventory)
    warehouse_recs = optimize_warehouse_allocation(df)
    expiry_recs = detect_expiry_risk(df)

    return {
        "inventory": inventory_recs,
        "warehouse": warehouse_recs,
        "expiry": expiry_recs,
    }
