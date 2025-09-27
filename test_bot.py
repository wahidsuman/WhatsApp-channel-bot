"""
Test script for WhatsApp MCQ Bot
"""

import json
import sys
from bot import MCQBot
from waha import WAHAClient

def test_questions_loading():
    """Test if questions are loaded correctly"""
    print("🔍 Testing questions loading...")
    
    bot = MCQBot()
    questions = bot.questions
    
    if not questions:
        print("❌ No questions loaded")
        return False
    
    print(f"✅ Loaded {len(questions)} questions")
    
    # Test first question
    first_question = questions[0]
    required_fields = ['id', 'question', 'options', 'correct_answer', 'explanation']
    
    for field in required_fields:
        if field not in first_question:
            print(f"❌ Missing field: {field}")
            return False
    
    print("✅ Question format is correct")
    return True

def test_question_formatting():
    """Test question message formatting"""
    print("\n🔍 Testing question formatting...")
    
    bot = MCQBot()
    if not bot.questions:
        print("❌ No questions to test")
        return False
    
    question = bot.questions[0]
    message = bot.format_question_message(question, 1)
    
    print("📝 Sample question message:")
    print("-" * 40)
    print(message)
    print("-" * 40)
    
    # Check if message contains required elements
    required_elements = [
        "Daily MCQ Challenge",
        "Question 1/4",
        "A)", "B)", "C)", "D)",
        "😀", "😁", "😂", "🤣",
        "React with the emoji"
    ]
    
    for element in required_elements:
        if element not in message:
            print(f"❌ Missing element: {element}")
            return False
    
    print("✅ Question formatting is correct")
    return True

def test_answer_formatting():
    """Test answer message formatting"""
    print("\n🔍 Testing answer formatting...")
    
    bot = MCQBot()
    if not bot.questions:
        print("❌ No questions to test")
        return False
    
    question = bot.questions[0]
    message = bot.format_answer_message(question, 1)
    
    print("📝 Sample answer message:")
    print("-" * 40)
    print(message)
    print("-" * 40)
    
    # Check if message contains required elements
    required_elements = [
        "Daily MCQ Challenge",
        "Answer 1/4",
        "Correct Answer:",
        "Explanation:",
        "Vote Results:"
    ]
    
    for element in required_elements:
        if element not in message:
            print(f"❌ Missing element: {element}")
            return False
    
    print("✅ Answer formatting is correct")
    return True

def test_waha_client():
    """Test WAHA client initialization"""
    print("\n🔍 Testing WAHA client...")
    
    try:
        client = WAHAClient()
        print("✅ WAHA client initialized")
        return True
    except Exception as e:
        print(f"❌ WAHA client error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    print("\n🔍 Testing configuration...")
    
    try:
        from config import (
            QUESTIONS_CHANNEL_ID, 
            ANSWERS_CHANNEL_ID, 
            EMOJI_OPTIONS, 
            SCHEDULE_TIMES
        )
        
        print(f"Questions Channel ID: {QUESTIONS_CHANNEL_ID}")
        print(f"Answers Channel ID: {ANSWERS_CHANNEL_ID}")
        print(f"Emoji Options: {EMOJI_OPTIONS}")
        print(f"Schedule Times: {SCHEDULE_TIMES}")
        
        print("✅ Configuration loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 WhatsApp MCQ Bot - Test Suite")
    print("=" * 50)
    
    tests = [
        ("Questions Loading", test_questions_loading),
        ("Question Formatting", test_question_formatting),
        ("Answer Formatting", test_answer_formatting),
        ("WAHA Client", test_waha_client),
        ("Configuration", test_config),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Bot is ready to deploy.")
        return True
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)