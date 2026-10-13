import { prisma } from '../../../../lib/prisma';
import * as xlsx from 'xlsx';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range');
    const part = searchParams.get('part');
    const skipParam = searchParams.get('skip');
    const takeParam = searchParams.get('take') || searchParams.get('limit');

    let skip = undefined;
    let take = undefined;
    let filename = 'patients_data_all_10000.xlsx';
    let sheetName = 'All Patients';

    if (part === '1' || range === '1-5000' || range === 'part1') {
      skip = 0;
      take = 5000;
      filename = 'patients_data_1_to_5000.xlsx';
      sheetName = 'Patients 1-5000';
    } else if (part === '2' || range === '5001-10000' || range === 'part2') {
      skip = 5000;
      take = 5000;
      filename = 'patients_data_5001_to_10000.xlsx';
      sheetName = 'Patients 5001-10000';
    } else if (skipParam !== null || takeParam !== null) {
      skip = skipParam ? Math.max(0, parseInt(skipParam, 10)) : 0;
      take = takeParam ? Math.max(1, parseInt(takeParam, 10)) : undefined;
      const startNum = skip + 1;
      const endNum = take ? startNum + take - 1 : 'end';
      filename = `patients_data_${startNum}_to_${endNum}.xlsx`;
      sheetName = `Patients ${startNum}-${endNum}`;
    }

    const queryOptions = {
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    };

    if (typeof skip === 'number') queryOptions.skip = skip;
    if (typeof take === 'number') queryOptions.take = take;

    const patients = await prisma.patientData.findMany(queryOptions);

    const data = patients.map(p => ({
      'First Name': p.firstName,
      'Last Name': p.lastName,
      'Date of Birth': p.dateOfBirth,
      'Village': p.village,
      'Taluka': p.taluka,
      'District': p.district,
      'Pin Code': p.pinCode,
      'ABHA ID': p.abhaId,
      'Ayushman Card': p.ayushmanCard,
      'Health Insurance': p.healthInsurance,
      'Aadhaar No': p.aadhaarNo,
      'Email ID': p.emailId,
      'Phone Number': p.phoneNumber,
      'Blood Pressure': p.bp,
      'Blood Sugar': p.sugar,
      'ECG': p.ecg,
      'Height': p.height,
      'Weight': p.weight
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    return new Response('Error generating Excel file', { status: 500 });
  }
}
