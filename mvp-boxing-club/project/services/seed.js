// services/seed.js — seed default data on first load
(function () {
  const { KEYS, read, write } = window.BC_Storage;

  // ---------- SCHEDULE ----------
  if (!read(KEYS.schedule, null)) {
    const items = [];
    const push = (day, time, category, teacher, note = '') => items.push({
      id: 'sch_' + day + '_' + time.replace(':', ''),
      day, time, category, teacher, note,
    });

    push(0, '07:00', 'Boxe', 'Prof. Caio');
    push(0, '11:00', 'Boxe', 'Prof. Caio');
    push(0, '17:00', 'Escola de Boxe', 'Prof. Bruna', 'Kids');
    push(0, '18:30', 'Preparação Física', 'Prof. Caio');
    push(0, '19:30', 'Boxe', 'Prof. Bruna');
    push(0, '20:30', 'Treino da Equipe de Competição', 'Prof. Caio');

    push(1, '06:00', 'Boxe', 'Prof. Caio');
    push(1, '09:00', 'Boxe', 'Prof. Bruna');
    push(1, '12:00', 'Boxe', 'Prof. Caio');
    push(1, '18:30', 'Boxe', 'Prof. Caio');
    push(1, '19:30', 'Boxe', 'Prof. Bruna');
    push(1, '20:30', 'Treino da Equipe de Competição', 'Prof. Caio');

    push(2, '07:00', 'Boxe', 'Prof. Caio');
    push(2, '11:00', 'Boxe', 'Prof. Caio');
    push(2, '17:00', 'Escola de Combate', 'Prof. Bruna', 'Kids');
    push(2, '18:30', 'Preparação Física', 'Prof. Caio');
    push(2, '19:30', 'Boxe', 'Prof. Bruna');
    push(2, '20:30', 'Treino da Equipe de Competição', 'Prof. Caio');

    push(3, '06:00', 'Boxe', 'Prof. Caio');
    push(3, '09:00', 'Boxe', 'Prof. Bruna');
    push(3, '12:00', 'Boxe', 'Prof. Caio');
    push(3, '18:30', 'Boxe', 'Prof. Caio');
    push(3, '19:30', 'Boxe', 'Prof. Bruna');
    push(3, '20:30', 'Boxe', 'Prof. Bruna');

    push(4, '07:00', 'Sparring', 'Prof. Caio');
    push(4, '11:00', 'Sparring', 'Prof. Caio');
    push(4, '18:30', 'Boxe', 'Prof. Bruna');
    push(4, '19:30', 'Sparring', 'Prof. Caio');
    push(4, '20:30', 'Treino da Equipe', 'Prof. Caio');

    push(5, '09:00', 'Boxe', 'Prof. Caio', '1h30 de aula');

    write(KEYS.schedule, items);
  }

  // ---------- PRODUCTS ----------
  if (!read(KEYS.products, null)) {
    const products = [
      { id: 'p_glove',     name: 'Luva de Boxe',         description: 'Luva premium 12oz, ideal para treino e bag work.', price: 249.90, category: 'Equipamento', stock: 12, glyph: 'glove',     accent: 'red',     active: true, tag: 'Best seller' },
      { id: 'p_bandage',   name: 'Bandagem Elástica',    description: 'Par de bandagens de 3m. Proteção essencial.',       price:  39.90, category: 'Acessório',   stock: 40, glyph: 'bandage',   accent: 'neutral', active: true, tag: 'Essencial'   },
      { id: 'p_shirt',     name: 'Camiseta Boxing Club', description: 'Algodão premium, estampa serigrafada do clube.',    price:  89.90, category: 'Vestuário',   stock: 25, glyph: 'shirt',     accent: 'green',   active: true, tag: 'Novidade'    },
      { id: 'p_shinguard', name: 'Caneleira de Treino',  description: 'Espuma EVA de alta densidade. Par.',                price: 129.90, category: 'Equipamento', stock:  8, glyph: 'shinguard', accent: 'red',     active: true, tag: 'Resistente'  },
      { id: 'p_rope',      name: 'Corda de Pular',       description: 'Corda profissional ajustável, rolamento esférico.', price:  59.90, category: 'Cardio',      stock: 30, glyph: 'rope',      accent: 'green',   active: true, tag: 'Cardio'      },
    ];
    write(KEYS.products, products);
  }

  // ---------- USERS ----------
  if (!read(KEYS.users, null)) write(KEYS.users, []);
  if (!read(KEYS.orders, null)) write(KEYS.orders, []);
  if (!read(KEYS.plans, null))  write(KEYS.plans, {});
})();
