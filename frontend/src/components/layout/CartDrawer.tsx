import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/stores/toastStore';
import { Drawer, EmptyState, Button, ProductGlyph, brl } from '@/components/ui';
import { IconShoppingCart, IconMinus, IconPlus, IconTrash, IconArrowRight } from '@/icons';
import { useCart, useUpdateCartItem, useClearCart, useCreateOrder } from '@/api/hooks';
import { useAuthStore } from '@/stores/authStore';

export function CartDrawer() {
  const { items, isOpen, close, setItems } = useCartStore();
  const { user } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const { data: serverCart } = useCart(!!user);
  const updateItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (serverCart) {
      setItems(
        serverCart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          glyph: i.glyph,
          image: i.image,
        }))
      );
    }
  }, [serverCart, setItems]);

  if (!isOpen) return null;

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const handleUpdateQty = (productId: string, qty: number) => {
    updateItem.mutate({ productId, qty });
  };

  const handleClear = () => {
    clearCart.mutate();
  };

  const handleCheckout = () => {
    createOrder.mutate(undefined, {
      onSuccess: (order) => {
        toast.success('Pedido criado!', `Pedido #${order.number} — Total: ${brl(order.total)}`);
        close();
        navigate(`/checkout/${order.id}`);
      },
      onError: (e: any) => {
        const msg = e?.response?.data?.message || 'Tente novamente.';
        toast.error('Não foi possível finalizar', msg);
      },
    });
  };

  return (
    <Drawer onClose={close} title={`Carrinho (${count})`}>
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="Carrinho vazio"
            message="Adicione produtos da nossa loja para começar."
            icon={<IconShoppingCart size={28} />}
            action={<Button variant="green" onClick={() => { close(); navigate('/loja'); }}>Ir para a loja</Button>}
          />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map((it) => (
              <div key={it.productId} className="flex gap-3 bg-cream border border-stone-200 p-3">
                <div className="w-20 h-20 bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {it.image
                    ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    : <ProductGlyph glyph={it.glyph || 'box'} color="#0d6b3a" className="w-12 h-12" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-lg tracking-wider text-ink truncate">{it.name}</h4>
                  <div className="text-sm text-stone-600 mb-2">{brl(it.price)} <span className="text-xs">cada</span></div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-stone-300">
                      <button
                        onClick={() => handleUpdateQty(it.productId, it.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-stone-100"
                      >
                        <IconMinus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                      <button
                        onClick={() => handleUpdateQty(it.productId, it.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-stone-100"
                      >
                        <IconPlus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleUpdateQty(it.productId, 0)}
                      className="ml-auto text-stone-400 hover:text-bc-red p-1"
                      aria-label="Remover"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="font-display text-lg tracking-wider text-ink">{brl(it.price * it.qty)}</span>
                </div>
              </div>
            ))}
            <button
              onClick={handleClear}
              className="text-xs text-stone-500 hover:text-bc-red uppercase tracking-widest mt-3"
            >
              Limpar carrinho
            </button>
          </div>
          <footer className="border-t border-stone-200 px-5 py-5 bg-cream flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-600">Subtotal</span>
              <span className="font-display text-3xl tracking-wider text-ink">{brl(total)}</span>
            </div>
            <Button
              variant="green"
              className="w-full"
              size="lg"
              loading={createOrder.isPending}
              onClick={handleCheckout}
              rightIcon={<IconArrowRight size={16} />}
            >
              Finalizar pedido
            </Button>
          </footer>
        </>
      )}
    </Drawer>
  );
}
