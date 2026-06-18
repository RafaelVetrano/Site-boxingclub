import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Spinner } from '@/components/ui';
import { IconCheck, IconX } from '@/icons';
import { useVerifyEmail, useResendByToken } from '@/api/auth';
import { useToastStore } from '@/stores/toastStore';
import { AuthShell } from './Login';

function getErrorInfo(errorCode: string | undefined) {
  if (errorCode === 'TOKEN_EXPIRED') {
    return {
      title: 'LINK EXPIRADO',
      message: 'O link de confirmação expirou. Solicite um novo.',
    };
  }
  return {
    title: 'LINK INVÁLIDO',
    message: 'O link expirou ou já foi utilizado.',
  };
}

export function ConfirmarEmail() {
  const { token } = useParams<{ token: string }>();
  const addToast = useToastStore((s) => s.add);
  const calledRef = useRef(false);

  const verify = useVerifyEmail();
  const resend = useResendByToken();

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    if (token) verify.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async () => {
    if (!token) return;
    try {
      await resend.mutateAsync(token);
      addToast({ type: 'success', title: 'E-mail reenviado!', message: 'Verifique sua caixa de entrada.' });
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Não foi possível reenviar o e-mail.' });
    }
  };

  const errorCode = verify.isError
    ? (verify.error as any)?.response?.data?.code
    : undefined;
  const { title: errorTitle, message: errorMessage } = getErrorInfo(errorCode);

  return (
    <AuthShell>
      <div className="text-center py-4">
        {verify.isPending && (
          <>
            <Spinner size={40} className="mx-auto text-bc-green mb-6"/>
            <h1 className="font-display text-4xl tracking-wider text-ink mb-2">VERIFICANDO</h1>
            <p className="text-sm text-stone-600">Aguarde um momento...</p>
          </>
        )}

        {verify.isSuccess && (
          <>
            <div className="w-16 h-16 bg-bc-green/10 flex items-center justify-center mx-auto mb-6">
              <IconCheck size={32} className="text-bc-green"/>
            </div>
            <h1 className="font-display text-4xl tracking-wider text-ink mb-2">E-MAIL VERIFICADO</h1>
            <p className="text-sm text-stone-600 mb-6">Sua conta foi confirmada com sucesso.</p>
            <Link to="/login">
              <Button variant="green" size="lg" className="w-full">ENTRAR</Button>
            </Link>
          </>
        )}

        {verify.isError && (
          <>
            <div className="w-16 h-16 bg-bc-red/10 flex items-center justify-center mx-auto mb-6">
              <IconX size={32} className="text-bc-red"/>
            </div>
            <h1 className="font-display text-4xl tracking-wider text-ink mb-2">{errorTitle}</h1>
            <p className="text-sm text-stone-600 mb-6">{errorMessage}</p>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleResend}
              loading={resend.isPending}
            >
              REENVIAR E-MAIL
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
