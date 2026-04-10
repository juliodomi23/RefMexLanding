import requests
import sys
import json
from datetime import datetime

class REFMEXAPITester:
    def __init__(self, base_url="https://refmex-services.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_blog_seed(self):
        """Test blog seeding endpoint"""
        try:
            response = requests.post(f"{self.api_url}/blog/seed", timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'No message')}"
            self.log_test("Blog Seed", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Blog Seed", False, str(e))
            return False, {}

    def test_get_blog_articles(self):
        """Test getting all blog articles"""
        try:
            response = requests.get(f"{self.api_url}/blog", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                articles = response.json()
                details += f", Articles count: {len(articles)}"
                # Check if we have articles for all categories
                categories = set(article.get('category') for article in articles)
                expected_categories = {'empresarios', 'fiscalistas', 'asalariados'}
                if expected_categories.issubset(categories):
                    details += f", Categories: {sorted(categories)}"
                else:
                    success = False
                    details += f", Missing categories: {expected_categories - categories}"
            self.log_test("Get Blog Articles", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Blog Articles", False, str(e))
            return False, []

    def test_get_blog_by_category(self):
        """Test filtering blog articles by category"""
        categories = ['empresarios', 'fiscalistas', 'asalariados']
        all_success = True
        
        for category in categories:
            try:
                response = requests.get(f"{self.api_url}/blog?category={category}", timeout=10)
                success = response.status_code == 200
                details = f"Status: {response.status_code}"
                if success:
                    articles = response.json()
                    details += f", Articles count: {len(articles)}"
                    # Verify all articles belong to the requested category
                    if articles:
                        wrong_category = [a for a in articles if a.get('category') != category]
                        if wrong_category:
                            success = False
                            details += f", Found {len(wrong_category)} articles with wrong category"
                        else:
                            details += f", All articles correctly filtered for {category}"
                    else:
                        details += f", No articles found for {category}"
                self.log_test(f"Get Blog Articles - {category}", success, details)
                if not success:
                    all_success = False
            except Exception as e:
                self.log_test(f"Get Blog Articles - {category}", False, str(e))
                all_success = False
        
        return all_success

    def test_create_job_application(self):
        """Test creating a job application"""
        try:
            # Test data
            test_data = {
                'nombre': f'Test User {datetime.now().strftime("%H%M%S")}',
                'edad': '28',
                'puesto': 'Contador de Impuestos',
                'grado_academico': 'Licenciatura en Contaduría',
                'salario_deseado': '$25,000 MXN'
            }
            
            response = requests.post(f"{self.api_url}/applications", data=test_data, timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Success: {data.get('success')}, ID: {data.get('id', 'No ID')}"
                return success, data.get('id')
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            self.log_test("Create Job Application", success, details)
            return success, None
        except Exception as e:
            self.log_test("Create Job Application", False, str(e))
            return False, None

    def test_get_job_applications(self):
        """Test getting job applications"""
        try:
            response = requests.get(f"{self.api_url}/applications", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                applications = response.json()
                details += f", Applications count: {len(applications)}"
                # Check structure of first application if exists
                if applications:
                    first_app = applications[0]
                    required_fields = ['id', 'nombre', 'edad', 'puesto', 'created_at']
                    missing_fields = [field for field in required_fields if field not in first_app]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                    else:
                        details += ", All required fields present"
            self.log_test("Get Job Applications", success, details)
            return success
        except Exception as e:
            self.log_test("Get Job Applications", False, str(e))
            return False

    def test_status_endpoints(self):
        """Test status check endpoints"""
        try:
            # Test creating a status check
            test_data = {
                'client_name': f'Test Client {datetime.now().strftime("%H%M%S")}'
            }
            
            response = requests.post(f"{self.api_url}/status", json=test_data, timeout=10)
            success = response.status_code == 200
            details = f"Create Status - Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", ID: {data.get('id', 'No ID')}"
            
            # Test getting status checks
            response = requests.get(f"{self.api_url}/status", timeout=10)
            get_success = response.status_code == 200
            details += f" | Get Status - Status: {response.status_code}"
            if get_success:
                statuses = response.json()
                details += f", Count: {len(statuses)}"
            
            overall_success = success and get_success
            self.log_test("Status Endpoints", overall_success, details)
            return overall_success
        except Exception as e:
            self.log_test("Status Endpoints", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🔍 Starting REFMEX API Testing...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test API connectivity first
        if not self.test_api_root():
            print("❌ API Root failed - stopping tests")
            return self.generate_report()
        
        # Test blog functionality
        print("\n📝 Testing Blog APIs...")
        self.test_blog_seed()
        self.test_get_blog_articles()
        self.test_get_blog_by_category()
        
        # Test job application functionality
        print("\n💼 Testing Job Application APIs...")
        self.test_create_job_application()
        self.test_get_job_applications()
        
        # Test status functionality
        print("\n📊 Testing Status APIs...")
        self.test_status_endpoints()
        
        return self.generate_report()

    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed:")
            failed_tests = [test for test in self.test_results if not test['success']]
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
            return 1

def main():
    tester = REFMEXAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())