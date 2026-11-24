// Fixed, fictional fixtures: this module never reads customer or payment records.
export const DEMO_TODAY = '2026-11-19';

export const CINEMAS = [
  { id: 'landmark', name: 'NOVA Landmark 81' },
  { id: 'westlake', name: 'NOVA Westlake' },
  { id: 'batrieu', name: 'NOVA Vincom Bà Triệu' },
];

export const MOVIES = [
  { id: 'dune', title: 'Dune: Hành Tinh Cát – Phần Hai', format: 'IMAX', poster: '/posters/dune.jpg' },
  { id: 'mai', title: 'Mai', format: '2D VIP', poster: '/posters/mai.jpg' },
  { id: 'godzilla', title: 'Godzilla x Kong: Đế Chế Mới', format: '3D', poster: '/posters/godzilla.jpg' },
  { id: 'oppenheimer', title: 'Oppenheimer', format: 'IMAX', poster: '/posters/oppenheimer.jpg' },
];

const dates = [DEMO_TODAY, '2026-11-18', '2026-11-17'];
const orderHours = [9, 10, 12, 14, 16, 18, 20, 22];
const statusPattern = ['paid', 'paid', 'holding', 'paid', 'cancelled', 'paid', 'paid', 'holding'];
const methods = ['MoMo (mẫu)', 'VNPay (mẫu)', 'Thẻ quốc tế (mẫu)'];

export const ORDERS = Array.from({ length: 24 }, (_, index) => {
  const dayIndex = Math.floor(index / 8);
  const slot = index % 8;
  const movie = MOVIES[(slot + dayIndex) % MOVIES.length];
  const cinema = CINEMAS[index % CINEMAS.length];
  const quantity = 1 + (index % 3);
  const seats = Array.from({ length: quantity }, (_, seat) => `${index % 2 ? 'G' : 'F'}${String(7 + seat).padStart(2, '0')}`);
  const seatPrice = movie.format === 'IMAX' ? 180000 : movie.format === '3D' ? 160000 : 140000;
  const ticketTotal = seatPrice * quantity;
  const comboTotal = index % 3 === 0 ? 0 : index % 2 === 0 ? 70000 : 110000;
  const date = dates[dayIndex];
  const hour = orderHours[slot];
  return {
    id: `DEMO-${894215 - index}`,
    customer: `Khách mẫu ${String(index + 1).padStart(2, '0')}`,
    phone: `09•• ••• ${String(index + 1).padStart(3, '0')}`,
    movieId: movie.id,
    cinemaId: cinema.id,
    room: movie.format === 'IMAX' ? 'IMAX 01' : movie.format === '3D' ? 'Dolby Atmos 03' : 'VIP Gold 02',
    showtime: `${date}T${String(Math.min(hour + 1, 23)).padStart(2, '0')}:30:00+07:00`,
    createdAt: `${date}T${String(hour).padStart(2, '0')}:${String(12 + slot * 3).padStart(2, '0')}:00+07:00`,
    date,
    seats,
    status: statusPattern[slot],
    ticketTotal,
    comboTotal,
    total: ticketTotal + comboTotal,
    comboDescription: comboTotal === 0 ? 'Không kèm bắp nước' : comboTotal === 70000 ? '1 × Solo Combo' : '1 × Couple Combo',
    method: methods[index % methods.length],
  };
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function normalize(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function filterOrders(orders, { cinema = 'all', period = 'today', query = '', status = 'all' } = {}) {
  const search = normalize(query).trim();
  return orders.filter((order) => {
    const dateMatches = period === 'week'
      ? order.date >= '2026-11-13' && order.date <= DEMO_TODAY
      : order.date === (period === 'yesterday' ? '2026-11-18' : DEMO_TODAY);
    if (!dateMatches || (cinema !== 'all' && order.cinemaId !== cinema) || (status !== 'all' && order.status !== status)) return false;
    const movie = MOVIES.find((item) => item.id === order.movieId);
    const venue = CINEMAS.find((item) => item.id === order.cinemaId);
    return !search || normalize([order.id, order.customer, order.phone, movie?.title, venue?.name, order.room, ...order.seats].join(' ')).includes(search);
  });
}

export function summarizeOrders(orders) {
  const paid = orders.filter((order) => order.status === 'paid');
  const ticketRevenue = paid.reduce((sum, order) => sum + order.ticketTotal, 0);
  const comboRevenue = paid.reduce((sum, order) => sum + order.comboTotal, 0);
  const tickets = paid.reduce((sum, order) => sum + order.seats.length, 0);
  const movieRevenue = MOVIES.map((movie) => {
    const matching = paid.filter((order) => order.movieId === movie.id);
    return { ...movie, revenue: matching.reduce((sum, order) => sum + order.ticketTotal, 0), tickets: matching.reduce((sum, order) => sum + order.seats.length, 0) };
  }).sort((a, b) => b.revenue - a.revenue);
  const formats = ['IMAX', '2D VIP', '3D'].map((name) => ({ name, tickets: movieRevenue.filter((movie) => movie.format === name).reduce((sum, movie) => sum + movie.tickets, 0) }));
  const hours = Array.from({ length: 8 }, (_, index) => {
    const hour = index * 3;
    return { label: `${String(hour).padStart(2, '0')}:00`, revenue: paid.filter((order) => {
      // Fixtures use +07:00 consistently; group purchase times in local 3-hour slots.
      const purchaseHour = Number(order.createdAt.slice(11, 13));
      return purchaseHour >= hour && purchaseHour < hour + 3;
    }).reduce((sum, order) => sum + order.ticketTotal, 0) };
  });
  return {
    ticketRevenue, comboRevenue, tickets,
    holdingSeats: orders.filter((order) => order.status === 'holding').reduce((sum, order) => sum + order.seats.length, 0),
    paidCount: paid.length, orderCount: orders.length,
    comboRate: paid.length ? paid.filter((order) => order.comboTotal > 0).length / paid.length * 100 : 0,
    movieRevenue, formats, hours,
  };
}

function csvCell(value) {
  let text = String(value ?? '');
  // Spreadsheet apps must treat fields such as =HYPERLINK(...) as literal text.
  if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function ordersToCsv(rows) {
  const statusNames = { paid: 'Thành công (mẫu)', holding: 'Đang giữ (mẫu)', cancelled: 'Đã hủy (mẫu)' };
  const data = [
    ['Mã đơn mẫu', 'Khách hàng mẫu', 'Số điện thoại minh họa', 'Phim', 'Rạp', 'Phòng', 'Suất chiếu', 'Ghế', 'Tiền vé (VND)', 'Tiền combo (VND)', 'Tổng tiền (VND)', 'Trạng thái', 'Phương thức mẫu'],
    ...rows.map((order) => [order.id, order.customer, order.phone,
      MOVIES.find((movie) => movie.id === order.movieId)?.title || order.movieId,
      CINEMAS.find((cinema) => cinema.id === order.cinemaId)?.name || order.cinemaId,
      order.room, order.showtime, order.seats.join(', '), order.ticketTotal, order.comboTotal, order.total,
      statusNames[order.status] || order.status, order.method]),
  ];
  return `\uFEFF${data.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
