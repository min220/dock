'use client';

import { useState } from 'react';

interface Props {
  berths: { id: number; name: string }[];
}

export default function NewBookingForm({ berths }: Props) {
  const [berthId, setBerthId] = useState(berths[0]?.id ?? '');
  const [vesselName, setVesselName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ berthId, vesselName, startDate, endDate }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(`Conflict: ${data.error}`);
    } else {
      setMessage('Booking created. Refresh the page to see it.');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
      <label>
        Berth
        <br />
        <select value={berthId} onChange={(e) => setBerthId(Number(e.target.value))}>
          {berths.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </label>
      <label>
        Vessel / event name
        <br />
        <input value={vesselName} onChange={(e) => setVesselName(e.target.value)} required />
      </label>
      <label>
        Start date
        <br />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </label>
      <label>
        End date
        <br />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </label>
      <button type="submit">Book it</button>
      {message && <p style={{ width: '100%' }}>{message}</p>}
    </form>
  );
}