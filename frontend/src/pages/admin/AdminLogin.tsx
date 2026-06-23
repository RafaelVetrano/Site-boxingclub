import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useAdminLogin } from '@/api/auth';
import { Button, Input } from '@/components/ui';
import { IconUser, IconLock, IconArrowLeft, IconArrowRight, IconAlertTriangle } from '@/icons';

export function AdminLogin() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const toast = useToast();
  const login = useAdminLogin();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = 'Informe o email.';
    if (!form.password) errs.password = 'Informe a senha.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    login.mutate(form, {
      onSuccess: () => {
        toast.success('Acesso liberado', 'Bem-vindo ao painel administrativo.');
        navigate('/admin/dashboard');
      },
      onError: (err: any) => {
        setErrors({ form: err?.response?.data?.message || 'Credenciais inválidas.' });
      },
    });
  };

  return (
    <section className="min-h-screen bg-ink relative overflow-hidden flex items-center justify-center px-5 py-12">
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-red" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-green" />
      </div>

      <div className="relative w-full max-w-md animate-reveal-up">
        <Link to="/" className="flex items-center gap-2 text-stone-400 hover:text-white text-xs uppercase tracking-[0.25em] mb-6">
          <IconArrowLeft size={14} /> Voltar ao site
        </Link>

        <div className="bg-white p-9 relative">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
          </div>

          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 bg-bc-green flex items-center justify-center text-white font-display text-xl tracking-wider">BC</div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-bc-red font-semibold">Boxing Club</div>
              <div className="font-display text-2xl tracking-wider text-ink leading-none">PAINEL ADMIN</div>
            </div>
          </div>

          <h2 className="font-display text-3xl tracking-wider text-ink mb-1">Login administrador</h2>
          <p className="text-sm text-stone-600 mb-6">Acesso restrito à equipe da academia.</p>

          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="admin@boxingclub.com"
              icon={<IconUser size={16} />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<IconLock size={16} />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            {errors.form && (
              <div className="bg-bc-red/5 border border-bc-red/30 text-bc-red text-sm px-4 py-3 flex items-center gap-2">
                <IconAlertTriangle size={16} />{errors.form}
              </div>
            )}

            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="w-full"
              loading={login.isPending}
              rightIcon={<IconArrowRight size={16} />}
            >
              Entrar no painel
            </Button>
          </form>

        </div>
      </div>
    </section>
  );
}
