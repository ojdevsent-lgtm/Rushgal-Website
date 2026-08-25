const KEY = 'rushgal-cart-v1';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('rushgal-cart-updated', { detail: cart }));
}

export function addToCart(product, quantity = 1, variant = null) {
  const cart = getCart();
  const key = `${product.id}:${variant || ''}`;
  const existing = cart.find((item) => item.key === key);
  if (existing) existing.quantity += quantity;
  else cart.push({ key, id: product.id, name: product.name, price: Number(product.price) || 0, image: product.images?.[0] || product.image || '', variant, quantity });
  saveCart(cart);
}

export function updateCartItem(key, quantity) {
  const cart = getCart().map((item) => item.key === key ? { ...item, quantity: Math.max(0, quantity) } : item).filter((item) => item.quantity > 0);
  saveCart(cart);
}

export function clearCart() { saveCart([]); }

export function getCartSubtotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
