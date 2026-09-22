'use client';

import { useState } from 'react';

interface Props {
  berths: { id: number; name: string; lengthFeet: number }[];
}

export default function NewBookingForm({ berths }: Props) {
  const [berthId, setBerthId] = useState(berths[0]?.id ?? '');
  const [vesselName, setVesselName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setStatus('idle');

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ berthId, vesselName, startDate, endDate }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus('error');
      setMessage(data.error ?? 'Something went wrong.');
    } else {
      setStatus('success');
      setMessage('Booking created. Refresh the page to see it in the list below.');
      setVesselName('');
      setStartDate('');
      setEndDate('');
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-medium text-slate-700">
          Berth
          <select
            className={inputClass}
            value={berthId}
            onChange={(e) => setBerthId(Number(e.target.value))}
          >
            {berths.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.lengthFeet}')
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Vessel / event name
          <input
            className={inputClass}
            value={vesselName}
            onChange={(e) => setVesselName(e.target.value)}
            placeholder="F/V Example"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Start date
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          End date
          <input
            type="date"
            className={inputClass}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Book it
      </button>

      {message && (
        <p
          className={
            status === 'error'
              ? 'rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700'
              : 'rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700'
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}