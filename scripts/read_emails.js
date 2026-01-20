const imaps = require('imap-simple');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const config = {
    imap: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        password: process.env.EMAIL_PASS || process.env.SMTP_PASS,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 3000
    }
};

async function fetchEmails() {
    try {
        const connection = await imaps.connect(config);
        console.log("✅ Authenticated with IMAP Server");

        await connection.openBox('INBOX');

        const searchCriteria = [
            ['SINCE', 'Jan 15, 2026'] // ISO format usually preferred but imap uses specific string
        ];

        const fetchOptions = {
            bodies: ['HEADER'],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        console.log(`\n📬 Found ${messages.length} email(s) since Jan 15, 2026.`);

        const emailSet = new Set();
        const emailRegex = /<(.+)>/;

        messages.forEach(message => {
            const fromHeader = message.parts[0].body.from[0];
            // Try to match "Name <email>" format, otherwise assume it's just "email"
            const match = fromHeader.match(emailRegex);
            const email = match ? match[1] : fromHeader;
            if (email) emailSet.add(email.trim());
        });

const fs = require('fs');

        console.log(`\nUnique Email Addresses Received:\n`);
        
        const emailList = Array.from(emailSet).join('\n');
        fs.writeFileSync('received_emails.txt', emailList);
        
        console.log(`✅ Saved ${emailSet.size} unique email addresses to 'received_emails.txt'`);
        console.log(`\n--------------------------------------------------`);

        connection.end();
    } catch (err) {
        console.error("❌ Error fetching emails:", err);
    }
}

fetchEmails();
