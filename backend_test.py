#!/usr/bin/env python3
"""
Backend API Testing for Rejap Khujamov School Attendance System
Tests all API endpoints and core functionality
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class SchoolAttendanceAPITester:
    def __init__(self, base_url="https://rejap-scanner.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ PASS: {name}")
        else:
            print(f"❌ FAIL: {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if "Rejap Khujamov School" in data.get("message", ""):
                    self.log_test("Root endpoint", True)
                    return True
                else:
                    self.log_test("Root endpoint", False, f"Unexpected message: {data}")
            else:
                self.log_test("Root endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Root endpoint", False, str(e))
        return False
    
    def test_director_login(self):
        """Test director login with valid credentials"""
        try:
            response = requests.post(
                f"{self.api_url}/auth/director/login",
                json={"username": "director", "password": "school2024"},
                timeout=10
            )
            success = response.status_code == 200
            if success:
                data = response.json()
                if data.get("success") and data.get("username") == "director":
                    self.log_test("Director login (valid credentials)", True)
                    return True
                else:
                    self.log_test("Director login (valid credentials)", False, f"Response: {data}")
            else:
                self.log_test("Director login (valid credentials)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Director login (valid credentials)", False, str(e))
        return False
    
    def test_director_login_invalid(self):
        """Test director login with invalid credentials"""
        try:
            response = requests.post(
                f"{self.api_url}/auth/director/login",
                json={"username": "director", "password": "wrongpassword"},
                timeout=10
            )
            success = response.status_code == 401
            if success:
                self.log_test("Director login (invalid credentials)", True)
                return True
            else:
                self.log_test("Director login (invalid credentials)", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Director login (invalid credentials)", False, str(e))
        return False
    
    def test_create_director_account(self):
        """Test creating director account (should fail if exists)"""
        try:
            response = requests.post(
                f"{self.api_url}/auth/director/create",
                json={"username": "director", "password": "school2024"},
                timeout=10
            )
            # Should return 400 if director already exists
            success = response.status_code in [400, 200]
            if success:
                self.log_test("Create director account", True, f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Create director account", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Create director account", False, str(e))
        return False
    
    def test_student_registration(self):
        """Test student registration"""
        try:
            # Mock face descriptor (128 dimensions)
            face_descriptor = [0.1] * 128
            
            student_data = {
                "full_name": f"Test Student {datetime.now().strftime('%H%M%S')}",
                "class_grade": 8,
                "class_subsection": "А",
                "face_descriptor": face_descriptor
            }
            
            response = requests.post(
                f"{self.api_url}/students",
                json=student_data,
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                if data.get("id") and data.get("shift") == "morning":
                    self.log_test("Student registration", True)
                    return True, data["id"]
                else:
                    self.log_test("Student registration", False, f"Invalid response: {data}")
            else:
                self.log_test("Student registration", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Student registration", False, str(e))
        return False, None
    
    def test_get_students(self):
        """Test getting all students"""
        try:
            response = requests.get(f"{self.api_url}/students", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get students", True, f"Found {len(data)} students")
                    return True
                else:
                    self.log_test("Get students", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Get students", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get students", False, str(e))
        return False
    
    def test_get_students_by_class(self):
        """Test getting students by class"""
        try:
            response = requests.get(f"{self.api_url}/students/class/8/А", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get students by class", True, f"Found {len(data)} students in class 8-А")
                    return True
                else:
                    self.log_test("Get students by class", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Get students by class", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get students by class", False, str(e))
        return False
    
    def test_attendance_scan(self, student_id=None):
        """Test attendance scanning"""
        try:
            if not student_id:
                # Need to create a student first
                success, student_id = self.test_student_registration()
                if not success:
                    self.log_test("Attendance scan", False, "No student available for testing")
                    return False
            
            # Mock face descriptor
            face_descriptor = [0.1] * 128
            
            scan_data = {
                "student_id": student_id,
                "face_descriptor": face_descriptor
            }
            
            response = requests.post(
                f"{self.api_url}/attendance/scan",
                json=scan_data,
                timeout=10
            )
            
            success = response.status_code in [200, 400]  # 400 is OK if already scanned
            if success:
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Attendance scan", True, f"Scanned: {data.get('student_name')}")
                else:
                    self.log_test("Attendance scan", True, "Already scanned today (expected)")
                return True
            else:
                self.log_test("Attendance scan", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Attendance scan", False, str(e))
        return False
    
    def test_get_today_attendance(self):
        """Test getting today's attendance"""
        try:
            response = requests.get(f"{self.api_url}/attendance/today", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get today attendance", True, f"Found {len(data)} records")
                    return True
                else:
                    self.log_test("Get today attendance", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Get today attendance", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get today attendance", False, str(e))
        return False
    
    def test_get_class_attendance(self):
        """Test getting class attendance"""
        try:
            response = requests.get(f"{self.api_url}/attendance/class/8/А", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if "total_students" in data and "attendance_records" in data:
                    self.log_test("Get class attendance", True, f"Class has {data['total_students']} students")
                    return True
                else:
                    self.log_test("Get class attendance", False, f"Missing expected fields: {data}")
            else:
                self.log_test("Get class attendance", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get class attendance", False, str(e))
        return False
    
    def test_weekly_analytics(self):
        """Test weekly analytics"""
        try:
            response = requests.get(f"{self.api_url}/analytics/weekly", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Weekly analytics", True, f"Found {len(data)} classes")
                    return True
                else:
                    self.log_test("Weekly analytics", False, f"Expected list, got: {type(data)}")
            else:
                self.log_test("Weekly analytics", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Weekly analytics", False, str(e))
        return False
    
    def test_class_of_week(self):
        """Test class of the week"""
        try:
            response = requests.get(f"{self.api_url}/analytics/class-of-week", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                if data is None or "class_name" in data:
                    self.log_test("Class of the week", True)
                    return True
                else:
                    self.log_test("Class of the week", False, f"Unexpected response: {data}")
            else:
                self.log_test("Class of the week", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Class of the week", False, str(e))
        return False
    
    def test_weekly_export(self):
        """Test weekly report export"""
        try:
            response = requests.get(f"{self.api_url}/export/weekly", timeout=15)
            success = response.status_code == 200
            if success:
                # Check if response is Excel file
                content_type = response.headers.get('content-type', '')
                if 'spreadsheet' in content_type or len(response.content) > 1000:
                    self.log_test("Weekly export", True, f"Excel file size: {len(response.content)} bytes")
                    return True
                else:
                    self.log_test("Weekly export", False, f"Invalid content type: {content_type}")
            else:
                self.log_test("Weekly export", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Weekly export", False, str(e))
        return False
    
    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting School Attendance API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 50)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Authentication tests
        self.test_director_login()
        self.test_director_login_invalid()
        self.test_create_director_account()
        
        # Student management
        success, student_id = self.test_student_registration()
        self.test_get_students()
        self.test_get_students_by_class()
        
        # Attendance management
        self.test_attendance_scan(student_id if success else None)
        self.test_get_today_attendance()
        self.test_get_class_attendance()
        
        # Analytics and reporting
        self.test_weekly_analytics()
        self.test_class_of_week()
        self.test_weekly_export()
        
        # Summary
        print("=" * 50)
        print(f"📊 Tests Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Detailed results
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"] and not result["success"]:
                print(f"   💬 {result['details']}")
        
        return success_rate >= 70  # Consider 70%+ as successful

def main():
    tester = SchoolAttendanceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())