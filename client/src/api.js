export async function fetchMap() {
  const res = await fetch('/api/map');
  if (!res.ok) throw new Error('Failed to fetch map');
  return res.json();
}

export async function postBooking(cabanaId, room, guestName) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cabanaId, room, guestName }),
  });
  return res.json();
}
