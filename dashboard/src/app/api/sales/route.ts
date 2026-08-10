import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma'; // Using the alias we set up during create-next-app
import { batchSchema } from '@/lib/schema'; // Using the alias we set up during create-next-app

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate incoming JSON against the schema
    const validationResult = batchSchema.safeParse(body);

    if (!validationResult.success) {
      // 2. Handle Broken Data Gracefully
      // The Python producer randomly injects anomalies (missing fields, wrong types).
      // We log the error but respond with a 200 OK status so the producer doesn't panic and keeps streaming.
      console.warn('⚠️ Received malformed data batch, discarding:', validationResult.error.issues);

      return NextResponse.json(
        { message: 'Batch discarded due to validation errors' },
        { status: 200 }
      );
    }

    const validEvents = validationResult.data;

    // 3. Persist valid data to the database
    await prisma.saleEvent.createMany({
      data: validEvents.map((event) => ({
        sellDate: new Date(event.sellDate),
        amountLitres: event.amountLitres,
        pricePerLitre: event.pricePerLitre,
        customerCompany: event.customerCompany,
        salesmanName: event.salesmanName,
        warrantyType: event.warrantyType,
        warrantyPeriodDays: event.warrantyPeriodDays,
        expectedYearlyMileage: event.expectedYearlyMileage || null,
      })),
    });

    console.log(`✅ Successfully ingested ${validEvents.length} events.`);

    return NextResponse.json(
      { message: `Ingested ${validEvents.length} events` },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to process incoming sales data:', error);
    // Only return 500 if the server itself fails (e.g. database goes offline)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
