// ============================================================
// Boxing Club — Contexts: Auth, Cart, Toast, Confirm, Router
// ============================================================
const { AuthService, CartService, StoreService } = window.BCServices;

const AuthContext    = React.createContext(null);
const CartContext    = React.createContext(null);
const ToastContext   = React.createContext(null);
const ConfirmContext = React.createContext(null);

// ---------------- AuthProvider ----------------
function AuthProvider({ children }) {
  const [user, setUser] = React.useState(AuthService.current());
  const [loading, setLoading] = React.useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try { const u = await AuthService.login(email, password); setUser(u); return u; }
    finally { setLoading(false); }
  };
  const register = async (data) => {
    setLoading(true);
    try { const u = await AuthService.register(data); setUser(u); return u; }
    finally { setLoading(false); }
  };
  const adminLogin = async (email, password) => {
    setLoading(true);
    try { const u = await AuthService.adminLogin(email, password); setUser(u); return u; }
    finally { setLoading(false); }
  };
  const logout = () => { AuthService.logout(); setUser(null); };
  const refresh = () => setUser(AuthService.current());
  const updateUser = (patch) => { const u = AuthService.updateUser(patch); setUser(u); return u; };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, adminLogin, logout, refresh, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
const useAuth = () => React.useContext(AuthContext);

// ---------------- CartProvider ----------------
function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = React.useState(() => (user ? CartService.get(user.id) : []));
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => { setItems(user ? CartService.get(user.id) : []); }, [user?.id]);

  const persist = (next) => { if (user) CartService.set(user.id, next); setItems(next); };
  const add = (product, qty = 1) => { if (!user) return false; const next = CartService.add(user.id, product, qty); setItems([...next]); return true; };
  const setQty = (productId, qty) => { if (!user) return; const next = CartService.setQty(user.id, productId, qty); setItems([...next]); };
  const remove = (productId) => setQty(productId, 0);
  const clear = () => { if (user) CartService.clear(user.id); setItems([]); };
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, total, count, open, setOpen, persist }}>
      {children}
    </CartContext.Provider>
  );
}
const useCart = () => React.useContext(CartContext);

// ---------------- ToastProvider ----------------
function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, type: 'info', duration: 3200, ...t };
    setToasts((xs) => [...xs, toast]);
    setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== id)), toast.duration);
  };
  const api = {
    show: push,
    success: (title, message) => push({ type: 'success', title, message }),
    error:   (title, message) => push({ type: 'error',   title, message, duration: 4200 }),
    info:    (title, message) => push({ type: 'info',    title, message }),
  };
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (<ToastItem key={t.id} t={t} />))}
      </div>
    </ToastContext.Provider>
  );
}
function ToastItem({ t }) {
  const color = t.type === 'success' ? 'border-bc-green'
              : t.type === 'error'   ? 'border-bc-red'
              : 'border-ink';
  const dot = t.type === 'success' ? 'bg-bc-green'
            : t.type === 'error'   ? 'bg-bc-red'
            : 'bg-ink';
  return (
    <div className={`pointer-events-auto bg-white border-l-4 ${color} shadow-[0_15px_40px_-15px_rgba(13,107,58,0.35)] px-4 py-3 pr-6 min-w-[280px] max-w-sm animate-toast-in`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
        <div className="flex-1">
          {t.title && <div className="font-display text-lg tracking-wider text-ink leading-tight">{t.title}</div>}
          {t.message && <div className="text-sm text-stone-600 mt-0.5">{t.message}</div>}
        </div>
      </div>
    </div>
  );
}
const useToast = () => React.useContext(ToastContext);

// ---------------- ConfirmProvider ----------------
function ConfirmProvider({ children }) {
  const [state, setState] = React.useState(null);
  const ask = (opts) => new Promise((resolve) => setState({ ...opts, resolve }));
  const close = (result) => { state?.resolve?.(result); setState(null); };
  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {state && (
        <Modal onClose={() => close(false)} size="sm">
          <h3 className="font-display text-3xl tracking-wider text-ink mb-3">{state.title || 'Confirmar ação'}</h3>
          <p className="text-stone-600 text-sm mb-7">{state.message || 'Tem certeza?'}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => close(false)}>{state.cancelLabel || 'Cancelar'}</Button>
            <Button variant={state.danger ? 'danger' : 'primary'} onClick={() => close(true)}>{state.confirmLabel || 'Confirmar'}</Button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}
const useConfirm = () => React.useContext(ConfirmContext);

// ---------------- Router (hash-based, segmented) ----------------
function parseHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '');
  if (!raw) return { path: 'home', segs: ['home'] };
  const segs = raw.split('/').filter(Boolean);
  return { path: segs.join('/'), segs };
}
function useRoute() {
  const [route, setRoute] = React.useState(parseHash());
  React.useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (path) => {
    const target = path.startsWith('#') ? path : '#/' + path.replace(/^\/+/, '');
    if (window.location.hash === target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = target;
      window.scrollTo({ top: 0 });
    }
  };
  return { ...route, navigate };
}

Object.assign(window, {
  AuthProvider, CartProvider, ToastProvider, ConfirmProvider,
  useAuth, useCart, useToast, useConfirm, useRoute,
});
