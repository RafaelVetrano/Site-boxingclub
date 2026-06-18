// ============================================================
// Admin Users — list, search, delete
// ============================================================
function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [filterPlan, setFilterPlan] = React.useState('all');

  const reload = () => setUsers(window.BCServices.AuthService.listUsers());
  React.useEffect(() => { setTimeout(reload, 200); }, []);

  const filtered = React.useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (filterPlan === 'subscribed' && !u.plan) return false;
      if (filterPlan === 'free' && u.plan)        return false;
      if (search && !`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, search, filterPlan]);

  const onDelete = async (u) => {
    if (u.id === me.id) { toast.error('Não permitido', 'Você não pode excluir a própria conta.'); return; }
    const ok = await confirm({ title: 'Excluir usuário?', message: `${u.firstName} ${u.lastName} será removido.`, confirmLabel: 'Excluir', danger: true });
    if (!ok) return;
    window.BCServices.AuthService.deleteUser(u.id);
    reload(); toast.success('Usuário excluído');
  };

  return (
    <AdminLayout active="usuarios" title="Usuários">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou email…" className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"/>
        </div>
        <Select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="min-w-[180px]">
          <option value="all">Todos os usuários</option>
          <option value="subscribed">Com plano ativo</option>
          <option value="free">Sem plano</option>
        </Select>
      </div>

      {users === null ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16"/>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <EmptyState title="Nenhum usuário encontrado" icon={<IconUsers size={28}/>}/>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  <th className="text-left px-4 py-3 font-semibold">Usuário</th>
                  <th className="text-left px-4 py-3 font-semibold">Plano</th>
                  <th className="text-left px-4 py-3 font-semibold">Cadastro</th>
                  <th className="text-left px-4 py-3 font-semibold">Função</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size={36}/>
                        <div className="min-w-0">
                          <div className="font-semibold text-ink truncate">{u.firstName} {u.lastName}{u.id === me.id && <span className="text-[10px] text-bc-green ml-2 uppercase tracking-widest">(você)</span>}</div>
                          <div className="text-xs text-stone-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.plan
                        ? <Badge color={u.plan.status === 'active' ? 'green' : 'red'}>{u.plan.planName.replace('Plano ', '')} · {u.plan.status === 'active' ? 'Ativo' : 'Cancelado'}</Badge>
                        : <Badge color="neutral">Sem plano</Badge>}
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-xs">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">{u.role === 'admin' ? <Badge color="red">Admin</Badge> : <Badge color="neutral">Aluno</Badge>}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(u)} disabled={u.id === me.id} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-bc-red hover:bg-bc-red/5 disabled:opacity-30 disabled:cursor-not-allowed ml-auto" aria-label="Excluir"><IconTrash size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-stone-500 border-t border-stone-200">
            {filtered.length} de {users.length} usuário{users.length === 1 ? '' : 's'}.
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}

Object.assign(window, { AdminUsersPage });
