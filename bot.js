/**
 * WhatsApp MCQ Bot - Main bot logic using Baileys
 */

const BaileysClient = require('./baileys-client');
const fs = require('fs');
const path = require('path');

class MCQBot {
    constructor() {
        this.baileysClient = new BaileysClient();
        this.questions = this.loadQuestions();
        this.sentQuestions = this.loadSentQuestions();
        
        // Configuration
        this.questionsChannelId = process.env.QUESTIONS_CHANNEL_ID;
        this.answersChannelId = process.env.ANSWERS_CHANNEL_ID;
        this.dailyQuestions = 4;
        this.botName = 'MCQ Bot';
        
        // Emoji mappings
        this.emojiOptions = {
            'A': '😀',
            'B': '😁',
            'C': '😂',
            'D': '🤣'
        };
        
        if (!this.questionsChannelId || !this.answersChannelId) {
            throw new Error('QUESTIONS_CHANNEL_ID and ANSWERS_CHANNEL_ID environment variables are required');
        }
    }

    loadQuestions() {
        try {
            const data = fs.readFileSync('questions.json', 'utf8');
            const parsed = JSON.parse(data);
            return parsed.questions || [];
        } catch (error) {
            console.error('❌ Error loading questions:', error.message);
            return [];
        }
    }

    loadSentQuestions() {
        try {
            const data = fs.readFileSync('sent_questions.json', 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    saveSentQuestions() {
        try {
            fs.writeFileSync('sent_questions.json', JSON.stringify(this.sentQuestions, null, 2));
        } catch (error) {
            console.error('❌ Error saving sent questions:', error.message);
        }
    }

    getRandomQuestion() {
        const availableQuestions = this.questions.filter(q => !this.sentQuestions.includes(q.id));
        
        if (availableQuestions.length === 0) {
            // Reset sent questions if all have been used
            this.sentQuestions = [];
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.sentQuestions.push(question.id);
        this.saveSentQuestions();
        return question;
    }

    formatQuestionMessage(question, questionNum) {
        let message = `📚 Daily MCQ Challenge - Question ${questionNum}/${this.dailyQuestions}\n\n`;
        message += `${question.question}\n\n`;
        
        // Add options with emojis
        for (const [option, text] of Object.entries(question.options)) {
            const emoji = this.emojiOptions[option] || '❓';
            message += `${option}) ${text} ${emoji}\n`;
        }
        
        message += `\nReact with the emoji of your answer!\n`;
        message += `⏰ Answer will be revealed in 5 minutes\n`;
        message += `📊 Category: ${question.category || 'General'}\n`;
        message += `🎯 Difficulty: ${question.difficulty || 'Medium'}`;
        
        return message;
    }

    formatAnswerMessage(question, questionNum) {
        const correctOption = question.correct_answer;
        const correctText = question.options[correctOption];
        const correctEmoji = this.emojiOptions[correctOption] || '✅';
        
        let message = `📚 Daily MCQ Challenge - Answer ${questionNum}/${this.dailyQuestions}\n\n`;
        message += `${question.question}\n\n`;
        message += `✅ Correct Answer: ${correctOption}) ${correctText} ${correctEmoji}\n\n`;
        message += `💡 Explanation: ${question.explanation}\n\n`;
        message += `📊 Vote results will be available after reactions are counted`;
        
        return message;
    }

    async sendQuestion(questionNum) {
        const question = this.getRandomQuestion();
        if (!question) {
            console.log('❌ No questions available');
            return false;
        }

        const message = this.formatQuestionMessage(question, questionNum);
        
        console.log(`📤 Sending question ${questionNum} to Questions Channel...`);
        try {
            await this.baileysClient.sendMessageToChannel(this.questionsChannelId, message);
            console.log(`✅ Question ${questionNum} sent successfully`);
            console.log(`Question: ${question.question}`);
            console.log(`Correct Answer: ${question.correct_answer}) ${question.options[question.correct_answer]}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send question: ${error.message}`);
            return false;
        }
    }

    async sendAnswer(questionNum) {
        if (this.sentQuestions.length === 0) {
            console.log('❌ No questions have been sent yet');
            return false;
        }

        const lastQuestionId = this.sentQuestions[this.sentQuestions.length - 1];
        const question = this.questions.find(q => q.id === lastQuestionId);
        
        if (!question) {
            console.log(`❌ Question with ID ${lastQuestionId} not found`);
            return false;
        }

        const message = this.formatAnswerMessage(question, questionNum);
        
        console.log(`📤 Sending answer ${questionNum} to Answers Channel...`);
        try {
            await this.baileysClient.sendMessageToChannel(this.answersChannelId, message);
            console.log(`✅ Answer ${questionNum} sent successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send answer: ${error.message}`);
            return false;
        }
    }

    async sendQuestionAndAnswer(questionNum) {
        console.log(`\n🚀 Sending Question ${questionNum}/${this.dailyQuestions}`);
        console.log('='.repeat(50));
        
        // Send question
        const questionSent = await this.sendQuestion(questionNum);
        if (!questionSent) {
            return false;
        }
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Send answer
        const answerSent = await this.sendAnswer(questionNum);
        if (!answerSent) {
            return false;
        }
        
        console.log(`✅ Question ${questionNum} and answer sent successfully!`);
        return true;
    }

    async sendDailyQuestions() {
        console.log(`🤖 ${this.botName} - Starting daily question session`);
        console.log(`📅 Date: ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));
        
        let successCount = 0;
        
        for (let i = 1; i <= this.dailyQuestions; i++) {
            if (await this.sendQuestionAndAnswer(i)) {
                successCount++;
            }
            
            // Wait between questions (except for the last one)
            if (i < this.dailyQuestions) {
                console.log('⏳ Waiting 10 seconds before next question...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
        
        console.log('='.repeat(60));
        console.log(`📊 Daily session completed: ${successCount}/${this.dailyQuestions} questions sent`);
        
        if (successCount === this.dailyQuestions) {
            console.log('🎉 All questions sent successfully!');
            return true;
        } else {
            console.log('⚠️ Some questions failed to send');
            return false;
        }
    }

    async testConnection() {
        console.log('🔧 Testing WhatsApp connection...');
        return this.baileysClient.isReady();
    }
}

async function main() {
    try {
        const bot = new MCQBot();
        
        // Connect to WhatsApp
        console.log('🔗 Connecting to WhatsApp...');
        try {
            await bot.baileysClient.connect();
        } catch (error) {
            console.log('⚠️ WhatsApp connection attempt completed');
        }
        
        // Test connection
        if (!await bot.testConnection()) {
            console.log('❌ WhatsApp not connected yet.');
            console.log('📱 Please scan the QR code with your WhatsApp app');
            console.log('==========================================');
            console.log('📱 FOR MOBILE USERS:');
            console.log('1. Copy the QR URL from above');
            console.log('2. Go to: https://www.qr-code-generator.com/');
            console.log('3. Paste the URL to generate QR code');
            console.log('4. Scan with WhatsApp');
            console.log('==========================================');
            console.log('💻 FOR DESKTOP USERS:');
            console.log('🖼️  QR Code image saved as: whatsapp-qr.png');
            console.log('🌐 Open qr-display.html in a browser');
            console.log('==========================================');
            console.log('🔄 Run the workflow again after scanning to send messages');
            
            // Exit gracefully
            process.exit(0);
        }
        
        // Send daily questions
        await bot.sendDailyQuestions();
        
        // Disconnect
        await bot.baileysClient.disconnect();
        
    } catch (error) {
        console.error('❌ Bot execution failed:', error.message);
        process.exit(1);
    }
}

// Run the bot
if (require.main === module) {
    main();
}

module.exports = MCQBot;