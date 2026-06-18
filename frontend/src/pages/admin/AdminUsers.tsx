import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAdminUsers, useAdminUser, useUpdateUserRole, useDeleteUser } from '@/api/admin';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import {
  Button, Card, Skeleton, EmptyState, Modal, Badge, Avatar, brl,
} from '@/components/ui';
import { IconSearch, IconUsers, IconTrash, IconCalendar, IconCheck } from '@/icons';
import type { AdminUser } from '@/api/admin';

const STATUS_META: Record<string, { label: string; badge: 'green' | 'red' | 'amber' | 'neutral' | 'ink' }> = {
  pago:      { label: 'Pago',      badge: 'green'   },
  entregue:  { label: 'Entregue',  badge: 'green'   },
  pendente:  { label: 'Pendente',  badge: 'amber'   },
  nao_pago:  { label: 'Não pago',  badge: 'red'     },
  cancelado: { label: 'Cancelado', badge: 'red'     },
  recusado:  { label: 'Recusado',  badge: 'red'     },
  expirado:  { label: 'Expirado',  badge: 'neutral' },
  erro:      { label: 'Erro',      badge: 'red'     },
};

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const me = useAuthStore((s) => s.user);
  const toast = useToast();
  const confirmStore = useConfirmStore();

  const { data: user, isLoading } = useAdminUser(userId);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleRoleToggle = async () => {
    if (!user) return;
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const label = newRole === 'ADMIN' ? 'Promover a Admin' : 'Rebaixar a Usuário';
    const ok = await confirmStore.open({
      title: `${label}?`,
      message: `${user.firstName} ${user.lastName} será ${newRole === 'ADMIN' ? 'promovido(a) a administrador' : 'rebaixado(a) para usuário comum'}.`,
      confirmLabel: label,
      danger: newRole === 'USER',
    });
    if (!ok) return;
    try {
      await updateRole.mutateAsync({ id: user.id, role: newRole });
      toast.success(newRole === 'ADMIN' ? 'Usuário promovido a Admin' : 'Usuário rebaixado');
      onClose();
    } catch (e: any) {
      toast.error('Erro', e?.response?.data?.message ?? 'Não foi possível alterar o papel.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const ok = await confirmStore.open({
      title: 'Excluir usuário?',
      message: `${user.firstName} ${user.lastName} será removido permanentemente. Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir permanentemente',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('Usuário excluído');
      onClose();
    } catch (e: any) {
      toast.error('Erro', e?.response?.data?.message ?? 'Não foi possível excluir.');
    }
  };

  return (
    <Modal onClose={onClose} size="lg">
      {isLoading || !user ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6 pr-10">
            <Avatar user={user} size={60} />
            <div>
              <h3 className="font-display text-3xl tracking-wider text-ink leading-none">
                {user.firstName} {user.lastName}
                {me?.id === user.id && <span className="text-[10px] text-bc-green ml-2 uppercase tracking-widest">(você)</span>}
              </h3>
              <div className="text-sm text-stone-500 mt-1">{user.email}</div>
              <div className="flex items-center gap-2 mt-2">
                {user.role === 'ADMIN' ? <Badge color="red">Admin</Badge> : <Badge color="neutral">Aluno</Badge>}
                {user.emailVerified ? <Badge color="green">Email verificado</Badge> : <Badge color="amber">Email não verificado</Badge>}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-cream border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-1 flex items-center gap-2"><IconCalendar size={12} />Cadastrado em</div>
              <div className="text-sm font-semibold text-ink">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
            <div className="bg-cream border border-stone-200 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-1">Plano ativo</div>
              <div className="text-sm font-semibold text-ink">
                {user.subscription?.status === 'ACTIVE' ? user.subscription.plan?.name : 'Sem plano'}
              </div>
            </div>
          </div>

          {user.orders.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-3">Pedidos recentes</div>
              <ul className="border border-stone-200 divide-y divide-stone-200">
                {user.orders.map((o) => {
                  const m = STATUS_META[o.status] ?? { label: o.status, badge: 'neutral' as const };
                  return (
                    <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">#{o.number}</div>
                        <div className="text-xs text-stone-500">{new Date(o.date).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg tracking-wider text-ink">{brl(o.total)}</span>
                        <Badge color={m.badge}>{m.label}</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {me?.id !== user.id && (
            <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-stone-200">
              <Button
                variant={user.role === 'ADMIN' ? 'ghost' : 'outline'}
                size="sm"
                onClick={handleRoleToggle}
                loading={updateRole.isPending}
                leftIcon={<IconCheck size={14} />}
              >
                {user.role === 'ADMIN' ? 'Rebaixar a Usuário' : 'Promover a Admin'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={deleteUser.isPending}
                leftIcon={<IconTrash size={14} />}
                className="ml-auto"
              >
                Excluir usuário
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

export function AdminUsers() {
  const me = useAuthStore((s) => s.user);
  const toast = useToast();
  const confirmStore = useConfirmStore();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'USER' | 'ADMIN'>('all');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: filterRole !== 'all' ? filterRole : undefined,
    page,
    limit: 25,
  });

  const deleteUser = useDeleteUser();

  const users = data?.data ?? [];

  const onDelete = async (u: AdminUser) => {
    if (u.id === me?.id) { toast.error('Não permitido', 'Você não pode excluir a própria conta.'); return; }
    const ok = await confirmStore.open({
      title: 'Excluir usuário?',
      message: `${u.firstName} ${u.lastName} será removido permanentemente.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteUser.mutateAsync(u.id);
      toast.success('Usuário excluído');
    } catch (e: any) {
      toast.error('Erro', e?.response?.data?.message ?? 'Não foi possível excluir.');
    }
  };

  return (
    <AdminLayout active="usuarios" title="Usuários">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome ou email…"
            className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value as typeof filterRole); setPage(1); }}
          className="border border-stone-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-ink min-w-[180px]"
        >
          <option value="all">Todos os usuários</option>
          <option value="ADMIN">Apenas admins</option>
          <option value="USER">Apenas alunos</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : users.length === 0 ? (
        <Card className="p-10">
          <EmptyState title="Nenhum usuário encontrado" icon={<IconUsers size={28} />} />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  <th className="text-left px-4 py-3 font-semibold">Usuário</th>
                  <th className="text-left px-4 py-3 font-semibold">Plano</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Cadastro</th>
                  <th className="text-left px-4 py-3 font-semibold">Função</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size={36} />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink truncate">
                            {u.firstName} {u.lastName}
                            {u.id === me?.id && <span className="text-[10px] text-bc-green ml-2 uppercase tracking-widest">(você)</span>}
                          </div>
                          <div className="text-xs text-stone-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.subscription
                        ? <Badge color={u.subscription.status === 'ACTIVE' ? 'green' : 'red'}>{u.subscription.plan.name.replace('Plano ', '')} · {u.subscription.status === 'ACTIVE' ? 'Ativo' : 'Cancelado'}</Badge>
                        : <Badge color="neutral">Sem plano</Badge>}
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-xs hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      {u.role === 'ADMIN' ? <Badge color="red">Admin</Badge> : <Badge color="neutral">Aluno</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(u); }}
                        disabled={u.id === me?.id}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-bc-red hover:bg-bc-red/5 disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
                        aria-label="Excluir"
                      >
                        <IconTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-stone-500 border-t border-stone-200">
            {data?.total ?? users.length} usuário{(data?.total ?? users.length) === 1 ? '' : 's'}.
          </div>
        </Card>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-stone-500">Página {data.page} de {data.pages}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="ghost" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </AdminLayout>
  );
}
