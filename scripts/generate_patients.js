require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rohan', 'Rahul', 'Amit', 'Vikram', 'Neha', 'Priya', 'Anjali', 'Sneha', 'Pooja', 'Riya', 'Kavya', 'Simran', 'Aarti', 'Kiran', 'Suresh', 'Ramesh', 'Ganesh', 'Dinesh', 'Deepak', 'Sanjay', 'Rajesh', 'Sunil', 'Anil', 'Nitin'];
const lastNames = ['Patil', 'Deshmukh', 'Joshi', 'Kulkarni', 'Deshpande', 'Pawar', 'More', 'Shinde', 'Jadhav', 'Gaikwad', 'Kamble', 'Kadam', 'Kale', 'Bhosale', 'Mane', 'Wagh', 'Chavan', 'Kharat', 'Tambe', 'Gore'];

const talukaVillages = {
  'Haveli': ['Wagholi', 'Hadapsar', 'Kothrud', 'Khadakwasla', 'Narhe', 'Uruli Kanchan'],
  'Pune City': ['Shivajinagar', 'Camp', 'Deccan', 'Swargate', 'Yerawada', 'Katraj'],
  'Maval': ['Lonavala', 'Talegaon', 'Kamshet', 'Vadgaon', 'Karla'],
  'Mulshi': ['Hinjewadi', 'Pirangut', 'Paud', 'Lavale', 'Bhugaon'],
  'Khed': ['Alandi', 'Rajgurunagar', 'Chakan', 'Khed', 'Bham'],
  'Shirur': ['Shirur', 'Koregaon Bhima', 'Shikrapur', 'Ranjangaon'],
  'Baramati': ['Baramati', 'Malegaon', 'Supe'],
  'Indapur': ['Indapur', 'Bhigwan', 'Walchandnagar'],
  'Daund': ['Daund', 'Kedgaon', 'Patas', 'Yawat'],
  'Bhor': ['Bhor', 'Kapúrhol', 'Nasrapur'],
  'Purandar': ['Saswad', 'Jejuri', 'Nira'],
  'Junnar': ['Junnar', 'Narayangaon', 'Otur', 'Alephata'],
  'Ambegaon': ['Manchar', 'Ghodegaon', 'Dimbhe']
};

const talukas = Object.keys(talukaVillages);

const diseases = ['None', 'None', 'None', 'Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'Arthritis', 'Heart Disease', 'CKD', 'COPD'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePatient() {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  const patientName = `${firstName} ${lastName}`;

  // DOB 30-70 yrs gap. 2026 - 70 = 1956, 2026 - 30 = 1996.
  const birthYear = getRandomInt(1956, 1996);
  const birthMonth = getRandomInt(1, 12);
  const birthDay = getRandomInt(1, 28);
  const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

  const taluka = getRandomItem(talukas);
  const village = getRandomItem(talukaVillages[taluka]);
  const district = 'Pune';

  // Pin Code starting with 41, 6 digits
  const pinCode = `41${getRandomInt(1000, 2999)}`;

  const abhaId = 'Yes';
  const ayushmanCard = Math.random() > 0.5 ? 'Yes' : 'No';
  const healthInsurance = Math.random() > 0.5 ? 'Yes' : 'No';

  // Aadhaar masked: ********1234
  const last4 = String(getRandomInt(1000, 9999));
  const aadhaarNo = `********${last4}`;

  // Email masked: show 2 chars, then stars, then @gmail.com
  let baseEmail = (firstName + lastName).toLowerCase();
  if (baseEmail.length < 4) baseEmail += 'abcd';
  const emailId = `${baseEmail.substring(0, 2)}****${baseEmail.substring(baseEmail.length - 2)}@gmail.com`;

  // Phone number: 5,6,7 digits are stars -> xxxx***xxx
  const p1 = String(getRandomInt(7000, 9999));
  const p3 = String(getRandomInt(100, 999));
  const phoneNumber = `${p1}***${p3}`;

  const disease = getRandomItem(diseases);

  return {
    patientName,
    dateOfBirth,
    village,
    taluka,
    district,
    pinCode,
    abhaId,
    ayushmanCard,
    healthInsurance,
    aadhaarNo,
    emailId,
    phoneNumber,
    disease
  };
}

async function main() {
  console.log('Generating 10,000 records...');
  
  // Insert in batches of 1000
  for (let i = 0; i < 10; i++) {
    const batch = [];
    for (let j = 0; j < 1000; j++) {
      batch.push(generatePatient());
    }
    
    await prisma.patientData.createMany({
      data: batch
    });
    console.log(`Inserted batch ${i + 1}/10`);
  }
  
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
