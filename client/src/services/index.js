import api, { unwrap, listOf, pageOf } from './api';

const get = async (url, params) => unwrap(await api.get(url, { params }));
const send = async (m, url, body) => unwrap(await api[m](url, body));

export const authApi = {
  login: (b) => send('post', '/auth/login', b),
  register: (b) => send('post', '/auth/register', b),
  me: () => get('/auth/me'),
};
export const accountApi = {
  profile: (b) => send('patch', '/account/profile', b),
  password: (b) => send('patch', '/account/password', b),
};
export const categoryApi = {
  list: async (p) => listOf(await get('/categories', p), 'categories'),
  create: (b) => send('post', '/categories', b),
  update: (id, b) => send('patch', `/categories/${id}`, b),
  remove: (id) => send('delete', `/categories/${id}`),
};
export const foodApi = {
  list: async (p) => {
    const res = await api.get('/foods', { params: p });
    return { items: listOf(unwrap(res), 'foods', 'items'), page: pageOf(res) };
  },
  get: (id) => get(`/foods/${id}`),
  create: (b) => send('post', '/foods', b),
  update: (id, b) => send('patch', `/foods/${id}`, b),
  remove: (id) => send('delete', `/foods/${id}`),
  /** PUT replaces the whole ingredient list: body is { ingredients: [{ingredientId, quantity}] } (min 1). */
  setIngredients: (id, ingredients) => send('put', `/foods/${id}/ingredients`, { ingredients }),
};
export const ingredientApi = {
  list: async (p) => listOf(await get('/ingredients', p), 'ingredients'),
  create: (b) => send('post', '/ingredients', b),
  update: (id, b) => send('patch', `/ingredients/${id}`, b),
  remove: (id) => send('delete', `/ingredients/${id}`),
};
export const recipeApi = {
  save: (foodId, b) => send('put', `/recipes/${foodId}`, b), // upsert; recipes are read via the food detail
};
export const inventoryApi = {
  list: async (p) => listOf(await get('/inventory', p), 'ingredients', 'inventory', 'items'),
  movements: async (id) => listOf(await get(`/inventory/${id}/movements`), 'movements'),
  move: (id, b) => send('post', `/inventory/${id}/movements`, b),
};
export const addressApi = {
  list: async () => listOf(await get('/addresses'), 'addresses'),
  create: (b) => send('post', '/addresses', b),
  update: (id, b) => send('patch', `/addresses/${id}`, b),
  remove: (id) => send('delete', `/addresses/${id}`),
};
export const cartApi = {
  get: () => get('/cart'),
  add: (b) => send('post', '/cart/items', b),
  update: (id, b) => send('patch', `/cart/items/${id}`, b),
  remove: (id) => send('delete', `/cart/items/${id}`),
  clear: () => send('delete', '/cart'),
};
export const orderApi = {
  create: (b) => send('post', '/orders', b),
  list: async () => listOf(await get('/orders'), 'orders', 'items'),
  get: (id) => get(`/orders/${id}`),
};
export const paymentApi = {
  createOrder: (b) => send('post', '/payments/create-order', b),
  verify: (b) => send('post', '/payments/verify', b),
  failed: (b) => send('post', '/payments/failed', b),
};
export const adminApi = {
  dashboard: () => get('/admin/dashboard'),
  orders: async (p) => {
    const res = await api.get('/admin/orders', { params: p });
    return { items: listOf(unwrap(res), 'orders', 'items'), page: pageOf(res) };
  },
  order: (id) => get(`/admin/orders/${id}`),
  setStatus: (id, status, note) => send('patch', `/admin/orders/${id}/status`, note ? { status, note } : { status }),
  partners: async () => listOf(await get('/admin/delivery-partners'), 'deliveryPartners', 'partners'),
  createPartner: (b) => send('post', '/admin/delivery-partners', b),
  assign: (orderId, partnerId) => send('patch', `/admin/orders/${orderId}/delivery`, { partnerId }),
  reviews: async (p) => listOf(await get('/admin/reviews', p), 'reviews'),
  moderate: (id, status) => send('patch', `/admin/reviews/${id}/status`, { status }),
  suggestions: async (p) => listOf(await get('/admin/suggestions', p), 'suggestions'),
  reviewSuggestion: (id, b) => send('patch', `/admin/suggestions/${id}/status`, b),
};
export const reviewApi = {
  forFood: (foodId) => get(`/reviews/food/${foodId}`), // { reviews, averageRating, totalReviews, pagination }
  mine: async () => listOf(await get('/reviews/my'), 'reviews'),
  create: (b) => send('post', '/reviews', b),
};
export const suggestionApi = {
  mine: async () => listOf(await get('/suggestions'), 'suggestions'),
  create: (b) => send('post', '/suggestions', b),
};
export const deliveryApi = {
  list: async () => listOf(await get('/delivery'), 'deliveries'), // all of this partner's deliveries (no separate history route)
  get: (id) => get(`/delivery/${id}`),
  setStatus: (id, status, note) => send('patch', `/delivery/${id}/status`, note ? { status, note } : { status }),
};
