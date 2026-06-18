import { useState, useRef } from 'react';
import { Button, Input, Card, Avatar } from '@/components/ui';
import { IconCheck, IconCalendar, IconCreditCard, IconUser } from '@/icons';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { usePatchMe } from '@/api/auth';
import { api } from '@/api/client';
import { AccountShell } from './AccountShell';

// ── Perfil ────────────────────────────────────────────────────────
export function Perfil() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.add);
  const patchMe = usePatchMe();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      setErrors({ firstName: 'Informe seu nome.' });
      return;
    }
    if (!form.lastName.trim()) {
      setErrors({ lastName: 'Informe seu sobrenome.' });
      return;
    }
    setErrors({});

    try {
      await patchMe.mutateAsync({ firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      addToast({ type: 'success', title: 'Perfil atualizado', message: 'Suas informações foram salvas.' });
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Não foi possível salvar as alterações.' });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      addToast({ type: 'error', title: 'Formato inválido', message: 'Use JPG, PNG ou WebP.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'Arquivo muito grande', message: 'Máximo de 5MB.' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string }>('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await patchMe.mutateAsync({ avatar: data.url });
      addToast({ type: 'success', title: 'Avatar atualizado!', message: '' });
    } catch {
      addToast({ type: 'error', title: 'Erro no upload', message: 'Não foi possível atualizar o avatar.' });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <AccountShell active="perfil">
      <Card className="p-7">
        <h2 className="font-display text-3xl tracking-wider text-ink mb-1">Informações pessoais</h2>
        <p className="text-sm text-stone-600 mb-6">Mantenha seus dados atualizados.</p>

        {/* Avatar upload */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
          <Avatar user={user} size={64}/>
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              loading={uploadingAvatar}
            >
              Alterar foto
            </Button>
            <p className="text-[11px] text-stone-400 mt-1">JPG, PNG ou WebP · máx. 5MB</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              error={errors.firstName}
            />
            <Input
              label="Sobrenome"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              error={errors.lastName}
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={user.email}
            disabled
            hint="O e-mail não pode ser alterado."
          />
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="green"
              loading={patchMe.isPending}
              leftIcon={<IconCheck size={16}/>}
            >
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <IconUser size={18} className="text-bc-green"/>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500">Tipo de conta</div>
            <div className="text-sm font-semibold text-ink">
              {user.role === 'ADMIN' ? 'Administrador' : 'Aluno'}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <IconCalendar size={18} className="text-bc-green"/>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500">Verificado</div>
            <div className="text-sm font-semibold text-ink">
              {user.emailVerified ? 'Sim' : 'Pendente'}
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <IconCreditCard size={18} className="text-bc-green"/>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500">Plano</div>
            <div className="text-sm font-semibold text-ink">Nenhum</div>
          </div>
        </Card>
      </div>
    </AccountShell>
  );
}
