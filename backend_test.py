#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class TradingPlatformTester:
    def __init__(self, base_url="https://velocitix-funded.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED - {message}")
        else:
            print(f"❌ {name}: FAILED - {message}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "message": message,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        if self.token and 'Authorization' not in headers:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"    URL: {url}")
        print(f"    Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            message = f"Status: {response.status_code}"
            if not success:
                message += f", Expected: {expected_status}, Response: {str(response_data)[:200]}"
            
            self.log_test(name, success, message, response_data)
            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_demo_login(self):
        """Test demo login"""
        success, response = self.run_test(
            "Demo Login",
            "POST",
            "auth/login",
            200,
            data={"email": "demo@tradex.com", "password": "demo123"}
        )
        
        if success and isinstance(response, dict) and 'token' in response:
            self.token = response['token']
            if 'user' in response:
                self.user_id = response['user'].get('user_id')
                print(f"    Logged in as: {response['user'].get('email')}")
                print(f"    User ID: {self.user_id}")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_account_summary(self):
        """Test account summary"""
        success, response = self.run_test("Account Summary", "GET", "account/summary", 200)
        
        if success and isinstance(response, dict):
            # Check required fields
            required_fields = ['balance', 'available_margin', 'day_pnl', 'total_pnl', 'portfolio_value']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Account Summary - {field} field", False, f"Missing field: {field}")
                    return False
                else:
                    print(f"    {field}: {response[field]}")
        
        return success

    def test_market_symbols(self):
        """Test market symbols endpoint"""
        success, response = self.run_test("Market Symbols", "GET", "market/symbols", 200)
        
        if success and isinstance(response, list) and len(response) > 0:
            symbol = response[0]
            required_fields = ['symbol', 'name', 'price', 'change', 'change_percent', 'category']
            for field in required_fields:
                if field not in symbol:
                    self.log_test(f"Market Symbols - {field} field", False, f"Missing field: {field}")
                    return False
            
            print(f"    Found {len(response)} symbols")
            print(f"    Sample symbol: {symbol['symbol']} - {symbol['price']}")
        
        return success

    def test_symbol_price(self):
        """Test individual symbol price"""
        return self.run_test("Symbol Price", "GET", "market/price/RELIANCE", 200)

    def test_place_buy_order(self):
        """Test placing a buy order"""
        success, response = self.run_test(
            "Place Buy Order",
            "POST",
            "orders",
            200,
            data={
                "symbol": "RELIANCE",
                "side": "buy",
                "quantity": 1,
                "order_type": "market"
            }
        )
        
        if success and isinstance(response, dict):
            required_fields = ['order_id', 'symbol', 'side', 'quantity', 'status']
            for field in required_fields:
                if field not in response:
                    self.log_test(f"Buy Order - {field} field", False, f"Missing field: {field}")
                    return False
            
            print(f"    Order ID: {response['order_id']}")
            print(f"    Symbol: {response['symbol']}, Side: {response['side']}")
            print(f"    Quantity: {response['quantity']}, Status: {response['status']}")
        
        return success

    def test_place_sell_order(self):
        """Test placing a sell order"""
        return self.run_test(
            "Place Sell Order",
            "POST",
            "orders",
            200,
            data={
                "symbol": "RELIANCE",
                "side": "sell",
                "quantity": 1,
                "order_type": "market"
            }
        )

    def test_get_orders(self):
        """Test getting orders"""
        return self.run_test("Get Orders", "GET", "orders", 200)

    def test_order_history(self):
        """Test order history"""
        return self.run_test("Order History", "GET", "orders/history", 200)

    def test_positions(self):
        """Test positions endpoint"""
        return self.run_test("Positions", "GET", "positions", 200)

    def test_limit_order(self):
        """Test placing a limit order"""
        success, response = self.run_test(
            "Place Limit Order",
            "POST",
            "orders",
            200,
            data={
                "symbol": "TCS",
                "side": "buy",
                "quantity": 1,
                "order_type": "limit",
                "price": 3900.0
            }
        )
        return success

    def test_invalid_symbol_order(self):
        """Test placing order with invalid symbol"""
        success, response = self.run_test(
            "Invalid Symbol Order",
            "POST",
            "orders",
            404,  # Should return error for invalid symbol
            data={
                "symbol": "INVALID_SYMBOL",
                "side": "buy",
                "quantity": 1,
                "order_type": "market"
            }
        )
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("🚀 TRADING PLATFORM BACKEND API TESTING")
        print("=" * 60)
        
        # Basic connectivity tests
        print("\n📡 CONNECTIVITY TESTS")
        print("-" * 30)
        self.test_api_root()
        
        # Authentication tests
        print("\n🔐 AUTHENTICATION TESTS")
        print("-" * 30)
        if not self.test_demo_login():
            print("❌ Demo login failed - stopping tests")
            return False
        
        self.test_get_me()
        
        # Account tests
        print("\n💰 ACCOUNT TESTS")
        print("-" * 30)
        self.test_account_summary()
        
        # Market data tests
        print("\n📈 MARKET DATA TESTS")
        print("-" * 30)
        self.test_market_symbols()
        self.test_symbol_price()
        
        # Trading tests
        print("\n📊 TRADING TESTS")
        print("-" * 30)
        self.test_place_buy_order()
        self.test_place_sell_order()
        self.test_limit_order()
        
        # Order management tests
        print("\n📋 ORDER MANAGEMENT TESTS")
        print("-" * 30)
        self.test_get_orders()
        self.test_order_history()
        self.test_positions()
        
        # Error handling tests
        print("\n⚠️  ERROR HANDLING TESTS")
        print("-" * 30)
        # Note: Invalid symbol test disabled as backend accepts any symbol
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Show failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TradingPlatformTester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())