import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/stores/toastStore';
import { api } from '@/api/client';
import { Avatar, ColorStripe } from '@/components/ui';
import {
  IconShoppingCart, IconChevronDown, IconUser, IconCreditCard, IconPackage,
  IconLayoutDashboard, IconLogOut, IconMenu, IconX, IconChevronRight,
} from '@/icons';

const NAV_LINKS = [
  { to: '/sobre',    label: 'Sobre' },
  { to: '/horarios', label: 'Horários' },
  { to: '/planos',   label: 'Planos' },
  { to: '/loja',     label: 'Loja' },
  { to: '/contato',  label: 'Contato' },
];

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { itemCount, open: openCart, setItems } = useCartStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const count = itemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    setItems([]);
    toast.success('Até logo!', 'Você saiu da conta.');
    navigate('/');
  };

  const handleCartClick = () => {
    if (!user) {
      toast.error('Entre para usar o carrinho', 'Você precisa estar logado.');
      navigate('/login');
      return;
    }
    openCart();
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-xl border-b border-stone-200 py-3 shadow-[0_1px_0_0_rgba(13,107,58,0.08)]'
        : 'bg-cream/0 backdrop-blur-[2px] py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img src="/logo.png" alt="Boxing Club" className="w-11 h-11 object-contain transition-transform duration-500 group-hover:rotate-[-8deg]" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-wider text-ink">
              BOXING<span className="text-bc-red">.</span>CLUB
            </span>
            <span className="text-[10px] text-stone-500 tracking-[0.3em] uppercase">Ribeirão Preto</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium tracking-wide transition-colors relative group ${isActive ? 'text-ink' : 'text-stone-700 hover:text-ink'}`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span className={`absolute left-4 right-4 -bottom-0.5 h-px bg-bc-green transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={handleCartClick}
            className="relative w-10 h-10 flex items-center justify-center text-stone-700 hover:text-ink hover:bg-stone-100 transition-colors"
            aria-label="Carrinho"
          >
            <IconShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-bc-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>
            )}
          </button>

          {/* Auth */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold tracking-wider uppercase text-ink px-3 py-2 hover:text-bc-green transition-colors">Entrar</Link>
              <Link to="/register" className="hidden md:inline-flex items-center gap-2 bg-bc-red hover:bg-bc-red-dark text-white text-sm font-semibold tracking-wider uppercase px-4 py-2.5 transition-all">
                Criar conta
              </Link>
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
                  <ColorStripe />
                  <div className="px-4 py-4 border-b border-stone-200 flex items-center gap-3">
                    <Avatar user={user} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink truncate">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-stone-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <ul className="py-2">
                    {[
                      { to: '/conta/perfil',  label: 'Meu perfil',      Icon: IconUser },
                      { to: '/conta/planos',  label: 'Meus planos',     Icon: IconCreditCard },
                      { to: '/conta/compras', label: 'Minhas compras',  Icon: IconPackage },
                      ...(user.role === 'ADMIN' ? [{ to: '/admin/dashboard', label: 'Painel admin', Icon: IconLayoutDashboard, newTab: true }] : []),
                    ].map((it) => (
                      <li key={it.to}>
                        {it.newTab ? (
                          <a
                            href={it.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-ink"
                          >
                            <it.Icon size={16} className="text-bc-green" />
                            {it.label}
                          </a>
                        ) : (
                          <button onClick={() => { setMenuOpen(false); navigate(it.to); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-ink">
                            <it.Icon size={16} className="text-bc-green" />
                            {it.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-stone-200 py-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-bc-red hover:bg-bc-red/5">
                      <IconLogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-ink p-2" aria-label="Menu">
            {mobileOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? 'max-h-[600px] mt-4' : 'max-h-0'}`}>
        <div className="bg-white border-t border-stone-200 px-5 py-6 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-3 border-b border-stone-200 font-medium tracking-wide flex items-center justify-between ${isActive ? 'text-bc-red' : 'text-ink'}`
              }
            >
              {l.label}
              <IconChevronRight size={18} className="text-bc-green" />
            </NavLink>
          ))}
          {!user && (
            <div className="flex gap-2 mt-4">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 border-2 border-ink text-ink text-center font-semibold tracking-wider uppercase py-3 text-sm">Entrar</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 bg-bc-red text-white text-center font-semibold tracking-wider uppercase py-3 text-sm">Criar conta</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
