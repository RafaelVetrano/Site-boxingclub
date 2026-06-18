// ============================================================
// Boxing Club — MVP Services (localStorage-backed)
// All data layers in one place. Swappable later for an API.
// ============================================================
(function () {
  // ---------------- storage primitives ----------------
  const NS = 'bc:v1:';
  const Storage = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(NS + key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(NS + key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(NS + key); },
  };

  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
  const now = () => new Date().toISOString();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Mock hash (NOT secure — MVP only)
  const mockHash = (s) => 'h$' + btoa(unescape(encodeURIComponent(s || '')));

  // ---------------- seed ----------------
  function ensureSeed() {
    if (Storage.get('seeded') === true) return;

    // Admin user (default credentials: admin@boxingclub.com / admin123)
    Storage.set('users', [
      {
        id: uid(),
        firstName: 'Admin',
        lastName: 'Boxing Club',
        email: 'admin@boxingclub.com',
        passwordHash: mockHash('admin123'),
        role: 'admin',
        avatar: null,
        createdAt: now(),
        plan: null,
      },
    ]);

    // Plans catalog
    Storage.set('plansCatalog', [
      {
        id: 'mensal',
        name: 'Plano Mensal',
        price: 209.99,
        period: '/mês',
        cycleMonths: 1,
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
        cycleMonths: 6,
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
    ]);

    // Schedule (matches the printed cronograma)
    const SDAYS = [0, 1, 2, 3, 4, 5]; // seg..sab
    const s = [];
    const add = (day, time, category, teacher = 'Equipe BC', notes = '') => s.push({ id: uid(), day, time, category, teacher, notes });

    // Manhã
    add(1, '06:00', 'boxe');     add(3, '06:00', 'boxe');
    add(0, '07:00', 'boxe');     add(2, '07:00', 'boxe');     add(4, '07:00', 'sparring');
    add(1, '09:00', 'boxe');     add(3, '09:00', 'boxe');     add(5, '09:00', 'boxe', 'Equipe BC', '1h30 de aula');
    add(0, '11:00', 'boxe');     add(2, '11:00', 'boxe');     add(4, '11:00', 'sparring');
    add(1, '12:00', 'boxe');     add(3, '12:00', 'boxe');
    // Tarde / Noite
    add(0, '17:00', 'escola_boxe');     add(2, '17:00', 'escola_combate');
    add(0, '18:30', 'prep');     add(1, '18:30', 'boxe');     add(2, '18:30', 'prep');     add(3, '18:30', 'boxe');     add(4, '18:30', 'boxe');
    add(0, '19:30', 'boxe');     add(1, '19:30', 'boxe');     add(2, '19:30', 'boxe');     add(3, '19:30', 'boxe');     add(4, '19:30', 'sparring');
    add(0, '20:30', 'competicao', 'Treinador-chefe', 'Treino da Equipe');
    add(1, '20:30', 'competicao', 'Treinador-chefe');
    add(2, '20:30', 'competicao', 'Treinador-chefe');
    add(3, '20:30', 'boxe');
    add(4, '20:30', 'competicao', 'Treinador-chefe', 'Treino da Equipe');

    Storage.set('schedule', s);

    // Class categories registry
    Storage.set('categories', [
      { id: 'boxe',           label: 'Boxe',              color: '#c41e2a' },
      { id: 'sparring',       label: 'Sparring',          color: '#0d6b3a' },
      { id: 'escola_boxe',    label: 'Escola de Boxe',    color: '#b45309' },
      { id: 'escola_combate', label: 'Escola de Combate', color: '#0d6b3a' },
      { id: 'prep',           label: 'Preparação Física', color: '#3730a3' },
      { id: 'competicao',     label: 'Treino da Equipe',  color: '#0e1410' },
    ]);

    // Products
    Storage.set('products', [
      { id: uid(), name: 'Luva de Boxe',         description: 'Luva 12oz, couro sintético, ideal para iniciantes e treinos diários.', price: 249.90, category: 'Equipamento', stock: 12, images: [], glyph: 'glove',     active: true, createdAt: now() },
      { id: uid(), name: 'Bandagem Elástica',    description: 'Par de bandagens de 4,5m, alto suporte para punhos.',                   price: 39.90,  category: 'Acessório',   stock: 40, images: [], glyph: 'bandage',   active: true, createdAt: now() },
      { id: uid(), name: 'Camiseta Boxing Club', description: 'Camiseta oficial em algodão peruano. Tamanhos P–GG.',                    price: 89.90,  category: 'Vestuário',   stock: 25, images: [], glyph: 'shirt',     active: true, createdAt: now() },
      { id: uid(), name: 'Caneleira de Treino',  description: 'Caneleira tipo competição, EVA reforçado.',                              price: 129.90, category: 'Equipamento', stock: 8,  images: [], glyph: 'shinguard', active: true, createdAt: now() },
      { id: uid(), name: 'Corda de Pular',       description: 'Corda speed rope com rolamento, cabo emborrachado.',                     price: 59.90,  category: 'Acessório',   stock: 30, images: [], glyph: 'rope',      active: true, createdAt: now() },
    ]);

    Storage.set('orders', []);
    Storage.set('orderCounter', 10001);
    Storage.set('seeded', true);
  }
  ensureSeed();

  // ---------------- one-time demo orders seed ----------------
  (function ensureDemoOrders() {
    if (Storage.get('demoOrdersSeeded')) return;
    const existing = Storage.get('orders', []);
    if (existing.length > 0) { Storage.set('demoOrdersSeeded', true); return; }

    // Make sure we have a few non-admin users for variety
    let users = Storage.get('users', []);
    const adminCount = users.filter((u) => u.role === 'admin').length;
    if (users.length - adminCount < 3) {
      const demoUsers = [
        { firstName: 'João',    lastName: 'Silva',   email: 'joao@demo.com' },
        { firstName: 'Marina',  lastName: 'Costa',   email: 'marina@demo.com' },
        { firstName: 'Pedro',   lastName: 'Almeida', email: 'pedro@demo.com' },
        { firstName: 'Bianca',  lastName: 'Lima',    email: 'bianca@demo.com' },
        { firstName: 'Ricardo', lastName: 'Souza',   email: 'ricardo@demo.com' },
      ];
      demoUsers.forEach((d) => {
        if (!users.some((u) => u.email === d.email)) {
          users.push({
            id: uid(), ...d,
            passwordHash: mockHash('demo123'),
            role: 'user', avatar: null, createdAt: now(), plan: null,
          });
        }
      });
      Storage.set('users', users);
    }

    const products = Storage.get('products', []);
    const nonAdmins = users.filter((u) => u.role !== 'admin');
    if (nonAdmins.length === 0 || products.length === 0) { Storage.set('demoOrdersSeeded', true); return; }

    const pickRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(8 + Math.floor(Math.random()*12), Math.floor(Math.random()*60)); return d.toISOString(); };

    const STATUSES = [
      { status: 'entregue',  reason: null,                                 weight: 4, paid: true },
      { status: 'pago',      reason: null,                                 weight: 3, paid: true },
      { status: 'pendente',  reason: 'Aguardando confirmação de pagamento', weight: 2, paid: false },
      { status: 'nao_pago',  reason: 'Pagamento não realizado',             weight: 1, paid: false },
      { status: 'cancelado', reason: 'Pedido cancelado pelo usuário',       weight: 1, paid: false },
      { status: 'recusado',  reason: 'Cartão recusado pela operadora',      weight: 1, paid: false },
      { status: 'expirado',  reason: 'Tempo limite do PIX expirado',        weight: 1, paid: false },
      { status: 'erro',      reason: 'Falha no processamento do pagamento', weight: 1, paid: false },
    ];
    const bag = [];
    STATUSES.forEach((s) => { for (let i = 0; i < s.weight; i++) bag.push(s); });
    const PAYMENT_METHODS = ['pix', 'credit_card', 'debit_card', 'boleto'];

    const orders = [];
    let counter = 10001;
    for (let i = 0; i < 14; i++) {
      const user = pickRand(nonAdmins);
      const st = pickRand(bag);
      const itemsCount = 1 + Math.floor(Math.random() * 3);
      const picked = [];
      for (let j = 0; j < itemsCount; j++) {
        const p = pickRand(products);
        if (picked.find((x) => x.productId === p.id)) continue;
        picked.push({ productId: p.id, name: p.name, price: p.price, qty: 1 + Math.floor(Math.random()*3), glyph: p.glyph, image: p.images?.[0] || null });
      }
      if (!picked.length) continue;
      const total = picked.reduce((s, it) => s + it.price * it.qty, 0);
      const date = daysAgo(Math.floor(Math.random() * 30));
      const history = [{ status: 'pendente', at: date, note: 'Pedido criado' }];
      if (st.paid) history.push({ status: 'pago', at: new Date(new Date(date).getTime() + 60000 * 5).toISOString(), note: 'Pagamento confirmado' });
      if (st.status === 'entregue') history.push({ status: 'entregue', at: new Date(new Date(date).getTime() + 86400000 * 2).toISOString(), note: 'Entrega confirmada' });
      if (!st.paid && st.status !== 'pendente') history.push({ status: st.status, at: new Date(new Date(date).getTime() + 60000 * 30).toISOString(), note: st.reason });

      orders.push({
        id: uid(),
        number: counter++,
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, avatar: user.avatar || null },
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        items: picked,
        total,
        paymentMethod: pickRand(PAYMENT_METHODS),
        status: st.status,
        statusReason: st.reason,
        statusHistory: history,
        date,
        deliveredAt: st.status === 'entregue' ? history[history.length - 1].at : null,
      });
    }
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    Storage.set('orders', orders);
    Storage.set('orderCounter', counter);
    Storage.set('demoOrdersSeeded', true);
  })();

  // ---------------- one-time product migration: image (singular) -> images[] ----------------
  (function migrateProducts() {
    const products = Storage.get('products', []);
    let changed = false;
    const next = products.map((p) => {
      if (Array.isArray(p.images)) return p;
      changed = true;
      const { image, ...rest } = p;
      return { ...rest, images: image ? [image] : [] };
    });
    if (changed) Storage.set('products', next);
  })();

  // ---------------- auth ----------------
  const AuthService = {
    current() {
      const id = Storage.get('session');
      if (!id) return null;
      const users = Storage.get('users', []);
      const u = users.find((x) => x.id === id);
      if (!u) return null;
      const { passwordHash, ...safe } = u;
      return safe;
    },
    async login(email, password) {
      await wait(450);
      const users = Storage.get('users', []);
      const u = users.find((x) => x.email.toLowerCase() === (email || '').toLowerCase());
      if (!u || u.passwordHash !== mockHash(password)) {
        const err = new Error('Email ou senha incorretos.');
        err.code = 'invalid_credentials'; throw err;
      }
      Storage.set('session', u.id);
      const { passwordHash, ...safe } = u; return safe;
    },
    async register({ firstName, lastName, email, password }) {
      await wait(550);
      const users = Storage.get('users', []);
      if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
        const err = new Error('Já existe uma conta com esse email.'); err.code = 'email_taken'; throw err;
      }
      const u = {
        id: uid(),
        firstName, lastName, email,
        passwordHash: mockHash(password),
        role: 'user', avatar: null, createdAt: now(), plan: null,
      };
      users.push(u);
      Storage.set('users', users);
      Storage.set('session', u.id);
      const { passwordHash, ...safe } = u; return safe;
    },
    async adminLogin(email, password) {
      const u = await this.login(email, password);
      if (u.role !== 'admin') {
        Storage.remove('session');
        const err = new Error('Esta conta não tem permissão de administrador.');
        err.code = 'not_admin'; throw err;
      }
      return u;
    },
    logout() { Storage.remove('session'); },
    updateUser(patch) {
      const id = Storage.get('session');
      if (!id) return null;
      const users = Storage.get('users', []);
      const idx = users.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...patch };
      Storage.set('users', users);
      const { passwordHash, ...safe } = users[idx]; return safe;
    },
    listUsers() {
      return Storage.get('users', []).map(({ passwordHash, ...u }) => u);
    },
    deleteUser(id) {
      const users = Storage.get('users', []).filter((u) => u.id !== id);
      Storage.set('users', users);
    },
  };

  // ---------------- plans ----------------
  const PlansService = {
    catalog() { return Storage.get('plansCatalog', []); },
    get(id) { return this.catalog().find((p) => p.id === id) || null; },
    async subscribe(userId, planId) {
      await wait(550);
      const p = this.get(planId); if (!p) throw new Error('Plano não encontrado.');
      const start = new Date();
      const next = new Date(start); next.setMonth(next.getMonth() + (p.cycleMonths || 1));
      const sub = {
        planId: p.id, planName: p.name, price: p.price, cycleMonths: p.cycleMonths,
        startDate: start.toISOString(), nextBilling: next.toISOString(),
        status: 'active', features: p.features,
      };
      const users = Storage.get('users', []);
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error('Usuário não encontrado.');
      users[idx].plan = sub; Storage.set('users', users);
      return sub;
    },
    async cancel(userId) {
      await wait(400);
      const users = Storage.get('users', []);
      const idx = users.findIndex((u) => u.id === userId);
      if (idx === -1 || !users[idx].plan) throw new Error('Sem plano ativo.');
      users[idx].plan = { ...users[idx].plan, status: 'cancelled' };
      Storage.set('users', users); return users[idx].plan;
    },
  };

  // ---------------- schedule ----------------
  const ScheduleService = {
    list() { return Storage.get('schedule', []); },
    categories() { return Storage.get('categories', []); },
    create(data) {
      const items = this.list();
      const item = { id: uid(), day: 0, time: '19:00', category: 'boxe', teacher: '', notes: '', ...data };
      items.push(item); Storage.set('schedule', items); return item;
    },
    update(id, patch) {
      const items = this.list();
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...patch };
      Storage.set('schedule', items); return items[idx];
    },
    remove(id) {
      const items = this.list().filter((i) => i.id !== id);
      Storage.set('schedule', items);
    },
  };

  // ---------------- store products ----------------
  const StoreService = {
    list() { return Storage.get('products', []); },
    listActive() { return this.list().filter((p) => p.active); },
    get(id) { return this.list().find((p) => p.id === id) || null; },
    create(data) {
      const items = this.list();
      const p = { id: uid(), name: '', description: '', price: 0, category: 'Equipamento', stock: 0, images: [], glyph: 'box', active: true, createdAt: now(), ...data };
      items.unshift(p); Storage.set('products', items); return p;
    },
    update(id, patch) {
      const items = this.list();
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...patch };
      Storage.set('products', items); return items[idx];
    },
    remove(id) {
      const items = this.list().filter((i) => i.id !== id);
      Storage.set('products', items);
    },
  };

  // ---------------- cart (per user) ----------------
  const CartService = {
    key(userId) { return 'cart:' + userId; },
    get(userId) { return userId ? Storage.get(this.key(userId), []) : []; },
    set(userId, items) { if (userId) Storage.set(this.key(userId), items); },
    add(userId, product, qty = 1) {
      const items = this.get(userId);
      const idx = items.findIndex((i) => i.productId === product.id);
      if (idx >= 0) items[idx].qty += qty;
      else items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
        glyph: product.glyph,
        image: product.images?.[0] || product.image || null,
      });
      this.set(userId, items); return items;
    },
    setQty(userId, productId, qty) {
      let items = this.get(userId);
      if (qty <= 0) items = items.filter((i) => i.productId !== productId);
      else items = items.map((i) => i.productId === productId ? { ...i, qty } : i);
      this.set(userId, items); return items;
    },
    remove(userId, productId) { return this.setQty(userId, productId, 0); },
    clear(userId) { this.set(userId, []); },
    total(userId) { return this.get(userId).reduce((sum, i) => sum + i.price * i.qty, 0); },
    count(userId) { return this.get(userId).reduce((s, i) => s + i.qty, 0); },
  };

  // ---------------- orders ----------------
  const ORDER_STATUS_META = {
    entregue:  { label: 'Entregue',   reason: null, badge: 'green',   approved: true,  paid: true },
    pago:      { label: 'Pago',       reason: null, badge: 'amber',   approved: true,  paid: true },
    pendente:  { label: 'Pendente',   reason: 'Aguardando confirmação de pagamento', badge: 'amber',   approved: false, paid: false },
    nao_pago:  { label: 'Não pago',   reason: 'Pagamento não realizado',             badge: 'neutral', approved: false, paid: false },
    cancelado: { label: 'Cancelado',  reason: 'Pedido cancelado pelo usuário',       badge: 'red',     approved: false, paid: false },
    recusado:  { label: 'Recusado',   reason: 'Cartão recusado pela operadora',      badge: 'red',     approved: false, paid: false },
    expirado:  { label: 'Expirado',   reason: 'Tempo limite do PIX expirado',        badge: 'red',     approved: false, paid: false },
    erro:      { label: 'Erro',       reason: 'Falha no processamento',              badge: 'red',     approved: false, paid: false },
  };
  const PAYMENT_METHODS_META = {
    pix:         { label: 'PIX' },
    credit_card: { label: 'Cartão de crédito' },
    debit_card:  { label: 'Cartão de débito' },
    boleto:      { label: 'Boleto' },
  };

  const OrderService = {
    statusMeta: ORDER_STATUS_META,
    paymentMeta: PAYMENT_METHODS_META,
    listAll() { return Storage.get('orders', []); },
    listFor(userId) { return this.listAll().filter((o) => o.userId === userId); },
    get(id) { return this.listAll().find((o) => o.id === id) || null; },
    nextNumber() {
      const n = Storage.get('orderCounter', 10001);
      Storage.set('orderCounter', n + 1);
      return n;
    },
    async checkout(user, paymentMethod = 'pix') {
      await wait(650);
      const items = CartService.get(user.id);
      if (!items.length) throw new Error('Seu carrinho está vazio.');
      const date = now();
      const order = {
        id: uid(),
        number: this.nextNumber(),
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, avatar: user.avatar || null },
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        items, total: items.reduce((s, i) => s + i.price * i.qty, 0),
        paymentMethod,
        status: 'pago',
        statusReason: null,
        statusHistory: [
          { status: 'pendente', at: date, note: 'Pedido criado' },
          { status: 'pago',     at: date, note: 'Pagamento confirmado' },
        ],
        date,
        deliveredAt: null,
      };
      const all = this.listAll(); all.unshift(order); Storage.set('orders', all);
      CartService.clear(user.id);
      return order;
    },
    async updateStatus(id, status, note = null) {
      await wait(300);
      const all = this.listAll();
      const idx = all.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('Pedido não encontrado.');
      const at = now();
      const meta = ORDER_STATUS_META[status];
      all[idx] = {
        ...all[idx],
        status,
        statusReason: meta?.reason ?? all[idx].statusReason,
        statusHistory: [...(all[idx].statusHistory || []), { status, at, note: note || meta?.label || status }],
        deliveredAt: status === 'entregue' ? at : all[idx].deliveredAt,
      };
      Storage.set('orders', all);
      return all[idx];
    },
    markDelivered(id) { return this.updateStatus(id, 'entregue', 'Entrega confirmada pelo admin'); },
  };

  // expose
  window.BCServices = { Storage, AuthService, PlansService, ScheduleService, StoreService, CartService, OrderService, ensureSeed, uid };
})();
