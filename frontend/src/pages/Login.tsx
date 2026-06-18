import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { IconMail, IconArrowRight, IconAlertTriangle } from '@/icons';
import { useLogin, useResendVerification } from '@/api/auth';
import { useToastStore } from '@/stores/toastStore';

// ── AuthShell ─────────────────────────────────────────────────────
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 bg-cream min-h-[100vh] overflow-hidden flex items-center">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green"/>
        <div className="flex-1 bg-white"/>
        <div className="flex-1 bg-bc-red"/>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-32 top-0 w-[40%] h-full bg-bc-green/[0.04] -skew-x-12"/>
        <div className="absolute -left-32 bottom-0 w-[30%] h-full bg-bc-red/[0.04] skew-x-12"/>
      </div>
      <div className="relative w-full max-w-md mx-auto px-5 sm:px-8 animate-reveal-up">
        <div className="bg-white border border-stone-200 shadow-[0_30px_80px_-30px_rgba(13,107,58,0.3)] p-8 sm:p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-bc-green"/>
            <div className="flex-1 bg-white"/>
            <div className="flex-1 bg-bc-red"/>
          </div>
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Boxing Club" className="w-14 h-14 object-contain"/>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

// ── Schema ────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

// ── Login ─────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/';
  const addToast = useToastStore((s) => s.add);

  const login = useLogin();
  const resend = useResendVerification();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notVerifiedEmail, setNotVerifiedEmail] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0] ?? '',
        password: flat.password?.[0] ?? '',
      });
      return;
    }
    setErrors({});
    setNotVerifiedEmail(null);

    try {
      await login.mutateAsync({ email: form.email.trim(), password: form.password });
      addToast({ type: 'success', title: 'Bem-vindo de volta!', message: 'Login efetuado com sucesso.' });
      navigate(from, { replace: true });
    } catch (err: any) {
      const code = err?.response?.data?.error;
      if (code === 'EMAIL_NOT_VERIFIED') {
        setNotVerifiedEmail(form.email.trim());
      } else {
        setErrors({ form: err?.response?.data?.message ?? 'Erro ao entrar.' });
      }
    }
  };

  const handleResend = async () => {
    if (!notVerifiedEmail) return;
    try {
      await resend.mutateAsync(notVerifiedEmail);
      addToast({ type: 'success', title: 'E-mail reenviado!', message: 'Verifique sua caixa de entrada.' });
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Não foi possível reenviar o e-mail.' });
    }
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

      {notVerifiedEmail && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 mb-4 flex items-start gap-3">
          <IconAlertTriangle size={16} className="mt-0.5 shrink-0"/>
          <div className="flex-1 min-w-0">
            <span>Confirme seu e-mail antes de entrar. </span>
            <button
              onClick={handleResend}
              disabled={resend.isPending}
              className="font-semibold underline hover:no-underline disabled:opacity-60"
            >
              {resend.isPending ? 'Enviando...' : 'Reenviar e-mail'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          icon={<IconMail size={16}/>}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link to="/esqueci-senha" className="text-xs text-stone-500 hover:text-bc-green transition-colors">
            Esqueci minha senha
          </Link>
        </div>

        {errors.form && (
          <div className="bg-bc-red/5 border border-bc-red/30 text-bc-red text-sm px-4 py-3 flex items-center gap-2">
            <IconAlertTriangle size={16}/>
            {errors.form}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={login.isPending}
          rightIcon={<IconArrowRight size={16}/>}
        >
          Entrar
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-stone-200 text-center text-sm text-stone-600">
        Ainda não tem conta?{' '}
        <Link to="/register" className="text-bc-red font-semibold hover:underline">
          Criar conta
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link to="/admin" className="text-[11px] text-stone-400 uppercase tracking-[0.2em] hover:text-ink transition-colors">
          Área administrativa
        </Link>
      </div>
    </AuthShell>
  );
}

export { AuthShell };
