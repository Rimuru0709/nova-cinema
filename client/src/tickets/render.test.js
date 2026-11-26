import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { createDemoBooking } from '../checkout/checkout.js';
import { saveSimulation } from '../confirmation/confirmation.js';

test('Rendered history retains its rows and links; unpaid orders never offer a QR', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  const previousStorage = globalThis.sessionStorage;
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.sessionStorage = storage;
  try {
    const receipt = saveSimulation({ outcome: 'success', booking: createDemoBooking(), demoBooking: true, ready: true, missing: [],
      items: [{ id: 1, name: 'Combo kiểm thử', price: 45000, quantity: 2 }],
      contact: { name: 'Khách kiểm thử', email: 'test@example.invalid', phone: '' }, method: 'MoMo' }, storage);
    const { default: TicketsPage } = await vite.ssrLoadModule('/src/tickets/TicketsPage.jsx');
    const html = renderToStaticMarkup(React.createElement(TicketsPage, { targetOrderCode: receipt.orderCode }));
    assert.match(html, /<table/);
    assert.match(html, /Combo kiểm thử/);
    assert.ok(html.includes(`href="#chi-tiet-ve/${receipt.orderCode}"`));
    assert.match(html, /Lịch sử đặt vé/);
    const { default: OrderDetail } = await vite.ssrLoadModule('/src/tickets/OrderDetail.jsx');
    for (const status of ['pending', 'payment_failed', 'expired', 'cancelled']) {
      const unpaid = renderToStaticMarkup(React.createElement(OrderDetail, { order: { ...receipt, source: 'database', status, ticketCode: null } }));
      assert.match(unpaid, /Chưa phát hành vé/);
      assert.doesNotMatch(unpaid, /class="order-qr"/);
      assert.doesNotMatch(unpaid, /In \/|PDF/);
    }
  } finally {
    if (previousStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = previousStorage;
    await vite.close();
  }
});
