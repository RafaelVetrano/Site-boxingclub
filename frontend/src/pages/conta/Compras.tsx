import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Skeleton, EmptyState, ProductGlyph, brl } from '@/components/ui';
import { IconShoppingBag, IconCheck, IconChevronDown, IconPackage } from '@/icons';
import { AccountShell } from './AccountShell';
import { useMyOrders, Order, StatusHistoryEntry } from '@/api/hooks';

// ── Status meta (mirrors services.js) ────────────────────────────
type BadgeColor = 'green' | 'red' | 'ink' | 'amber' | 'neutral';

const STATUS_META: Record<string, { label: string; badge: BadgeColor }> = {
  entregue:  { label: 'Entregue',   badge: 'green' },
  pago:      { label: 'Pago',       badge: 'green' },
  pendente:  { label: 'Pendente',   badge: 'amber' },
  nao_pago:  { label: 'Não pago',   badge: 'amber' },
  cancelado: { label: 'Cancelado',  badge: 'red' },
  recusado:  { label: 'Recusado',   badge: 'red' },
  expirado:  { label: 'Expirado',   badge: 'neutral' },
  erro:      { label: 'Erro',       badge: 'red' },
};

const PAYMENT_META: Record<string, string> = {
  pix:         'PIX',
  credit_card: 'Cartão de crédito',
  debit_card:  'Cartão de débito',
  boleto:      'Boleto',
};

// ── Order Card ────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const meta    = STATUS_META[order.status];
  const payment = PAYMENT_META[order.paymentMethod];
  const dateObj = new Date(order.date);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">
            Pedido #{order.number}
          </div>
          <div className="font-display text-2xl tracking-wider text-ink">
            {dateObj.toLocaleString('pt-BR')}
          </div>
          {payment && (
            <div className="text-xs text-stone-500 mt-1">
              Pagamento: <span className="text-ink font-semibold">{payment}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <Badge color={meta?.badge ?? 'neutral'}>{meta?.label ?? order.status}</Badge>
          <div className="font-display text-3xl tracking-wider text-ink mt-1">{brl(order.total)}</div>
        </div>
      </div>

      {/* Expandable items */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-ink uppercase tracking-widest mb-3"
      >
        <IconChevronDown size={13} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
        {expanded ? 'Ocultar itens' : `Ver ${order.items.length} ${order.items.length === 1 ? 'item' : 'itens'}`}
      </button>

      {expanded && (
        <ul className="border-t border-stone-200 pt-4 space-y-3 mb-4">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {it.image
                  ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                  : <ProductGlyph glyph={it.glyph || 'box'} color="#0d6b3a" className="w-6 h-6" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-ink font-semibold">{it.qty}×</span>{' '}
                <span className="text-sm text-stone-700 truncate">{it.name}</span>
              </div>
              <span className="text-sm text-stone-600 flex-shrink-0">{brl(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Status timeline */}
      {expanded && (order.statusHistory as StatusHistoryEntry[]).length > 0 && (
        <div className="border-t border-stone-200 pt-4">
          <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-3">Histórico</div>
          <ol className="relative border-l border-stone-200 space-y-3 pl-4">
            {(order.statusHistory as StatusHistoryEntry[]).map((h, idx) => {
              const hMeta = STATUS_META[h.status];
              return (
                <li key={idx} className="relative">
                  <div className="absolute -left-[18px] top-0.5 w-3 h-3 rounded-full border-2 border-stone-300 bg-white" />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Badge color={hMeta?.badge ?? 'neutral'} className="text-[9px]">
                      {hMeta?.label ?? h.status}
                    </Badge>
                    <span className="text-[10px] text-stone-400">
                      {new Date(h.at).toLocaleString('pt-BR')}
                    </span>
                    {h.note && <span className="text-xs text-stone-500">— {h.note}</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {order.deliveredAt && (
        <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-bc-green flex items-center gap-2">
          <IconCheck size={14} strokeWidth={3} />
          Entregue em {new Date(order.deliveredAt).toLocaleString('pt-BR')}
        </div>
      )}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export function Compras() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useMyOrders();

  return (
    <AccountShell active="compras">
      {isLoading ? (
        <Card className="p-7 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </Card>
      ) : !orders || orders.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title="Nenhum pedido ainda"
            message="Quando você comprar da nossa loja, seus pedidos aparecem aqui."
            icon={<IconPackage size={28} />}
            action={
              <button
                onClick={() => navigate('/loja')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-bc-green text-white text-sm font-semibold uppercase tracking-widest hover:bg-bc-green/90 transition-colors"
              >
                <IconShoppingBag size={16} />
                Ir para a loja
              </button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </AccountShell>
  );
}
