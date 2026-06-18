// ============================================================
// Account — Profile, Plans (alias to plans page when subscribed), Orders
// ============================================================
function AccountShell({ active, children }) {
  const { user, logout } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();

  if (!user) {
    React.useEffect(() => { navigate('login'); }, []);
    return null;
  }

  const tabs = [
    { id: 'perfil',  label: 'Meu perfil',    icon: IconUser },
    { id: 'planos',  label: 'Meus planos',   icon: IconCreditCard },
    { id: 'compras', label: 'Minhas compras', icon: IconPackage },
  ];
  const doLogout = () => { logout(); toast.success('Até logo!', 'Você saiu da conta.'); navigate('home'); };

  return (
    <section className="relative pt-28 pb-24 sm:pt-36 bg-cream min-h-[80vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="mb-8 flex items-center gap-4 animate-reveal-up">
          <Avatar user={user} size={64} />
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.3em] text-bc-green font-semibold mb-1">Minha conta</div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-ink leading-none truncate">{user.firstName} {user.lastName}</h1>
            <div className="text-sm text-stone-500 mt-1">{user.email}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <aside className="md:col-span-3">
            <nav className="bg-white border border-stone-200 sticky top-24">
              <div className="h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
              <ul>
                {tabs.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => navigate('conta/' + t.id)} className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm border-l-4 transition-colors ${active === t.id ? 'border-bc-red bg-bc-red/[0.04] text-ink font-semibold' : 'border-transparent text-stone-600 hover:bg-stone-50 hover:text-ink'}`}>
                      <t.icon size={16} className={active === t.id ? 'text-bc-red' : 'text-bc-green'}/>
                      {t.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={doLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-bc-red border-l-4 border-transparent hover:bg-bc-red/5">
                    <IconLogOut size={16}/> Sair
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="md:col-span-9 animate-reveal-up" style={{ animationDelay: '100ms' }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  if (!user) return null;
  const [form, setForm] = React.useState({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  const [saving, setSaving] = React.useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateUser({ firstName: form.firstName, lastName: form.lastName });
    setSaving(false);
    toast.success('Perfil atualizado', 'Suas informações foram salvas.');
  };

  return (
    <AccountShell active="perfil">
      <Card className="p-7">
        <h2 className="font-display text-3xl tracking-wider text-ink mb-1">Informações pessoais</h2>
        <p className="text-sm text-stone-600 mb-6">Mantenha seus dados atualizados.</p>
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}/>
            <Input label="Sobrenome" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}/>
          </div>
          <Input label="Email" value={form.email} disabled hint="O email não pode ser alterado." icon={<IconMail size={16}/>}/>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="green" loading={saving} leftIcon={<IconCheck size={16}/>}>Salvar alterações</Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3"><IconUser size={18} className="text-bc-green"/><div><div className="text-[10px] uppercase tracking-widest text-stone-500">Tipo de conta</div><div className="text-sm font-semibold text-ink">{user.role === 'admin' ? 'Administrador' : 'Aluno'}</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><IconCalendar size={18} className="text-bc-green"/><div><div className="text-[10px] uppercase tracking-widest text-stone-500">Membro desde</div><div className="text-sm font-semibold text-ink">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><IconCreditCard size={18} className="text-bc-green"/><div><div className="text-[10px] uppercase tracking-widest text-stone-500">Plano</div><div className="text-sm font-semibold text-ink">{user.plan ? user.plan.planName : 'Nenhum'}</div></div></Card>
      </div>
    </AccountShell>
  );
}

function MyPlansPage() {
  const { navigate } = useRoute();
  React.useEffect(() => { navigate('planos'); }, []);
  return null;
}

function OrdersPage() {
  const { user } = useAuth();
  const { navigate } = useRoute();
  if (!user) return null;

  const [orders, setOrders] = React.useState(null);
  React.useEffect(() => {
    setTimeout(() => setOrders(window.BCServices.OrderService.listFor(user.id)), 250);
  }, [user.id]);

  return (
    <AccountShell active="compras">
      {orders === null ? (
        <Card className="p-7 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20"/>)}
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-10">
          <EmptyState title="Nenhuma compra ainda" message="Quando você comprar da nossa loja, seus pedidos aparecem aqui." icon={<IconShoppingBag size={28}/>} action={<Button variant="primary" onClick={() => navigate('loja')}>Ir para a loja</Button>}/>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const meta = window.BCServices.OrderService.statusMeta[o.status];
            const pay  = window.BCServices.OrderService.paymentMeta[o.paymentMethod];
            const dateObj = new Date(o.date);
            return (
              <Card key={o.id} className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">Pedido #{o.number || o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="font-display text-2xl tracking-wider text-ink">{dateObj.toLocaleString('pt-BR')}</div>
                    {pay && <div className="text-xs text-stone-500 mt-1">Pagamento: <span className="text-ink font-semibold">{pay.label}</span></div>}
                  </div>
                  <div className="text-right">
                    <Badge color={meta?.badge || 'neutral'}>{meta?.label || o.status}</Badge>
                    <div className="font-display text-3xl tracking-wider text-ink mt-1">{BRL(o.total)}</div>
                  </div>
                </div>
                {o.statusReason && (
                  <div className="bg-bc-red/5 border border-bc-red/20 text-bc-red text-xs px-3 py-2 mb-4 flex items-center gap-2">
                    <IconAlertTriangle size={14}/>
                    <span><strong className="font-semibold">Motivo:</strong> {o.statusReason}</span>
                  </div>
                )}
                <ul className="border-t border-stone-200 pt-4 space-y-2">
                  {o.items.map((it) => (
                    <li key={it.productId} className="flex items-center justify-between text-sm text-stone-700">
                      <span><span className="font-semibold text-ink">{it.qty}×</span> {it.name}</span>
                      <span>{BRL(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
                {o.deliveredAt && (
                  <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-bc-green flex items-center gap-2">
                    <IconCheck size={14} strokeWidth={3}/>
                    Entregue em {new Date(o.deliveredAt).toLocaleString('pt-BR')}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}

Object.assign(window, { ProfilePage, MyPlansPage, OrdersPage, AccountShell });
