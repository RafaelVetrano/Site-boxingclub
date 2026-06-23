import { useState, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAdminOrders, useUpdateOrderStatus } from '@/api/admin';
import { useToast } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import {
  Button, Card, Skeleton, EmptyState, Modal, Badge, Avatar, brl,
} from '@/components/ui';
import {
  IconPackage, IconSearch, IconChevronRight, IconCheck, IconCreditCard, IconCalendar,
} from '@/icons';
import type { Order, OrderItem } from '@/api/hooks';

const STATUS_META: Record<string, { label: string; badge: 'green' | 'red' | 'amber' | 'neutral' | 'ink'; approved: boolean }> = {
  pago:      { label: 'Pago',       badge: 'green',   approved: true  },
  entregue:  { label: 'Entregue',   badge: 'green',   approved: true  },
  pendente:  { label: 'Pendente',   badge: 'amber',   approved: false },
  nao_pago:  { label: 'Não pago',   badge: 'red',     approved: false },
  cancelado: { label: 'Cancelado',  badge: 'red',     approved: false },
  recusado:  { label: 'Recusado',   badge: 'red',     approved: false },
  expirado:  { label: 'Expirado',   badge: 'neutral', approved: false },
  erro:      { label: 'Erro',       badge: 'red',     approved: false },
};

const PAYMENT_META: Record<string, { label: string }> = {
  pix:         { label: 'Pix'           },
  credit_card: { label: 'Cartão de crédito' },
  debit_card:  { label: 'Cartão de débito'  },
  boleto:      { label: 'Boleto'        },
};

type AdminOrderEntry = Order & {
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
};

function MiniStat({ label, value, color, dot }: { label: string; value: string | number; color: 'green' | 'red' | 'amber'; dot?: boolean }) {
  const colorMap = {
    green: { bg: 'bg-bc-green/10', text: 'text-bc-green', dot: 'bg-bc-green' },
    red:   { bg: 'bg-bc-red/10',   text: 'text-bc-red',   dot: 'bg-bc-red' },
    amber: { bg: 'bg-amber-100',   text: 'text-amber-700', dot: 'bg-amber-500' },
  }[color];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-1.5">
        {dot && <span className={`w-2 h-2 rounded-full ${colorMap.dot}`} />}
        {label}
      </div>
      <div className={`font-display text-2xl sm:text-3xl tracking-wider ${colorMap.text} leading-none`}>{value}</div>
    </Card>
  );
}

function DetailTile({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: 'green' | 'red' }) {
  const color = accent === 'green' ? 'text-bc-green' : accent === 'red' ? 'text-bc-red' : 'text-stone-500';
  return (
    <div className="bg-cream border border-stone-200 p-3">
      <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] ${color} font-semibold mb-1`}>{icon}{label}</div>
      <div className="text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onMarkDelivered,
  onUpdateStatus,
}: {
  order: AdminOrderEntry;
  onClose: () => void;
  onMarkDelivered: () => void;
  onUpdateStatus: (s: string) => void;
}) {
  const meta = STATUS_META[order.status] ?? { label: order.status, badge: 'neutral' as const };
  const pay = PAYMENT_META[order.paymentMethod] ?? { label: order.paymentMethod };
  const dateObj = new Date(order.date);
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;

  return (
    <Modal onClose={onClose} size="lg">
      <div className="flex items-start justify-between gap-4 mb-6 pr-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-semibold mb-1">Pedido</div>
          <h3 className="font-display text-3xl sm:text-4xl tracking-wider text-ink leading-none">#{order.number}</h3>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge color={meta.badge}>{meta.label}</Badge>
            {(order as any).statusReason && <span className="text-xs text-stone-500 italic">· {(order as any).statusReason}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl sm:text-4xl tracking-wider text-ink leading-none">{brl(order.total)}</div>
          <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">Total</div>
        </div>
      </div>

      {order.user && (
        <div className="bg-cream border border-stone-200 p-4 flex items-center gap-3 mb-5">
          <Avatar user={order.user} size={48} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Comprador</div>
            <div className="font-semibold text-ink truncate">{order.user.firstName} {order.user.lastName}</div>
            <div className="text-xs text-stone-500 truncate">{order.user.email}</div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2">Itens</div>
        <ul className="border border-stone-200 divide-y divide-stone-200">
          {order.items.map((it: OrderItem) => (
            <li key={it.id} className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-cream border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {it.image
                  ? <img src={it.image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-stone-400 text-xs">{it.glyph ?? '?'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink truncate">{it.name}</div>
                <div className="text-xs text-stone-500">{it.qty} × {brl(it.price)}</div>
              </div>
              <div className="font-display text-lg tracking-wider text-ink">{brl(it.price * it.qty)}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <DetailTile label="Forma de pagamento" value={pay.label} icon={<IconCreditCard size={14} />} />
        <DetailTile
          label="Data do pedido"
          value={`${dateObj.toLocaleDateString('pt-BR')} · ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
          icon={<IconCalendar size={14} />}
        />
        {deliveredAt && (
          <DetailTile
            label="Entregue em"
            value={`${deliveredAt.toLocaleDateString('pt-BR')} · ${deliveredAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            icon={<IconCheck size={14} />}
            accent="green"
          />
        )}
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">Histórico</div>
          <ol className="relative border-l-2 border-stone-200 pl-5 space-y-3">
            {order.statusHistory.map((h, i) => {
              const hm = STATUS_META[h.status] ?? { label: h.status, badge: 'neutral' as const };
              const dotColor = hm.badge === 'green' ? 'bg-bc-green' : hm.badge === 'red' ? 'bg-bc-red' : hm.badge === 'amber' ? 'bg-amber-500' : 'bg-stone-400';
              const hDate = new Date(h.at);
              return (
                <li key={i} className="relative">
                  <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white ${dotColor}`} />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Badge color={hm.badge}>{hm.label}</Badge>
                    <span className="text-xs text-stone-500">{hDate.toLocaleDateString('pt-BR')} · {hDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {h.note && <div className="text-xs text-stone-600 mt-1">{h.note}</div>}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-stone-200">
        {order.status === 'pago' && (
          <Button variant="green" onClick={onMarkDelivered} leftIcon={<IconCheck size={14} strokeWidth={3} />}>Marcar como entregue</Button>
        )}
        {order.status === 'pendente' && (
          <>
            <Button variant="green" size="sm" onClick={() => onUpdateStatus('pago')}>Confirmar pagamento</Button>
            <Button variant="danger" size="sm" onClick={() => onUpdateStatus('cancelado')}>Cancelar pedido</Button>
          </>
        )}
        {['recusado', 'expirado', 'erro', 'nao_pago'].includes(order.status) && (
          <Button variant="green" size="sm" onClick={() => onUpdateStatus('pago')}>Marcar como pago manualmente</Button>
        )}
        <Button variant="ghost" onClick={onClose} className="ml-auto">Fechar</Button>
      </div>
    </Modal>
  );
}

export function AdminOrders() {
  const toast = useToast();
  const confirmStore = useConfirmStore();

  const [tab, setTab] = useState<'approved' | 'problems'>('problems');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminOrderEntry | null>(null);

  const filters = {
    status: filterStatus !== 'all' ? filterStatus : undefined,
    paymentMethod: filterPayment !== 'all' ? filterPayment : undefined,
    from: period === 'custom' ? customRange.from : period === 'today' ? new Date().toISOString().slice(0, 10) : period === 'week' ? (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })() : period === 'month' ? (() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); })() : undefined,
    to: period === 'custom' ? customRange.to : undefined,
    search: search || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading } = useAdminOrders(filters);
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.data ?? [];

  const tabCounts = useMemo(() => {
    return {
      approved: orders.filter((o) => STATUS_META[o.status]?.approved).length,
      problems: orders.filter((o) => !STATUS_META[o.status]?.approved).length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const isApproved = STATUS_META[o.status]?.approved;
      return tab === 'approved' ? isApproved : !isApproved;
    });
  }, [orders, tab]);

  const stats = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(dayStart); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const paid = orders.filter((o) => ['pago', 'entregue'].includes(o.status));
    return {
      today: orders.filter((o) => new Date(o.date) >= dayStart).length,
      week: orders.filter((o) => new Date(o.date) >= weekStart).length,
      month: orders.filter((o) => new Date(o.date) >= monthStart).length,
      revenue: paid.reduce((s, o) => s + o.total, 0),
      delivered: orders.filter((o) => o.status === 'entregue').length,
      pago: orders.filter((o) => o.status === 'pago').length,
      pendente: orders.filter((o) => o.status === 'pendente').length,
      cancelado: orders.filter((o) => o.status === 'cancelado').length,
    };
  }, [orders]);

  const markDelivered = async (order: AdminOrderEntry) => {
    const ok = await confirmStore.open({
      title: 'Marcar como entregue?',
      message: `Deseja marcar o pedido #${order.number} como entregue?`,
      confirmLabel: 'Sim, entregue',
    });
    if (!ok) return;
    try {
      await updateStatus.mutateAsync({ id: order.id, status: 'entregue' });
      toast.success('Pedido entregue!', `#${order.number} foi marcado como entregue.`);
      if (selected?.id === order.id) setSelected(null);
    } catch (e: any) {
      toast.error('Erro', e.message);
    }
  };

  const doUpdateStatus = async (order: AdminOrderEntry, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status });
      toast.success('Status atualizado', `#${order.number} → ${STATUS_META[status]?.label ?? status}`);
      setSelected(null);
    } catch (e: any) {
      toast.error('Erro', e.message);
    }
  };

  return (
    <AdminLayout active="pedidos" title="Pedidos">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <MiniStat label="Hoje" value={stats.today} color="green" />
        <MiniStat label="Semana" value={stats.week} color="green" />
        <MiniStat label="Mês" value={stats.month} color="green" />
        <MiniStat label="Receita" value={brl(stats.revenue)} color="red" />
        <MiniStat label="Entregues" value={stats.delivered} color="green" dot />
        <MiniStat label="Pagos" value={stats.pago} color="amber" dot />
        <MiniStat label="Pendentes" value={stats.pendente} color="amber" dot />
        <MiniStat label="Cancelados" value={stats.cancelado} color="red" dot />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-stone-200">
        {([
          { id: 'approved' as const, label: 'Pedidos aprovados', dot: 'bg-bc-green', active: 'border-bc-green' },
          { id: 'problems' as const, label: 'Pendentes / problemas', dot: 'bg-bc-red', active: 'border-bc-red' },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setFilterStatus('all'); setPage(1); }}
            className={`px-5 py-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 ${tab === t.id ? `${t.active} text-ink` : 'border-transparent text-stone-500 hover:text-ink'}`}
          >
            <span className={`w-2 h-2 rounded-full ${t.dot}`} />
            {t.label}
            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">
              {tabCounts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mês' },
            { id: 'all', label: 'Tudo' },
            { id: 'custom', label: 'Período…' },
          ] as const).map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold border ${period === p.id ? 'bg-ink text-white border-ink' : 'bg-white text-stone-700 border-stone-300 hover:border-ink'}`}
            >
              {p.label}
            </button>
          ))}
          {period === 'custom' && (
            <>
              <input type="date" value={customRange.from} onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })} className="text-xs border border-stone-300 px-2 py-2 focus:outline-none focus:border-ink" />
              <span className="text-stone-400 text-xs">até</span>
              <input type="date" value={customRange.to} onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })} className="text-xs border border-stone-300 px-2 py-2 focus:outline-none focus:border-ink" />
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por #número, nome ou email…"
              className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="border border-stone-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink min-w-[170px]"
          >
            <option value="all">Todos os status</option>
            {Object.entries(STATUS_META).filter(([, m]) => tab === 'approved' ? m.approved : !m.approved).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}
            className="border border-stone-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink min-w-[170px]"
          >
            <option value="all">Todos os pagamentos</option>
            {Object.entries(PAYMENT_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title={tab === 'approved' ? 'Nenhum pedido aprovado' : 'Nenhum problema'}
            message={tab === 'approved' ? 'Quando houver pedidos pagos ou entregues, aparecerão aqui.' : 'Tudo certo por aqui.'}
            icon={<IconPackage size={28} />}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] ?? { label: o.status, badge: 'neutral' as const };
            const pay = PAYMENT_META[o.paymentMethod] ?? { label: o.paymentMethod };
            const dateObj = new Date(o.date);
            const canDeliver = o.status === 'pago';
            const userName = o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Usuário';

            return (
              <div key={o.id} onClick={() => setSelected(o)} className="cursor-pointer">
              <Card className="hover:border-ink/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar user={o.user} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-xs text-stone-500">#{o.number}</span>
                        <Badge color={meta.badge}>{meta.label}</Badge>
                      </div>
                      <div className="font-semibold text-ink truncate">{userName}</div>
                      <div className="text-xs text-stone-500">
                        {o.items.length} {o.items.length === 1 ? 'item' : 'itens'}
                        <span className="mx-2">·</span>
                        {pay.label}
                        <span className="mx-2">·</span>
                        {dateObj.toLocaleDateString('pt-BR')} {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 sm:flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="font-display text-2xl tracking-wider text-ink leading-none">{brl(o.total)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">Total</div>
                    </div>
                    {canDeliver && (
                      <Button
                        variant="green"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); markDelivered(o); }}
                        leftIcon={<IconCheck size={12} strokeWidth={3} />}
                      >
                        Entregar
                      </Button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                      className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-ink hover:bg-stone-100"
                      aria-label="Ver detalhes"
                    >
                      <IconChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-stone-500">{data.total} pedidos · página {data.page} de {data.pages}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="ghost" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onMarkDelivered={() => markDelivered(selected)}
          onUpdateStatus={(s) => doUpdateStatus(selected, s)}
        />
      )}
    </AdminLayout>
  );
}
