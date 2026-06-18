import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { IconArrowLeft } from '@/icons';

export function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-16 bg-cream">
      <div className="text-center px-5">
        <div className="font-display text-8xl tracking-wider text-bc-red mb-3">404</div>
        <h1 className="font-display text-3xl tracking-wider text-ink mb-2">Página não encontrada</h1>
        <p className="text-stone-600 mb-6">O endereço acessado não existe ou foi movido.</p>
        <Link to="/">
          <Button variant="primary" leftIcon={<IconArrowLeft size={16} />}>Voltar ao início</Button>
        </Link>
      </div>
    </section>
  );
}
