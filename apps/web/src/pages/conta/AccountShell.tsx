import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import { IconUser, IconCreditCard, IconShoppingBag, IconLogOut } from '@/icons';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useLogout } from '@/api/auth';

export function AccountShell({ active, children }: { active: 'perfil' | 'planos' | 'compras'; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.add);
  const navigate = useNavigate();
  const logout = useLogout();

  const tabs = [
    { id: 'perfil',  label: 'Meu perfil',     icon: IconUser,        to: '/conta/perfil' },
    { id: 'planos',  label: 'Meus planos',    icon: IconCreditCard,  to: '/conta/planos' },
    { id: 'compras', label: 'Minhas compras', icon: IconShoppingBag, to: '/conta/compras' },
  ] as const;

  const doLogout = async () => {
    await logout.mutateAsync();
    addToast({ type: 'success', title: 'Até logo!', message: 'Você saiu da conta.' });
    navigate('/');
  };

  return (
    <section className="relative pt-28 pb-24 sm:pt-36 bg-cream min-h-[80vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green"/>
        <div className="flex-1 bg-white"/>
        <div className="flex-1 bg-bc-red"/>
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="mb-8 flex items-center gap-4 animate-reveal-up">
          <Avatar user={user} size={64}/>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.3em] text-bc-green font-semibold mb-1">Minha conta</div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-ink leading-none truncate">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="text-sm text-stone-500 mt-1">{user?.email}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <aside className="md:col-span-3">
            <nav className="bg-white border border-stone-200 sticky top-24">
              <div className="h-1 flex">
                <div className="flex-1 bg-bc-green"/>
                <div className="flex-1 bg-white"/>
                <div className="flex-1 bg-bc-red"/>
              </div>
              <ul>
                {tabs.map((t) => {
                  const isActive = active === t.id;
                  const Icon = t.icon;
                  return (
                    <li key={t.id}>
                      <Link
                        to={t.to}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm border-l-4 transition-colors ${
                          isActive
                            ? 'border-bc-red bg-bc-red/[0.04] text-ink font-semibold'
                            : 'border-transparent text-stone-600 hover:bg-stone-50 hover:text-ink'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-bc-red' : 'text-bc-green'}/>
                        {t.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={doLogout}
                    disabled={logout.isPending}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-bc-red border-l-4 border-transparent hover:bg-bc-red/5 disabled:opacity-60"
                  >
                    <IconLogOut size={16}/>
                    {logout.isPending ? 'Saindo...' : 'Sair'}
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
