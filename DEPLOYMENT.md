# WhatsApp MCQ Bot - Deployment Guide

This guide will help you deploy your WhatsApp MCQ bot to run automatically on GitHub Actions.

## Prerequisites

- GitHub account
- WhatsApp account
- Two WhatsApp channels (Questions & Answers)

## Step 1: Create WhatsApp Channels

### 1.1 Create Questions Channel
1. Open WhatsApp
2. Go to **Updates** tab
3. Tap **Create Channel**
4. Name it: `Daily MCQ Questions`
5. Description: `Daily multiple choice questions with emoji reactions`
6. Make it **Public**
7. Note down the channel ID (you'll need this later)

### 1.2 Create Answers Channel
1. Create another channel
2. Name it: `MCQ Answers`
3. Description: `Correct answers and explanations for daily questions`
4. Make it **Public**
5. Note down the channel ID

## Step 2: Get Channel IDs

### Method 1: From WhatsApp Web
1. Open WhatsApp Web
2. Go to your channel
3. Look at the URL: `https://web.whatsapp.com/channel/[CHANNEL_ID]`
4. Copy the channel ID from the URL

### Method 2: From Mobile App
1. Open your channel
2. Tap the channel name
3. Look for the channel link
4. The ID is in the link

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

```
QUESTIONS_CHANNEL_ID=your_questions_channel_id
ANSWERS_CHANNEL_ID=your_answers_channel_id
```

## Step 4: Test Locally (Optional)

### 4.1 Install Dependencies
```bash
pip install -r requirements.txt
```

### 4.2 Run Setup
```bash
python setup.py
```

### 4.3 Configure Environment
1. Copy `.env.example` to `.env`
2. Edit `.env` with your channel IDs:
```
QUESTIONS_CHANNEL_ID=your_questions_channel_id
ANSWERS_CHANNEL_ID=your_answers_channel_id
```

### 4.4 Test Bot
```bash
python bot.py
```

## Step 5: Deploy to GitHub

### 5.1 Push to GitHub
```bash
git add .
git commit -m "Add WhatsApp MCQ Bot"
git push origin main
```

### 5.2 Enable GitHub Actions
1. Go to your repository
2. Click **Actions** tab
3. Enable workflows if prompted

## Step 6: Initial WhatsApp Connection

### 6.1 Manual Trigger
1. Go to **Actions** tab
2. Click **WhatsApp MCQ Bot**
3. Click **Run workflow**
4. Click **Run workflow** button

### 6.2 Connect WhatsApp
1. The workflow will start WAHA
2. It will generate a QR code
3. **Scan the QR code** with your WhatsApp mobile app
4. Wait for connection confirmation

### 6.3 Test Message
Once connected, the bot will send test questions to your channels.

## Step 7: Verify Automation

### 7.1 Check Schedule
The bot runs automatically at:
- 9:00 AM UTC
- 12:00 PM UTC
- 3:00 PM UTC
- 6:00 PM UTC

### 7.2 Monitor Actions
1. Go to **Actions** tab
2. Check that workflows run on schedule
3. View logs for any errors

## Step 8: Customize Questions

### 8.1 Edit Questions
1. Edit `questions.json`
2. Add your own questions
3. Commit and push changes

### 8.2 Question Format
```json
{
  "id": 1,
  "question": "Your question here?",
  "options": {
    "A": "Option A",
    "B": "Option B",
    "C": "Option C",
    "D": "Option D"
  },
  "correct_answer": "B",
  "explanation": "Explanation of the answer",
  "category": "Category",
  "difficulty": "Easy/Medium/Hard"
}
```

## Troubleshooting

### Bot Not Sending Messages
1. Check GitHub Actions logs
2. Verify channel IDs are correct
3. Ensure WhatsApp connection is active

### Connection Issues
1. Re-run the workflow manually
2. Scan QR code again
3. Check if WhatsApp Web is working

### Schedule Not Working
1. Check GitHub Actions is enabled
2. Verify cron schedule in workflow file
3. Check repository settings

## Monitoring

### View Logs
1. Go to **Actions** tab
2. Click on a workflow run
3. View logs for each step

### Check Status
- Green checkmark: Success
- Red X: Failed
- Yellow circle: Running

## Cost

This setup is **100% FREE**:
- ✅ GitHub Actions: Free for public repositories
- ✅ WAHA: Open source, no cost
- ✅ WhatsApp: No API costs (using unofficial method)

## Security Notes

- Channel IDs are stored as GitHub secrets
- No sensitive data in code
- WAHA runs in isolated container
- Session data is temporary

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Verify your configuration
4. Test locally first

## Next Steps

Once deployed:
1. Monitor the first few runs
2. Customize questions for your audience
3. Adjust schedule if needed
4. Add more question categories
5. Share your channels with users!

---

**🎉 Congratulations! Your WhatsApp MCQ Bot is now running automatically!**