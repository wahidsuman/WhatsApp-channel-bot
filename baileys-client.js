/**
 * Baileys WhatsApp Client for MCQ Bot
 */

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const P = require('pino');
const fs = require('fs');
const path = require('path');

class BaileysClient {
    constructor() {
        this.sock = null;
        this.isConnected = false;
        this.qrCodeGenerated = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
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
                    
                    // Generate QR code image file FIRST
                    const qrPath = path.join(__dirname, 'whatsapp-qr.png');
                    qrcode.toFile(qrPath, qr, {
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        },
                        width: 512,
                        margin: 4,
                        errorCorrectionLevel: 'M'
                    }, (err) => {
                        if (err) {
                            console.error('Failed to generate QR code image:', err);
                        } else {
                            console.log(`✅ QR Code image saved to: ${qrPath}`);
                        }
                    });
                    
                    // Also save as SVG for better quality
                    const svgPath = path.join(__dirname, 'whatsapp-qr.svg');
                    qrcode.toString(qr, { type: 'svg', width: 400 }, (err, svg) => {
                        if (!err) {
                            fs.writeFileSync(svgPath, svg);
                            console.log(`✅ QR Code SVG saved to: ${svgPath}`);
                        }
                    });
                    
                    console.log('==========================================');
                    console.log('📱 INSTRUCTIONS:');
                    console.log('==========================================');
                    console.log('1. QR CODE IS SHOWN BELOW - SCAN IT!');
                    console.log('2. If QR looks broken, use the URL at bottom');
                    console.log('3. Check GitHub Summary for clear QR image');
                    console.log('==========================================');
                    
                    // Save the raw QR URL first
                    fs.writeFileSync(path.join(__dirname, 'qr-url.txt'), qr);
                    
                    // Generate a data URL for the QR code
                    qrcode.toDataURL(qr, { width: 400, margin: 4 }, (err, dataUrl) => {
                        if (!err) {
                            console.log('🌐 QR Code Data URL (paste in browser):');
                            console.log(dataUrl.substring(0, 100) + '...');
                            console.log('(Full URL saved to qr-data-url.txt)');
                            fs.writeFileSync(path.join(__dirname, 'qr-data-url.txt'), dataUrl);
                        }
                    });
                    
                    // Always show terminal QR code
                    console.log('\n\n==========================================');
                    console.log('📱📱📱 QR CODE TO SCAN WITH WHATSAPP 📱📱📱');
                    console.log('==========================================\n');
                    
                    // Show QR code in terminal - try both methods
                    qrcodeTerminal.generate(qr, { small: false });
                    
                    console.log('\n==========================================');
                    console.log('📋 QR URL (if code above looks broken):');
                    console.log(qr);
                    console.log('==========================================\n');
                    
                    this.qrCodeGenerated = true;
                }
                
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
                    
                    // Check if it's a QR timeout (408 error)
                    if (lastDisconnect?.error?.output?.statusCode === 408) {
                        console.log('⏰ QR Code expired. Connection attempts:', this.connectionAttempts);
                        if (this.connectionAttempts >= this.maxConnectionAttempts) {
                            console.log('❌ Maximum connection attempts reached. Stopping.');
                            return;
                        }
                    }
                    
                    if (shouldReconnect && this.connectionAttempts < this.maxConnectionAttempts) {
                        this.connectionAttempts++;
                        console.log(`🔄 Reconnection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
                        setTimeout(() => this.connect(), 5000); // Wait 5 seconds before reconnecting
                    }
                } else if (connection === 'open') {
                    console.log('✅ WhatsApp connected successfully!');
                    this.isConnected = true;
                    this.connectionAttempts = 0; // Reset on successful connection
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
                }, 120000); // 2 minute timeout

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