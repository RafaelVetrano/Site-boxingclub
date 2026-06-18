// ============================================================
// Navbar — auth-aware, with cart and user dropdown
// ============================================================
function Navbar() {
  const { user, logout } = useAuth();
  const { count, setOpen: openCart } = useCart();
  const { path, navigate } = useRoute();
  const toast = useToast();

  const [open, setOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const dropRef = React.useRef(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const links = [
    { to: 'sobre',    label: 'Sobre' },
    { to: 'horarios', label: 'Horários' },
    { to: 'planos',   label: 'Planos' },
    { to: 'loja',     label: 'Loja' },
    { to: 'contato',  label: 'Contato' },
  ];

  const go = (e, to) => { e.preventDefault(); navigate(to); setOpen(false); };

  const isAdminArea = path.startsWith('admin');
  if (isAdminArea) return null; // admin has its own chrome

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-stone-200 py-3 shadow-[0_1px_0_0_rgba(13,107,58,0.08)]'
          : 'bg-cream/0 backdrop-blur-[2px] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
        <a href="#/home" onClick={(e) => go(e, 'home')} className="flex items-center gap-3 group flex-shrink-0">
          <img src={window.LOGO_DATA} alt="Boxing Club" className="w-11 h-11 object-contain transition-transform duration-500 group-hover:rotate-[-8deg]" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-wider text-ink">
              BOXING<span className="text-bc-red">.</span>CLUB
            </span>
            <span className="text-[10px] text-stone-500 tracking-[0.3em] uppercase">Ribeirão Preto</span>
          </div>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <a
                key={l.to}
                href={`#/${l.to}`}
                onClick={(e) => go(e, l.to)}
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors relative group ${active ? 'text-ink' : 'text-stone-700 hover:text-ink'}`}
              >
                {l.label}
                <span className={`absolute left-4 right-4 -bottom-0.5 h-px bg-bc-green transition-transform origin-left ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Cart button */}
          <button
            onClick={() => {
              if (!user) { toast.error('Entre para usar o carrinho', 'Você precisa estar logado.'); navigate('login'); return; }
              openCart(true);
            }}
            className="relative w-10 h-10 flex items-center justify-center text-stone-700 hover:text-ink hover:bg-stone-100 transition-colors"
            aria-label="Carrinho"
          >
            <IconShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-bc-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>
            )}
          </button>

          {/* Auth / user menu */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <a href="#/login" onClick={(e) => go(e, 'login')} className="text-sm font-semibold tracking-wider uppercase text-ink px-3 py-2 hover:text-bc-green transition-colors">Entrar</a>
              <a href="#/register" onClick={(e) => go(e, 'register')} className="hidden md:inline-flex items-center gap-2 bg-bc-red hover:bg-bc-red-dark text-white text-sm font-semibold tracking-wider uppercase px-4 py-2.5 transition-all">
                Criar conta
              </a>
            </div>
          ) : (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 pl-1 pr-3 py-1 border border-stone-200 hover:border-ink transition-colors">
                <Avatar user={user} size={32} />
                <span className="hidden md:flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500">Olá,</span>
                  <span className="text-sm font-semibold text-ink">{user.firstName}</span>
                </span>
                <IconChevronDown size={14} className="text-stone-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 shadow-[0_15px_40px_-15px_rgba(13,107,58,0.3)] animate-dropdown-in z-50">
                  <div className="absolute top-0 left-0 right-0 h-1 flex">
                    <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
                  </div>
                  <div className="px-4 py-4 border-b border-stone-200 flex items-center gap-3">
                    <Avatar user={user} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink truncate">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-stone-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <ul className="py-2">
                    {[
                      { to: 'conta/perfil', label: 'Meu perfil', icon: IconUser },
                      { to: 'conta/planos', label: 'Meus planos', icon: IconCreditCard },
                      { to: 'conta/compras', label: 'Minhas compras', icon: IconPackage },
                      ...(user.role === 'admin' ? [{ to: 'admin/dashboard', label: 'Painel admin', icon: IconLayoutDashboard }] : []),
                    ].map((it) => (
                      <li key={it.to}>
                        <button onClick={() => { setMenuOpen(false); navigate(it.to); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-ink">
                          <it.icon size={16} className="text-bc-green" />
                          {it.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-stone-200 py-2">
                    <button onClick={() => { setMenuOpen(false); logout(); toast.success('Até logo!', 'Você saiu da conta.'); navigate('home'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bc-red hover:bg-bc-red/5">
                      <IconLogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setOpen(!open)} className="lg:hidden text-ink p-2" aria-label="Menu">
            {open ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${open ? 'max-h-[600px] mt-4' : 'max-h-0'}`}>
        <div className="bg-white border-t border-stone-200 px-5 py-6 flex flex-col gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <a key={l.to} href={`#/${l.to}`} onClick={(e) => go(e, l.to)} className={`py-3 border-b border-stone-200 font-medium tracking-wide flex items-center justify-between ${active ? 'text-bc-red' : 'text-ink'}`}>
                {l.label}
                <IconChevronRight size={18} className="text-bc-green" />
              </a>
            );
          })}
          {!user && (
            <div className="flex gap-2 mt-4">
              <a href="#/login" onClick={(e) => go(e, 'login')} className="flex-1 border-2 border-ink text-ink text-center font-semibold tracking-wider uppercase py-3 text-sm">Entrar</a>
              <a href="#/register" onClick={(e) => go(e, 'register')} className="flex-1 bg-bc-red text-white text-center font-semibold tracking-wider uppercase py-3 text-sm">Criar conta</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { Navbar });
