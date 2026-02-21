#!/usr/bin/env python3
"""
Initialize a director account for the school attendance system
"""
import requests
import sys

BACKEND_URL = "https://rejap-scanner.preview.emergentagent.com/api"

def create_director():
    """Create a default director account"""
    
    # Default credentials
    username = "director"
    password = "school2024"
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/director/create",
            json={"username": username, "password": password}
        )
        
        if response.status_code == 200:
            print("✅ Director account created successfully!")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
            print("\nYou can now login to the director dashboard.")
        elif response.status_code == 400:
            print("ℹ️  Director account already exists.")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error creating director account: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("🏫 Initializing Rejap Khujamov School Attendance System...")
    print("=" * 60)
    create_director()
