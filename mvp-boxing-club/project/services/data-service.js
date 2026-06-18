// services/data-service.js — schedule, products, cart, orders, plans
(function () {
  const { KEYS, read, write, uid, delay } = window.BC_Storage;

  // ------- SCHEDULE -------
  function listSchedule() { return read(KEYS.schedule, []); }
  async function createScheduleItem(item) {
    await delay(300);
    const items = listSchedule();
    items.push({ ...item, id: uid('sch') });
    write(KEYS.schedule, items);
  }
  async function updateScheduleItem(id, patch) {
    await delay(300);
    const items = listSchedule().map(i => i.id === id ? { ...i, ...patch } : i);
    write(KEYS.schedule, items);
  }
  async function deleteScheduleItem(id) {
    await delay(250);
    write(KEYS.schedule, listSchedule().filter(i => i.id !== id));
  }

  // ------- PRODUCTS -------
  function listProducts() { return read(KEYS.products, []); }
  async function createProduct(p) {
    await delay(350);
    const items = listProducts();
    items.push({ ...p, id: uid('p'), active: p.active !== false });
    write(KEYS.products, items);
  }
  async function updateProduct(id, patch) {
    await delay(350);
    write(KEYS.products, listProducts().map(p => p.id === id ? { ...p, ...patch } : p));
  }
  async function deleteProduct(id) {
    await delay(300);
    write(KEYS.products, listProducts().filter(p => p.id !== id));
  }

  // ------- CART -------
  function getCart(userId) {
    const all = read(KEYS.cart, {});
    return all[userId] || [];
  }
  function setCart(userId, items) {
    const all = read(KEYS.cart, {});
    all[userId] = items;
    write(KEYS.cart, all);
  }

  // ------- ORDERS -------
  function listOrders(userId) {
    const all = read(KEYS.orders, []);
    if (!userId) return all;
    return all.filter(o => o.userId === userId);
  }
  async function createOrder(userId, items) {
    await delay(700);
    const all = read(KEYS.orders, []);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const order = {
      id: uid('ord'),
      userId,
      items,
      total,
      status: 'pago',
      createdAt: new Date().toISOString(),
    };
    all.unshift(order);
    write(KEYS.orders, all);
    setCart(userId, []);
    return order;
  }

  // ------- PLANS -------
  const PLAN_CATALOG = [
    {
      id: 'mensal',
      name: 'Plano Mensal',
      price: 209.99,
      period: '/mês',
      tagline: 'Liberdade total para começar',
      features: [
        'Acesso a todas as aulas',
        'Sem fidelidade',
        'Avaliação física inclusa',
        'Acompanhamento técnico',
        'Aulas em todos os horários',
      ],
      accent: 'green',
    },
    {
      id: 'semestral',
      name: 'Plano Semestral',
      price: 189.99,
      period: '/mês',
      originalPrice: 209.99,
      tagline: 'Economize no plano semestral',
      features: [
        'Acesso a todas as aulas',
        '6 meses de treino contínuo',
        'Avaliação física inclusa',
        'Acompanhamento técnico premium',
        'Camiseta Boxing Club de presente',
        'Prioridade nos eventos da academia',
      ],
      accent: 'red',
      highlight: true,
      badge: 'Mais escolhido',
    },
  ];

  function getPlan(userId) {
    const plans = read(KEYS.plans, {});
    return plans[userId] || null;
  }
  async function subscribePlan(userId, planId) {
    await delay(700);
    const cat = PLAN_CATALOG.find(p => p.id === planId);
    if (!cat) throw new Error('Plano inválido.');
    const start = new Date();
    const next  = new Date(start);
    next.setMonth(next.getMonth() + 1);
    const plan = {
      planId, name: cat.name, price: cat.price, period: cat.period, features: cat.features,
      startedAt: start.toISOString(), nextBilling: next.toISOString(), status: 'ativo',
    };
    const all = read(KEYS.plans, {});
    all[userId] = plan;
    write(KEYS.plans, all);
    return plan;
  }
  async function cancelPlan(userId) {
    await delay(400);
    const all = read(KEYS.plans, {});
    delete all[userId];
    write(KEYS.plans, all);
  }

  window.BC_DataService = {
    listSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem,
    listProducts, createProduct, updateProduct, deleteProduct,
    getCart, setCart,
    listOrders, createOrder,
    getPlan, subscribePlan, cancelPlan,
    PLAN_CATALOG,
  };
})();
