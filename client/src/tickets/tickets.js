import { validConfirmation } from '../confirmation/confirmation.js';

export function ticketStatus(receipt, now = Date.now()) {
  if (receipt.source === 'database' && receipt.status !== 'paid') return receipt.status;
  const starts = Date.parse(receipt.booking.startsAt);
  if (!Number.isFinite(starts)) return 'unknown';
  return starts > now ? 'upcoming' : 'past';
}

export function filterTickets(tickets, { tab = 'all', query = '', now = Date.now() } = {}) {
  const search = query.trim().toLocaleLowerCase('vi-VN');
  return tickets.filter(receipt => (tab === 'all' || ticketStatus(receipt, now) === tab)
    && [receipt.orderCode, receipt.ticketCode, receipt.booking.movieTitle, receipt.booking.cinemaName, ...receipt.booking.seats]
      .filter(Boolean).join(' ').toLocaleLowerCase('vi-VN').includes(search));
}

export function ticketHref(receipt) {
  return `#chi-tiet-ve/${encodeURIComponent(receipt.orderCode)}`;
}

// A scannable demo code, not payment data, a check-in credential or a bank QR.
// Do not embed contact details in the code.
export function ticketQrPayload(receipt) {
  if (receipt?.version === 2 && receipt.source === 'database' && receipt.status === 'paid' && /^NOVA-[a-f0-9-]{36}$/i.test(receipt.ticketCode || '')) return receipt.ticketCode;
  if (!validConfirmation(receipt)) throw new Error('Vé không hợp lệ.');
  return `NOVA CINEMA | VE MO PHONG | ${receipt.ticketCode} | KHONG CO GIA TRI VAO RAP`;
}
