"""
Whapi.cloud client for WhatsApp MCQ Bot
"""

import requests
import json
from typing import Dict, List, Optional
from config import QUESTIONS_CHANNEL_ID, ANSWERS_CHANNEL_ID

class WhapiClient:
    """Client for interacting with Whapi.cloud API"""
    
    def __init__(self, api_token: str, instance_id: str):
        self.api_token = api_token
        self.instance_id = instance_id
        self.base_url = f"https://gate.whapi.cloud"
        
    def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make HTTP request to Whapi.cloud API"""
        url = f"{self.base_url}{endpoint}"
        
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"Whapi.cloud API request failed: {e}")
            return {"error": str(e)}
    
    def send_message(self, to: str, message: str, message_type: str = "text") -> Dict:
        """Send a message to WhatsApp"""
        endpoint = f"/instances/{self.instance_id}/messages"
        data = {
            "to": to,
            "type": message_type,
            "text": {"body": message}
        }
        return self._make_request("POST", endpoint, data)
    
    def send_message_to_channel(self, channel_id: str, message: str) -> Dict:
        """Send a message to a WhatsApp channel"""
        return self.send_message(channel_id, message)
    
    def get_instance_status(self) -> Dict:
        """Get instance status"""
        endpoint = f"/instances/{self.instance_id}/status"
        return self._make_request("GET", endpoint)
    
    def test_connection(self) -> bool:
        """Test Whapi.cloud connection"""
        try:
            status = self.get_instance_status()
            if "error" not in status:
                print("✅ Whapi.cloud connection is working")
                return True
            else:
                print(f"❌ Whapi.cloud connection failed: {status['error']}")
                return False
        except Exception as e:
            print(f"❌ Whapi.cloud connection test failed: {e}")
            return False

def test_whapi_connection():
    """Test Whapi.cloud connection"""
    import os
    
    api_token = os.getenv("WHAPI_API_TOKEN")
    instance_id = os.getenv("WHAPI_INSTANCE_ID")
    
    if not api_token or not instance_id:
        print("❌ WHAPI_API_TOKEN and WHAPI_INSTANCE_ID environment variables are required")
        return False
    
    client = WhapiClient(api_token, instance_id)
    return client.test_connection()

if __name__ == "__main__":
    test_whapi_connection()