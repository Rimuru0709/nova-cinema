export async function bookingApi(path, body, signal) {
  const response = await fetch(`/api/bookings${path}`, {
    credentials: 'same-origin', signal, cache: 'no-store',
    ...(body && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw Object.assign(new Error(result?.message || 'Chưa kết nối được máy chủ đặt vé.'), { status: response.status });
  return result.data;
}

export function holdContext(hold, show = {}) {
  const seats = hold.seats || hold.heldSeats || [];
  return { ...show, ...hold, source: 'database', demo: false,
    poster: hold.poster || show.moviePoster || show.poster,
    seats: seats.map(seat => seat.label), seatIds: seats.map(seat => Number(seat.seatId)),
    ticketSubtotal: seats.reduce((sum, seat) => sum + Number(seat.price), 0),
    seatType: [...new Set(seats.map(seat => seat.seatType))].join(' / '),
  };
}
