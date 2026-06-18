import { useEffect, Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { api } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import { ToastContainer, ConfirmModal } from '@/components/ui';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { routes } from '@/routes';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-5">
          <div className="max-w-md text-center bg-white border border-stone-200 p-10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-bc-red" />
            <div className="font-display text-4xl tracking-wider text-ink mb-3">ERRO</div>
            <p className="text-stone-600 text-sm mb-6">Algo deu errado. Tente recarregar a página.</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-6 py-3 bg-ink text-white text-sm font-semibold uppercase tracking-wider hover:bg-stone-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthHydrator() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="bg-cream text-ink min-h-screen antialiased font-body flex flex-col">
      {!isAdmin && <Navbar />}
      <main key={location.pathname} className="flex-1 animate-page-in">
        <Routes>
          {routes.map((route, i) =>
            route.children ? (
              <Route key={i} element={route.element}>
                {route.children.map((child, j) => (
                  <Route key={j} path={child.path} element={child.element} />
                ))}
              </Route>
            ) : (
              <Route key={i} path={route.path} element={route.element} />
            )
          )}
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />
    </div>
  );
}

function GlobalModals() {
  const toasts = useToastStore((s) => s.toasts);
  const { isOpen, options, answer } = useConfirmStore();

  return (
    <>
      <ToastContainer toasts={toasts} />
      {isOpen && options && (
        <ConfirmModal
          title={options.title}
          message={options.message}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          danger={options.danger}
          onConfirm={() => answer(true)}
          onCancel={() => answer(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthHydrator />
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
        <GlobalModals />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
