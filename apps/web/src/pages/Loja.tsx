import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Skeleton, EmptyState, ProductGlyph } from '@/components/ui';
import { ProductCarousel } from '@/components/layout/ProductCarousel';
import { IconSearch, IconShoppingBag, IconArrowRight, IconLock, IconLogIn, IconAlertTriangle } from '@/icons';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useCartStore } from '@/stores/cartStore';
import { useProducts, useAddToCart, Product } from '@/api/hooks';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Product Card ──────────────────────────────────────────────────
interface ProductCardProps {
  p: Product;
  i: number;
  onBuy: (product: Product) => void;
}

function ProductCard({ p, i, onBuy }: ProductCardProps) {
  const color = i % 3 === 0 ? '#c41e2a' : i % 3 === 1 ? '#0d6b3a' : '#0e1410';
  const bg    = i % 3 === 0 ? 'bg-bc-red/[0.04]' : i % 3 === 1 ? 'bg-bc-green/[0.04]' : 'bg-stone-100';
  const tagBg = i % 3 === 0 ? 'bg-bc-red' : i % 3 === 1 ? 'bg-bc-green' : 'bg-ink';
  const out = p.stock <= 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  return (
    <div
      className="group bg-white border border-stone-200 hover:border-ink/40 transition-all duration-500 overflow-hidden animate-reveal-up"
      style={{ animationDelay: `${i * 80 + 100}ms` }}
    >
      <div className={`relative aspect-square ${bg} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.5] bg-[linear-gradient(45deg,transparent_48%,rgba(14,20,16,0.06)_50%,transparent_52%)] bg-[size:14px_14px] pointer-events-none" />
        {(p.images || []).length > 0 ? (
          <ProductCarousel images={p.images} glyph={p.glyph} fallbackColor={color} alt={p.name} />
        ) : (
          <div className="relative w-2/3 h-2/3 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <ProductGlyph glyph={p.glyph || 'box'} color={color} className="w-full h-full" />
          </div>
        )}
        <span className={`absolute top-3 left-3 ${tagBg} text-white text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-1 z-10`}>{p.category}</span>
        <span className="absolute bottom-3 right-3 text-[10px] text-stone-500 font-mono z-10">#{p.id.slice(0, 5).toUpperCase()}</span>
        {out && <span className="absolute top-3 right-3 bg-ink text-white text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-1 z-10">Esgotado</span>}
        {lowStock && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 z-10 flex items-center gap-1">
            <IconAlertTriangle size={9} />
            Últimas {p.stock}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl tracking-wide text-ink mb-1 leading-tight">{p.name.toUpperCase()}</h3>
        {p.description && <p className="text-xs text-stone-500 mb-3 line-clamp-2">{p.description}</p>}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-xs text-stone-500">R$</span>
          <span className="font-display text-2xl text-ink">{Number(p.price).toFixed(2).replace('.', ',')}</span>
        </div>
        <Button
          variant={out ? 'ghost' : 'dark'}
          className="w-full"
          disabled={out}
          onClick={() => onBuy(p)}
          rightIcon={!out ? <IconArrowRight size={14} /> : undefined}
        >
          {out ? 'Esgotado' : 'Comprar'}
        </Button>
      </div>
    </div>
  );
}

// ── Login Prompt Modal ────────────────────────────────────────────
function LoginPrompt({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <Modal onClose={onClose} size="sm">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bc-red/10 flex items-center justify-center text-bc-red">
          <IconLock size={26} />
        </div>
        <h3 className="font-display text-3xl tracking-wider text-ink mb-2">Faça login para continuar</h3>
        <p className="text-stone-600 text-sm mb-7">Para adicionar produtos ao carrinho você precisa estar logado.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose}>Agora não</Button>
          <Button
            variant="green"
            onClick={() => { onClose(); navigate('/login'); }}
            leftIcon={<IconLogIn size={16} />}
          >
            Entrar
          </Button>
        </div>
        <p className="text-xs text-stone-500 mt-5">
          Não tem conta?{' '}
          <button
            onClick={() => { onClose(); navigate('/register'); }}
            className="text-bc-red font-semibold hover:underline"
          >
            Criar conta
          </button>
        </p>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export function Loja() {
  const { user } = useAuthStore();
  const { open: openCart } = useCartStore();
  const toast = useToast();

  const [search, setSearch]           = useState('');
  const [cat, setCat]                 = useState('all');
  const [loginPrompt, setLoginPrompt] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(cat !== 'all' ? { category: cat } : {}),
  }), [debouncedSearch, cat]);

  const { data: products, isLoading } = useProducts(filters);
  const addToCart = useAddToCart();

  const allCategories = useMemo(() => {
    if (!products) return [] as string[];
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const prevCatRef = useRef(cat);
  useEffect(() => { prevCatRef.current = cat; }, [cat]);

  const buy = (product: Product) => {
    if (!user) { setLoginPrompt(true); return; }
    addToCart.mutate(
      { product, qty: 1 },
      {
        onSuccess: () => {
          toast.success('Adicionado!', `${product.name} entrou no seu carrinho.`);
          openCart();
        },
        onError: (e: any) => {
          const msg = e?.response?.data?.message || 'Não foi possível adicionar ao carrinho.';
          toast.error('Erro', msg);
        },
      }
    );
  };

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-cream overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,20,16,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,16,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-reveal-up">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <IconShoppingBag size={18} className="text-bc-red" />
              <span className="text-xs tracking-[0.3em] uppercase text-bc-red font-semibold">Loja Boxing Club</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9]">
              EQUIPE-SE PARA<br /><span className="text-bc-green">VENCER</span>
            </h1>
          </div>
          <p className="text-stone-600 max-w-md">
            Equipamentos selecionados pela nossa equipe técnica. Qualidade, durabilidade
            e o estilo Boxing Club nos pequenos detalhes.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2 animate-reveal-up" style={{ animationDelay: '100ms' }}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto…"
              className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
          </div>
          <button
            onClick={() => setCat('all')}
            className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold border ${cat === 'all' ? 'bg-ink text-white border-ink' : 'bg-white text-stone-700 border-stone-300 hover:border-ink'}`}
          >
            Todas
          </button>
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold border ${cat === c ? 'bg-ink text-white border-ink' : 'bg-white text-stone-700 border-stone-300 hover:border-ink'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200">
                <Skeleton className="aspect-square w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <EmptyState
            title="Nenhum produto encontrado"
            message="Ajuste os filtros ou volte mais tarde."
            icon={<IconShoppingBag size={28} />}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} onBuy={buy} />
            ))}
          </div>
        )}
      </div>

      {loginPrompt && <LoginPrompt onClose={() => setLoginPrompt(false)} />}
    </section>
  );
}
