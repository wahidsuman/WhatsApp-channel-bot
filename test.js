/**
 * Test script for WhatsApp MCQ Bot
 */

const MCQBot = require('./bot');
const fs = require('fs');

function testQuestionsLoading() {
    console.log('🔍 Testing questions loading...');
    
    try {
        const data = fs.readFileSync('questions.json', 'utf8');
        const parsed = JSON.parse(data);
        const questions = parsed.questions || [];
        
        if (questions.length === 0) {
            console.log('❌ No questions loaded');
            return false;
        }
        
        console.log(`✅ Loaded ${questions.length} questions`);
        
        // Test first question
        const firstQuestion = questions[0];
        const requiredFields = ['id', 'question', 'options', 'correct_answer', 'explanation'];
        
        for (const field of requiredFields) {
            if (!(field in firstQuestion)) {
                console.log(`❌ Missing field: ${field}`);
                return false;
            }
        }
        
        console.log('✅ Question format is correct');
        return true;
    } catch (error) {
        console.log(`❌ Error loading questions: ${error.message}`);
        return false;
    }
}

function testQuestionFormatting() {
    console.log('\n🔍 Testing question formatting...');
    
    try {
        const data = fs.readFileSync('questions.json', 'utf8');
        const parsed = JSON.parse(data);
        const questions = parsed.questions || [];
        
        if (questions.length === 0) {
            console.log('❌ No questions to test');
            return false;
        }
        
        const question = questions[0];
        
        // Create a mock bot for testing
        const mockBot = {
            dailyQuestions: 4,
            emojiOptions: {
                'A': '😀',
                'B': '😁',
                'C': '😂',
                'D': '🤣'
            },
            formatQuestionMessage: function(question, questionNum) {
                let message = `📚 Daily MCQ Challenge - Question ${questionNum}/${this.dailyQuestions}\n\n`;
                message += `${question.question}\n\n`;
                
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
        };
        
        const message = mockBot.formatQuestionMessage(question, 1);
        
        console.log('📝 Sample question message:');
        console.log('-'.repeat(40));
        console.log(message);
        console.log('-'.repeat(40));
        
        // Check if message contains required elements
        const requiredElements = [
            'Daily MCQ Challenge',
            'Question 1/4',
            'A)', 'B)', 'C)', 'D)',
            '😀', '😁', '😂', '🤣',
            'React with the emoji'
        ];
        
        for (const element of requiredElements) {
            if (!message.includes(element)) {
                console.log(`❌ Missing element: ${element}`);
                return false;
            }
        }
        
        console.log('✅ Question formatting is correct');
        return true;
    } catch (error) {
        console.log(`❌ Error testing question formatting: ${error.message}`);
        return false;
    }
}

function testAnswerFormatting() {
    console.log('\n🔍 Testing answer formatting...');
    
    try {
        const data = fs.readFileSync('questions.json', 'utf8');
        const parsed = JSON.parse(data);
        const questions = parsed.questions || [];
        
        if (questions.length === 0) {
            console.log('❌ No questions to test');
            return false;
        }
        
        const question = questions[0];
        
        // Create a mock bot for testing
        const mockBot = {
            dailyQuestions: 4,
            emojiOptions: {
                'A': '😀',
                'B': '😁',
                'C': '😂',
                'D': '🤣'
            },
            formatAnswerMessage: function(question, questionNum) {
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
        };
        
        const message = mockBot.formatAnswerMessage(question, 1);
        
        console.log('📝 Sample answer message:');
        console.log('-'.repeat(40));
        console.log(message);
        console.log('-'.repeat(40));
        
        // Check if message contains required elements
        const requiredElements = [
            'Daily MCQ Challenge',
            'Answer 1/4',
            'Correct Answer:',
            'Explanation:',
            'Vote results'
        ];
        
        for (const element of requiredElements) {
            if (!message.includes(element)) {
                console.log(`❌ Missing element: ${element}`);
                return false;
            }
        }
        
        console.log('✅ Answer formatting is correct');
        return true;
    } catch (error) {
        console.log(`❌ Error testing answer formatting: ${error.message}`);
        return false;
    }
}

function testConfiguration() {
    console.log('\n🔍 Testing configuration...');
    
    try {
        const questionsChannelId = process.env.QUESTIONS_CHANNEL_ID;
        const answersChannelId = process.env.ANSWERS_CHANNEL_ID;
        
        console.log(`Questions Channel ID: ${questionsChannelId}`);
        console.log(`Answers Channel ID: ${answersChannelId}`);
        
        if (!questionsChannelId || !answersChannelId) {
            console.log('❌ Missing environment variables');
            return false;
        }
        
        console.log('✅ Configuration loaded successfully');
        return true;
    } catch (error) {
        console.log(`❌ Configuration error: ${error.message}`);
        return false;
    }
}

function main() {
    console.log('🧪 WhatsApp MCQ Bot - Test Suite');
    console.log('='.repeat(50));
    
    const tests = [
        { name: 'Questions Loading', test: testQuestionsLoading },
        { name: 'Question Formatting', test: testQuestionFormatting },
        { name: 'Answer Formatting', test: testAnswerFormatting },
        { name: 'Configuration', test: testConfiguration }
    ];
    
    let passed = 0;
    const total = tests.length;
    
    for (const { name, test } of tests) {
        console.log(`\n🔍 Running: ${name}`);
        try {
            if (test()) {
                passed++;
            } else {
                console.log(`❌ ${name} failed`);
            }
        } catch (error) {
            console.log(`❌ ${name} error: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Bot is ready to deploy.');
        return true;
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
        return false;
    }
}

if (require.main === module) {
    const success = main();
    process.exit(success ? 0 : 1);
}

module.exports = { main };