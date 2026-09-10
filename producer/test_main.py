import unittest
from main import generate_valid_event, inject_anomaly

class TestProducerLogic(unittest.TestCase):
    def test_generate_valid_event_structure(self):
        """Ensures a valid event contains all required fields and correct data types."""
        event = generate_valid_event()

        self.assertIn("sellDate", event)
        self.assertIsInstance(event["amountLitres"], float)
        self.assertIsInstance(event["customerCompany"], str)
        self.assertIn(event["warrantyType"], ["mileage", "time"])

        if event["warrantyType"] == "mileage":
            self.assertIn("expectedYearlyMileage", event)

    def test_inject_anomaly_alters_payload(self):
        """Ensures the anomaly injector actually breaks the data."""
        valid_event = generate_valid_event()

        # We pass a copy so we can compare it to the original
        broken_event = inject_anomaly(valid_event.copy())

        # The broken event should no longer perfectly match the valid one
        self.assertNotEqual(valid_event, broken_event)

if __name__ == "__main__":
    unittest.main()
