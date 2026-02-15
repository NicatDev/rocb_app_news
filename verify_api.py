import requests
import sys

BASE_URL = "http://localhost:8000/api/v1/auth/"

def test_register():
    print("Testing Registration...")
    data = {
        "username": "api_test_user",
        "password": "password123",
        "email": "apitest@example.com",
        "first_name": "API",
        "last_name": "Test",
        "company": "TestCorp",
        "phone_number": "123456789",
        "field": "IT"
    }
    response = requests.post(BASE_URL + "register/", json=data)
    if response.status_code == 201:
        print("Registration Successful")
        return True
    else:
        print(f"Registration Failed: {response.status_code} - {response.text}")
        return False

def test_login():
    print("Testing Login...")
    data = {
        "username": "api_test_user",
        "password": "password123"
    }
    response = requests.post(BASE_URL + "login/", json=data)
    if response.status_code == 200:
        tokens = response.json()
        if "access" in tokens and "refresh" in tokens:
            print("Login Successful. Tokens received.")
            return True
        else:
            print(f"Login Failed. Tokens missing: {tokens}")
            return False
    else:
        print(f"Login Failed: {response.status_code} - {response.text}")
        return False

if __name__ == "__main__":
    if test_register():
        if test_login():
            print("ALL TESTS PASSED")
            sys.exit(0)
    print("TESTS FAILED")
    sys.exit(1)
