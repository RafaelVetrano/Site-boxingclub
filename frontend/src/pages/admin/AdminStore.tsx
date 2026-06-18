import { useState, useMemo, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import { useProducts } from '@/api/hooks';
import { useAdminCreateProduct, useAdminUpdateProduct, useAdminDeleteProduct } from '@/api/admin';
import { useToast } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import {
  Button, Card, Skeleton, EmptyState, Modal, Input, Select, Textarea, Badge, brl, ProductGlyph,
} from '@/components/ui';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconShoppingBag, IconCheck } from '@/icons';
import type { Product } from '@/api/hooks';

const GLYPH_OPTIONS = ['glove', 'bandage', 'shirt', 'shinguard', 'rope', 'box'] as const;

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  glyph: string;
  active: boolean;
  existingImages: string[];
  newFiles: File[];
  newPreviews: string[];
}

function ProductForm({
  item,
  onClose,
  onSave,
}: {
  item: Product | null;
  onClose: () => void;
  onSave: (state: ProductFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormState>(() => item
    ? {
        name: item.name,
        description: item.description,
        price: String(item.price),
        category: item.category,
        stock: String(item.stock),
        glyph: item.glyph,
        active: item.active,
        existingImages: item.images ?? [],
        newFiles: [],
        newPreviews: [],
      }
    : {
        name: '', description: '', price: '', category: 'Equipamento', stock: '0',
        glyph: 'box', active: true, existingImages: [], newFiles: [], newPreviews: [],
      }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasImages = form.existingImages.length + form.newPreviews.length > 0;

  const addFiles = (fl: FileList | null) => {
    const list = Array.from(fl ?? []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    list.forEach((f) => {
      const url = URL.createObjectURL(f);
      setForm((prev) => ({
        ...prev,
        newFiles: [...prev.newFiles, f],
        newPreviews: [...prev.newPreviews, url],
      }));
    });
  };

  const removeExisting = (idx: number) => {
    setForm((prev) => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== idx) }));
  };

  const removeNew = (idx: number) => {
    setForm((prev) => {
      URL.revokeObjectURL(prev.newPreviews[idx]);
      return {
        ...prev,
        newFiles: prev.newFiles.filter((_, i) => i !== idx),
        newPreviews: prev.newPreviews.filter((_, i) => i !== idx),
      };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Informe o nome.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Preço inválido.';
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Estoque inválido.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} size="xl">
      <h3 className="font-display text-3xl tracking-wider text-ink mb-1">{item ? 'Editar produto' : 'Novo produto'}</h3>
      <p className="text-sm text-stone-600 mb-6">Preencha os dados e adicione as imagens do produto.</p>

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
        {/* Images block */}
        <div className="sm:col-span-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600 mb-2">Imagens do produto</div>

          {(form.existingImages.length > 0 || form.newPreviews.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {form.existingImages.map((src, i) => (
                <div key={`ex-${i}`} className={`relative aspect-square bg-stone-50 border-2 overflow-hidden ${i === 0 && form.newPreviews.length === 0 ? 'border-bc-green' : 'border-stone-200'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && form.newPreviews.length === 0 && (
                    <span className="absolute top-1 left-1 bg-bc-green text-white text-[9px] font-bold uppercase px-1.5 py-0.5">Capa</span>
                  )}
                  <button type="button" onClick={() => removeExisting(i)} className="absolute top-1 right-1 w-6 h-6 bg-bc-red text-white flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              {form.newPreviews.map((src, i) => (
                <div key={`new-${i}`} className={`relative aspect-square bg-stone-50 border-2 overflow-hidden ${i === 0 && form.existingImages.length === 0 ? 'border-bc-green' : 'border-stone-200'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && form.existingImages.length === 0 && (
                    <span className="absolute top-1 left-1 bg-bc-green text-white text-[9px] font-bold uppercase px-1.5 py-0.5">Capa</span>
                  )}
                  <span className="absolute top-1 right-6 bg-amber-500 text-white text-[9px] font-bold px-1 py-0.5">NOVO</span>
                  <button type="button" onClick={() => removeNew(i)} className="absolute top-1 right-1 w-6 h-6 bg-bc-red text-white flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-300 hover:border-bc-green bg-cream hover:bg-bc-green/5 transition-all p-5 text-center"
          >
            <div className="font-display text-base tracking-wider text-ink">+ ADICIONAR IMAGENS</div>
            <div className="text-xs text-stone-500 mt-1">JPG · PNG · WEBP</div>
          </button>

          {!hasImages && (
            <div className="mt-4 bg-cream border border-stone-200 p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">Ou escolha um ícone</div>
              <div className="flex flex-wrap gap-2">
                {GLYPH_OPTIONS.map((g) => (
                  <button key={g} type="button" onClick={() => setForm({ ...form, glyph: g })}
                    className={`w-14 h-14 bg-white border flex items-center justify-center transition-colors ${form.glyph === g ? 'border-ink ring-2 ring-bc-green/30' : 'border-stone-200 hover:border-ink'}`}>
                    <ProductGlyph glyph={g} color="#0d6b3a" className="w-9 h-9" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} className="sm:col-span-2" />
        <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2" />
        <Input label="Preço (R$)" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} error={errors.price} />
        <Input label="Estoque" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} error={errors.stock} />
        <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['Equipamento', 'Acessório', 'Vestuário', 'Suplemento', 'Outro'].map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600 mb-1.5">Status</div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-bc-green' : 'bg-stone-300'}`}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="sr-only" />
              <span className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
            </span>
            <span className="text-sm text-stone-700">{form.active ? 'Ativo' : 'Inativo'}</span>
          </label>
        </div>

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-stone-200">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="green" loading={saving} leftIcon={<IconCheck size={16} />}>{item ? 'Salvar alterações' : 'Criar produto'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminStore() {
  const toast = useToast();
  const confirmStore = useConfirmStore();

  const { data: productsData, isLoading } = useProducts({ active: undefined } as any);
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();
  const deleteProduct = useAdminDeleteProduct();

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const allProducts = (productsData as any)?.data ?? (Array.isArray(productsData) ? productsData : []);

  const filtered = useMemo(() => {
    if (!search) return allProducts;
    return allProducts.filter((p: Product) =>
      `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [allProducts, search]);

  const buildFormData = (state: ProductFormState): FormData => {
    const fd = new FormData();
    fd.append('name', state.name);
    fd.append('description', state.description);
    fd.append('price', state.price);
    fd.append('category', state.category);
    fd.append('stock', state.stock);
    fd.append('glyph', state.glyph);
    fd.append('active', String(state.active));
    state.newFiles.forEach((f) => fd.append('images', f));
    return fd;
  };

  const onSave = async (state: ProductFormState) => {
    const fd = buildFormData(state);
    if (editing === 'new') {
      await createProduct.mutateAsync(fd);
      toast.success('Produto criado', state.name);
    } else if (editing) {
      await updateProduct.mutateAsync({ id: editing.id, formData: fd });
      toast.success('Produto atualizado');
    }
    setEditing(null);
  };

  const onDelete = async (p: Product) => {
    const ok = await confirmStore.open({
      title: 'Excluir produto?',
      message: `"${p.name}" será desativado.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    await deleteProduct.mutateAsync(p.id);
    toast.success('Produto excluído');
  };

  const onToggleActive = async (p: Product) => {
    const fd = new FormData();
    fd.append('active', String(!p.active));
    await updateProduct.mutateAsync({ id: p.id, formData: fd });
    toast.success(p.active ? 'Produto desativado' : 'Produto ativado');
  };

  return (
    <AdminLayout active="loja" title="Loja / Produtos">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto…"
            className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
        </div>
        <Button variant="primary" onClick={() => setEditing('new')} leftIcon={<IconPlus size={16} />}>Novo produto</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title={search ? 'Nenhum resultado' : 'Nenhum produto'}
            message="Comece criando o primeiro produto da loja."
            icon={<IconShoppingBag size={28} />}
            action={!search ? <Button variant="primary" onClick={() => setEditing('new')} leftIcon={<IconPlus size={14} />}>Criar produto</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: Product) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <div className={`relative aspect-square ${p.active ? 'bg-cream' : 'bg-stone-100'} flex items-center justify-center overflow-hidden`}>
                {p.images?.length > 0
                  ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  : <ProductGlyph glyph={p.glyph || 'box'} color={p.active ? '#0d6b3a' : '#999'} className="w-2/3 h-2/3" />}
                {!p.active && <Badge color="neutral" className="absolute top-2 left-2 z-10">Inativo</Badge>}
                {p.stock <= 0 && p.active && <Badge color="red" className="absolute top-2 left-2 z-10">Esgotado</Badge>}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">{p.category}</div>
                <h3 className="font-display text-lg tracking-wider text-ink leading-tight mb-1">{p.name}</h3>
                <div className="text-xs text-stone-500 mb-3 line-clamp-2 flex-1">{p.description}</div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-display text-xl tracking-wider text-ink">{brl(p.price)}</span>
                  <span className="text-xs text-stone-500">Estoque: <span className="font-semibold text-ink">{p.stock}</span></span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-widest border border-stone-300 hover:bg-bc-green hover:text-white hover:border-bc-green transition-colors"
                  >
                    <IconEdit size={12} />Editar
                  </button>
                  <button
                    onClick={() => onToggleActive(p)}
                    className="px-3 py-2 text-xs border border-stone-300 hover:border-ink transition-colors text-stone-500"
                    title={p.active ? 'Desativar' : 'Ativar'}
                  >
                    {p.active ? '●' : '○'}
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="px-3 py-2 text-stone-500 hover:text-bc-red hover:bg-bc-red/5 border border-stone-300 hover:border-bc-red transition-colors"
                    aria-label="Excluir"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && (
        <ProductForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </AdminLayout>
  );
}
