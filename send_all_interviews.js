require('dotenv').config({ path: '.env.local' });
const { sendEmailToCandidate } = require('./send_interview_emails.js');

const candidates = [
  { name: 'Nikita Babasaheb Sanap', email: 'nikitasanap1212@gmail.com', date: 'August 21, 2024', time: '7:00 PM - 7:10 PM' },
  { name: 'Alka Menon', email: 'alkamenon02@gmail.com', date: 'August 21, 2024', time: '7:10 PM - 7:20 PM' },
  { name: 'Siddhi Dattatray Rokade', email: 'siddhirokade09@gmail.com', date: 'August 21, 2024', time: '7:20 PM - 7:30 PM' },
  { name: 'Sohan Saha', email: 'sahasohan115@gmail.com', date: 'August 21, 2024', time: '7:30 PM - 7:40 PM' },
  { name: 'Sachin Tanaji Kale', email: 'sachintkale1999@gmail.com', date: 'August 21, 2024', time: '7:40 PM - 7:50 PM' },
  { name: 'Sujoy Biswas', email: 'sujoybiswas.sb3@gmail.com', date: 'August 21, 2024', time: '7:50 PM - 8:00 PM' },
  { name: 'Falguni Bhale', email: 'falgunibhale409@gmail.com', date: 'August 21, 2024', time: '8:00 PM - 8:10 PM' },
  { name: 'Harshada Dattatraya Suryawanshi', email: 'suryawanshiharshada775@gmail.com', date: 'August 21, 2024', time: '8:10 PM - 8:20 PM' },
  { name: 'Om ganesh shelke', email: 'om4501806@gmail.com', date: 'August 21, 2024', time: '8:20 PM - 8:30 PM' },
  { name: 'AINAVALLI BHAVANI SATYA PRASAD', email: 'ainavallibhavaniprasad@gmail.com', date: 'August 21, 2024', time: '8:30 PM - 8:40 PM' },
  { name: 'Vaishnavi Dadarao More', email: 'morevaishnavi68@gmail.com', date: 'August 21, 2024', time: '8:40 PM - 8:50 PM' },
  { name: 'Luvneet Prakash Khithani', email: 'luvneeth@gmail.com', date: 'August 21, 2024', time: '8:50 PM - 9:00 PM' },
  
  { name: 'Sayali Ajit Pande', email: 'sayalipande25@gmail.com', date: 'August 22, 2024', time: '7:00 PM - 7:10 PM' },
  { name: 'Mayuri jamwal', email: 'vaniyasingh26@gmail.com', date: 'August 22, 2024', time: '7:10 PM - 7:20 PM' },
  { name: 'Dr. Shruti Soni', email: 'Sonishruti141@gmail.com', date: 'August 22, 2024', time: '7:20 PM - 7:30 PM' },
  { name: 'Vaishnav Panchal', email: 'panchalvaishnav7378@gmail.com', date: 'August 22, 2024', time: '7:30 PM - 7:40 PM' },
  { name: 'SUSHRUTI', email: 'sushruti3001@gmail.com', date: 'August 22, 2024', time: '7:40 PM - 7:50 PM' },
  { name: 'KRITIKA KUMARI', email: 'krianshi2013army21@gmail.com', date: 'August 22, 2024', time: '7:50 PM - 8:00 PM' },
  { name: 'DR SUBHASREE NAYAK', email: 'drsubhasree.nayak29@gmail.com', date: 'August 22, 2024', time: '8:00 PM - 8:10 PM' },
  { name: 'Kirti Subhash Savali', email: 'kirtisavali@gmail.com', date: 'August 22, 2024', time: '8:10 PM - 8:20 PM' },
  { name: 'Dr. Sayali Yogesh Gamne', email: 'sayaligamne@gmail.com', date: 'August 22, 2024', time: '8:20 PM - 8:30 PM' },
  { name: 'Nupur Dyandev Pise', email: 'nupurpise77@gmail.com', date: 'August 22, 2024', time: '8:30 PM - 8:40 PM' },
  { name: 'Dr Apurva Paliwal', email: 'apurva.plwl@gmail.com', date: 'August 22, 2024', time: '8:40 PM - 8:50 PM' },
  { name: 'Anuja Shirke', email: 'anujashirke1@gmail.com', date: 'August 22, 2024', time: '8:50 PM - 9:00 PM' },
  { name: 'Om Bandal', email: 'ombandal0203@gmail.com', date: 'August 22, 2024', time: '9:00 PM - 9:10 PM' },
  { name: 'Nishit Sisodia', email: 'sisodiarajendra02@gmail.com', date: 'August 22, 2024', time: '9:10 PM - 9:20 PM' },
  { name: 'Tushar Ashok Kamble', email: 'kambletushar2007@gmail.com', date: 'August 22, 2024', time: '9:20 PM - 9:30 PM' },
];

async function main() {
  console.log(`Starting to send ${candidates.length} interview emails...`);
  let successCount = 0;
  
  for (const candidate of candidates) {
    const success = await sendEmailToCandidate(candidate.email, candidate.name, candidate.date, candidate.time);
    if (success) successCount++;
    // Add a small delay to avoid rate limiting from SMTP server
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`Finished sending emails. Successfully sent: ${successCount} / ${candidates.length}`);
}

main();
