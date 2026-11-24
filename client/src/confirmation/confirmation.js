import { bookingContext, MAX_QUANTITY } from '../combo/cart.js';
import { canSimulatePayment } from '../checkout/checkout.js';

export const CONFIRMATION_KEY = 'nova.confirmation.demo.v1';
export const TICKET_HISTORY_KEY = 'nova.tickets.demo.v1';
const isMoney = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isText = (value) => typeof value === 'string' && value.trim().length > 0;

export function validConfirmation(value) {
  try {
    if (!value || value.version !== 1 || value.status !== 'simulated-success'
      || typeof value.demoBooking !== 'boolean' || !bookingContext(value.booking)
      || !/^DEMO-[A-F0-9-]{36}$/.test(value.orderCode)
      || value.ticketCode !== `NOVA-${value.orderCode}`
      || !Number.isFinite(Date.parse(value.confirmedAt)) || !isText(value.method)
      || !isText(value.contact?.name) || !isText(value.contact?.email)
      || typeof value.contact.phone !== 'string'
      || !Array.isArray(value.items) || !isMoney(value.productSubtotal) || !isMoney(value.total)) return null;
    for (const key of ['movieTitle', 'cinemaName', 'roomName', 'poster', 'format', 'language', 'ageRating', 'seatType', 'startsAt']) {
      if (value.booking[key] != null && typeof value.booking[key] !== 'string') return null;
    }
    const ids = new Set();
    for (const item of value.items) {
      if (!Number.isSafeInteger(item.productId) || item.productId < 1 || ids.has(item.productId)
        || !isText(item.name) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY
        || !isMoney(item.unitPrice) || item.subtotal !== item.unitPrice * item.quantity) return null;
      ids.add(item.productId);
    }
    const subtotal = value.items.reduce((sum, item) => sum + item.subtotal, 0);
    if (subtotal !== value.productSubtotal || value.total !== value.booking.ticketSubtotal + subtotal) return null;
    return value;
  } catch { return null; }
}

export function sameBooking(receipt, booking) {
  return Boolean(receipt && booking && receipt.booking.holdId === booking.holdId
    && receipt.booking.showtimeId === booking.showtimeId && receipt.booking.expiresAt === booking.expiresAt);
}

// Ticket history belongs to this browser tab's simulation, not a server account.
// Include the legacy latest receipt so existing confirmations remain visible.
export function readTicketHistory(storage = globalThis.sessionStorage) {
  let warning = '';
  const records = [];
  for (const key of [TICKET_HISTORY_KEY, CONFIRMATION_KEY]) {
    try {
      const raw = storage.getItem(key);
      if (raw == null) continue;
      const value = JSON.parse(raw);
      const values = key === TICKET_HISTORY_KEY ? value : [value];
      if (!Array.isArray(values)) throw new Error('Invalid history');
      for (const record of values) {
        const valid = validConfirmation(record);
        if (valid) records.push(valid);
        else warning = 'Một số vé trong phiên không hợp lệ nên không được hiển thị.';
      }
    } catch {
      warning = 'Không đọc được đầy đủ lịch sử trong phiên trình duyệt.';
    }
  }
  const unique = new Map(records.map(record => [record.orderCode, record]));
  return { tickets: [...unique.values()].sort((a, b) => Date.parse(b.confirmedAt) - Date.parse(a.confirmedAt)), warning };
}

// Local UI demo only: this is not proof of a payment or a database booking.
export function saveSimulation(input, storage = globalThis.sessionStorage, now = Date.now()) {
  if (input.outcome !== 'success') throw new Error('Chỉ xác nhận khi mô phỏng thanh toán thành công.');
  const history = readTicketHistory(storage).tickets;
  const previous = history.find(receipt => sameBooking(receipt, input.booking));
  if (previous) {
    try { storage.setItem(CONFIRMATION_KEY, JSON.stringify(previous)); }
    catch { throw new Error('Không lưu được xác nhận. Hãy cho phép bộ nhớ trang web rồi thử lại.'); }
    return previous;
  }
  if (!canSimulatePayment({ ...input, now })) throw new Error('Phiên giữ ghế đã hết hạn hoặc dữ liệu chưa sẵn sàng.');
  const items = input.items.map((item) => ({ productId: item.id, name: item.name, quantity: item.quantity, unitPrice: item.price, subtotal: item.price * item.quantity }));
  const productSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const record = {
    version: 1, status: 'simulated-success', demoBooking: input.demoBooking,
    orderCode: `DEMO-${crypto.randomUUID().toUpperCase()}`,
    confirmedAt: new Date(now).toISOString(), method: input.method,
    booking: structuredClone(input.booking),
    contact: { name: input.contact.name.trim(), email: input.contact.email.trim(), phone: input.contact.phone?.trim() || '' },
    items, productSubtotal, total: input.booking.ticketSubtotal + productSubtotal,
  };
  record.ticketCode = `NOVA-${record.orderCode}`;
  if (!validConfirmation(record)) throw new Error('Thông tin xác nhận chưa hợp lệ. Vui lòng kiểm tra lại.');
  try {
    // Keep old receipts before replacing the latest. If storage is full, report
    // the failure without losing the prior confirmation.
    storage.setItem(TICKET_HISTORY_KEY, JSON.stringify([record, ...history]));
    storage.setItem(CONFIRMATION_KEY, JSON.stringify(record));
  }
  catch { throw new Error('Không lưu được xác nhận. Hãy cho phép bộ nhớ trang web rồi thử lại.'); }
  return record;
}
