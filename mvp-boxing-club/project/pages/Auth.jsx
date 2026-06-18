// ============================================================
// Auth pages — Login + Register
// ============================================================
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const { login, loading } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState({});

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email)         errs.email = 'Informe seu email.';
    else if (!emailRx.test(form.email)) errs.email = 'Email inválido.';
    if (!form.password)      errs.password = 'Informe sua senha.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await login(form.email.trim(), form.password);
      toast.success('Bem-vindo de volta!', 'Login efetuado com sucesso.');
      navigate('home');
    } catch (err) { setErrors({ form: err.message }); }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-bc-green font-semibold mb-3">
          <span className="w-6 h-px bg-bc-green"/> Sua conta <span className="w-6 h-px bg-bc-green"/>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-wider text-ink leading-none mb-2">ENTRAR</h1>
        <p className="text-sm text-stone-600">Bem-vindo de volta ao Boxing Club.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" placeholder="voce@email.com" icon={<IconMail size={16}/>} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Senha" type="password" autoComplete="current-password" placeholder="••••••••" icon={<IconLock size={16}/>} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />

        {errors.form && <div className="bg-bc-red/5 border border-bc-red/30 text-bc-red text-sm px-4 py-3 flex items-center gap-2"><IconAlertTriangle size={16}/>{errors.form}</div>}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} rightIcon={<IconArrowRight size={16}/>}>Entrar</Button>
      </form>

      <div className="mt-6 pt-6 border-t border-stone-200 text-center text-sm text-stone-600">
        Ainda não tem conta? <a href="#/register" onClick={(e) => { e.preventDefault(); navigate('register'); }} className="text-bc-red font-semibold hover:underline">Criar conta</a>
      </div>

      <div className="mt-4 text-center">
        <a href="#/admin" onClick={(e) => { e.preventDefault(); navigate('admin'); }} className="text-[11px] text-stone-400 uppercase tracking-[0.2em] hover:text-ink">Área administrativa</a>
      </div>
    </AuthShell>
  );
}

function RegisterPage() {
  const { register, loading } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [form, setForm] = React.useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = React.useState({});

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim())                 errs.firstName = 'Informe seu nome.';
    if (!form.lastName.trim())                  errs.lastName  = 'Informe seu sobrenome.';
    if (!form.email)                            errs.email     = 'Informe seu email.';
    else if (!emailRx.test(form.email))         errs.email     = 'Email inválido.';
    if (!form.password)                         errs.password  = 'Crie uma senha.';
    else if (form.password.length < 6)          errs.password  = 'Mínimo de 6 caracteres.';
    if (form.confirm !== form.password)         errs.confirm   = 'As senhas não coincidem.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Conta criada!', 'Bem-vindo ao Boxing Club.');
      navigate('home');
    } catch (err) { setErrors({ form: err.message }); }
  };

  // Password strength
  const pwScore = React.useMemo(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);
  const pwLabel = ['Fraca', 'Fraca', 'Média', 'Boa', 'Forte', 'Excelente'][pwScore];
  const pwColor = pwScore <= 1 ? 'bg-bc-red' : pwScore <= 2 ? 'bg-amber-500' : pwScore <= 3 ? 'bg-bc-green' : 'bg-bc-green';

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-bc-red font-semibold mb-3">
          <span className="w-6 h-px bg-bc-red"/> Junte-se ao time <span className="w-6 h-px bg-bc-red"/>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-wider text-ink leading-none mb-2">CRIAR CONTA</h1>
        <p className="text-sm text-stone-600">Vamos preparar tudo para o seu primeiro treino.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Nome" placeholder="João" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} error={errors.firstName}/>
          <Input label="Sobrenome" placeholder="Silva" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} error={errors.lastName}/>
        </div>
        <Input label="Email" type="email" autoComplete="email" placeholder="voce@email.com" icon={<IconMail size={16}/>} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email}/>
        <div>
          <Input label="Senha" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" icon={<IconLock size={16}/>} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password}/>
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0,1,2,3,4].map((i) => <div key={i} className={`h-1 flex-1 ${i < pwScore ? pwColor : 'bg-stone-200'} transition-colors`}/>)}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">Força da senha: <span className="font-semibold text-ink">{pwLabel}</span></div>
            </div>
          )}
        </div>
        <Input label="Confirmar senha" type="password" autoComplete="new-password" placeholder="Repita a senha" icon={<IconLock size={16}/>} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm}/>

        {errors.form && <div className="bg-bc-red/5 border border-bc-red/30 text-bc-red text-sm px-4 py-3 flex items-center gap-2"><IconAlertTriangle size={16}/>{errors.form}</div>}

        <Button type="submit" variant="green" size="lg" className="w-full" loading={loading} rightIcon={<IconArrowRight size={16}/>}>Criar minha conta</Button>
      </form>

      <div className="mt-6 pt-6 border-t border-stone-200 text-center text-sm text-stone-600">
        Já tem conta? <a href="#/login" onClick={(e) => { e.preventDefault(); navigate('login'); }} className="text-bc-green font-semibold hover:underline">Entrar</a>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 bg-cream min-h-[100vh] overflow-hidden flex items-center">
      <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-32 top-0 w-[40%] h-full bg-bc-green/[0.04] -skew-x-12"/>
        <div className="absolute -left-32 bottom-0 w-[30%] h-full bg-bc-red/[0.04] skew-x-12"/>
      </div>

      <div className="relative w-full max-w-md mx-auto px-5 sm:px-8 animate-reveal-up">
        <div className="bg-white border border-stone-200 shadow-[0_30px_80px_-30px_rgba(13,107,58,0.3)] p-8 sm:p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
          <div className="flex justify-center mb-6">
            <img src={window.LOGO_DATA} alt="Boxing Club" className="w-14 h-14 object-contain"/>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LoginPage, RegisterPage });
