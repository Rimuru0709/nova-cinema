import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoBooking } from '../checkout/checkout.js';
import { saveSimulation } from '../confirmation/confirmation.js';
import { ticketStatus, filterTickets, ticketHref, ticketQrPayload } from './tickets.js';

const now = Date.parse('2026-11-19T12:00:00+07:00');

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

function createReceipt(customTime = now) {
  const store = storage();
  const input = {
    outcome: 'success',
    booking: createDemoBooking(customTime),
    demoBooking: true,
    ready: true,
    missing: [],
    items: [{ id: 8, name: 'Couple', price: 110000, quantity: 2 }],
    contact: { name: 'Thái Dương', email: 'duong@example.com', phone: '0901234567' },
    method: 'MoMo'
  };
  return saveSimulation(input, store, customTime);
}

test('ticketStatus accurately identifies upcoming and past tickets based on startsAt', () => {
  const receipt = createReceipt(now);
  // Default demo booking starts in 2 hours
  assert.equal(ticketStatus(receipt, now), 'upcoming');

  // After showtime starts
  const futureTime = Date.parse(receipt.booking.startsAt) + 1000;
  assert.equal(ticketStatus(receipt, futureTime), 'past');

  // Corrupted startsAt returns unknown
  const invalid = { ...receipt, booking: { ...receipt.booking, startsAt: 'invalid-date' } };
  assert.equal(ticketStatus(invalid, now), 'unknown');
});

test('filterTickets correctly filters by tab (upcoming, past, all) and search query', () => {
  const receipt = createReceipt(now);
  const list = [receipt];

  // Tab filter
  assert.equal(filterTickets(list, { tab: 'all', now }).length, 1);
  assert.equal(filterTickets(list, { tab: 'upcoming', now }).length, 1);
  assert.equal(filterTickets(list, { tab: 'past', now }).length, 0);

  // Search by movie title
  assert.equal(
    filterTickets(list, { tab: 'all', query: receipt.booking.movieTitle, now }).length,
    1
  );

  // Search by seat
  assert.equal(filterTickets(list, { tab: 'all', query: 'F07', now }).length, 1);

  // Search by orderCode
  assert.equal(filterTickets(list, { tab: 'all', query: receipt.orderCode, now }).length, 1);

  // Search non-existing keyword
  assert.equal(filterTickets(list, { tab: 'all', query: 'KhongTonTaiXYZ', now }).length, 0);
});

test('ticketHref and ticketQrPayload generate scannable demo URL and payload', () => {
  const receipt = createReceipt(now);
  assert.equal(ticketHref(receipt), `#chi-tiet-ve/${encodeURIComponent(receipt.orderCode)}`);

  const payload = ticketQrPayload(receipt);
  assert.ok(payload.startsWith('NOVA CINEMA | VE MO PHONG |'));
  assert.ok(payload.includes(receipt.ticketCode));

  // Invalid receipt throws error
  assert.throws(() => ticketQrPayload(null), /Vé không hợp lệ/);
});
