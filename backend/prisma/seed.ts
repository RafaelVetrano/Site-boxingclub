import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@boxingclub.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Boxing Club',
      email: 'admin@boxingclub.com',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('✅ Admin user created');

  // Plans
  await prisma.plan.upsert({
    where: { id: 'mensal' },
    update: {},
    create: {
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
      highlight: false,
    },
  });

  await prisma.plan.upsert({
    where: { id: 'semestral' },
    update: {
      price: 189.99,
      originalPrice: 209.99,
      tagline: 'Mesmo plano, preço menor pagando 6 meses',
      features: [
        'Acesso a todas as aulas',
        'Preço fixo garantido por 6 meses',
        'Avaliação física inclusa',
        'Acompanhamento técnico',
        'Aulas em todos os horários',
      ],
    },
    create: {
      id: 'semestral',
      name: 'Plano Semestral',
      price: 189.99,
      originalPrice: 209.99,
      period: '/mês',
      cycleMonths: 6,
      tagline: 'Mesmo plano, preço menor pagando 6 meses',
      features: [
        'Acesso a todas as aulas',
        'Preço fixo garantido por 6 meses',
        'Avaliação física inclusa',
        'Acompanhamento técnico',
        'Aulas em todos os horários',
      ],
      accent: 'red',
      highlight: true,
      badge: 'Mais escolhido',
    },
  });
  console.log('✅ Plans created');

  // Categories
  const categories = [
    { id: 'boxe',           label: 'Boxe',              color: '#c41e2a' },
    { id: 'sparring',       label: 'Sparring',          color: '#0d6b3a' },
    { id: 'escola_boxe',    label: 'Escola de Boxe',    color: '#b45309' },
    { id: 'escola_combate', label: 'Escola de Combate', color: '#0d6b3a' },
    { id: 'prep',           label: 'Preparação Física', color: '#3730a3' },
    { id: 'competicao',     label: 'Treino da Equipe',  color: '#0e1410' },
  ];

  for (const cat of categories) {
    await prisma.classCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // Schedule — delete and recreate to ensure clean state
  await prisma.classSchedule.deleteMany({});

  type ScheduleEntry = { day: number; time: string; categoryId: string; teacher: string; notes: string };
  const s: ScheduleEntry[] = [];
  const add = (day: number, time: string, category: string, teacher = 'Equipe BC', notes = '') =>
    s.push({ day, time, categoryId: category, teacher, notes });

  // Manhã
  add(1, '06:00', 'boxe');      add(3, '06:00', 'boxe');
  add(0, '07:00', 'boxe');      add(2, '07:00', 'boxe');      add(4, '07:00', 'sparring');
  add(1, '09:00', 'boxe');      add(3, '09:00', 'boxe');      add(5, '09:00', 'boxe', 'Equipe BC', '1h30 de aula');
  add(0, '11:00', 'boxe');      add(2, '11:00', 'boxe');      add(4, '11:00', 'sparring');
  add(1, '12:00', 'boxe');      add(3, '12:00', 'boxe');
  // Tarde / Noite
  add(0, '17:00', 'escola_boxe');     add(2, '17:00', 'escola_combate');
  add(0, '18:30', 'prep');      add(1, '18:30', 'boxe');      add(2, '18:30', 'prep');      add(3, '18:30', 'boxe');      add(4, '18:30', 'boxe');
  add(0, '19:30', 'boxe');      add(1, '19:30', 'boxe');      add(2, '19:30', 'boxe');      add(3, '19:30', 'boxe');      add(4, '19:30', 'sparring');
  add(0, '20:30', 'competicao', 'Treinador-chefe', 'Treino da Equipe');
  add(1, '20:30', 'competicao', 'Treinador-chefe');
  add(2, '20:30', 'competicao', 'Treinador-chefe');
  add(3, '20:30', 'boxe');
  add(4, '20:30', 'competicao', 'Treinador-chefe', 'Treino da Equipe');

  await prisma.classSchedule.createMany({ data: s });
  console.log(`✅ Schedule created (${s.length} entries)`);

  // Products — upsert by name
  const products = [
    { name: 'Luva de Boxe',         description: 'Luva 12oz, couro sintético, ideal para iniciantes e treinos diários.', price: 249.90, category: 'Equipamento', stock: 12, glyph: 'glove' },
    { name: 'Bandagem Elástica',    description: 'Par de bandagens de 4,5m, alto suporte para punhos.',                   price: 39.90,  category: 'Acessório',   stock: 40, glyph: 'bandage' },
    { name: 'Camiseta Boxing Club', description: 'Camiseta oficial em algodão peruano. Tamanhos P–GG.',                    price: 89.90,  category: 'Vestuário',   stock: 25, glyph: 'shirt' },
    { name: 'Caneleira de Treino',  description: 'Caneleira tipo competição, EVA reforçado.',                              price: 129.90, category: 'Equipamento', stock: 8,  glyph: 'shinguard' },
    { name: 'Corda de Pular',       description: 'Corda speed rope com rolamento, cabo emborrachado.',                     price: 59.90,  category: 'Acessório',   stock: 30, glyph: 'rope' },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: { ...p, images: [] } });
    }
  }
  console.log('✅ Products created');

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
