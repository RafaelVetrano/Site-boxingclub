// ============================================================
// Admin Schedule — CRUD for class slots
// ============================================================
function AdminSchedulePage() {
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [filterDay, setFilterDay] = React.useState('all');
  const [filterCat, setFilterCat] = React.useState('all');
  const [editing, setEditing] = React.useState(null); // null | 'new' | item

  const reload = () => {
    setItems(window.BCServices.ScheduleService.list());
    setCategories(window.BCServices.ScheduleService.categories());
  };
  React.useEffect(() => { setTimeout(reload, 200); }, []);

  const filtered = React.useMemo(() => {
    if (!items) return [];
    return items
      .filter((i) => filterDay === 'all' || i.day === Number(filterDay))
      .filter((i) => filterCat === 'all' || i.category === filterCat)
      .filter((i) => {
        if (!search) return true;
        const cat = categories.find((c) => c.id === i.category)?.label || '';
        return `${i.time} ${cat} ${i.teacher} ${i.notes}`.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (a.day - b.day) || a.time.localeCompare(b.time));
  }, [items, filterDay, filterCat, search, categories]);

  const onSave = (data) => {
    if (editing === 'new') {
      window.BCServices.ScheduleService.create(data);
      toast.success('Aula criada', `${DAYS_FULL[data.day]} às ${data.time}h`);
    } else {
      window.BCServices.ScheduleService.update(editing.id, data);
      toast.success('Aula atualizada');
    }
    reload(); setEditing(null);
  };

  const onDelete = async (item) => {
    const ok = await confirm({ title: 'Excluir aula?', message: `${DAYS_FULL[item.day]} às ${item.time}h será removida.`, confirmLabel: 'Excluir', danger: true });
    if (!ok) return;
    window.BCServices.ScheduleService.remove(item.id);
    reload(); toast.success('Aula excluída');
  };

  return (
    <AdminLayout active="horarios" title="Agenda / Horários">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar…" className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"/>
        </div>
        <Select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="!flex-row !items-center gap-2 min-w-[160px]">
          <option value="all">Todos os dias</option>
          {DAYS_FULL.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </Select>
        <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="min-w-[180px]">
          <option value="all">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <Button variant="primary" onClick={() => setEditing('new')} leftIcon={<IconPlus size={16}/>}>Nova aula</Button>
      </div>

      {items === null ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14"/>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState title="Nenhuma aula cadastrada" message="Comece adicionando o primeiro horário." icon={<IconCalendar size={28}/>}
            action={<Button variant="primary" onClick={() => setEditing('new')} leftIcon={<IconPlus size={14}/>}>Adicionar aula</Button>}/>
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
                  <th className="text-left px-4 py-3 font-semibold">Observações</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const cat = categories.find((c) => c.id === it.category);
                  return (
                    <tr key={it.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3"><span className="font-semibold text-ink">{DAYS_FULL[it.day]}</span></td>
                      <td className="px-4 py-3 font-display text-lg tracking-wider text-ink">{it.time}h</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-white" style={{ background: cat?.color || '#0e1410' }}>
                          {cat?.label || it.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{it.teacher || '—'}</td>
                      <td className="px-4 py-3 text-stone-500 text-xs">{it.notes || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(it)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-bc-green hover:bg-bc-green/5" aria-label="Editar"><IconEdit size={14}/></button>
                          <button onClick={() => onDelete(it)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-bc-red hover:bg-bc-red/5" aria-label="Excluir"><IconTrash size={14}/></button>
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

      {editing && (
        <ScheduleForm
          item={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </AdminLayout>
  );
}

function ScheduleForm({ item, categories, onClose, onSave }) {
  const [form, setForm] = React.useState(() => item || { day: 0, time: '19:00', category: 'boxe', teacher: '', notes: '' });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\d{1,2}:\d{2}$/.test(form.time)) errs.time = 'Formato: HH:MM';
    if (!form.category) errs.category = 'Selecione uma categoria';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));
    onSave({ ...form, day: Number(form.day) });
    setSaving(false);
  };

  return (
    <Modal onClose={onClose} size="md">
      <h3 className="font-display text-3xl tracking-wider text-ink mb-1">{item ? 'Editar aula' : 'Nova aula'}</h3>
      <p className="text-sm text-stone-600 mb-6">Defina dia, horário e categoria da aula.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Dia da semana" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {DAYS_FULL.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </Select>
          <Input label="Horário" placeholder="19:00" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} error={errors.time}/>
        </div>
        <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} error={errors.category}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <Input label="Professor" placeholder="Nome do professor" value={form.teacher || ''} onChange={(e) => setForm({ ...form, teacher: e.target.value })}/>
        <Textarea label="Observações" placeholder="Detalhes, duração especial, restrição etc." value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}/>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="green" loading={saving} leftIcon={<IconCheck size={16}/>}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

Object.assign(window, { AdminSchedulePage });
