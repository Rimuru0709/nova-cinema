import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoBooking, HOLD_MS } from '../checkout/checkout.js';
import { CONFIRMATION_KEY, saveSimulation, validConfirmation } from './confirmation.js';

const now = Date.parse('2026-11-19T12:00:00+07:00');
function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
function input() {
  return { outcome: 'success', booking: createDemoBooking(now), demoBooking: true, ready: true, missing: [],
    items: [{ id: 8, name: 'Couple', price: 110000, quantity: 2 }, { id: 4, name: 'Cola', price: 35000, quantity: 1 }],
    contact: { name: 'Nguyễn Văn An', email: 'an@example.com', phone: '' }, method: 'MoMo' };
}

test('Success saves a fixed receipt with exact checkout totals and survives a reload', () => {
  const store = storage();
  const request = input();
  const receipt = saveSimulation(request, store, now);
  assert.equal(receipt.total, 555000);
  assert.equal(receipt.productSubtotal, 255000);
  request.booking.seats.push('F09');
  request.items[0].price = 1;
  assert.deepEqual(receipt.booking.seats, ['F07', 'F08']);
  assert.equal(receipt.items[0].unitPrice, 110000);
  const reloaded = validConfirmation(JSON.parse(store.getItem(CONFIRMATION_KEY)));
  assert.equal(reloaded.orderCode, receipt.orderCode);
  assert.equal(reloaded.ticketCode, `NOVA-${receipt.orderCode}`);
});

test('Double submission and returning to a completed hold reuse the same receipt', () => {
  const store = storage();
  const first = saveSimulation(input(), store, now);
  const second = saveSimulation(input(), store, now + HOLD_MS + 1);
  assert.deepEqual(second, first);
  const changed = input();
  changed.booking = createDemoBooking(now + HOLD_MS + 1);
  assert.notEqual(saveSimulation(changed, store, now + HOLD_MS + 1).orderCode, first.orderCode);
});

test('Failed, expired, unpriced or unavailable-product checkouts never create a receipt', () => {
  for (const [changes, time] of [[{ outcome: 'failure' }, now], [{}, now + HOLD_MS], [{ ready: false }, now], [{ missing: ['9'] }, now]]) {
    const store = storage();
    assert.throws(() => saveSimulation({ ...input(), ...changes }, store, time));
    assert.equal(store.getItem(CONFIRMATION_KEY), null);
  }
});

test('Invalid stored confirmations produce an empty state, and storage failure is surfaced', () => {
  const receipt = saveSimulation(input(), storage(), now);
  for (const value of [null, {}, { ...receipt, status: 'failed' }, { ...receipt, total: 1 }, { ...receipt, items: [{ productId: 8 }] }]) {
    assert.equal(validConfirmation(value), null);
  }
  assert.throws(() => saveSimulation(input(), { getItem: () => null, setItem: () => { throw new Error('quota'); } }, now), /Không lưu được/);
});
