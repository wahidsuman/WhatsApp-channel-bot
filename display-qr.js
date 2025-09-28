#!/usr/bin/env node

/**
 * Simple script to display the QR code in different formats
 */

const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('📱 WhatsApp QR Code Display Options');
console.log('==========================================\n');

// Check for QR code files
const files = [
    { name: 'whatsapp-qr.png', desc: '🖼️  PNG Image' },
    { name: 'whatsapp-qr.svg', desc: '🎨 SVG Image' },
    { name: 'qr-display.html', desc: '🌐 Web Viewer' },
    { name: 'qr-url.txt', desc: '📋 Raw QR URL' },
    { name: 'qr-data-url.txt', desc: '🔗 Data URL' }
];

console.log('Available QR code files:');
files.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file.name))) {
        console.log(`✅ ${file.desc}: ${file.name}`);
    } else {
        console.log(`❌ ${file.desc}: ${file.name} (not found)`);
    }
});

console.log('\n==========================================');
console.log('📱 How to scan the QR code:');
console.log('==========================================');
console.log('1. RECOMMENDED: Open whatsapp-qr.png or whatsapp-qr.svg');
console.log('2. Open qr-display.html in your web browser');
console.log('3. If QR looks broken in terminal, use the image files above');
console.log('4. As last resort, copy the URL from qr-url.txt\n');

// Try to display the QR URL
try {
    const qrUrl = fs.readFileSync(path.join(__dirname, 'qr-url.txt'), 'utf8');
    console.log('==========================================');
    console.log('📋 QR Code URL (if images don\'t work):');
    console.log('==========================================');
    console.log(qrUrl);
    console.log('==========================================\n');
} catch (err) {
    console.log('QR URL not available yet. Run the bot first.\n');
}

console.log('💡 TIP: If the QR code in terminal looks distorted or');
console.log('   has uneven borders, use the image files instead!');