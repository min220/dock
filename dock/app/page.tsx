import { PrismaClient } from '@prisma/client';
import NewBookingForm from './NewBookingForm';

const prisma = new PrismaClient();

export default async function Home() {
  const berths = await prisma.berth.findMany({
    include: { bookings: { orderBy: { startDate: 'asc' } } },
    orderBy: { name: 'asc' },
  });

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Dock Scheduling</h1>

      <NewBookingForm berths={berths.map((b) => ({ id: b.id, name: b.name }))} />

      <h2 style={{ marginTop: 40 }}>Berths &amp; Bookings</h2>
      {berths.map((berth) => (
        <div key={berth.id} style={{ marginBottom: 24, borderBottom: '1px solid #ddd', paddingBottom: 12 }}>
          <h3>{berth.name} ({berth.lengthFeet}')</h3>
          {berth.bookings.length === 0 && <p style={{ color: '#888' }}>No bookings</p>}
          <ul>
            {berth.bookings.map((b) => (
              <li key={b.id}>
                {b.isEvent ? '📅' : '⛴️'} <strong>{b.vesselName}</strong>
                {' — '}
                {b.startDate.toISOString().slice(0, 10)} to {b.endDate.toISOString().slice(0, 10)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}