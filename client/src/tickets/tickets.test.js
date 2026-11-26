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


test('Database ticket QR round-trips without exposing contact data', async () => {
  const { default: QRCode } = await import('qrcode');
  const { default: jsQR } = await import('jsqr');
  const receipt = { version:2, source:'database', status:'paid', ticketCode:'NOVA-11111111-2222-4333-8444-555555555555', contact:{ email:'private@example.invalid' } };
  const payload = ticketQrPayload(receipt);
  assert.equal(payload, receipt.ticketCode);
  assert.throws(() => ticketQrPayload({...receipt,status:'pending'}));
  const qr = QRCode.create(payload), scale=8, border=4, width=(qr.modules.size+border*2)*scale;
  const pixels = new Uint8ClampedArray(width*width*4).fill(255);
  for(let y=0;y<qr.modules.size;y++) for(let x=0;x<qr.modules.size;x++) if(qr.modules.get(y,x)) {
    for(let dy=0;dy<scale;dy++) for(let dx=0;dx<scale;dx++) {
      const at=(((y+border)*scale+dy)*width+(x+border)*scale+dx)*4;
      pixels[at]=11;pixels[at+1]=19;pixels[at+2]=43;
    }
  }
  assert.equal(jsQR(pixels,width,width)?.data,payload);
});

test('Pending, failed, expired and cancelled orders do not appear as upcoming tickets', () => {
  const original = createReceipt(now);
  const orders = ['paid', 'pending', 'payment_failed', 'expired', 'cancelled'].map(status => ({ ...original, source: 'database', status }));
  assert.equal(filterTickets(orders, { tab: 'upcoming', now }).length, 1);
  for (const status of ['pending', 'payment_failed', 'expired', 'cancelled']) {
    assert.equal(filterTickets(orders, { tab: status, now })[0].status, status);
    assert.throws(() => ticketQrPayload(orders.find(order => order.status === status)));
  }
});
