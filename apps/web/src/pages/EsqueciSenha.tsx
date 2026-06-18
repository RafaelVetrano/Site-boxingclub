import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { IconMail, IconCheck } from '@/icons';
import { useForgotPassword } from '@/api/auth';
import { AuthShell } from './Login';

const schema = z.object({
  email: z.string().email('E-mail inválido.'),
});

export function EsqueciSenha() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.email?.[0] ?? '');
      return;
    }
    setError('');

    await forgot.mutateAsync(email.trim());
    setDone(true);
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-bc-green font-semibold mb-3">
          <span className="w-6 h-px bg-bc-green"/> Recuperar acesso <span className="w-6 h-px bg-bc-green"/>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider text-ink leading-none mb-2">ESQUECI A SENHA</h1>
        <p className="text-sm text-stone-600">Enviaremos um link para redefinir sua senha.</p>
      </div>

      {done ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-bc-green/10 flex items-center justify-center mx-auto mb-4">
            <IconCheck size={32} className="text-bc-green"/>
          </div>
          <p className="text-sm text-stone-600 mb-6">
            Se esse e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também a pasta de spam.
          </p>
          <Link to="/login">
            <Button variant="outline" size="md" className="w-full">Voltar para o login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            icon={<IconMail size={16}/>}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />

          <Button
            type="submit"
            variant="green"
            size="lg"
            className="w-full"
            loading={forgot.isPending}
          >
            Enviar link
          </Button>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-stone-200 text-center text-sm text-stone-600">
        Lembrou a senha?{' '}
        <Link to="/login" className="text-bc-green font-semibold hover:underline">
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}
