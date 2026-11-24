export const CART_KEY = 'nova.combo.cart.v1';
export const BOOKING_KEY = 'nova.booking.context.v1';
export const DRAFT_KEY = 'nova.checkout.draft.v1';
export const MAX_QUANTITY = 10;

export function readSession(key, fallback) {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function writeSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function cleanCart(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id, quantity]) => /^[1-9]\d*$/.test(id) && Number.isInteger(quantity) && quantity > 0)
    .map(([id, quantity]) => [id, Math.min(MAX_QUANTITY, quantity)]));
}

export function normalizeProducts(data) {
  if (!Array.isArray(data)) throw new Error('Danh sách sản phẩm không hợp lệ.');
  const ids = new Set();
  return data.map((product) => {
    const id = Number(product.id);
    const price = Number(product.price);
    if (!Number.isSafeInteger(id) || id <= 0 || ids.has(id)
      || typeof product.name !== 'string' || !product.name.trim()
      || !['popcorn', 'drink', 'combo'].includes(product.category)
      || product.price == null || !Number.isFinite(price) || price < 0) {
      throw new Error('Dữ liệu sản phẩm chưa hợp lệ. Vui lòng thử lại.');
    }
    ids.add(id);
    return { ...product, id, price };
  });
}

export function cartLines(products, cart) {
  const quantities = cleanCart(cart);
  return products.filter((p) => quantities[p.id]).map((p) => ({ ...p, quantity: quantities[p.id], subtotal: p.price * quantities[p.id] }));
}

export function bookingContext(value) {
  if (!value || !value.holdId || !value.showtimeId || !Array.isArray(value.seats) || !value.seats.length
    || !value.seats.every((s) => typeof s === 'string' && s.trim().length > 0 && s.length <= 20)
    || typeof value.ticketSubtotal !== 'number' || !Number.isFinite(value.ticketSubtotal) || value.ticketSubtotal < 0
    || typeof value.expiresAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(value.expiresAt)
    || !Number.isFinite(Date.parse(value.expiresAt))) return null;
  return value;
}
