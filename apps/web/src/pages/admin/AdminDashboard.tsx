import { AdminLayout } from './AdminLayout';
import { useAdminStats } from '@/api/admin';
import { Skeleton, Card, Badge, Avatar, EmptyState, brl } from '@/components/ui';
import { IconUsers, IconCreditCard, IconCalendar, IconShoppingBag, IconTrendingUp } from '@/icons';
import type { Order } from '@/api/hooks';

type AdminOrder = Order & { user?: { id: string; firstName: string; lastName: string; email: string } | null };

const STATUS_META: Record<string, { label: string; badge: 'green' | 'red' | 'amber' | 'neutral' | 'ink' }> = {
  pago:      { label: 'Pago',      badge: 'green'   },
  entregue:  { label: 'Entregue',  badge: 'green'   },
  pendente:  { label: 'Pendente',  badge: 'amber'   },
  nao_pago:  { label: 'Não pago',  badge: 'red'     },
  cancelado: { label: 'Cancelado', badge: 'red'     },
  recusado:  { label: 'Recusado',  badge: 'red'     },
  expirado:  { label: 'Expirado',  badge: 'neutral' },
  erro:      { label: 'Erro',      badge: 'red'     },
};

function StatCard({
  icon,
  color,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  color: 'green' | 'red' | 'ink' | 'amber';
  label: string;
  value: string | number;
  sub?: string;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-bc-green/10 text-bc-green',
    red:   'bg-bc-red/10 text-bc-red',
    ink:   'bg-ink/10 text-ink',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
        <IconTrendingUp size={14} className="text-stone-300" />
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">{label}</div>
      <div className="font-display text-3xl tracking-wider text-ink leading-tight mt-1">{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </Card>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <AdminLayout active="dashboard" title="Dashboard">
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<IconUsers size={20} />}
              color="green"
              label="Usuários"
              value={stats.totalUsers}
              sub={`${stats.activeSubscriptions} com plano ativo`}
            />
            <StatCard
              icon={<IconCreditCard size={20} />}
              color="red"
              label="Receita total"
              value={brl(stats.revenue)}
              sub="pedidos pagos + entregues"
            />
            <StatCard
              icon={<IconCalendar size={20} />}
              color="ink"
              label="Aulas na agenda"
              value={stats.activeSchedule}
              sub="horários cadastrados"
            />
            <StatCard
              icon={<IconShoppingBag size={20} />}
              color="amber"
              label="Produtos ativos"
              value={stats.activeProducts}
              sub="disponíveis na loja"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl tracking-wider text-ink">Pedidos recentes</h3>
                <IconShoppingBag size={16} className="text-stone-400" />
              </div>
              {stats.recentOrders.length === 0 ? (
                <EmptyState title="Sem pedidos ainda" message="Os pedidos da loja aparecem aqui." icon={<IconShoppingBag size={24} />} />
              ) : (
                <ul className="divide-y divide-stone-200">
                  {(stats.recentOrders as AdminOrder[]).map((o) => {
                    const m = STATUS_META[o.status] ?? { label: o.status, badge: 'neutral' as const };
                    const userName = o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Usuário';
                    return (
                      <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-ink truncate">{userName}</div>
                          <div className="text-xs text-stone-500">#{o.number} · {new Date(o.date).toLocaleString('pt-BR')}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-display text-lg tracking-wider text-ink">{brl(o.total)}</div>
                          <Badge color={m.badge}>{m.label}</Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl tracking-wider text-ink">Novos usuários</h3>
                <IconUsers size={16} className="text-stone-400" />
              </div>
              {stats.recentUsers.length === 0 ? (
                <EmptyState title="Sem usuários ainda" icon={<IconUsers size={24} />} />
              ) : (
                <ul className="divide-y divide-stone-200">
                  {stats.recentUsers.map((u) => (
                    <li key={u.id} className="py-3 flex items-center gap-3">
                      <Avatar user={u} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink truncate">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-stone-500 truncate">{u.email}</div>
                      </div>
                      {u.subscription
                        ? <Badge color="green">{u.subscription.plan.name.replace('Plano ', '')}</Badge>
                        : <Badge color="neutral">Sem plano</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
}
