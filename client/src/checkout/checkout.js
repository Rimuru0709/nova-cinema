import { bookingContext, cartLines, cleanCart } from '../combo/cart.js';

export const DEMO_KEY = 'nova.checkout.demo.v1';
export const HOLD_MS = 3 * 60 * 1000;

export function createDemoBooking(now = Date.now()) {
  return {
    demo: true, holdId: 'DEMO-HOLD', showtimeId: 'DEMO-SHOWTIME',
    movieTitle: 'Dune: Hành Tinh Cát – Phần Hai',
    cinemaName: 'NOVA Landmark 81', roomName: 'Phòng IMAX 01',
    format: 'IMAX 2D', language: 'Phụ đề tiếng Việt', ageRating: 'T16',
    poster: '/posters/dune.jpg', seats: ['F07', 'F08'], seatType: 'VIP',
    ticketSubtotal: 300000, startsAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now).toISOString(), expiresAt: new Date(now + HOLD_MS).toISOString(),
  };
}

export function resolveBooking(real, demo, now = Date.now()) {
  // An invalid TV3 handoff must never silently become a sample booking.
  if (real != null) return { booking: bookingContext(real), demo: false };
  return { booking: demo?.demo === true && bookingContext(demo) ? demo : createDemoBooking(now), demo: true };
}

export function remainingSeconds(expiresAt, now = Date.now()) {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000) || 0);
}

export function checkoutTotals(products, cart, ticketSubtotal) {
  const quantities = cleanCart(cart);
  const items = cartLines(products, quantities);
  const missing = Object.keys(quantities).filter((id) => !products.some((p) => String(p.id) === id));
  const productSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, missing, productSubtotal, total: ticketSubtotal + productSubtotal };
}

export function canSimulatePayment({ booking, ready, missing, now = Date.now() }) {
  return Boolean(booking && ready && missing.length === 0 && remainingSeconds(booking.expiresAt, now) > 0);
}
