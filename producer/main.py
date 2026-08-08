import time
import os

API_URL = os.getenv("API_URL", "http://localhost:3000/api/sales")

def main():
    print(f"Producer started. Target API: {API_URL}")
    while True:
        # TODO: Implement Faker logic, broken payload logic, and HTTP POST
        print("Emitting dummy payload...")
        time.sleep(30)

if __name__ == "__main__":
    main()