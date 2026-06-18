import { useState, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { useSchedule, useCategories } from '@/api/hooks';
import {
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/api/admin';
import { useToast } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import {
  Button, Card, Skeleton, EmptyState, Modal, Input, Select, Textarea,
} from '@/components/ui';
import {
  IconPlus, IconEdit, IconTrash, IconSearch, IconCalendar, IconCheck,
} from '@/icons';
import type { ClassSchedule, ClassCategory } from '@/api/hooks';
import { SCHEDULE_DAYS_FULL as DAYS_FULL } from '@/lib/scheduleConstants';

const TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = 5 * 60 + i * 30;
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
});

type ScheduleFormState = {
  day: number;
  time: string;
  categoryId: string;
  teacher: string;
  notes: string;
};

function ScheduleForm({
  item,
  categories,
  onClose,
  onSave,
}: {
  item: ClassSchedule | null;
  categories: ClassCategory[];
  onClose: () => void;
  onSave: (data: ScheduleFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<ScheduleFormState>(() =>
    item
      ? { day: item.day, time: item.time, categoryId: item.categoryId, teacher: item.teacher ?? '', notes: item.notes ?? '' }
      : { day: 0, time: '19:00', categoryId: categories[0]?.id ?? '', teacher: '', notes: '' }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.time) errs.time = 'Selecione um horário';
    if (!form.categoryId) errs.categoryId = 'Selecione uma categoria';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} size="md">
      <h3 className="font-display text-3xl tracking-wider text-ink mb-1">{item ? 'Editar aula' : 'Nova aula'}</h3>
      <p className="text-sm text-stone-600 mb-6">Defina dia, horário e categoria da aula.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Dia da semana"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
          >
            {DAYS_FULL.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </Select>
          <Select
            label="Horário"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            error={errors.time}
          >
            <option value="">Selecione um horário</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
        <Select
          label="Categoria"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          error={errors.categoryId}
        >
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <Input
          label="Professor"
          placeholder="Nome do professor"
          value={form.teacher}
          onChange={(e) => setForm({ ...form, teacher: e.target.value })}
        />
        <Textarea
          label="Observações"
          placeholder="Detalhes, duração especial etc."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="green" loading={saving} leftIcon={<IconCheck size={16} />}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryForm({
  item,
  onClose,
  onSave,
}: {
  item: ClassCategory | null;
  onClose: () => void;
  onSave: (data: { label: string; color: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ label: item?.label ?? '', color: item?.color ?? '#0d6b3a' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) { setError('Informe o nome da categoria.'); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} size="sm">
      <h3 className="font-display text-2xl tracking-wider text-ink mb-1">{item ? 'Editar categoria' : 'Nova categoria'}</h3>
      <form onSubmit={submit} className="space-y-4 mt-5">
        <Input label="Nome" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} error={error} />
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600 mb-1.5 block">Cor</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 cursor-pointer border border-stone-300 p-0.5" />
            <span className="text-sm text-stone-700 font-mono">{form.color}</span>
            <span className="inline-block px-3 py-1 text-xs text-white font-semibold" style={{ background: form.color }}>{form.label || 'Prévia'}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="green" loading={saving} leftIcon={<IconCheck size={16} />}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminSchedule() {
  const toast = useToast();
  const confirmStore = useConfirmStore();

  const { data: scheduleData, isLoading: schedLoading } = useSchedule();
  const { data: categoriesData, isLoading: catLoading } = useCategories();

  const createSched = useCreateSchedule();
  const updateSched = useUpdateSchedule();
  const deleteSched = useDeleteSchedule();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [search, setSearch] = useState('');
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');
  const [filterCat, setFilterCat] = useState<string | 'all'>('all');
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | 'new' | null>(null);
  const [editingCategory, setEditingCategory] = useState<ClassCategory | 'new' | null>(null);

  const items = scheduleData ?? [];
  const categories = categoriesData ?? [];

  const filtered = useMemo(() => {
    return items
      .filter((i) => filterDay === 'all' || i.day === filterDay)
      .filter((i) => filterCat === 'all' || i.categoryId === filterCat)
      .filter((i) => {
        if (!search) return true;
        const cat = categories.find((c) => c.id === i.categoryId)?.label ?? '';
        return `${i.time} ${cat} ${i.teacher ?? ''} ${i.notes ?? ''}`.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  }, [items, filterDay, filterCat, search, categories]);

  const onSaveSchedule = async (data: ScheduleFormState) => {
    if (editingSchedule === 'new') {
      await createSched.mutateAsync(data);
      toast.success('Aula criada', `${DAYS_FULL[data.day]} às ${data.time}h`);
    } else if (editingSchedule) {
      await updateSched.mutateAsync({ id: editingSchedule.id, ...data });
      toast.success('Aula atualizada');
    }
    setEditingSchedule(null);
  };

  const onDeleteSchedule = async (item: ClassSchedule) => {
    const ok = await confirmStore.open({
      title: 'Excluir aula?',
      message: `${DAYS_FULL[item.day]} às ${item.time}h será removida.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    await deleteSched.mutateAsync(item.id);
    toast.success('Aula excluída');
  };

  const onSaveCategory = async (data: { label: string; color: string }) => {
    if (editingCategory === 'new') {
      await createCat.mutateAsync(data);
      toast.success('Categoria criada');
    } else if (editingCategory) {
      await updateCat.mutateAsync({ id: editingCategory.id, ...data });
      toast.success('Categoria atualizada');
    }
    setEditingCategory(null);
  };

  const onDeleteCategory = async (cat: ClassCategory) => {
    const ok = await confirmStore.open({
      title: 'Excluir categoria?',
      message: `A categoria "${cat.label}" será removida.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCat.mutateAsync(cat.id);
      toast.success('Categoria excluída');
    } catch (err: any) {
      toast.error('Erro', err?.response?.data?.message ?? 'Não foi possível excluir.');
    }
  };

  const isLoading = schedLoading || catLoading;

  return (
    <AdminLayout active="horarios" title="Agenda / Horários">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main schedule table */}
        <div className="flex-1 min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"
              />
            </div>
            <Select value={filterDay} onChange={(e) => setFilterDay(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="min-w-[160px]">
              <option value="all">Todos os dias</option>
              {DAYS_FULL.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </Select>
            <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="min-w-[180px]">
              <option value="all">Todas as categorias</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <Button variant="primary" onClick={() => setEditingSchedule('new')} leftIcon={<IconPlus size={16} />}>Nova aula</Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <Card className="p-10">
              <EmptyState
                title="Nenhuma aula cadastrada"
                message="Comece adicionando o primeiro horário."
                icon={<IconCalendar size={28} />}
                action={<Button variant="primary" onClick={() => setEditingSchedule('new')} leftIcon={<IconPlus size={14} />}>Adicionar aula</Button>}
              />
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                      <th className="text-left px-4 py-3 font-semibold">Dia</th>
                      <th className="text-left px-4 py-3 font-semibold">Horário</th>
                      <th className="text-left px-4 py-3 font-semibold">Categoria</th>
                      <th className="text-left px-4 py-3 font-semibold">Professor</th>
                      <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Observações</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((it) => {
                      const cat = categories.find((c) => c.id === it.categoryId);
                      return (
                        <tr key={it.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-ink">{DAYS_FULL[it.day]}</td>
                          <td className="px-4 py-3 font-display text-lg tracking-wider text-ink">{it.time}h</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-2 px-2 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-white"
                              style={{ background: cat?.color ?? '#0e1410' }}
                            >
                              {cat?.label ?? it.categoryId}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-700">{it.teacher || '—'}</td>
                          <td className="px-4 py-3 text-stone-500 text-xs hidden sm:table-cell">{it.notes || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditingSchedule(it)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-bc-green hover:bg-bc-green/5" aria-label="Editar"><IconEdit size={14} /></button>
                              <button onClick={() => onDeleteSchedule(it)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-bc-red hover:bg-bc-red/5" aria-label="Excluir"><IconTrash size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 text-xs text-stone-500 border-t border-stone-200">
                Mostrando {filtered.length} de {items.length} aulas.
              </div>
            </Card>
          )}
        </div>

        {/* Categories sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card>
            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-display text-lg tracking-wider text-ink">Categorias</h3>
              <button onClick={() => setEditingCategory('new')} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-bc-green hover:bg-bc-green/5" aria-label="Nova categoria">
                <IconPlus size={16} />
              </button>
            </div>
            {catLoading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex items-center gap-2 px-4 py-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="flex-1 text-sm text-ink truncate">{cat.label}</span>
                    <button onClick={() => setEditingCategory(cat)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-bc-green" aria-label="Editar"><IconEdit size={12} /></button>
                    <button onClick={() => onDeleteCategory(cat)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-bc-red" aria-label="Excluir"><IconTrash size={12} /></button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-stone-500">Sem categorias</li>
                )}
              </ul>
            )}
          </Card>
        </aside>
      </div>

      {editingSchedule !== null && (
        <ScheduleForm
          item={editingSchedule === 'new' ? null : editingSchedule}
          categories={categories}
          onClose={() => setEditingSchedule(null)}
          onSave={onSaveSchedule}
        />
      )}

      {editingCategory !== null && (
        <CategoryForm
          item={editingCategory === 'new' ? null : editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={onSaveCategory}
        />
      )}
    </AdminLayout>
  );
}
