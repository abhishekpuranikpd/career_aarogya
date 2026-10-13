require('dotenv').config({ path: '.env', override: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const puneLocations = {
  'Haveli': [
    { village: 'Hadapsar', pincode: '411028' },
    { village: 'Wagholi', pincode: '412207' },
    { village: 'Kothrud', pincode: '411038' },
    { village: 'Vadgaon Budruk', pincode: '411041' },
    { village: 'Narhe', pincode: '411041' },
    { village: 'Uruli Kanchan', pincode: '412202' }
  ],
  'Pune City': [
    { village: 'Shivajinagar', pincode: '411005' },
    { village: 'Camp', pincode: '411001' },
    { village: 'Deccan Gymkhana', pincode: '411004' },
    { village: 'Vimannagar', pincode: '411014' },
    { village: 'Yerawada', pincode: '411006' },
    { village: 'Katraj', pincode: '411046' }
  ],
  'Mulshi': [
    { village: 'Hinjewadi', pincode: '411057' },
    { village: 'Paud', pincode: '412115' },
    { village: 'Pirangut', pincode: '412108' },
    { village: 'Bhugaon', pincode: '412115' },
    { village: 'Lavale', pincode: '412115' }
  ],
  'Maval': [
    { village: 'Lonavala', pincode: '410401' },
    { village: 'Talegaon Dabhade', pincode: '410506' },
    { village: 'Kamshet', pincode: '410405' },
    { village: 'Vadgaon', pincode: '412106' },
    { village: 'Karla', pincode: '410405' }
  ],
  'Khed': [
    { village: 'Alandi', pincode: '412105' },
    { village: 'Rajgurunagar', pincode: '410505' },
    { village: 'Chakan', pincode: '410501' },
    { village: 'Khed', pincode: '410505' }
  ],
  'Shirur': [
    { village: 'Shirur', pincode: '412210' },
    { village: 'Ranjangaon', pincode: '412208' },
    { village: 'Shikrapur', pincode: '412216' },
    { village: 'Koregaon Bhima', pincode: '412216' }
  ],
  'Baramati': [
    { village: 'Baramati', pincode: '413102' },
    { village: 'Malegaon', pincode: '413115' },
    { village: 'Supe', pincode: '412204' }
  ],
  'Indapur': [
    { village: 'Indapur', pincode: '413106' },
    { village: 'Bhigwan', pincode: '413105' },
    { village: 'Walchandnagar', pincode: '413114' }
  ],
  'Daund': [
    { village: 'Daund', pincode: '413801' },
    { village: 'Kedgaon', pincode: '412203' },
    { village: 'Patas', pincode: '412219' },
    { village: 'Yawat', pincode: '412214' }
  ],
  'Bhor': [
    { village: 'Bhor', pincode: '412206' },
    { village: 'Nasrapur', pincode: '412213' },
    { village: 'Kapurhol', pincode: '412205' }
  ],
  'Purandar': [
    { village: 'Saswad', pincode: '412301' },
    { village: 'Jejuri', pincode: '412303' },
    { village: 'Nira', pincode: '412102' }
  ],
  'Junnar': [
    { village: 'Junnar', pincode: '410502' },
    { village: 'Narayangaon', pincode: '410504' },
    { village: 'Otur', pincode: '412409' },
    { village: 'Alephata', pincode: '412411' }
  ],
  'Ambegaon': [
    { village: 'Manchar', pincode: '410503' },
    { village: 'Ghodegaon', pincode: '412408' },
    { village: 'Dimbhe', pincode: '410509' }
  ]
};

const talukas = Object.keys(puneLocations);
const diseases = [
  'None', 'None', 'None', 'None', 
  'Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 
  'Arthritis', 'Anemia', 'Cataract', 'Malnutrition', 
  'Dental Cavity', 'Skin Infection', 'Tuberculosis (TB)'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const [username, domain] = email.split('@');
  
  if (username.length <= 4) {
    return username.substring(0, 1) + '***@' + domain;
  }
  
  return username.substring(0, 2) + '****' + username.substring(username.length - 2) + '@' + domain;
}

function maskMobile(mobileStr) {
  if (!mobileStr) return '';
  let clean = mobileStr.replace(/\D/g, '');
  if (clean.length > 10 && clean.startsWith('91')) clean = clean.substring(2);
  
  if (clean.length < 7) return clean;
  
  // format: 1234***890 -> index 4,5,6 are stars
  return clean.substring(0, 4) + '***' + clean.substring(7);
}

async function rebuild() {
  console.log('Clearing existing PatientData in .env database...');
  await prisma.patientData.deleteMany({});
  
  console.log('Fetching all real applicants from User table...');
  const users = await prisma.user.findMany({
    where: { name: { not: null } },
    select: { name: true, email: true, mobile: true },
    take: 10000
  });
  
  console.log(`Fetched ${users.length} applicants. Generating patient records...`);
  
  // 1. Assign Birth Dates and Sort by Age (Oldest First)
  let preProcessedUsers = users.map(user => {
    const birthYear = getRandomInt(1986, 2006);
    const birthMonth = getRandomInt(1, 12);
    const birthDay = getRandomInt(1, 28);
    const dateOfBirth = `${String(birthDay).padStart(2, '0')}-${String(birthMonth).padStart(2, '0')}-${birthYear}`;
    
    return { ...user, birthYear, dateOfBirth };
  });
  
  // Sort ascending by birthYear (oldest people have lowest birthYear)
  preProcessedUsers.sort((a, b) => a.birthYear - b.birthYear);

  // 2. Assign metrics
  const recordsToInsert = preProcessedUsers.map((user, index) => {
    const taluka = getRandomItem(talukas);
    const loc = getRandomItem(puneLocations[taluka]);

    const abhaId = 'Yes';
    const ayushmanCard = Math.random() > 0.5 ? 'Yes' : 'No';
    const healthInsurance = Math.random() > 0.5 ? 'Yes' : 'No';

    // Aadhaar masked: ********1234
    const last4 = String(getRandomInt(1000, 9999));
    const aadhaarNo = `********${last4}`;

    // Mask actual user details
    const emailId = maskEmail(user.email);
    const phoneNumber = maskMobile(user.mobile);
    
    // BP Logic (27 Low, 225 High, rest Normal) - Assigned to the oldest people first
    let bp = '120/80 (Normal)'; // Default Normal
    let isAbnormalBP = false;
    
    if (index < 27) {
      bp = `${getRandomInt(80, 90)}/${getRandomInt(50, 60)} (Low)`;
      isAbnormalBP = true;
    } else if (index < 27 + 225) {
      bp = `${getRandomInt(140, 180)}/${getRandomInt(90, 110)} (High)`;
      isAbnormalBP = true;
    } else {
      bp = `${getRandomInt(110, 120)}/${getRandomInt(70, 80)} (Normal)`;
    }
    
    // Sugar Logic (350 High, rest Normal)
    let sugar = '90 mg/dL (Normal)'; // Default Normal
    let isHighSugar = false;
    
    if (index < 350) {
      sugar = `${getRandomInt(140, 250)} mg/dL (High)`;
      isHighSugar = true;
    } else {
      sugar = `${getRandomInt(70, 99)} mg/dL (Normal)`;
    }

    // ECG Logic
    let ecg = 'Not Required';
    if (isAbnormalBP && isHighSugar) {
      // Out of the 350 with issues, some are Suggested, some came back Normal
      ecg = Math.random() > 0.5 ? 'Suggested' : 'Normal';
    }

    // Height & Weight correlated with age
    // Older (birthYear <= 1996): heavier, younger: lighter
    let h, w;
    if (user.birthYear <= 1996) {
      // 30 - 40 years old
      h = getRandomInt(155, 180);
      w = getRandomInt(65, 90); 
    } else {
      // 20 - 29 years old
      h = getRandomInt(160, 175);
      w = getRandomInt(50, 70);
    }
    
    const height = `${h} cm`;
    const weight = `${w} kg`;

    // Split full name professionally
    let fName = '';
    let lName = '';
    if (user.name) {
      const parts = user.name.trim().replace(/\s+/g, ' ').split(' ');
      const titles = ['dr', 'dr.', 'mr', 'mr.', 'ms', 'ms.', 'mrs', 'mrs.'];
      
      let i = 0;
      let firstNames = [];
      
      while (i < parts.length) {
        let isTitle = titles.includes(parts[i].toLowerCase());
        let isInitial = parts[i].length <= 2;
        
        if (isTitle || isInitial) {
           firstNames.push(parts[i]);
           i++;
        } else {
           // First actual word encountered
           firstNames.push(parts[i]);
           i++;
           break;
        }
      }
      
      if (i === parts.length) {
         fName = firstNames.join(' ');
         lName = '';
      } else {
         fName = firstNames.join(' ');
         lName = parts.slice(i).join(' ');
      }
    } else {
      fName = 'Applicant';
    }
    
    // Capitalize nicely
    const cap = (s) => {
      if (!s) return '';
      return s.split(' ').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };
    const firstName = cap(fName);
    const lastName = cap(lName);

    return {
      firstName,
      lastName,
      dateOfBirth: user.dateOfBirth,
      village: loc.village,
      taluka: taluka,
      district: 'Pune',
      pinCode: loc.pincode,
      abhaId,
      ayushmanCard,
      healthInsurance,
      aadhaarNo,
      emailId,
      phoneNumber,
      bp,
      height,
      weight,
      sugar,
      ecg
    };
  });
  
  // 3. Shuffle records so they aren't perfectly sorted by age in the database
  for (let i = recordsToInsert.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [recordsToInsert[i], recordsToInsert[j]] = [recordsToInsert[j], recordsToInsert[i]];
  }
  
  console.log(`Inserting ${recordsToInsert.length} patient records in batches...`);
  
  const chunkSize = 1000;
  for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
    const chunk = recordsToInsert.slice(i, i + chunkSize);
    await prisma.patientData.createMany({ data: chunk });
    console.log(`Inserted up to ${i + chunk.length}`);
  }
  
  console.log('Rebuild completely finished!');
}

rebuild().catch(console.error).finally(() => prisma.$disconnect());
