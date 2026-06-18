import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useLogout } from '@/api/auth';
import { Avatar, Button } from '@/components/ui';
import {
  IconLayoutDashboard,
  IconCalendar,
  IconShoppingBag,
  IconPackage,
  IconUsers,
  IconArrowLeft,
  IconLogOut,
  IconMenu,
  IconX,
  IconLock,
  IconLogIn,
} from '@/icons';

type AdminSection = 'dashboard' | 'horarios' | 'loja' | 'pedidos' | 'usuarios';

const NAV_ITEMS: { id: AdminSection; label: string; Icon: React.FC<{ size?: number }>; to: string }[] = [
  { id: 'dashboard', label: 'Dashboard',  Icon: IconLayoutDashboard, to: '/admin/dashboard' },
  { id: 'horarios',  label: 'Agenda',     Icon: IconCalendar,        to: '/admin/horarios'  },
  { id: 'loja',      label: 'Loja',       Icon: IconShoppingBag,     to: '/admin/loja'      },
  { id: 'pedidos',   label: 'Pedidos',    Icon: IconPackage,         to: '/admin/pedidos'   },
  { id: 'usuarios',  label: 'Usuários',   Icon: IconUsers,           to: '/admin/usuarios'  },
];

interface AdminLayoutProps {
  active: AdminSection;
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ active, title, children }: AdminLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const navigate = useNavigate();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        toast.info('Sessão encerrada', 'Até a próxima.');
        navigate('/');
      },
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-stone-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-ink text-cream flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-1 flex flex-shrink-0">
          <div className="flex-1 bg-bc-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-bc-red" />
        </div>

        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-bc-green flex items-center justify-center text-white font-display text-lg tracking-wider flex-shrink-0">BC</div>
          <div className="leading-none">
            <div className="text-[10px] uppercase tracking-[0.25em] text-stone-400">Boxing Club</div>
            <div className="font-display text-xl tracking-wider text-white">ADMIN</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white">
            <IconX size={18} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-3">
            {NAV_ITEMS.map((it) => {
              const isActive = active === it.id;
              return (
                <li key={it.id}>
                  <Link
                    to={it.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-white/10 text-white border-l-2 border-bc-red' : 'text-stone-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                  >
                    <it.Icon size={16} />{it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-4">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-300 hover:bg-white/5 hover:text-white">
            <IconArrowLeft size={16} /> Ver site
          </Link>
          <button onClick={doLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-bc-red hover:bg-bc-red/10">
            <IconLogOut size={16} /> Sair
          </button>
          {user && (
            <div className="mt-4 px-3 flex items-center gap-3">
              <Avatar user={user} size={32} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user.firstName} {user.lastName}</div>
                <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-ink/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-stone-200 px-5 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center text-ink hover:bg-stone-100" aria-label="Abrir menu">
            <IconMenu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-semibold">Painel administrativo</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-ink leading-none truncate">{title}</h1>
          </div>
          <Avatar user={user} size={36} />
        </header>
        <div className="p-5 sm:p-8 animate-reveal-up">{children}</div>
      </main>
    </div>
  );
}

export function AdminAccessDenied({ reason }: { reason: 'login' | 'role' }) {
  return (
    <section className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="max-w-md text-center bg-white border border-stone-200 p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-bc-red" />
        <div className="w-16 h-16 mx-auto rounded-full bg-bc-red/10 flex items-center justify-center text-bc-red mb-5">
          <IconLock size={28} />
        </div>
        <h2 className="font-display text-3xl tracking-wider text-ink mb-2">Acesso restrito</h2>
        <p className="text-sm text-stone-600 mb-6">
          {reason === 'role'
            ? 'Sua conta não tem permissão de administrador.'
            : 'Você precisa fazer login como administrador para acessar esta área.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => window.location.assign('/')}>Voltar ao site</Button>
          <Button variant="primary" onClick={() => window.location.assign('/admin')} leftIcon={<IconLogIn size={16} />}>Login admin</Button>
        </div>
      </div>
    </section>
  );
}
