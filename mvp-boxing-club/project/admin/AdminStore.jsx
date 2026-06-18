// ============================================================
// Admin Store — CRUD for products
// ============================================================
function AdminStorePage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState(null); // null | 'new' | product

  const reload = () => setItems(window.BCServices.StoreService.list());
  React.useEffect(() => { setTimeout(reload, 200); }, []);

  const filtered = React.useMemo(() => {
    if (!items) return [];
    return items.filter((p) => !search || `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const onSave = (data) => {
    if (editing === 'new') {
      window.BCServices.StoreService.create(data);
      toast.success('Produto criado', data.name);
    } else {
      window.BCServices.StoreService.update(editing.id, data);
      toast.success('Produto atualizado');
    }
    reload(); setEditing(null);
  };

  const onDelete = async (p) => {
    const ok = await confirm({ title: 'Excluir produto?', message: `"${p.name}" será removido permanentemente.`, confirmLabel: 'Excluir', danger: true });
    if (!ok) return;
    window.BCServices.StoreService.remove(p.id);
    reload(); toast.success('Produto excluído');
  };

  return (
    <AdminLayout active="loja" title="Loja / Produtos">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto…" className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"/>
        </div>
        <Button variant="primary" onClick={() => setEditing('new')} leftIcon={<IconPlus size={16}/>}>Novo produto</Button>
      </div>

      {items === null ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState title="Nenhum produto" message="Comece criando o primeiro produto da loja." icon={<IconShoppingBag size={28}/>}
            action={<Button variant="primary" onClick={() => setEditing('new')} leftIcon={<IconPlus size={14}/>}>Criar produto</Button>}/>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <div className={`relative aspect-square ${p.active ? 'bg-cream' : 'bg-stone-100'} flex items-center justify-center overflow-hidden group`}>
                {(p.images || []).length > 0
                  ? <ProductCarousel images={p.images} glyph={p.glyph} alt={p.name}/>
                  : <ProductGlyph glyph={p.glyph || 'box'} color={p.active ? '#0d6b3a' : '#999'} className="w-2/3 h-2/3"/>}
                {!p.active && <Badge color="neutral" className="absolute top-2 left-2 z-10">Inativo</Badge>}
                {p.stock <= 0 && p.active && <Badge color="red" className="absolute top-2 left-2 z-10">Esgotado</Badge>}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">{p.category}</div>
                <h3 className="font-display text-lg tracking-wider text-ink leading-tight mb-1">{p.name}</h3>
                <div className="text-xs text-stone-500 mb-3 line-clamp-2 flex-1">{p.description}</div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-display text-xl tracking-wider text-ink">{BRL(p.price)}</span>
                  <span className="text-xs text-stone-500">Estoque: <span className="font-semibold text-ink">{p.stock}</span></span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-widest border border-stone-300 hover:bg-bc-green hover:text-white hover:border-bc-green transition-colors"><IconEdit size={12}/>Editar</button>
                  <button onClick={() => onDelete(p)} className="px-3 py-2 text-stone-500 hover:text-bc-red hover:bg-bc-red/5 border border-stone-300 hover:border-bc-red transition-colors" aria-label="Excluir"><IconTrash size={14}/></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <ProductForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </AdminLayout>
  );
}

function ProductForm({ item, onClose, onSave }) {
  const [form, setForm] = React.useState(() => item || {
    name: '', description: '', price: 0, category: 'Equipamento', stock: 0, image: null, glyph: 'box', active: true,
  });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Informe o nome.';
    if (form.price < 0 || isNaN(Number(form.price))) errs.price = 'Preço inválido.';
    if (form.stock < 0 || isNaN(Number(form.stock))) errs.stock = 'Estoque inválido.';
    setErrors(errs); if (Object.keys(errs).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
    setSaving(false);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setForm((f) => ({ ...f, image: r.result }));
    r.readAsDataURL(file);
  };

  const glyphOptions = ['glove', 'bandage', 'shirt', 'shinguard', 'rope', 'box'];
  const hasImages = (form.images || []).length > 0;

  return (
    <Modal onClose={onClose} size="xl">
      <h3 className="font-display text-3xl tracking-wider text-ink mb-1">{item ? 'Editar produto' : 'Novo produto'}</h3>
      <p className="text-sm text-stone-600 mb-6">Preencha os dados e adicione as imagens do produto.</p>

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
        {/* Images block */}
        <div className="sm:col-span-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600 mb-2 flex items-center justify-between">
            <span>Imagens do produto</span>
            {hasImages && <span className="text-stone-400 normal-case tracking-normal">A primeira imagem é a capa</span>}
          </div>
          <MultiImageUpload value={form.images || []} onChange={(images) => setForm({ ...form, images })} />
          {!hasImages && (
            <div className="mt-4 bg-cream border border-stone-200 p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">Ou escolha um ícone (usado quando não há imagens)</div>
              <div className="flex flex-wrap gap-2">
                {glyphOptions.map((g) => (
                  <button key={g} type="button" onClick={() => setForm({ ...form, glyph: g })} className={`w-14 h-14 bg-white border flex items-center justify-center transition-colors ${form.glyph === g ? 'border-ink ring-2 ring-bc-green/30' : 'border-stone-200 hover:border-ink'}`}>
                    <ProductGlyph glyph={g} color="#0d6b3a" className="w-9 h-9"/>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} className="sm:col-span-2"/>
        <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2"/>
        <Input label="Preço (R$)" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price}/>
        <Input label="Estoque" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} error={errors.stock}/>
        <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="Equipamento">Equipamento</option>
          <option value="Acessório">Acessório</option>
          <option value="Vestuário">Vestuário</option>
          <option value="Suplemento">Suplemento</option>
          <option value="Outro">Outro</option>
        </Select>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600 mb-1.5">Status</div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-bc-green' : 'bg-stone-300'}`}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="sr-only"/>
              <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`}/>
            </span>
            <span className="text-sm text-stone-700">{form.active ? 'Ativo' : 'Inativo'}</span>
          </label>
        </div>

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-stone-200">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="green" loading={saving} leftIcon={<IconCheck size={16}/>}>{item ? 'Salvar alterações' : 'Criar produto'}</Button>
        </div>
      </form>
    </Modal>
  );
}

Object.assign(window, { AdminStorePage });
