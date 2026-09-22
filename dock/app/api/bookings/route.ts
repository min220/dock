import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/bookings — returns every berth with its bookings, for the grid view
export async function GET() {
  const berths = await prisma.berth.findMany({
    include: { bookings: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(berths);
}

// POST /api/bookings — creates a new booking, rejecting it if it overlaps
// an existing booking on the same berth.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { berthId, vesselName, startDate, endDate, isEvent } = body;

  if (!berthId || !vesselName || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'berthId, vesselName, startDate and endDate are all required.' },
      { status: 400 }
    );
  }

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  // Two date ranges [aStart, aEnd] and [bStart, bEnd] overlap when
  // aStart <= bEnd AND bStart <= aEnd. That's the whole conflict check.
  const conflict = await prisma.booking.findFirst({
    where: {
      berthId: Number(berthId),
      startDate: { lte: newEnd },
      endDate: { gte: newStart },
    },
  });

  if (conflict) {
    return NextResponse.json(
      {
        error: 'This berth is already booked for part of that date range.',
        conflictingBooking: conflict,
      },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      berthId: Number(berthId),
      vesselName,
      startDate: newStart,
      endDate: newEnd,
      isEvent: !!isEvent,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
