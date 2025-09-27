# WhatsApp MCQ Bot - Quick Start Guide

## 🚀 What You Get

A **completely hands-free** WhatsApp bot that:
- ✅ Sends 4 MCQs daily at scheduled times (9 AM, 12 PM, 3 PM, 6 PM)
- ✅ Posts questions to Questions Channel with emoji reactions
- ✅ Posts answers to Answers Channel simultaneously  
- ✅ Tracks emoji reactions and shows statistics
- ✅ Runs automatically on GitHub Actions
- ✅ **100% FREE** to run

## 📱 User Experience

### Questions Channel:
```
📚 Daily MCQ Challenge - Question 1/4

What is the capital of France?

A) London 😀
B) Paris 😁  
C) Berlin 😂
D) Madrid 🤣

React with the emoji of your answer!
⏰ Answer will be revealed in 5 minutes
```

### Answers Channel:
```
📚 Daily MCQ Challenge - Answer 1/4

What is the capital of France?

✅ Correct Answer: B) Paris 😁

💡 Explanation: Paris has been the capital of France since the 12th century...

📊 Vote Results:
😀 A) London - 12 votes (15%)
😁 B) Paris - 45 votes (56%) ✅
😂 C) Berlin - 8 votes (10%)
🤣 D) Madrid - 15 votes (19%)

Total: 80 participants
```

## ⚡ Quick Setup (5 minutes)

### 1. Create WhatsApp Channels
- **Questions Channel**: "Daily MCQ Questions"
- **Answers Channel**: "MCQ Answers"
- Make both **Public**
- Note down the **Channel IDs**

### 2. Configure GitHub
1. Push this code to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Add secrets:
   ```
   QUESTIONS_CHANNEL_ID=your_questions_channel_id
   ANSWERS_CHANNEL_ID=your_answers_channel_id
   ```

### 3. Deploy
1. Go to **Actions** tab
2. Click **WhatsApp MCQ Bot**
3. Click **Run workflow** → **Run workflow**
4. **Scan QR code** with your WhatsApp app
5. Wait for connection confirmation

### 4. Done! 🎉
The bot will now run automatically 4 times daily!

## 📁 Files Created

- `bot.py` - Main bot logic
- `waha.py` - WhatsApp automation
- `questions.json` - 10 sample questions
- `config.py` - Configuration settings
- `.github/workflows/mcq-bot.yml` - GitHub Actions workflow
- `DEPLOYMENT.md` - Detailed setup guide
- `test_bot.py` - Test script

## 🧪 Test Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
python test_bot.py

# Test bot (requires WhatsApp connection)
python bot.py
```

## 📊 Schedule

The bot runs automatically at:
- **9:00 AM UTC** - Question 1 + Answer 1
- **12:00 PM UTC** - Question 2 + Answer 2  
- **3:00 PM UTC** - Question 3 + Answer 3
- **6:00 PM UTC** - Question 4 + Answer 4

## 🎯 Customize Questions

Edit `questions.json` to add your own questions:

```json
{
  "id": 11,
  "question": "Your question here?",
  "options": {
    "A": "Option A",
    "B": "Option B", 
    "C": "Option C",
    "D": "Option D"
  },
  "correct_answer": "B",
  "explanation": "Your explanation here",
  "category": "Your Category",
  "difficulty": "Easy/Medium/Hard"
}
```

## 🔧 Troubleshooting

### Bot not sending messages?
1. Check GitHub Actions logs
2. Verify channel IDs are correct
3. Ensure WhatsApp connection is active

### Connection issues?
1. Re-run workflow manually
2. Scan QR code again
3. Check if WhatsApp Web works

## 💰 Cost

**Completely FREE:**
- ✅ GitHub Actions: Free for public repos
- ✅ WAHA: Open source
- ✅ WhatsApp: No API costs

## 📈 Next Steps

1. **Monitor** the first few runs
2. **Customize** questions for your audience
3. **Share** your channels with users
4. **Add** more question categories
5. **Scale** to more questions per day

---

**🎉 Your WhatsApp MCQ Bot is ready to go!**

Just follow the Quick Setup steps above and you'll have a fully automated MCQ bot running in minutes!