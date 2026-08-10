import time
import os
import random
import requests
from faker import Faker
from datetime import datetime, timezone

# Ensure we hit the Next.js API route we will build next
API_URL = os.getenv("API_URL", "http://web:3000/api/sales")
fake = Faker()

# A fixed list of salesmen to make the dashboard grouping more realistic
SALESMEN = ["Alice Smith", "Bob Johnson", "Charlie Brown", "Diana Prince", "Evan Wright"]

def generate_valid_event():
    """Generates a perfectly valid engine oil sales event."""
    warranty_type = random.choice(["mileage", "time"])

    event = {
        "sellDate": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "amountLitres": round(random.uniform(10.0, 500.0), 2),
        "pricePerLitre": round(random.uniform(5.0, 25.0), 2),
        "customerCompany": fake.company(),
        "salesmanName": random.choice(SALESMEN),
        "warrantyType": warranty_type,
        "warrantyPeriodDays": random.randint(365, 1095) # 1 to 3 years
    }

    if warranty_type == "mileage":
        event["expectedYearlyMileage"] = random.randint(10000, 50000)

    return event

def inject_anomaly(event):
    """Corrupts an event to fulfill the 'Occasionally emitting broken data' requirement."""
    anomaly_type = random.choice(["missing_field", "null_value", "wrong_type"])

    if anomaly_type == "missing_field":
        # Remove a random required key
        field_to_remove = random.choice(list(event.keys()))
        del event[field_to_remove]
    elif anomaly_type == "null_value":
        # Inject a null into a field that expects a value
        field_to_null = random.choice(["amountLitres", "customerCompany", "salesmanName"])
        event[field_to_null] = None
    elif anomaly_type == "wrong_type":
        # Send a string where a float is expected
        event["amountLitres"] = "five hundred liters"

    return event

def generate_batch():
    """Creates a batch of 3 to 8 events."""
    batch_size = random.randint(3, 8)
    batch = []

    for _ in range(batch_size):
        event = generate_valid_event()

        # 15% chance to deliberately break the event
        if random.random() < 0.15:
            event = inject_anomaly(event)

        batch.append(event)

    return batch

def main():
    print(f"Producer starting. Target API: {API_URL}")

    # Brief pause to let the web container and database boot up first
    time.sleep(5)

    while True:
        batch = generate_batch()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Emitting batch of {len(batch)} events...")

        try:
            # Send the batch as a JSON array
            response = requests.post(API_URL, json=batch, timeout=5)
            print(f"Server responded: HTTP {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to send data (Server might be down): {e}")

        # Requirement: Emit every 30 seconds
        time.sleep(30)

if __name__ == "__main__":
    main()
