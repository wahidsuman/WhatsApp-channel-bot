"""
WAHA (WhatsApp HTTP API) integration for WhatsApp MCQ Bot
"""

import requests
import json
import time
from typing import Dict, List, Optional
from config import WAHA_BASE_URL, WAHA_SESSION_NAME

class WAHAClient:
    """Client for interacting with WAHA API"""
    
    def __init__(self, base_url: str = WAHA_BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.session_name = WAHA_SESSION_NAME
        
    def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make HTTP request to WAHA API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"WAHA API request failed: {e}")
            return {"error": str(e)}
    
    def start_session(self) -> Dict:
        """Start a new WAHA session"""
        endpoint = f"/api/sessions/{self.session_name}/start"
        data = {
            "name": self.session_name,
            "config": {
                "webhooks": [],
                "webhookEvents": ["message", "message.any"],
                "webhookUrl": "",
                "events": ["message", "message.any"],
                "rejectCalls": True,
                "markOnlineOnConnect": True
            }
        }
        return self._make_request("POST", endpoint, data)
    
    def stop_session(self) -> Dict:
        """Stop the WAHA session"""
        endpoint = f"/api/sessions/{self.session_name}/stop"
        return self._make_request("POST", endpoint)
    
    def get_session_status(self) -> Dict:
        """Get session status"""
        endpoint = f"/api/sessions/{self.session_name}"
        return self._make_request("GET", endpoint)
    
    def get_qr_code(self) -> Dict:
        """Get QR code for WhatsApp Web connection"""
        endpoint = f"/api/sessions/{self.session_name}/auth/qr"
        return self._make_request("GET", endpoint)
    
    def send_message(self, to: str, message: str, message_type: str = "text") -> Dict:
        """Send a message to WhatsApp"""
        endpoint = f"/api/sessions/{self.session_name}/sendMessage"
        data = {
            "to": to,
            "type": message_type,
            "text": {"body": message}
        }
        return self._make_request("POST", endpoint, data)
    
    def get_messages(self, limit: int = 50) -> Dict:
        """Get recent messages"""
        endpoint = f"/api/sessions/{self.session_name}/messages"
        params = {"limit": limit}
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to get messages: {e}")
            return {"error": str(e)}
    
    def get_reactions(self, message_id: str) -> Dict:
        """Get reactions for a specific message"""
        endpoint = f"/api/sessions/{self.session_name}/messages/{message_id}/reactions"
        return self._make_request("GET", endpoint)
    
    def wait_for_connection(self, timeout: int = 300) -> bool:
        """Wait for WhatsApp Web connection"""
        print("Waiting for WhatsApp Web connection...")
        print("Please scan the QR code with your WhatsApp mobile app")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            status = self.get_session_status()
            if status.get("status") == "WORKING":
                print("✅ WhatsApp Web connected successfully!")
                return True
            elif status.get("status") == "FAILED":
                print("❌ WhatsApp Web connection failed")
                return False
            
            time.sleep(5)
            print(".", end="", flush=True)
        
        print(f"\n⏰ Connection timeout after {timeout} seconds")
        return False
    
    def setup_webhook(self, webhook_url: str) -> Dict:
        """Setup webhook for receiving messages"""
        endpoint = f"/api/sessions/{self.session_name}/webhook"
        data = {
            "url": webhook_url,
            "events": ["message", "message.any"]
        }
        return self._make_request("POST", endpoint, data)

def test_waha_connection():
    """Test WAHA connection and setup"""
    client = WAHAClient()
    
    print("🔧 Testing WAHA connection...")
    
    # Check if WAHA is running
    try:
        status = client.get_session_status()
        print(f"WAHA Status: {status}")
    except Exception as e:
        print(f"❌ WAHA not accessible: {e}")
        print("Please make sure WAHA is running on the configured URL")
        return False
    
    # Start session
    print("🚀 Starting WAHA session...")
    start_result = client.start_session()
    print(f"Start result: {start_result}")
    
    # Get QR code
    print("📱 Getting QR code...")
    qr_result = client.get_qr_code()
    if "qr" in qr_result:
        print("QR Code URL:", qr_result["qr"])
    else:
        print("QR Code result:", qr_result)
    
    return True

if __name__ == "__main__":
    test_waha_connection()