// ============================================================
// MiniMenu — floating quick-nav for testing all routes
// ============================================================
function MiniMenu() {
  const { path, navigate } = useRoute();
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Cmd/Ctrl + K toggles
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const sections = [
    {
      title: 'Público',
      color: 'text-bc-green',
      items: [
        { to: 'home',     label: 'Home',         icon: IconDumbbell },
        { to: 'sobre',    label: 'Sobre',        icon: IconUsers },
        { to: 'horarios', label: 'Horários',     icon: IconCalendar },
        { to: 'planos',   label: 'Planos',       icon: IconCreditCard },
        { to: 'loja',     label: 'Loja',         icon: IconShoppingBag },
        { to: 'contato',  label: 'Contato',      icon: IconMail },
      ],
    },
    {
      title: 'Conta',
      color: 'text-ink',
      items: !user ? [
        { to: 'login',    label: 'Entrar',       icon: IconLogIn },
        { to: 'register', label: 'Criar conta',  icon: IconUser },
      ] : [
        { to: 'conta/perfil',  label: 'Meu perfil',     icon: IconUser },
        { to: 'conta/planos',  label: 'Meus planos',    icon: IconCreditCard },
        { to: 'conta/compras', label: 'Minhas compras', icon: IconPackage },
      ],
    },
    {
      title: 'Admin',
      color: 'text-bc-red',
      items: [
        { to: 'admin',            label: 'Login admin',  icon: IconLock },
        { to: 'admin/dashboard',  label: 'Dashboard',    icon: IconLayoutDashboard },
        { to: 'admin/horarios',   label: 'Agenda',       icon: IconCalendar },
        { to: 'admin/loja',       label: 'Loja',         icon: IconShoppingBag },
        { to: 'admin/pedidos',    label: 'Pedidos',      icon: IconPackage },
        { to: 'admin/usuarios',   label: 'Usuários',     icon: IconUsers },
      ],
    },
  ];

  const go = (to) => { navigate(to); setOpen(false); };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-5 z-[80] w-12 h-12 rounded-full bg-ink text-white shadow-[0_15px_40px_-10px_rgba(13,107,58,0.4)] flex items-center justify-center hover:bg-bc-green transition-colors group ${open ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Menu de navegação rápida"
        title="Mini menu (Ctrl/Cmd + K)"
      >
        <IconLayoutDashboard size={18}/>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-bc-red border-2 border-white animate-pulse"/>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-[80] pointer-events-none">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px] pointer-events-auto animate-fade-in" onClick={() => setOpen(false)}/>
          <aside className="absolute bottom-5 right-5 w-[300px] max-h-[80vh] bg-white border border-stone-200 shadow-[0_30px_60px_-15px_rgba(13,107,58,0.35)] pointer-events-auto flex flex-col animate-mini-in overflow-hidden">
            <div className="h-1 flex flex-shrink-0">
              <div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/>
            </div>
            <header className="px-4 py-3 border-b border-stone-200 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-sm bg-ink text-white flex items-center justify-center">
                <IconLayoutDashboard size={14}/>
              </div>
              <div className="flex-1 leading-tight">
                <div className="font-display text-lg tracking-wider text-ink leading-none">MINI MENU</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Navegação rápida</div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-ink hover:bg-stone-100">
                <IconX size={14}/>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {sections.map((sec) => (
                <div key={sec.title}>
                  <div className={`text-[10px] uppercase tracking-[0.25em] font-semibold ${sec.color} px-2 mb-1`}>{sec.title}</div>
                  <ul className="space-y-0.5">
                    {sec.items.map((it) => {
                      const active = path === it.to;
                      return (
                        <li key={it.to}>
                          <button
                            onClick={() => go(it.to)}
                            className={`w-full flex items-center gap-3 px-2 py-2 text-sm transition-colors group ${active ? 'bg-ink text-white font-semibold' : 'text-stone-700 hover:bg-stone-100 hover:text-ink'}`}
                          >
                            <it.icon size={14} className={active ? 'text-white' : 'text-stone-400 group-hover:text-bc-green'}/>
                            <span className="flex-1 text-left">{it.label}</span>
                            <span className={`text-[10px] font-mono ${active ? 'text-white/70' : 'text-stone-400'}`}>
                              #/{it.to}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <footer className="border-t border-stone-200 px-4 py-2.5 bg-stone-50 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-stone-500 flex-shrink-0">
              <span>
                {user ? (
                  <>Logado: <span className="text-ink font-semibold">{user.firstName}</span>{user.role === 'admin' && <span className="text-bc-red ml-1">· admin</span>}</>
                ) : (
                  <>Visitante</>
                )}
              </span>
              <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 font-mono">⌘K</kbd>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

Object.assign(window, { MiniMenu });
