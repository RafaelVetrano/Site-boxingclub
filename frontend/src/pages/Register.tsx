import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { IconMail, IconArrowRight, IconAlertTriangle } from '@/icons';
import { useRegister, useResendVerification } from '@/api/auth';
import { useToastStore } from '@/stores/toastStore';
import { AuthShell } from './Login';

// ── Schema ────────────────────────────────────────────────────────
const schema = z
  .object({
    firstName: z.string().min(1, 'Informe seu nome.').max(80),
    lastName: z.string().min(1, 'Informe seu sobrenome.').max(80),
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(6, 'Mínimo de 6 caracteres.').max(100),
    confirm: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem.',
    path: ['confirm'],
  });

// ── Password strength (exact MVP logic) ──────────────────────────
function usePasswordStrength(password: string) {
  return useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['Fraca', 'Fraca', 'Média', 'Boa', 'Forte', 'Excelente'];
    const label = labels[score];
    const color = score <= 1 ? 'bg-bc-red' : score <= 3 ? 'bg-amber-500' : 'bg-bc-green';
    return { score, label, color };
  }, [password]);
}

// ── Register ──────────────────────────────────────────────────────
export function Register() {
  const addToast = useToastStore((s) => s.add);
  const register = useRegister();
  const resend = useResendVerification();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const pw = usePasswordStrength(form.password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        firstName: flat.firstName?.[0] ?? '',
        lastName: flat.lastName?.[0] ?? '',
        email: flat.email?.[0] ?? '',
        password: flat.password?.[0] ?? '',
        confirm: flat.confirm?.[0] ?? '',
      });
      return;
    }
    setErrors({});

    try {
      await register.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setDone(true);
    } catch (err: any) {
      const code = err?.response?.data?.error;
      if (code === 'EMAIL_TAKEN') {
        setErrors({ email: 'Este e-mail já está em uso.' });
      } else {
        setErrors({ form: err?.response?.data?.message ?? 'Erro ao criar conta.' });
      }
    }
  };

  const handleResend = async () => {
    try {
      await resend.mutateAsync(form.email.trim());
      addToast({ type: 'success', title: 'E-mail reenviado!', message: 'Verifique sua caixa de entrada.' });
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Não foi possível reenviar o e-mail.' });
    }
  };

  if (done) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-bc-green font-semibold mb-3">
            <span className="w-6 h-px bg-bc-green"/> Conta criada <span className="w-6 h-px bg-bc-green"/>
          </div>
          <h1 className="font-display text-5xl tracking-wider text-ink leading-none mb-4">VERIFIQUE SEU E-MAIL</h1>
          <p className="text-sm text-stone-600 mb-6">
            Enviamos um link de confirmação para <strong>{form.email}</strong>. Clique no link para ativar sua conta.
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={handleResend}
            loading={resend.isPending}
            className="w-full"
          >
            Reenviar e-mail
          </Button>
          <div className="mt-4 text-center text-sm text-stone-600">
            Já confirmou?{' '}
            <Link to="/login" className="text-bc-green font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

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
          <Input
            label="Nome"
            placeholder="João"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            error={errors.firstName}
          />
          <Input
            label="Sobrenome"
            placeholder="Silva"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName}
          />
        </div>

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

        <div>
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 ${i < pw.score ? pw.color : 'bg-stone-200'} transition-colors`}/>
                ))}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">
                Força da senha: <span className="font-semibold text-ink">{pw.label}</span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          error={errors.confirm}
        />

        {errors.form && (
          <div className="bg-bc-red/5 border border-bc-red/30 text-bc-red text-sm px-4 py-3 flex items-center gap-2">
            <IconAlertTriangle size={16}/>
            {errors.form}
          </div>
        )}

        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          loading={register.isPending}
          rightIcon={<IconArrowRight size={16}/>}
        >
          Criar minha conta
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-stone-200 text-center text-sm text-stone-600">
        Já tem conta?{' '}
        <Link to="/login" className="text-bc-green font-semibold hover:underline">
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}
