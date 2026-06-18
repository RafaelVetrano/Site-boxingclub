import { Link, useSearchParams } from 'react-router-dom';
import { IconArrowRight, IconShoppingBag } from '@/icons';

export function CheckoutFailure() {
  const [params] = useSearchParams();
  const orderId = params.get('external_reference') ?? '';
  const statusDetail = params.get('status_detail') ?? '';

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 bg-cream min-h-[80vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-lg mx-auto px-5 sm:px-8 text-center animate-reveal-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bc-red/10 flex items-center justify-center text-bc-red">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <div className="text-xs uppercase tracking-[0.3em] text-bc-red font-semibold mb-3">Falha no pagamento</div>
        <h1 className="font-display text-5xl sm:text-6xl text-ink mb-4">NÃO FOI DESSA VEZ</h1>

        <p className="text-stone-600 mb-2">
          Seu pagamento não foi processado.
          {statusDetail && (
            <> Motivo: <span className="font-semibold text-ink">{statusDetail.replace(/_/g, ' ')}</span>.</>
          )}
        </p>
        <p className="text-stone-500 text-sm mb-8">
          Verifique os dados do cartão e tente novamente, ou escolha outra forma de pagamento.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              to={`/checkout/${orderId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bc-green text-white text-sm font-semibold uppercase tracking-widest hover:bg-bc-green/90 transition-colors"
            >
              Tentar novamente <IconArrowRight size={14} />
            </Link>
          )}
          <Link
            to="/conta/compras"
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 text-sm font-semibold uppercase tracking-widest hover:border-ink hover:text-ink transition-colors"
          >
            <IconShoppingBag size={16} />
            Ver meus pedidos
          </Link>
        </div>
      </div>
    </section>
  );
}
