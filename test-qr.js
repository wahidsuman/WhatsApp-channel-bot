#!/usr/bin/env node

/**
 * Test script to generate and display QR code
 */

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

async function testConnection() {
    console.log('🧪 WhatsApp QR Code Test');
    console.log('========================\n');
    
    // Clear old auth
    console.log('🧹 Clearing old auth...');
    try {
        if (fs.existsSync('./auth_info_test')) {
            fs.rmSync('./auth_info_test', { recursive: true, force: true });
        }
    } catch (e) {}
    
    // Create auth state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_test');
    
    // Get version
    const { version } = await fetchLatestBaileysVersion();
    console.log('📱 WhatsApp version:', version.join('.'));
    
    // Test different browser configs
    const browserConfigs = [
        ['Chrome (Linux)', 'Chrome', '120.0.0.0'],
        ['Chrome', 'Chrome', '120.0.0.0'],
        ['WhatsApp', 'Chrome', '120.0.0.0'],
        ['Ubuntu', 'Chrome', '120.0.0.0']
    ];
    
    console.log('\n🔧 Testing browser config:', browserConfigs[0]);
    
    // Create socket
    const sock = makeWASocket({
        version,
        auth: state,
        browser: browserConfigs[0],
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        qrTimeout: 120000
    });
    
    // Handle connection
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n✅ QR Code Generated Successfully!');
            console.log('📏 QR Length:', qr.length);
            console.log('🔤 QR Type:', typeof qr);
            console.log('📝 First 100 chars:', qr.substring(0, 100));
            
            // Display QR
            console.log('\n📱 SCAN THIS QR CODE:\n');
            qrcode.generate(qr, { small: false });
            
            // Save QR to file
            fs.writeFileSync('test-qr-url.txt', qr);
            console.log('\n💾 QR saved to: test-qr-url.txt');
            
            // Generate QR image
            const QRCode = require('qrcode');
            await QRCode.toFile('test-qr.png', qr, {
                width: 512,
                margin: 2
            });
            console.log('🖼️  QR image saved to: test-qr.png');
            
            console.log('\n⏰ You have 2 minutes to scan!');
        }
        
        if (connection === 'open') {
            console.log('\n✅ Successfully connected to WhatsApp!');
            process.exit(0);
        }
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error;
            console.log('\n❌ Connection closed:', reason?.message || 'Unknown error');
            
            if (reason?.output?.statusCode === 408) {
                console.log('⏰ QR Code expired');
            } else if (reason?.output?.statusCode === 401) {
                console.log('🔒 Authentication failed - try a different browser config');
            }
            
            process.exit(1);
        }
    });
    
    // Save creds
    sock.ev.on('creds.update', saveCreds);
    
    // Keep alive
    console.log('\n⏳ Waiting for QR code...\n');
}

// Run test
testConnection().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});