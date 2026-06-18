// ============================================================
// Cart Drawer — opens from right side of screen
// ============================================================
function CartDrawer() {
  const { items, total, setQty, remove, count, open, setOpen, clear } = useCart();
  const { user } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  if (!open) return null;

  const checkout = async () => {
    setLoading(true);
    try {
      const order = await window.BCServices.OrderService.checkout(user);
      toast.success('Pedido confirmado!', `Total: ${BRL(order.total)}`);
      setOpen(false);
      navigate('conta/compras');
    } catch (e) {
      toast.error('Não foi possível finalizar', e.message);
    } finally { setLoading(false); }
  };

  return (
    <Drawer onClose={() => setOpen(false)} title={`Carrinho (${count})`}>
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title="Carrinho vazio"
            message="Adicione produtos da nossa loja para começar."
            icon={<IconShoppingCart size={28}/>}
            action={<Button variant="green" onClick={() => { setOpen(false); navigate('loja'); }}>Ir para a loja</Button>}
          />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map((it) => (
              <div key={it.productId} className="flex gap-3 bg-cream border border-stone-200 p-3">
                <div className="w-20 h-20 bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {it.image
                    ? <img src={it.image} alt={it.name} className="w-full h-full object-cover"/>
                    : <ProductGlyph glyph={it.glyph || 'box'} color="#0d6b3a" className="w-12 h-12"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-lg tracking-wider text-ink truncate">{it.name}</h4>
                  <div className="text-sm text-stone-600 mb-2">{BRL(it.price)} <span className="text-xs">cada</span></div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-stone-300">
                      <button onClick={() => setQty(it.productId, it.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-stone-100"><IconMinus size={12}/></button>
                      <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                      <button onClick={() => setQty(it.productId, it.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-stone-100"><IconPlus size={12}/></button>
                    </div>
                    <button onClick={() => remove(it.productId)} className="ml-auto text-stone-400 hover:text-bc-red p-1" aria-label="Remover">
                      <IconTrash size={16}/>
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="font-display text-lg tracking-wider text-ink">{BRL(it.price * it.qty)}</span>
                </div>
              </div>
            ))}
            {items.length > 0 && (
              <button onClick={clear} className="text-xs text-stone-500 hover:text-bc-red uppercase tracking-widest mt-3">Limpar carrinho</button>
            )}
          </div>
          <footer className="border-t border-stone-200 px-5 py-5 bg-cream flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-600">Subtotal</span>
              <span className="font-display text-3xl tracking-wider text-ink">{BRL(total)}</span>
            </div>
            <Button variant="green" className="w-full" size="lg" loading={loading} onClick={checkout} rightIcon={<IconArrowRight size={16}/>}>
              Finalizar pedido
            </Button>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest text-center mt-3">Pagamento simulado · MVP</p>
          </footer>
        </>
      )}
    </Drawer>
  );
}

Object.assign(window, { CartDrawer });
