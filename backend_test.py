import requests
import unittest
import uuid
import time
from datetime import datetime

class SaaSBlueprintAPITest(unittest.TestCase):
    def setUp(self):
        # Get the backend URL from environment
        self.base_url = "http://localhost:8001"
        self.test_user = {
            "username": f"testuser_{int(time.time())}",
            "email": f"testuser_{int(time.time())}@example.com",
            "password": "password123"
        }
        self.token = None
        self.project_id = None
        self.task_id = None

    def test_01_api_root(self):
        """Test the API root endpoint"""
        print("\n🔍 Testing API root endpoint...")
        response = requests.get(f"{self.base_url}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "SaaS Blueprint Generator API")
        print("✅ API root endpoint test passed")

    def test_02_register_user(self):
        """Test user registration"""
        print("\n🔍 Testing user registration...")
        response = requests.post(
            f"{self.base_url}/api/register",
            json=self.test_user
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_user["username"])
        self.assertEqual(data["user"]["email"], self.test_user["email"])
        self.token = data["access_token"]
        print("✅ User registration test passed")

    def test_03_login_user(self):
        """Test user login"""
        print("\n🔍 Testing user login...")
        response = requests.post(
            f"{self.base_url}/api/login",
            json={
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], self.test_user["email"])
        self.token = data["access_token"]
        print("✅ User login test passed")

    def test_04_get_user_profile(self):
        """Test getting user profile"""
        print("\n🔍 Testing get user profile...")
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/user/profile",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], self.test_user["email"])
        print("✅ Get user profile test passed")

    def test_05_create_project(self):
        """Test creating a project"""
        print("\n🔍 Testing project creation...")
        headers = {"Authorization": f"Bearer {self.token}"}
        project_data = {
            "title": "Team Collaboration Platform",
            "description": "A comprehensive platform for remote team collaboration with real-time messaging, file sharing, project tracking, and video conferencing integration designed to increase productivity for distributed teams."
        }
        response = requests.post(
            f"{self.base_url}/api/projects",
            json=project_data,
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("project", data)
        self.assertEqual(data["project"]["title"], project_data["title"])
        self.project_id = data["project"]["id"]
        print("✅ Project creation test passed")

    def test_06_get_projects(self):
        """Test getting user projects"""
        print("\n🔍 Testing get user projects...")
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/projects",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("projects", data)
        self.assertTrue(len(data["projects"]) > 0)
        print("✅ Get user projects test passed")

    def test_07_get_project_detail(self):
        """Test getting project details"""
        print("\n🔍 Testing get project details...")
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/projects/{self.project_id}",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("project", data)
        self.assertEqual(data["project"]["id"], self.project_id)
        self.assertIn("tasks", data["project"])
        print("✅ Get project details test passed")

    def test_08_get_project_tasks(self):
        """Test getting project tasks"""
        print("\n🔍 Testing get project tasks...")
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/projects/{self.project_id}/tasks",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("tasks", data)
        if len(data["tasks"]) > 0:
            self.task_id = data["tasks"][0]["id"]
        print("✅ Get project tasks test passed")

    def test_09_create_task(self):
        """Test creating a task"""
        print("\n🔍 Testing task creation...")
        headers = {"Authorization": f"Bearer {self.token}"}
        task_data = {
            "title": "Implement user authentication",
            "description": "Add secure login and registration functionality",
            "priority": "High"
        }
        response = requests.post(
            f"{self.base_url}/api/projects/{self.project_id}/tasks",
            json=task_data,
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task", data)
        self.assertEqual(data["task"]["title"], task_data["title"])
        if not self.task_id:
            self.task_id = data["task"]["id"]
        print("✅ Task creation test passed")

    def test_10_update_task(self):
        """Test updating a task"""
        print("\n🔍 Testing task update...")
        if not self.task_id:
            print("⚠️ No task ID available, skipping test")
            return
            
        headers = {"Authorization": f"Bearer {self.token}"}
        task_update = {
            "status": "In Progress"
        }
        response = requests.put(
            f"{self.base_url}/api/tasks/{self.task_id}",
            json=task_update,
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task", data)
        self.assertEqual(data["task"]["status"], task_update["status"])
        print("✅ Task update test passed")

    def test_11_get_project_flow(self):
        """Test getting project flow"""
        print("\n🔍 Testing get project flow...")
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/projects/{self.project_id}/flow",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("flow_steps", data)
        self.assertIn("pages_needed", data)
        print("✅ Get project flow test passed")

    def test_12_get_ai_suggestion(self):
        """Test getting AI suggestion"""
        print("\n🔍 Testing get AI suggestion...")
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/assistant/suggestion",
            headers=headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("suggestion", data)
        print("✅ Get AI suggestion test passed")

if __name__ == "__main__":
    # Run tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(SaaSBlueprintAPITest('test_01_api_root'))
    test_suite.addTest(SaaSBlueprintAPITest('test_02_register_user'))
    test_suite.addTest(SaaSBlueprintAPITest('test_03_login_user'))
    test_suite.addTest(SaaSBlueprintAPITest('test_04_get_user_profile'))
    test_suite.addTest(SaaSBlueprintAPITest('test_05_create_project'))
    test_suite.addTest(SaaSBlueprintAPITest('test_06_get_projects'))
    test_suite.addTest(SaaSBlueprintAPITest('test_07_get_project_detail'))
    test_suite.addTest(SaaSBlueprintAPITest('test_08_get_project_tasks'))
    test_suite.addTest(SaaSBlueprintAPITest('test_09_create_task'))
    test_suite.addTest(SaaSBlueprintAPITest('test_10_update_task'))
    test_suite.addTest(SaaSBlueprintAPITest('test_11_get_project_flow'))
    test_suite.addTest(SaaSBlueprintAPITest('test_12_get_ai_suggestion'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)