import unittest
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.tests.run_tests import TestCareLensPipeline
from backend.tests.test_api_endpoints import TestCareLensBackendAPI
from backend.tests.test_data_and_fhir import TestDataAndFHIRArchitecture

def run_all_tests():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # 1. Pipeline tests
    suite.addTests(loader.loadTestsFromTestCase(TestCareLensPipeline))

    # 2. Data and FHIR architecture tests
    suite.addTests(loader.loadTestsFromTestCase(TestDataAndFHIRArchitecture))

    # 3. Backend API tests
    suite.addTests(loader.loadTestsFromTestCase(TestCareLensBackendAPI))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)

if __name__ == "__main__":
    run_all_tests()
