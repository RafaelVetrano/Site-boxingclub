import { useParams, Link, Navigate } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Spinner, brl } from '@/components/ui';
import { IconShoppingBag, IconArrowRight } from '@/icons';
import { useMyOrder } from '@/api/hooks';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;

if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
}

export function Checkout() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useMyOrder(orderId ?? '');

  if (!orderId) return <Navigate to="/loja" replace />;

  return (
    <section className="relative pt-28 pb-24 sm:pt-36 bg-cream min-h-[80vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-2xl mx-auto px-5 sm:px-8">
        {/* Logo + header */}
        <div className="text-center mb-8 animate-reveal-up">
          <div className="text-xs uppercase tracking-[0.3em] text-bc-green font-semibold mb-2">Finalizar compra</div>
          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none">PAGAMENTO</h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size={36} className="text-bc-green" />
          </div>
        )}

        {isError && (
          <div className="bg-white border border-stone-200 p-8 text-center">
            <p className="text-stone-600 mb-4">Não foi possível carregar o pedido.</p>
            <Link
              to="/loja"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bc-green text-white text-sm font-semibold uppercase tracking-widest hover:bg-bc-green/90 transition-colors"
            >
              Voltar à loja
            </Link>
          </div>
        )}

        {order && (
          <div className="animate-reveal-up" style={{ animationDelay: '100ms' }}>
            {/* Order summary */}
            <div className="bg-white border border-stone-200 p-6 mb-6">
              <div className="h-0.5 -mx-6 -mt-6 mb-6 flex">
                <div className="flex-1 bg-bc-green" />
                <div className="flex-1 bg-white border-t border-b border-stone-200" />
                <div className="flex-1 bg-bc-red" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <IconShoppingBag size={18} className="text-bc-green" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-stone-500">Pedido</div>
                  <div className="font-display text-xl tracking-wider text-ink">#{order.number}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs uppercase tracking-widest text-stone-500">Total</div>
                  <div className="font-display text-2xl tracking-wider text-ink">{brl(order.total)}</div>
                </div>
              </div>
              <ul className="space-y-1 border-t border-stone-100 pt-3">
                {order.items.map((it) => (
                  <li key={it.id} className="flex justify-between text-sm text-stone-600">
                    <span>
                      <span className="font-semibold text-ink">{it.qty}×</span> {it.name}
                    </span>
                    <span>{brl(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Brick or fallback */}
            {MP_PUBLIC_KEY && order.mpPreferenceId ? (
              <div className="bg-white border border-stone-200 p-6">
                <Payment
                  initialization={{
                    amount: order.total,
                    preferenceId: order.mpPreferenceId,
                  }}
                  customization={{
                    paymentMethods: {
                      creditCard: 'all',
                      debitCard: 'all',
                      ticket: 'all',
                      bankTransfer: 'all',
                      atm: 'all',
                    },
                  }}
                  onSubmit={async () => {
                    // MP Brick handles redirect via back_urls after submission
                  }}
                  onError={(err) => {
                    console.error('[MP Brick]', err);
                  }}
                />
              </div>
            ) : (
              <div className="bg-white border border-stone-200 p-8 text-center">
                <p className="text-stone-600 mb-2 text-sm">
                  {!MP_PUBLIC_KEY
                    ? 'VITE_MP_PUBLIC_KEY não configurado.'
                    : 'Preferência de pagamento não gerada. Tente criar o pedido novamente.'}
                </p>
                <Link
                  to="/loja"
                  className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 text-sm font-semibold uppercase tracking-widest border border-stone-300 text-stone-700 hover:border-ink hover:text-ink transition-colors"
                >
                  Voltar à loja <IconArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
