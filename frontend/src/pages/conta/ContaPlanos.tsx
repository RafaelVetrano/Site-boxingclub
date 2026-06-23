import { useState } from 'react';
import { Card, Badge, Button, Skeleton, EmptyState } from '@/components/ui';
import { IconCheck, IconCalendar, IconCreditCard, IconDumbbell, IconArrowRight, IconAlertTriangle } from '@/icons';
import { AccountShell } from './AccountShell';
import { usePlans, Plan, Subscription, useMySubscription, useCreateSubscription, useCancelSubscription } from '@/api/hooks';
import { useToast } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';

// ── Info Tile ──────────────────────────────────────────────────────
function InfoTile({ icon, label, value, accent = 'green' }: { icon: React.ReactNode; label: string; value: string; accent?: 'green' | 'red' }) {
  const color = accent === 'red' ? 'text-bc-red' : 'text-bc-green';
  return (
    <div className="bg-cream border border-stone-200 p-4">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] ${color} font-semibold mb-2`}>{icon}{label}</div>
      <div className="font-display text-2xl tracking-wider text-ink">{value}</div>
    </div>
  );
}

// ── Pending Payment Card ───────────────────────────────────────────
function PendingPaymentCard({ subscription, loading, onResume }: { subscription: Subscription; loading: boolean; onResume: () => void }) {
  const p = subscription.plan;
  return (
    <div className="border-2 border-amber-400 bg-amber-50 p-6 mb-6 animate-reveal-up">
      <div className="flex items-start gap-3 mb-4">
        <IconAlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 text-sm">Pagamento pendente</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Seu pagamento do <strong>{p.name}</strong> não foi concluído. Clique abaixo para retomar de onde parou.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-stone-500 text-sm">R$</span>
          <span className="font-display text-3xl text-ink leading-none">{Number(p.price).toFixed(2).split('.')[0]}</span>
          <span className="text-stone-500 text-sm">,{Number(p.price).toFixed(2).split('.')[1]}</span>
          <span className="text-xs text-stone-500 ml-1">{p.period}</span>
        </div>
        <Button
          variant={p.accent === 'green' ? 'green' : 'primary'}
          loading={loading}
          onClick={onResume}
          rightIcon={<IconArrowRight size={14} />}
        >
          Retomar pagamento
        </Button>
      </div>
    </div>
  );
}

// ── Plan Card (compact) ────────────────────────────────────────────
function CompactPlanCard({ p, idx, loadingId, onSubscribe }: { p: Plan; idx: number; loadingId: string | null; onSubscribe: (id: string) => void }) {
  const isHighlight = p.highlight;
  return (
    <div className="relative animate-reveal-up" style={{ animationDelay: `${idx * 100}ms` }}>
      <div className={`relative p-6 bg-white ${isHighlight ? 'border-2 border-bc-red' : 'border border-stone-200'}`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${p.accent === 'green' ? 'bg-bc-green' : 'bg-bc-red'}`} />
        <div className={`text-xs uppercase tracking-[0.3em] font-semibold mb-1 ${p.accent === 'green' ? 'text-bc-green' : 'text-bc-red'}`}>{p.name}</div>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-stone-500">R$</span>
          <span className="font-display text-4xl text-ink leading-none">{Number(p.price).toFixed(2).split('.')[0]}</span>
          <span className="text-stone-500">,{Number(p.price).toFixed(2).split('.')[1]}</span>
          <span className="text-xs text-stone-500 ml-1">{p.period}</span>
        </div>
        <ul className="space-y-1.5 mb-5">
          {p.features.slice(0, 3).map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-stone-600">
              <IconCheck size={11} strokeWidth={3} className={p.accent === 'green' ? 'text-bc-green' : 'text-bc-red'} />
              {f}
            </li>
          ))}
        </ul>
        <Button
          variant={isHighlight ? 'primary' : 'green'}
          size="sm"
          className="w-full"
          loading={loadingId === p.id}
          onClick={() => onSubscribe(p.id)}
          rightIcon={<IconArrowRight size={14} />}
        >
          Assinar
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export function ContaPlanos() {
  const toast = useToast();
  const confirm = useConfirmStore((s) => s.open);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();

  const handleSubscribe = async (planId: string) => {
    setLoadingId(planId);
    try {
      const result = await createSubscription.mutateAsync(planId);
      window.location.href = result.initPoint;
    } catch (e: any) {
      const code = e?.response?.data?.error;
      const msg = e?.response?.data?.message ?? 'Tente novamente.';
      const title = code === 'MP_NOT_CONFIGURED' ? 'Pagamentos desativados' : 'Erro ao assinar';
      toast.error(title, msg);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancelar assinatura?',
      message: 'Você manterá o acesso até a próxima data de cobrança. Essa ação não pode ser desfeita.',
      confirmLabel: 'Sim, cancelar',
      danger: true,
    });
    if (!ok) return;
    try {
      await cancelSubscription.mutateAsync();
      toast.info('Assinatura cancelada', 'Seu acesso foi mantido até o fim do ciclo.');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Tente novamente.';
      toast.error('Erro ao cancelar', msg);
    }
  };

  return (
    <AccountShell active="planos">
      {subLoading ? (
        <Card className="p-7 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-1/4" />
        </Card>
      ) : subscription?.status === 'ACTIVE' ? (
        /* ── Active subscription ── */
        <Card className="p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-bc-green font-semibold mb-1">Plano ativo</div>
              <h2 className="font-display text-3xl sm:text-4xl tracking-wider text-ink leading-none">{subscription.plan.name}</h2>
            </div>
            <div className="text-right">
              <Badge color="green">● Ativo</Badge>
              <div className="font-display text-3xl tracking-wider text-ink mt-1">
                R$ {Number(subscription.plan.price).toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs text-stone-500">por mês</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <InfoTile
              icon={<IconCalendar size={14} />}
              label="Início"
              value={new Date(subscription.startDate).toLocaleDateString('pt-BR')}
            />
            <InfoTile
              icon={<IconCreditCard size={14} />}
              label="Próxima cobrança"
              value={new Date(subscription.nextBilling).toLocaleDateString('pt-BR')}
            />
            <InfoTile
              icon={<IconDumbbell size={14} />}
              label="Treinos"
              value="Ilimitados"
            />
          </div>

          <ul className="space-y-2 mb-6">
            {subscription.plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-stone-700">
                <IconCheck size={13} strokeWidth={3} className="text-bc-green flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            variant="ghost"
            loading={cancelSubscription.isPending}
            onClick={handleCancel}
            className="text-bc-red border-bc-red hover:bg-bc-red/5"
          >
            Cancelar assinatura
          </Button>
        </Card>
      ) : (
        /* ── No active subscription ── */
        <>
          {subscription?.status === 'PENDING' && (
            <PendingPaymentCard
              subscription={subscription}
              loading={loadingId === subscription.planId}
              onResume={() => handleSubscribe(subscription.planId)}
            />
          )}
          {subscription?.status === 'CANCELLED' && (
            <div className="bg-stone-50 border border-stone-200 p-4 mb-5 text-sm text-stone-600">
              Sua assinatura anterior foi cancelada. Escolha um plano abaixo para reativar.
            </div>
          )}

          {plansLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[0, 1].map((i) => <Card key={i} className="p-6 h-64"><Skeleton className="h-full" /></Card>)}
            </div>
          ) : plans.length === 0 ? (
            <Card className="p-10">
              <EmptyState
                title="Nenhum plano disponível"
                message="Entre em contato para conhecer nossas opções."
                icon={<IconDumbbell size={28} />}
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map((p, idx) => (
                <CompactPlanCard
                  key={p.id}
                  p={p}
                  idx={idx}
                  loadingId={loadingId}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          )}
        </>
      )}
    </AccountShell>
  );
}
