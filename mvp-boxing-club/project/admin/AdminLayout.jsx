// ============================================================
// Admin — Login (route protector entry point)
// ============================================================
function AdminLoginPage() {
  const { adminLogin, loading, user } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState({});

  // If already an admin, jump straight to dashboard
  React.useEffect(() => {
    if (user?.role === 'admin') navigate('admin/dashboard');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email = 'Informe o email.';
    if (!form.password) errs.password = 'Informe a senha.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await adminLogin(form.email, form.password);
      toast.success('Acesso liberado', 'Bem-vindo ao painel administrativo.');
      navigate('admin/dashboard');
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  return (
    <section className="min-h-screen bg-ink relative overflow-hidden flex items-center justify-center px-5 py-12">
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:60px_60px]"/>
      <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-red"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-green"/></div>

      <div className="relative w-full max-w-md animate-reveal-up">
        <a href="#/home" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="flex items-center gap-2 text-stone-400 hover:text-white text-xs uppercase tracking-[0.25em] mb-6">
          <IconArrowLeft size={14}/> Voltar ao site
        </a>
        <div className="bg-white p-9 relative">
          <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>

          <div className="flex items-center gap-3 mb-7">
            <img src={window.LOGO_DATA} alt="Boxing Club" className="w-12 h-12 object-contain"/>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-bc-red font-semibold">Boxing Club</div>
              <div className="font-display text-2xl tracking-wider text-ink leading-none">PAINEL ADMIN</div>
            </div>
          </div>

          <h2 className="font-display text-3xl tracking-wider text-ink mb-1">Login administrador</h2>
          <p className="text-sm text-stone-600 mb-6">Acesso restrito à equipe da academia.</p>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input label="Email" type="email" placeholder="admin@boxingclub.com" icon={<IconUser size={16}/>} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email}/>
            <Input label="Senha" type="password" placeholder="••••••••" icon={<IconLock size={16}/>} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password}/>

            {errors.form && <div className="bg-bc-red/5 border border-bc-red/30 text-bc-red text-sm px-4 py-3 flex items-center gap-2"><IconAlertTriangle size={16}/>{errors.form}</div>}

            <Button type="submit" variant="dark" size="lg" className="w-full" loading={loading} rightIcon={<IconArrowRight size={16}/>}>Entrar no painel</Button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2">Credenciais de demonstração</div>
            <div className="bg-stone-50 border border-stone-200 px-3 py-2 text-xs font-mono text-stone-700 space-y-1">
              <div>admin@boxingclub.com</div>
              <div>admin123</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Admin Layout — protected wrapper with sidebar
// ============================================================
function AdminLayout({ active, title, children }) {
  const { user, logout } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Auth/role guard
  if (!user) {
    React.useEffect(() => { navigate('admin'); }, []);
    return <AccessDenied reason="login" />;
  }
  if (user.role !== 'admin') {
    return <AccessDenied reason="role" />;
  }

  const items = [
    { id: 'dashboard', label: 'Dashboard',  icon: IconLayoutDashboard, to: 'admin/dashboard' },
    { id: 'horarios',  label: 'Agenda',     icon: IconCalendar,        to: 'admin/horarios' },
    { id: 'loja',      label: 'Loja',       icon: IconShoppingBag,     to: 'admin/loja' },
    { id: 'pedidos',   label: 'Pedidos',    icon: IconPackage,         to: 'admin/pedidos' },
    { id: 'usuarios',  label: 'Usuários',   icon: IconUsers,           to: 'admin/usuarios' },
  ];

  const doLogout = () => { logout(); toast.info('Sessão encerrada', 'Até a próxima.'); navigate('home'); };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-ink text-cream flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-1 flex flex-shrink-0"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <img src={window.LOGO_DATA} alt="" className="w-10 h-10 object-contain"/>
          <div className="leading-none">
            <div className="text-[10px] uppercase tracking-[0.25em] text-stone-400">Boxing Club</div>
            <div className="font-display text-xl tracking-wider text-white">ADMIN</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white">
            <IconX size={18}/>
          </button>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-0.5 px-3">
            {items.map((it) => {
              const isActive = active === it.id;
              return (
                <li key={it.id}>
                  <button onClick={() => { navigate(it.to); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-white/10 text-white border-l-2 border-bc-red' : 'text-stone-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                    <it.icon size={16}/>{it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <button onClick={() => navigate('home')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-300 hover:bg-white/5 hover:text-white">
            <IconArrowLeft size={16}/> Ver site
          </button>
          <button onClick={doLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-bc-red hover:bg-bc-red/10">
            <IconLogOut size={16}/> Sair
          </button>
          <div className="mt-4 px-3 flex items-center gap-3">
            <Avatar user={user} size={32}/>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.firstName} {user.lastName}</div>
              <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-ink/60 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-stone-200 px-5 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center text-ink hover:bg-stone-100" aria-label="Abrir menu">
            <IconMenu size={20}/>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-semibold">Painel administrativo</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-ink leading-none truncate">{title}</h1>
          </div>
          <Avatar user={user} size={36}/>
        </header>
        <div className="p-5 sm:p-8 animate-reveal-up">{children}</div>
      </main>
    </div>
  );
}

function AccessDenied({ reason }) {
  const { navigate } = useRoute();
  return (
    <section className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="max-w-md text-center bg-white border border-stone-200 p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-bc-red"/>
        <div className="w-16 h-16 mx-auto rounded-full bg-bc-red/10 flex items-center justify-center text-bc-red mb-5"><IconLock size={28}/></div>
        <h2 className="font-display text-3xl tracking-wider text-ink mb-2">Acesso restrito</h2>
        <p className="text-sm text-stone-600 mb-6">
          {reason === 'role' ? 'Sua conta não tem permissão de administrador.' : 'Você precisa fazer login como administrador para acessar esta área.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate('home')}>Voltar ao site</Button>
          <Button variant="primary" onClick={() => navigate('admin')} leftIcon={<IconLogIn size={16}/>}>Login admin</Button>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AdminLoginPage, AdminLayout, AccessDenied });
