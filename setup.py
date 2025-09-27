"""
Setup script for WhatsApp MCQ Bot
"""

import os
import json
import subprocess
import sys
from pathlib import Path

def check_docker():
    """Check if Docker is installed and running"""
    try:
        result = subprocess.run(['docker', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Docker is installed")
            return True
        else:
            print("❌ Docker is not installed")
            return False
    except FileNotFoundError:
        print("❌ Docker is not installed")
        return False

def check_python_dependencies():
    """Check if Python dependencies are installed"""
    try:
        import requests
        import schedule
        print("✅ Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def create_env_file():
    """Create .env file from template"""
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists() and env_example.exists():
        # Copy example to .env
        with open(env_example, 'r') as f:
            content = f.read()
        
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("✅ Created .env file from template")
        print("⚠️ Please edit .env file with your channel IDs")
        return True
    elif env_file.exists():
        print("✅ .env file already exists")
        return True
    else:
        print("❌ .env.example not found")
        return False

def test_waha_connection():
    """Test WAHA connection"""
    try:
        from waha import test_waha_connection
        return test_waha_connection()
    except Exception as e:
        print(f"❌ WAHA connection test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 WhatsApp MCQ Bot Setup")
    print("=" * 40)
    
    # Check requirements
    checks = [
        ("Docker", check_docker),
        ("Python Dependencies", check_python_dependencies),
        ("Environment File", create_env_file),
    ]
    
    all_passed = True
    for name, check_func in checks:
        print(f"\n🔍 Checking {name}...")
        if not check_func():
            all_passed = False
    
    if all_passed:
        print("\n✅ All checks passed!")
        print("\n📋 Next steps:")
        print("1. Edit .env file with your WhatsApp channel IDs")
        print("2. Create your WhatsApp channels (Questions & Answers)")
        print("3. Get channel IDs and update .env file")
        print("4. Test the bot locally: python bot.py")
        print("5. Push to GitHub and set up secrets")
        print("6. The bot will run automatically on schedule!")
    else:
        print("\n❌ Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()