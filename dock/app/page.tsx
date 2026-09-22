import { PrismaClient } from '@prisma/client';
import NewBookingForm from './NewBookingForm';

const prisma = new PrismaClient();

export default async function Home() {
  const berths = await prisma.berth.findMany({
    include: { bookings: { orderBy: { startDate: 'asc' } } },
    orderBy: { name: 'asc' },
  });

  const totalBookings = berths.reduce((sum, b) => sum + b.bookings.length, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Dock Scheduling</h1>
          <p className="mt-1 text-sm text-slate-500">
            {berths.length} berths &middot; {totalBookings} bookings on record
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">New booking</h2>
          <NewBookingForm berths={berths.map((b) => ({ id: b.id, name: b.name, lengthFeet: b.lengthFeet }))} />
        </section>

        <section className="mt-8 space-y-4">
          {berths.map((berth) => (
            <div key={berth.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-slate-900">{berth.name}</h3>
                <span className="text-sm text-slate-400">{berth.lengthFeet}' berth</span>
              </div>

              {berth.bookings.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No bookings</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {berth.bookings.map((b) => (
                    <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className={
                            b.isEvent
                              ? 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'
                              : 'inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700'
                          }
                        >
                          {b.isEvent ? 'Event' : 'Vessel'}
                        </span>
                        <span className="font-medium text-slate-800">{b.vesselName}</span>
                      </span>
                      <span className="text-slate-500">
                        {b.startDate.toISOString().slice(0, 10)} &rarr; {b.endDate.toISOString().slice(0, 10)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}