"""
Configuration file for WhatsApp MCQ Bot
"""

import os
from dotenv import load_dotenv

load_dotenv()

# WhatsApp Channel IDs (you'll need to get these from your channels)
QUESTIONS_CHANNEL_ID = os.getenv("QUESTIONS_CHANNEL_ID", "your_questions_channel_id")
ANSWERS_CHANNEL_ID = os.getenv("ANSWERS_CHANNEL_ID", "your_answers_channel_id")

# WAHA Configuration
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3000")
WAHA_SESSION_NAME = os.getenv("WAHA_SESSION_NAME", "mcq_bot")

# Bot Settings
BOT_NAME = "MCQ Bot"
DAILY_QUESTIONS = 4

# Schedule Times (24-hour format)
SCHEDULE_TIMES = [
    "09:00",  # 9:00 AM
    "12:00",  # 12:00 PM
    "15:00",  # 3:00 PM
    "18:00"   # 6:00 PM
]

# Emoji mappings for answers
EMOJI_OPTIONS = {
    "A": "😀",
    "B": "😁", 
    "C": "😂",
    "D": "🤣"
}

# Question categories
CATEGORIES = [
    "General Knowledge",
    "Science",
    "History",
    "Geography",
    "Technology",
    "Sports",
    "Entertainment",
    "Literature"
]