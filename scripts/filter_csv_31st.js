
const fs = require('fs');

const inputFile = 'interview_users_dump.csv';
const outputFile = 'recipients_31st_Jan.csv';
const targetDate = '2026-01-31';

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    
    // Header
    const header = lines[0];
    const users = lines.slice(1).filter(line => line.trim() !== '');
    
    const filteredUsers = users.filter(line => {
        const parts = line.split(',');
        const updatedAt = parts[parts.length - 1]; // Date is last
        return updatedAt.startsWith(targetDate);
    });
    
    const content = [header, ...filteredUsers].join('\n');
    
    fs.writeFileSync(outputFile, content);
    console.log(`Filtered CSV created: ${outputFile}`);
    console.log(`Total count: ${filteredUsers.length}`);
    
} catch (err) {
    console.error("Error:", err);
}
