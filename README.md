# WhatsApp MCQ Bot

A hands-free WhatsApp bot that sends multiple choice questions to WhatsApp channels at scheduled intervals.

## Features

- 📚 Sends 4 MCQs daily at scheduled times
- 🎯 Questions sent to Questions Channel with emoji reactions
- ✅ Answers sent to Answers Channel simultaneously
- 📊 Tracks emoji reactions and shows statistics
- 🤖 Completely automated using GitHub Actions
- 💰 100% Free to run

## How It Works

1. **Questions Channel**: Bot sends MCQ questions with emoji options (😀😁😂🤣)
2. **Answers Channel**: Bot sends correct answers with explanations
3. **Users**: React with emojis to participate
4. **Bot**: Counts reactions and posts statistics
5. **Automation**: GitHub Actions runs 4 times daily

## Setup

1. Create two WhatsApp channels (Questions & Answers)
2. Configure channel IDs in `config.py`
3. Add your questions to `questions.json`
4. Deploy to GitHub Actions
5. Connect your WhatsApp account

## Schedule

- 9:00 AM - Question 1 + Answer 1
- 12:00 PM - Question 2 + Answer 2
- 3:00 PM - Question 3 + Answer 3
- 6:00 PM - Question 4 + Answer 4

## Files

- `bot.py` - Main bot logic
- `waha.py` - WAHA integration
- `questions.json` - Question database
- `config.py` - Configuration settings
- `.github/workflows/mcq-bot.yml` - GitHub Actions workflow
- `requirements.txt` - Python dependencies