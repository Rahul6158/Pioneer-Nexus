import os
import csv
import random
from datetime import datetime, timedelta


def generate_sales_data(filepath, row_count=250):
    products = [
        "CLAFONEER 500mg IV/IM Vial",
        "No-vomit 8mg/4ml Injection",
        "ATRANEER 10mg/ml Injection",
        "SITAVIA Plus 50/1000mg",
        "SITAVIA 100mg Tablets",
        "NAPRON 500mg Tablet",
        "Piodol 500mg Tablets",
        "LOSART 50mg Tablets",
        "Neuro-Forte F/C Tablet",
        "CLOXABAN 20mg F/C Tablet",
    ]
    regions = ["Baghdad", "Basra", "Erbil", "Mosul", "Anbar"]
    warehouses = ["Central", "South", "North", "West"]
    transaction_types = [
        "Sale",
        "Sale",
        "Sale",
        "Sale",
        "Sale",
        "Sale",
        "Sale",
        "Sale",
        "Sale",
        "Return",
    ]

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "order_id",
                "order_date",
                "product_name",
                "region",
                "warehouse",
                "transaction_type",
                "quantity",
                "unit_price_iqd",
                "revenue_iqd",
                "expiry_date",
            ]
        )

        start_date = datetime.now() - timedelta(days=180)

        for i in range(1, row_count + 1):
            order_date = start_date + timedelta(
                days=random.randint(0, 180), hours=random.randint(0, 23)
            )
            product = random.choice(products)
            region = random.choice(regions)
            warehouse = random.choice(warehouses)
            trans_type = random.choice(transaction_types)

            if trans_type == "Return":
                qty = random.randint(1, 10)
            else:
                qty = random.randint(10, 150)

            unit_price = random.choice([5000, 7500, 12000, 15000, 25000])
            revenue = qty * unit_price

            if trans_type == "Return":
                revenue = -revenue

            expiry_days = random.choice(
                [
                    random.randint(-30, 29),
                    random.randint(30, 120),
                    random.randint(120, 365),
                ]
            )
            expiry_date = order_date + timedelta(days=expiry_days)

            writer.writerow(
                [
                    f"TXN-{10000 + i}",
                    order_date.strftime("%Y-%m-%d %H:%M:%S"),
                    product,
                    region,
                    warehouse,
                    trans_type,
                    qty,
                    unit_price,
                    revenue,
                    expiry_date.strftime("%Y-%m-%d"),
                ]
            )
    print(f"Generated {row_count} sales transactions at: {filepath}")


def generate_inventory_data(filepath, row_count=100):
    products = [
        "CLAFONEER 500mg IV/IM Vial",
        "No-vomit 8mg/4ml Injection",
        "ATRANEER 10mg/ml Injection",
        "SITAVIA Plus 50/1000mg",
        "SITAVIA 100mg Tablets",
        "NAPRON 500mg Tablet",
        "Piodol 500mg Tablets",
        "LOSART 50mg Tablets",
        "Neuro-Forte F/C Tablet",
        "CLOXABAN 20mg F/C Tablet",
    ]
    warehouses = ["Central", "South", "North", "West"]

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "batch_id",
                "product_name",
                "warehouse",
                "quantity",
                "manufactured_date",
                "expiry_date",
                "unit_cost_iqd",
            ]
        )

        now = datetime.now()

        for i in range(1, row_count + 1):
            product = random.choice(products)
            warehouse = random.choice(warehouses)
            qty = random.randint(50, 1000)

            man_date = now - timedelta(days=random.randint(30, 180))
            expiry_days = random.choice(
                [
                    random.randint(-15, 30),
                    random.randint(31, 150),
                    random.randint(151, 365),
                ]
            )
            expiry_date = man_date + timedelta(days=expiry_days)

            unit_cost = random.choice([3500, 5000, 8000, 10000, 18000])

            writer.writerow(
                [
                    f"B-{20000 + i}",
                    product,
                    warehouse,
                    qty,
                    man_date.strftime("%Y-%m-%d"),
                    expiry_date.strftime("%Y-%m-%d"),
                    unit_cost,
                ]
            )
    print(f"Generated {row_count} inventory transactions at: {filepath}")


if __name__ == "__main__":
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    data_dir = os.path.join(base_dir, "data")
    generate_sales_data(os.path.join(data_dir, "sales_transactions_sample.csv"))
    generate_inventory_data(os.path.join(data_dir, "inventory_transactions_sample.csv"))
