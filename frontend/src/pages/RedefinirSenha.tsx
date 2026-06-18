import { useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { IconAlertTriangle } from '@/icons';
import { useResetPassword } from '@/api/auth';
import { useToastStore } from '@/stores/toastStore';
import { AuthShell } from './Login';

const schema = z
  .object({
    password: z.string().min(6, 'Mínimo de 6 caracteres.').max(100),
    confirm: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem.',
    path: ['confirm'],
  });

function usePasswordStrength(password: string) {
  return useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['Fraca', 'Fraca', 'Média', 'Boa', 'Forte', 'Excelente'];
    const color = score <= 1 ? 'bg-bc-red' : score <= 3 ? 'bg-amber-500' : 'bg-bc-green';
    return { score, label: labels[score], color };
  }, [password]);
}

export function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.add);
  const reset = useResetPassword();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pw = usePasswordStrength(form.password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        password: flat.password?.[0] ?? '',
        confirm: flat.confirm?.[0] ?? '',
      });
      return;
    }
    setErrors({});

    try {
      await reset.mutateAsync({ token: token!, password: form.password });
      addToast({ type: 'success', title: 'Senha redefinida!', message: 'Faça login com sua nova senha.' });
      navigate('/login');
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message ?? 'Token inválido ou expirado.' });
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-bc-red font-semibold mb-3">
          <span className="w-6 h-px bg-bc-red"/> Nova senha <span className="w-6 h-px bg-bc-red"/>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-ink leading-none mb-2">REDEFINIR SENHA</h1>
        <p className="text-sm text-stone-600">Escolha uma senha forte para sua conta.</p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Input
            label="Nova senha"
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
          label="Confirmar nova senha"
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
          variant="primary"
          size="lg"
          className="w-full"
          loading={reset.isPending}
        >
          Redefinir senha
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-stone-200 text-center text-sm text-stone-600">
        <Link to="/login" className="text-bc-green font-semibold hover:underline">
          Voltar para o login
        </Link>
      </div>
    </AuthShell>
  );
}
