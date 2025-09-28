/**
 * Baileys WhatsApp Client for MCQ Bot
 */

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const fs = require('fs');

class BaileysClient {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.qrCodeGenerated = false;
    }

    async connect() {
        try {
            console.log('🚀 Starting WhatsApp connection...');
            
            // Load auth state
            const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
            
            // Fetch latest version
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

            // Create socket
            this.sock = makeWASocket({
                version,
                logger: P({ level: 'silent' }),
                printQRInTerminal: false,
                auth: state,
                browser: ['MCQ Bot', 'Chrome', '1.0.0'],
                generateHighQualityLinkPreview: true
            });

            // Handle connection updates
            this.sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    console.log('📱 QR Code generated!');
                    console.log('==========================================');
                    qrcode.generate(qr, { small: true });
                    console.log('==========================================');
                    console.log('Scan the QR code above with your WhatsApp app');
                    this.qrCodeGenerated = true;
                }
                
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
                    
                    if (shouldReconnect) {
                        this.connect();
                    }
                } else if (connection === 'open') {
                    console.log('✅ WhatsApp connected successfully!');
                    this.isConnected = true;
                }
            });

            // Save credentials
            this.sock.ev.on('creds.update', saveCreds);

            // Handle messages
            this.sock.ev.on('messages.upsert', (m) => {
                console.log('📨 Message received:', JSON.stringify(m, undefined, 2));
            });

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    if (!this.isConnected) {
                        console.log('⏰ Connection timeout - QR code may have expired');
                        console.log('💡 Please run the workflow again to get a fresh QR code');
                        resolve(); // Don't reject, just continue
                    }
                }, 300000); // 5 minute timeout

                this.sock.ev.on('connection.update', (update) => {
                    if (update.connection === 'open') {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            });

        } catch (error) {
            console.error('❌ Connection failed:', error);
            throw error;
        }
    }

    async sendMessage(to, message) {
        if (!this.isConnected) {
            throw new Error('WhatsApp not connected');
        }

        try {
            const result = await this.sock.sendMessage(to, { text: message });
            console.log('✅ Message sent successfully:', result.key.id);
            return result;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            throw error;
        }
    }

    async sendMessageToChannel(channelId, message) {
        return this.sendMessage(channelId, message);
    }

    isReady() {
        return this.isConnected;
    }

    async disconnect() {
        if (this.sock) {
            await this.sock.logout();
            this.sock = null;
            this.isConnected = false;
            console.log('👋 Disconnected from WhatsApp');
        }
    }
}

module.exports = BaileysClient;