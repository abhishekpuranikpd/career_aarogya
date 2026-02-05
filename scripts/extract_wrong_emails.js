
const fs = require('fs');

const inputFile = 'interview_users_dump.csv';
const outputFile = 'wrong_email_recipients.txt';
const targetDate = '2026-01-31';

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    
    // Skip header
    const users = lines.slice(1).filter(line => line.trim() !== '');
    
    const recipients = [];
    
    users.forEach(line => {
        const parts = line.split(',');
        const email = parts[0];
        const updatedAt = parts[parts.length - 1]; // Date is last
        
        if (updatedAt.startsWith(targetDate)) {
            recipients.push(email);
        }
    });
    
    fs.writeFileSync(outputFile, recipients.join('\n'));
    console.log(`Extracted ${recipients.length} emails to ${outputFile}`);
    
} catch (err) {
    console.error("Error:", err);
}
