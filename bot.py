"""
WhatsApp MCQ Bot - Main bot logic
"""

import json
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from waha import WAHAClient
from config import (
    QUESTIONS_CHANNEL_ID, 
    ANSWERS_CHANNEL_ID, 
    EMOJI_OPTIONS, 
    BOT_NAME,
    DAILY_QUESTIONS
)

class MCQBot:
    """Main bot class for handling MCQ questions and answers"""
    
    def __init__(self):
        self.waha_client = WAHAClient()
        self.questions = self.load_questions()
        self.sent_questions = self.load_sent_questions()
        
    def load_questions(self) -> List[Dict]:
        """Load questions from JSON file"""
        try:
            with open('questions.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('questions', [])
        except FileNotFoundError:
            print("❌ questions.json not found")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing questions.json: {e}")
            return []
    
    def load_sent_questions(self) -> List[int]:
        """Load list of already sent question IDs"""
        try:
            with open('sent_questions.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def save_sent_questions(self):
        """Save list of sent question IDs"""
        with open('sent_questions.json', 'w') as f:
            json.dump(self.sent_questions, f)
    
    def get_random_question(self) -> Optional[Dict]:
        """Get a random question that hasn't been sent recently"""
        available_questions = [q for q in self.questions if q['id'] not in self.sent_questions]
        
        if not available_questions:
            # Reset sent questions if all have been used
            self.sent_questions = []
            available_questions = self.questions
        
        if available_questions:
            question = random.choice(available_questions)
            self.sent_questions.append(question['id'])
            self.save_sent_questions()
            return question
        
        return None
    
    def format_question_message(self, question: Dict, question_num: int) -> str:
        """Format question message for WhatsApp"""
        message = f"📚 Daily MCQ Challenge - Question {question_num}/{DAILY_QUESTIONS}\n\n"
        message += f"{question['question']}\n\n"
        
        # Add options with emojis
        for option, text in question['options'].items():
            emoji = EMOJI_OPTIONS.get(option, "❓")
            message += f"{option}) {text} {emoji}\n"
        
        message += f"\nReact with the emoji of your answer!\n"
        message += f"⏰ Answer will be revealed in 5 minutes\n"
        message += f"📊 Category: {question.get('category', 'General')}\n"
        message += f"🎯 Difficulty: {question.get('difficulty', 'Medium')}"
        
        return message
    
    def format_answer_message(self, question: Dict, question_num: int, reactions: Dict = None) -> str:
        """Format answer message for WhatsApp"""
        correct_option = question['correct_answer']
        correct_text = question['options'][correct_option]
        correct_emoji = EMOJI_OPTIONS.get(correct_option, "✅")
        
        message = f"📚 Daily MCQ Challenge - Answer {question_num}/{DAILY_QUESTIONS}\n\n"
        message += f"{question['question']}\n\n"
        message += f"✅ Correct Answer: {correct_option}) {correct_text} {correct_emoji}\n\n"
        message += f"💡 Explanation: {question['explanation']}\n\n"
        
        # Add reaction statistics if available
        if reactions:
            message += "📊 Vote Results:\n"
            total_reactions = sum(reactions.values())
            
            for option, text in question['options'].items():
                emoji = EMOJI_OPTIONS.get(option, "❓")
                count = reactions.get(emoji, 0)
                percentage = (count / total_reactions * 100) if total_reactions > 0 else 0
                marker = "✅" if option == correct_option else ""
                message += f"{emoji} {option}) {text} - {count} votes ({percentage:.1f}%) {marker}\n"
            
            message += f"\nTotal: {total_reactions} participants"
        else:
            message += "📊 Vote results will be available after reactions are counted"
        
        return message
    
    def get_message_reactions(self, message_id: str) -> Dict:
        """Get reactions for a specific message"""
        try:
            reactions = self.waha_client.get_reactions(message_id)
            if "reactions" in reactions:
                return reactions["reactions"]
            return {}
        except Exception as e:
            print(f"Error getting reactions: {e}")
            return {}
    
    def send_question(self, question_num: int) -> bool:
        """Send a question to the questions channel"""
        question = self.get_random_question()
        if not question:
            print("❌ No questions available")
            return False
        
        message = self.format_question_message(question, question_num)
        
        print(f"📤 Sending question {question_num} to Questions Channel...")
        result = self.waha_client.send_message(QUESTIONS_CHANNEL_ID, message)
        
        if "error" in result:
            print(f"❌ Failed to send question: {result['error']}")
            return False
        
        print(f"✅ Question {question_num} sent successfully")
        print(f"Question: {question['question']}")
        print(f"Correct Answer: {question['correct_answer']}) {question['options'][question['correct_answer']]}")
        
        return True
    
    def send_answer(self, question_num: int) -> bool:
        """Send answer to the answers channel"""
        # Get the last sent question
        if not self.sent_questions:
            print("❌ No questions have been sent yet")
            return False
        
        last_question_id = self.sent_questions[-1]
        question = next((q for q in self.questions if q['id'] == last_question_id), None)
        
        if not question:
            print(f"❌ Question with ID {last_question_id} not found")
            return False
        
        message = self.format_answer_message(question, question_num)
        
        print(f"📤 Sending answer {question_num} to Answers Channel...")
        result = self.waha_client.send_message(ANSWERS_CHANNEL_ID, message)
        
        if "error" in result:
            print(f"❌ Failed to send answer: {result['error']}")
            return False
        
        print(f"✅ Answer {question_num} sent successfully")
        return True
    
    def send_question_and_answer(self, question_num: int) -> bool:
        """Send both question and answer simultaneously"""
        print(f"\n🚀 Sending Question {question_num}/{DAILY_QUESTIONS}")
        print("=" * 50)
        
        # Send question
        question_sent = self.send_question(question_num)
        if not question_sent:
            return False
        
        # Wait a moment
        time.sleep(2)
        
        # Send answer
        answer_sent = self.send_answer(question_num)
        if not answer_sent:
            return False
        
        print(f"✅ Question {question_num} and answer sent successfully!")
        return True
    
    def send_daily_questions(self) -> bool:
        """Send all daily questions"""
        print(f"🤖 {BOT_NAME} - Starting daily question session")
        print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        success_count = 0
        
        for i in range(1, DAILY_QUESTIONS + 1):
            if self.send_question_and_answer(i):
                success_count += 1
            
            # Wait between questions (except for the last one)
            if i < DAILY_QUESTIONS:
                print(f"⏳ Waiting 10 seconds before next question...")
                time.sleep(10)
        
        print("=" * 60)
        print(f"📊 Daily session completed: {success_count}/{DAILY_QUESTIONS} questions sent")
        
        if success_count == DAILY_QUESTIONS:
            print("🎉 All questions sent successfully!")
            return True
        else:
            print("⚠️ Some questions failed to send")
            return False
    
    def test_connection(self) -> bool:
        """Test WhatsApp connection"""
        print("🔧 Testing WhatsApp connection...")
        
        status = self.waha_client.get_session_status()
        if status.get("status") == "WORKING":
            print("✅ WhatsApp connection is working")
            return True
        else:
            print(f"❌ WhatsApp connection status: {status.get('status', 'Unknown')}")
            return False

def main():
    """Main function"""
    bot = MCQBot()
    
    # Test connection
    if not bot.test_connection():
        print("❌ WhatsApp connection failed. Please check your setup.")
        return
    
    # Send daily questions
    bot.send_daily_questions()

if __name__ == "__main__":
    main()