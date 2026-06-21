import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const data = await req.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Data must be an array of objects' }, { status: 400 });
    }

    const inserted = await prisma.testDataset.createMany({
      data: data.map(item => ({
        firstName: item.firstName,
        middleName: item.middleName || null,
        lastName: item.lastName,
        gender: item.gender
      }))
    });

    return NextResponse.json({ success: true, count: inserted.count }, { status: 201 });
  } catch (error) {
    console.error('Error saving dataset:', error);
    return NextResponse.json({ error: 'Failed to save dataset' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await prisma.testDataset.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching count:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
