// ============================================================
// Admin Orders — gerenciamento completo de pedidos
// Tabs: Aprovados | Problemas
// Cards de resumo, filtros, busca, modal de detalhe
// ============================================================
const PAY_METHOD_ICONS = { pix: '◆', credit_card: '💳', debit_card: '💳', boleto: '📄' };

function AdminOrdersPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [orders, setOrders] = React.useState(null);
  const [tab, setTab] = React.useState('approved'); // approved | problems
  const [period, setPeriod] = React.useState('all'); // today | week | month | all | custom
  const [customRange, setCustomRange] = React.useState({ from: '', to: '' });
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterPayment, setFilterPayment] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const reload = () => setOrders(window.BCServices.OrderService.listAll());
  React.useEffect(() => { setTimeout(reload, 250); }, []);

  const statusMeta = window.BCServices.OrderService.statusMeta;
  const paymentMeta = window.BCServices.OrderService.paymentMeta;

  // Stats
  const stats = React.useMemo(() => {
    if (!orders) return null;
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0,0,0,0);
    const weekStart = new Date(dayStart); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayOrders = orders.filter((o) => new Date(o.date) >= dayStart);
    const weekOrders  = orders.filter((o) => new Date(o.date) >= weekStart);
    const monthOrders = orders.filter((o) => new Date(o.date) >= monthStart);
    const paidOrders = orders.filter((o) => statusMeta[o.status]?.paid);
    return {
      today: todayOrders.length,
      week: weekOrders.length,
      month: monthOrders.length,
      revenue: paidOrders.reduce((s, o) => s + o.total, 0),
      delivered: orders.filter((o) => o.status === 'entregue').length,
      paid: orders.filter((o) => o.status === 'pago').length,
      pending: orders.filter((o) => o.status === 'pendente').length,
      cancelled: orders.filter((o) => o.status === 'cancelado').length,
    };
  }, [orders]);

  // Filtered list
  const filtered = React.useMemo(() => {
    if (!orders) return [];
    const now = new Date();
    return orders.filter((o) => {
      // Tab filter
      const isApproved = statusMeta[o.status]?.approved;
      if (tab === 'approved' && !isApproved) return false;
      if (tab === 'problems' && isApproved) return false;
      // Period
      const d = new Date(o.date);
      if (period === 'today') {
        const s = new Date(now); s.setHours(0,0,0,0);
        if (d < s) return false;
      } else if (period === 'week') {
        const s = new Date(now); s.setHours(0,0,0,0); s.setDate(s.getDate() - s.getDay());
        if (d < s) return false;
      } else if (period === 'month') {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        if (d < s) return false;
      } else if (period === 'custom') {
        if (customRange.from && d < new Date(customRange.from + 'T00:00:00')) return false;
        if (customRange.to   && d > new Date(customRange.to   + 'T23:59:59')) return false;
      }
      // Status
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      // Payment
      if (filterPayment !== 'all' && o.paymentMethod !== filterPayment) return false;
      // Search
      if (search) {
        const hay = `${o.number} ${o.userName} ${o.user?.email || ''}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [orders, tab, period, customRange, filterStatus, filterPayment, search]);

  const markDelivered = async (order) => {
    const ok = await confirm({ title: 'Marcar como entregue?', message: `Deseja marcar o pedido #${order.number} como entregue?`, confirmLabel: 'Sim, entregue' });
    if (!ok) return;
    try {
      const updated = await window.BCServices.OrderService.markDelivered(order.id);
      toast.success('Pedido entregue!', `#${updated.number} foi marcado como entregue.`);
      reload();
      if (selected?.id === order.id) setSelected(updated);
    } catch (e) { toast.error('Erro', e.message); }
  };

  const updateStatus = async (order, status) => {
    try {
      const updated = await window.BCServices.OrderService.updateStatus(order.id, status);
      toast.success('Status atualizado', `#${updated.number} → ${statusMeta[status].label}`);
      reload();
      if (selected?.id === order.id) setSelected(updated);
    } catch (e) { toast.error('Erro', e.message); }
  };

  const tabCounts = React.useMemo(() => {
    if (!orders) return { approved: 0, problems: 0 };
    return {
      approved: orders.filter((o) => statusMeta[o.status]?.approved).length,
      problems: orders.filter((o) => !statusMeta[o.status]?.approved).length,
    };
  }, [orders]);

  return (
    <AdminLayout active="pedidos" title="Pedidos">
      {/* Summary cards */}
      {stats === null ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <MiniStat label="Hoje" value={stats.today} color="green"/>
          <MiniStat label="Semana" value={stats.week} color="green"/>
          <MiniStat label="Mês" value={stats.month} color="green"/>
          <MiniStat label="Receita" value={BRL(stats.revenue)} color="red" wide/>
          <MiniStat label="Entregues" value={stats.delivered} color="green" dot/>
          <MiniStat label="Pagos" value={stats.paid} color="amber" dot/>
          <MiniStat label="Pendentes" value={stats.pending} color="amber" dot/>
          <MiniStat label="Cancelados" value={stats.cancelled} color="red" dot/>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-stone-200">
        <button onClick={() => setTab('approved')} className={`px-5 py-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-colors ${tab === 'approved' ? 'border-bc-green text-ink' : 'border-transparent text-stone-500 hover:text-ink'}`}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bc-green"/>
            Pedidos aprovados
            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">{tabCounts.approved}</span>
          </span>
        </button>
        <button onClick={() => setTab('problems')} className={`px-5 py-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-colors ${tab === 'problems' ? 'border-bc-red text-ink' : 'border-transparent text-stone-500 hover:text-ink'}`}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bc-red"/>
            Pendentes / problemas
            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">{tabCounts.problems}</span>
          </span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'week',  label: 'Semana' },
            { id: 'month', label: 'Mês' },
            { id: 'all',   label: 'Tudo' },
            { id: 'custom',label: 'Período…' },
          ].map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold border ${period === p.id ? 'bg-ink text-white border-ink' : 'bg-white text-stone-700 border-stone-300 hover:border-ink'}`}>{p.label}</button>
          ))}
          {period === 'custom' && (
            <>
              <input type="date" value={customRange.from} onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })} className="text-xs border border-stone-300 px-2 py-2 focus:outline-none focus:border-ink"/>
              <span className="text-stone-400 text-xs">até</span>
              <input type="date" value={customRange.to}   onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}   className="text-xs border border-stone-300 px-2 py-2 focus:outline-none focus:border-ink"/>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por #número, nome ou email…" className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"/>
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="min-w-[170px]">
            <option value="all">Todos os status</option>
            {Object.entries(statusMeta).filter(([, m]) => tab === 'approved' ? m.approved : !m.approved).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </Select>
          <Select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="min-w-[170px]">
            <option value="all">Todos os pagamentos</option>
            {Object.entries(paymentMeta).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </Select>
        </div>
      </div>

      {/* List */}
      {orders === null ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24"/>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title={tab === 'approved' ? 'Nenhum pedido aprovado' : 'Nenhum problema'}
            message={tab === 'approved' ? 'Quando houver pedidos pagos ou entregues, aparecerão aqui.' : 'Tudo certo por aqui — sem pedidos pendentes ou com problemas.'}
            icon={<IconPackage size={28}/>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => <OrderRow key={o.id} order={o} onOpen={() => setSelected(o)} onMarkDelivered={() => markDelivered(o)}/>)}
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onMarkDelivered={() => markDelivered(selected)}
          onUpdateStatus={(s) => updateStatus(selected, s)}
        />
      )}
    </AdminLayout>
  );
}

function MiniStat({ label, value, color, dot, wide }) {
  const colorMap = {
    green: { bg: 'bg-bc-green/10', text: 'text-bc-green', dot: 'bg-bc-green' },
    red:   { bg: 'bg-bc-red/10',   text: 'text-bc-red',   dot: 'bg-bc-red' },
    amber: { bg: 'bg-amber-100',   text: 'text-amber-700',dot: 'bg-amber-500' },
  }[color];
  return (
    <Card className={`p-4 ${wide ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-1.5">
        {dot && <span className={`w-2 h-2 rounded-full ${colorMap.dot}`}/>}
        {label}
      </div>
      <div className={`font-display text-2xl sm:text-3xl tracking-wider ${colorMap.text} leading-none`}>{value}</div>
    </Card>
  );
}

function OrderRow({ order, onOpen, onMarkDelivered }) {
  const meta = window.BCServices.OrderService.statusMeta[order.status];
  const pay = window.BCServices.OrderService.paymentMeta[order.paymentMethod];
  const dateObj = new Date(order.date);
  const canDeliver = order.status === 'pago';

  return (
    <Card className="hover:border-ink/40 transition-colors cursor-pointer" onClick={onOpen}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar user={order.user} size={42}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-mono text-xs text-stone-500">#{order.number}</span>
              <Badge color={meta.badge}>{meta.label}</Badge>
              {order.statusReason && <span className="text-[10px] text-stone-500 italic">· {order.statusReason}</span>}
            </div>
            <div className="font-semibold text-ink truncate">{order.userName}</div>
            <div className="text-xs text-stone-500">
              {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
              <span className="mx-2">·</span>
              {pay?.label}
              <span className="mx-2">·</span>
              {dateObj.toLocaleDateString('pt-BR')} {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 sm:flex-shrink-0">
          <div className="text-left sm:text-right">
            <div className="font-display text-2xl tracking-wider text-ink leading-none">{BRL(order.total)}</div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">Total</div>
          </div>
          {canDeliver && (
            <Button variant="green" size="sm" onClick={(e) => { e.stopPropagation(); onMarkDelivered(); }} leftIcon={<IconCheck size={12} strokeWidth={3}/>}>
              Entregar
            </Button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-ink hover:bg-stone-100" aria-label="Ver detalhes">
            <IconChevronRight size={18}/>
          </button>
        </div>
      </div>
    </Card>
  );
}

function OrderDetailModal({ order, onClose, onMarkDelivered, onUpdateStatus }) {
  const meta = window.BCServices.OrderService.statusMeta[order.status];
  const pay = window.BCServices.OrderService.paymentMeta[order.paymentMethod];
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
            {order.statusReason && <span className="text-xs text-stone-500 italic">· {order.statusReason}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl sm:text-4xl tracking-wider text-ink leading-none">{BRL(order.total)}</div>
          <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">Total</div>
        </div>
      </div>

      {/* Buyer info */}
      <div className="bg-cream border border-stone-200 p-4 flex items-center gap-3 mb-5">
        <Avatar user={order.user} size={48}/>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Comprador</div>
          <div className="font-semibold text-ink truncate">{order.userName}</div>
          <div className="text-xs text-stone-500 truncate">{order.user?.email || '—'}</div>
        </div>
      </div>

      {/* Items */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2">Itens</div>
        <ul className="border border-stone-200 divide-y divide-stone-200">
          {order.items.map((it) => (
            <li key={it.productId} className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-cream border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover"/> : <ProductGlyph glyph={it.glyph || 'box'} color="#0d6b3a" className="w-8 h-8"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink truncate">{it.name}</div>
                <div className="text-xs text-stone-500">{it.qty} × {BRL(it.price)}</div>
              </div>
              <div className="font-display text-lg tracking-wider text-ink">{BRL(it.price * it.qty)}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Meta grid */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <DetailTile label="Forma de pagamento" value={pay?.label || order.paymentMethod} icon={<IconCreditCard size={14}/>}/>
        <DetailTile label="Data do pedido" value={`${dateObj.toLocaleDateString('pt-BR')} · ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`} icon={<IconCalendar size={14}/>}/>
        {deliveredAt && (
          <DetailTile label="Entregue em" value={`${deliveredAt.toLocaleDateString('pt-BR')} · ${deliveredAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`} icon={<IconCheck size={14}/>} accent="green"/>
        )}
        {order.statusReason && (
          <DetailTile label="Motivo do status" value={order.statusReason} icon={<IconAlertTriangle size={14}/>} accent="red"/>
        )}
      </div>

      {/* History */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">Histórico</div>
        <ol className="relative border-l-2 border-stone-200 pl-5 space-y-3">
          {(order.statusHistory || []).map((h, i) => {
            const hm = window.BCServices.OrderService.statusMeta[h.status];
            const hDate = new Date(h.at);
            return (
              <li key={i} className="relative">
                <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white ${hm?.badge === 'green' ? 'bg-bc-green' : hm?.badge === 'red' ? 'bg-bc-red' : hm?.badge === 'amber' ? 'bg-amber-500' : 'bg-stone-400'}`}/>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Badge color={hm?.badge || 'neutral'}>{hm?.label || h.status}</Badge>
                  <span className="text-xs text-stone-500">{hDate.toLocaleDateString('pt-BR')} · {hDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {h.note && <div className="text-xs text-stone-600 mt-1">{h.note}</div>}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-stone-200">
        {order.status === 'pago' && (
          <Button variant="green" onClick={onMarkDelivered} leftIcon={<IconCheck size={14} strokeWidth={3}/>}>Marcar como entregue</Button>
        )}
        {order.status === 'pendente' && (
          <>
            <Button variant="green" size="sm" onClick={() => onUpdateStatus('pago')}>Confirmar pagamento</Button>
            <Button variant="danger" size="sm" onClick={() => onUpdateStatus('cancelado')}>Cancelar pedido</Button>
          </>
        )}
        {(order.status === 'recusado' || order.status === 'expirado' || order.status === 'erro' || order.status === 'nao_pago') && (
          <Button variant="green" size="sm" onClick={() => onUpdateStatus('pago')}>Marcar como pago manualmente</Button>
        )}
        <Button variant="ghost" onClick={onClose} className="ml-auto">Fechar</Button>
      </div>
    </Modal>
  );
}

function DetailTile({ label, value, icon, accent }) {
  const color = accent === 'green' ? 'text-bc-green' : accent === 'red' ? 'text-bc-red' : 'text-stone-500';
  return (
    <div className="bg-cream border border-stone-200 p-3">
      <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] ${color} font-semibold mb-1`}>{icon}{label}</div>
      <div className="text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

Object.assign(window, { AdminOrdersPage });
