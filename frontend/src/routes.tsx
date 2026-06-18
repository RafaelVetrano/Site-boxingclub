import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/ui';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFound } from '@/pages/NotFound';
import { Home } from '@/pages/Home';
import { Sobre } from '@/pages/Sobre';
import { Horarios } from '@/pages/Horarios';
import { Planos } from '@/pages/Planos';
import { Loja } from '@/pages/Loja';
import { Contato } from '@/pages/Contato';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ConfirmarEmail } from '@/pages/ConfirmarEmail';
import { EsqueciSenha } from '@/pages/EsqueciSenha';
import { RedefinirSenha } from '@/pages/RedefinirSenha';
import { Perfil } from '@/pages/conta/Perfil';
import { Compras } from '@/pages/conta/Compras';
import { ContaPlanos } from '@/pages/conta/ContaPlanos';
import { Checkout } from '@/pages/Checkout';
import { CheckoutSuccess } from '@/pages/CheckoutSuccess';
import { CheckoutFailure } from '@/pages/CheckoutFailure';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminSchedule } from '@/pages/admin/AdminSchedule';
import { AdminStore } from '@/pages/admin/AdminStore';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminUsers } from '@/pages/admin/AdminUsers';

// ── Guards ───────────────────────────────────────────────────────
export function RequireAuth() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} className="text-bc-green"/>
      </div>
    );
  }
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} className="text-bc-green"/>
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin" state={{ from: location }} replace />;
  return <Outlet />;
}

// ── Placeholder pages (replaced in later phases) ─────────────────
export const CS = (name: string) => <ComingSoon pageName={name} />;

export const routes = [
  // Public
  { path: '/',                   element: <Home /> },
  { path: '/sobre',              element: <Sobre /> },
  { path: '/horarios',           element: <Horarios /> },
  { path: '/planos',             element: <Planos /> },
  { path: '/loja',               element: <Loja /> },
  { path: '/contato',            element: <Contato /> },
  { path: '/login',              element: <Login /> },
  { path: '/register',           element: <Register /> },

  // Email / password flows
  { path: '/confirmar-email/:token', element: <ConfirmarEmail /> },
  { path: '/esqueci-senha',          element: <EsqueciSenha /> },
  { path: '/redefinir-senha/:token', element: <RedefinirSenha /> },

  // Auth-protected account
  {
    element: <RequireAuth />,
    children: [
      { path: '/conta/perfil',  element: <Perfil /> },
      { path: '/conta/planos',  element: <ContaPlanos /> },
      { path: '/conta/compras', element: <Compras /> },
      { path: '/checkout/success',  element: <CheckoutSuccess /> },
      { path: '/checkout/failure',  element: <CheckoutFailure /> },
      { path: '/checkout/:orderId', element: <Checkout /> },
    ],
  },

  // Admin login (public)
  { path: '/admin', element: <AdminLogin /> },

  // Admin protected
  {
    element: <RequireAdmin />,
    children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      { path: '/admin/horarios',  element: <AdminSchedule /> },
      { path: '/admin/loja',      element: <AdminStore /> },
      { path: '/admin/pedidos',   element: <AdminOrders /> },
      { path: '/admin/usuarios',  element: <AdminUsers /> },
    ],
  },

  { path: '*', element: <NotFound /> },
];
