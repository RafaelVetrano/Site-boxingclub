// ============================================================
// App root — router + providers
// ============================================================
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ConfirmProvider>
            <Shell />
          </ConfirmProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function Shell() {
  const { path, segs, navigate } = useRoute();
  const { user } = useAuth();

  // Resolve route
  let page;

  const requireLogin = (component) => {
    if (!user) {
      React.useEffect(() => { navigate('login'); }, []);
      return null;
    }
    return component;
  };

  if (path === 'home' || path === '') {
    page = <HomePage />;
  } else if (path === 'sobre') {
    page = <SobrePage />;
  } else if (path === 'horarios') {
    page = <HorariosPage />;
  } else if (path === 'planos') {
    page = <PlanosPage />;
  } else if (path === 'loja') {
    page = <LojaPage />;
  } else if (path === 'contato') {
    page = <ContatoPage />;
  } else if (path === 'login') {
    page = <LoginPage />;
  } else if (path === 'register') {
    page = <RegisterPage />;
  } else if (segs[0] === 'conta') {
    const tab = segs[1] || 'perfil';
    if (tab === 'perfil')  page = requireLogin(<ProfilePage />);
    else if (tab === 'planos')  page = requireLogin(<MyPlansPage />);
    else if (tab === 'compras') page = requireLogin(<OrdersPage />);
    else page = requireLogin(<ProfilePage />);
  } else if (segs[0] === 'admin') {
    const sub = segs[1];
    if (!sub) page = <AdminLoginPage />;
    else if (sub === 'dashboard') page = <AdminDashboardPage />;
    else if (sub === 'horarios')  page = <AdminSchedulePage />;
    else if (sub === 'loja')      page = <AdminStorePage />;
    else if (sub === 'pedidos')   page = <AdminOrdersPage />;
    else if (sub === 'usuarios')  page = <AdminUsersPage />;
    else page = <NotFound />;
  } else {
    page = <NotFound />;
  }

  const isAdminArea = path.startsWith('admin');

  return (
    <div className="bg-cream text-ink min-h-screen antialiased font-body flex flex-col">
      {!isAdminArea && <Navbar />}
      <main key={path} className="flex-1 animate-page-in">
        {page}
      </main>
      {!isAdminArea && <Footer />}
      <CartDrawer />
      <MiniMenu />
    </div>
  );
}

function NotFound() {
  const { navigate } = useRoute();
  return (
    <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-16 bg-cream">
      <div className="text-center px-5">
        <div className="font-display text-8xl tracking-wider text-bc-red mb-3">404</div>
        <h1 className="font-display text-3xl tracking-wider text-ink mb-2">Página não encontrada</h1>
        <p className="text-stone-600 mb-6">O endereço acessado não existe ou foi movido.</p>
        <Button variant="primary" onClick={() => navigate('home')} leftIcon={<IconArrowLeft size={16}/>}>Voltar ao início</Button>
      </div>
    </section>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
