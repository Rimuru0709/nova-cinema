import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanCart, cartLines, normalizeProducts, bookingContext } from './cart.js';

test('Stored quantities cannot be negative, fractional or above the limit', () => {
  assert.deepEqual(cleanCart({ 1: 3, 2: -1, 3: 1.5, 4: '2', 5: 100, bad: 4 }), { 1: 3, 5: 10 });
  assert.deepEqual(cleanCart([]), {});
});
test('Totals use current API prices and exclude removed products', () => {
  const products = normalizeProducts([{ id: 1, name: 'Combo', category: 'combo', price: '110000' }, { id: 2, name: 'Nước', category: 'drink', price: 35000 }]);
  const lines = cartLines(products, { 1: 2, 2: 1, 999: 10 });
  assert.equal(lines.reduce((sum, item) => sum + item.subtotal, 0), 255000);
  assert.equal(lines.length, 2);
  assert.deepEqual(cartLines(products, {}), []);
});
test('Reject malformed API prices and duplicate product IDs', () => {
  const product = { id: 1, name: 'Bắp', category: 'popcorn', price: 45000 };
  for (const price of [-1, null, 'bad']) assert.throws(() => normalizeProducts([{ ...product, price }]));
  assert.throws(() => normalizeProducts([product, product]));
});
test('A hold needs seats, a ticket subtotal, and an explicit timezone', () => {
  const hold = { holdId: 1, showtimeId: 2, seats: ['F07'], ticketSubtotal: 150000, expiresAt: '2026-11-19T18:03:00+07:00' };
  assert.equal(bookingContext(hold), hold);
  assert.equal(bookingContext({ ...hold, expiresAt: '2026-11-19T18:03:00' }), null);
  assert.equal(bookingContext({ ...hold, seats: [] }), null);
  assert.equal(bookingContext({ ...hold, seats: [''] }), null);
  assert.equal(bookingContext({ ...hold, ticketSubtotal: -1 }), null);
  assert.equal(bookingContext(null), null);
});
