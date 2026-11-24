import test from 'node:test';
import assert from 'node:assert/strict';
import { HOLD_MS, canSimulatePayment, checkoutTotals, createDemoBooking, remainingSeconds, resolveBooking } from './checkout.js';

const now = Date.parse('2026-11-19T10:00:00+07:00');

test('The demo expires after three minutes and remounting never extends it', () => {
  const first = resolveBooking(null, null, now);
  assert.equal(first.demo, true);
  assert.equal(Date.parse(first.booking.expiresAt), now + HOLD_MS);
  const reloaded = resolveBooking(null, first.booking, now + 75000);
  assert.equal(reloaded.booking.expiresAt, first.booking.expiresAt);
  assert.equal(remainingSeconds(reloaded.booking.expiresAt, now + 75000), 105);
  assert.equal(remainingSeconds(reloaded.booking.expiresAt, now + HOLD_MS + 1000), 0);
});

test('TV3 context wins over the demo and invalid context is blocked', () => {
  const demo = createDemoBooking(now);
  const real = { ...demo, demo: false, holdId: 123, expiresAt: new Date(now + 40000).toISOString() };
  const resolved = resolveBooking(real, demo, now);
  assert.equal(resolved.demo, false);
  assert.equal(resolved.booking, real);
  assert.equal(remainingSeconds(resolved.booking.expiresAt, now), 40);
  assert.equal(resolveBooking({ holdId: 123 }, demo, now).booking, null);
});

test('The total includes tickets and the latest API prices; removed items block payment', () => {
  const products = [{ id: 8, name: 'Couple', price: 110000 }, { id: 4, name: 'Cola', price: 35000 }];
  const totals = checkoutTotals(products, { 8: 2, 4: 1 }, 300000);
  assert.equal(totals.productSubtotal, 255000);
  assert.equal(totals.total, 555000);
  assert.equal(checkoutTotals([], {}, 300000).total, 300000);
  const removed = checkoutTotals(products.slice(0, 1), { 8: 2, 4: 1 }, 300000);
  assert.deepEqual(removed.missing, ['4']);
  assert.equal(canSimulatePayment({ booking: createDemoBooking(now), ready: true, missing: removed.missing, now }), false);
});

test('Payment must recheck expiry at submit time, including the exact deadline', () => {
  const booking = createDemoBooking(now);
  const state = { booking, ready: true, missing: [] };
  assert.equal(canSimulatePayment({ ...state, now: now + HOLD_MS - 1 }), true);
  assert.equal(canSimulatePayment({ ...state, now: now + HOLD_MS }), false);
  assert.equal(canSimulatePayment({ ...state, ready: false, now }), false);
  assert.equal(canSimulatePayment({ ...state, booking: null, now }), false);
});
