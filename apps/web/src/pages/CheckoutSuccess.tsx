import { Link, useSearchParams } from 'react-router-dom';
import { IconCheck, IconArrowRight, IconShoppingBag } from '@/icons';
import { brl } from '@/components/ui';
import { useMyOrder } from '@/api/hooks';

export function CheckoutSuccess() {
  const [params] = useSearchParams();
  const paymentId = params.get('payment_id') ?? '';
  const status = params.get('status') ?? '';
  const orderId = params.get('external_reference') ?? '';

  const { data: order } = useMyOrder(orderId);

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 bg-cream min-h-[80vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-lg mx-auto px-5 sm:px-8 text-center animate-reveal-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bc-green/10 flex items-center justify-center text-bc-green">
          <IconCheck size={36} strokeWidth={2.5} />
        </div>

        <div className="text-xs uppercase tracking-[0.3em] text-bc-green font-semibold mb-3">
          {status === 'pending' ? 'Pagamento em processamento' : 'Pagamento confirmado'}
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-ink mb-5">
          {status === 'pending' ? 'PROCESSANDO' : 'PEDIDO CONFIRMADO!'}
        </h1>

        {order ? (
          <div className="bg-white border border-stone-200 p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-stone-500">Pedido</div>
                <div className="font-display text-2xl tracking-wider text-ink">#{order.number}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-stone-500">Total</div>
                <div className="font-display text-2xl tracking-wider text-ink">{brl(order.total)}</div>
              </div>
            </div>
            {paymentId && (
              <p className="text-xs text-stone-400 truncate">ID do pagamento: {paymentId}</p>
            )}
          </div>
        ) : (
          <p className="text-stone-600 mb-8">
            {status === 'pending'
              ? 'Seu pagamento está sendo processado. Você receberá um e-mail de confirmação em breve.'
              : 'Obrigado pela sua compra! Você receberá um e-mail de confirmação em breve.'}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/conta/compras"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bc-green text-white text-sm font-semibold uppercase tracking-widest hover:bg-bc-green/90 transition-colors"
          >
            <IconShoppingBag size={16} />
            Ver meus pedidos
          </Link>
          <Link
            to="/loja"
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 text-sm font-semibold uppercase tracking-widest hover:border-ink hover:text-ink transition-colors"
          >
            Continuar comprando <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
