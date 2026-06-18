// ============================================================
// Admin Dashboard — at-a-glance metrics
// ============================================================
function AdminDashboardPage() {
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    setTimeout(() => {
      const users = window.BCServices.AuthService.listUsers();
      const products = window.BCServices.StoreService.list();
      const schedule = window.BCServices.ScheduleService.list();
      const orders = window.BCServices.OrderService.listAll();
      const meta = window.BCServices.OrderService.statusMeta;
      const revenue = orders.filter((o) => meta[o.status]?.paid).reduce((s, o) => s + o.total, 0);
      const subs = users.filter((u) => u.plan && u.plan.status === 'active');
      const recentOrders = orders.slice(0, 5);
      const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setStats({ users, products, schedule, orders, revenue, subs, recentOrders, recentUsers });
    }, 300);
  }, []);

  return (
    <AdminLayout active="dashboard" title="Dashboard">
      {stats === null ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28"/>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<IconUsers size={20}/>} color="green" label="Usuários" value={stats.users.length} sub={`${stats.subs.length} com plano ativo`} />
            <StatCard icon={<IconCreditCard size={20}/>} color="red" label="Receita total" value={BRL(stats.revenue)} sub={`${stats.orders.length} pedido${stats.orders.length === 1 ? '' : 's'}`} />
            <StatCard icon={<IconCalendar size={20}/>} color="ink" label="Aulas semanais" value={stats.schedule.length} sub="ativas na agenda" />
            <StatCard icon={<IconShoppingBag size={20}/>} color="amber" label="Produtos na loja" value={stats.products.length} sub={`${stats.products.filter((p) => p.active).length} ativos`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl tracking-wider text-ink">Pedidos recentes</h3>
                <IconShoppingBag size={16} className="text-stone-400"/>
              </div>
              {stats.recentOrders.length === 0 ? (
                <EmptyState title="Sem pedidos ainda" message="Os pedidos da loja aparecem aqui." icon={<IconShoppingBag size={24}/>}/>
              ) : (
                <ul className="divide-y divide-stone-200">
              {stats.recentOrders.map((o) => {
                const m = window.BCServices.OrderService.statusMeta[o.status];
                return (
                  <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-ink truncate">{o.userName}</div>
                      <div className="text-xs text-stone-500">#{o.number || o.id.slice(0,8)} · {new Date(o.date).toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display text-lg tracking-wider text-ink">{BRL(o.total)}</div>
                      <Badge color={m?.badge || 'neutral'}>{m?.label || o.status}</Badge>
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
                <IconUsers size={16} className="text-stone-400"/>
              </div>
              <ul className="divide-y divide-stone-200">
                {stats.recentUsers.map((u) => (
                  <li key={u.id} className="py-3 flex items-center gap-3">
                    <Avatar user={u} size={36}/>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink truncate">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-stone-500 truncate">{u.email}</div>
                    </div>
                    {u.plan ? <Badge color="green">{u.plan.planName.replace('Plano ', '')}</Badge> : <Badge color="neutral">Sem plano</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon, color, label, value, sub }) {
  const colorMap = {
    green: 'bg-bc-green/10 text-bc-green',
    red:   'bg-bc-red/10 text-bc-red',
    ink:   'bg-ink/10 text-ink',
    amber: 'bg-amber-100 text-amber-700',
  }[color];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${colorMap}`}>{icon}</div>
        <IconTrendingUp size={14} className="text-stone-300"/>
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">{label}</div>
      <div className="font-display text-3xl tracking-wider text-ink leading-tight mt-1">{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </Card>
  );
}

Object.assign(window, { AdminDashboardPage });
