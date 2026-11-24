import test from 'node:test';
import assert from 'node:assert/strict';
import { CINEMAS, DEMO_TODAY, MOVIES, ORDERS, filterOrders, ordersToCsv, summarizeOrders } from './adminData.js';

test('Demo fixture is consistent and covers three dates and all cinemas', () => {
  assert.equal(ORDERS.length, 24);
  assert.equal(new Set(ORDERS.map((order) => order.id)).size, 24);
  assert.deepEqual([...new Set(ORDERS.map((order) => order.date))].sort(), ['2026-11-17', '2026-11-18', DEMO_TODAY]);
  assert.equal(new Set(ORDERS.map((order) => order.cinemaId)).size, CINEMAS.length);
  for (const order of ORDERS) {
    assert.equal(order.total, order.ticketTotal + order.comboTotal);
    assert.ok(order.id.startsWith('DEMO-'));
    assert.ok(order.customer.startsWith('Khách mẫu'));
    assert.ok(MOVIES.some((movie) => movie.id === order.movieId));
    assert.ok(Number.isFinite(Date.parse(order.showtime)));
  }
});

test('Period, cinema, status and accent-insensitive search compose together', () => {
  assert.equal(filterOrders(ORDERS).length, 8);
  assert.equal(filterOrders(ORDERS, { period: 'yesterday' }).length, 8);
  assert.equal(filterOrders(ORDERS, { period: 'week' }).length, 24);
  assert.equal(filterOrders(ORDERS, { query: 'KHACH MAU 01' })[0].customer, 'Khách mẫu 01');
  const found = filterOrders(ORDERS, { period: 'week', cinema: 'batrieu', status: 'paid', query: 'ba trieu' });
  assert.ok(found.length > 0);
  assert.ok(found.every((order) => order.cinemaId === 'batrieu' && order.status === 'paid'));
  assert.equal(filterOrders(ORDERS, { query: 'không có kết quả này' }).length, 0);
  assert.ok(filterOrders(ORDERS, { period: 'week', query: 'hanh tinh cat' }).every((order) => order.movieId === 'dune'));
});

test('Revenue and tickets count paid orders only; every chart reconciles', () => {
  const summary = summarizeOrders(ORDERS);
  const paid = ORDERS.filter((order) => order.status === 'paid');
  assert.equal(summary.ticketRevenue, paid.reduce((sum, order) => sum + order.ticketTotal, 0));
  assert.equal(summary.comboRevenue, paid.reduce((sum, order) => sum + order.comboTotal, 0));
  assert.equal(summary.tickets, paid.reduce((sum, order) => sum + order.seats.length, 0));
  assert.equal(summary.paidCount, paid.length);
  assert.equal(summary.orderCount, ORDERS.length);
  assert.equal(summary.movieRevenue.reduce((sum, movie) => sum + movie.revenue, 0), summary.ticketRevenue);
  assert.equal(summary.hours.reduce((sum, hour) => sum + hour.revenue, 0), summary.ticketRevenue);
  assert.equal(summary.formats.reduce((sum, format) => sum + format.tickets, 0), summary.tickets);
  assert.equal(summary.holdingSeats, ORDERS.filter((order) => order.status === 'holding').reduce((sum, order) => sum + order.seats.length, 0));
  assert.ok(summary.comboRate >= 0 && summary.comboRate <= 100);
  const unpaid = summarizeOrders(ORDERS.filter((order) => order.status !== 'paid'));
  assert.equal(unpaid.ticketRevenue, 0);
  assert.equal(unpaid.comboRevenue, 0);
  assert.equal(unpaid.tickets, 0);
  assert.equal(unpaid.comboRate, 0);
});

test('Empty filters produce finite zero values', () => {
  const empty = summarizeOrders([]);
  for (const key of ['ticketRevenue', 'comboRevenue', 'tickets', 'holdingSeats', 'paidCount', 'orderCount', 'comboRate']) assert.equal(empty[key], 0);
  assert.ok(empty.movieRevenue.every((movie) => movie.revenue === 0));
  assert.ok(empty.hours.every((hour) => hour.revenue === 0));
});

test('CSV preserves Vietnamese with BOM and neutralizes formulas and quotes', () => {
  const row = { ...ORDERS[0], customer: '=HYPERLINK("bad")', room: 'Phòng "VIP", 01' };
  const csv = ordersToCsv([row]);
  assert.ok(csv.startsWith('\uFEFF"Mã đơn mẫu"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"Phòng ""VIP"", 01"'));
  assert.equal(csv.split('\r\n').filter(Boolean).length, 2);
  assert.ok(ordersToCsv([{ ...row, customer: '  +SUM(1,2)' }]).includes('"\'  +SUM(1,2)"'));
  assert.equal(ordersToCsv([]).split('\r\n').filter(Boolean).length, 1);
});
