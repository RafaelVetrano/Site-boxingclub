// ============================================================
// Planos — adapts to user subscription state
// ============================================================
function PlanosPage() {
  const { user, refresh } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const confirm = useConfirm();

  const [catalog, setCatalog] = React.useState([]);
  const [loadingId, setLoadingId] = React.useState(null);
  const [changing, setChanging] = React.useState(false);

  React.useEffect(() => { setCatalog(window.BCServices.PlansService.catalog()); }, []);

  const subscribe = async (planId) => {
    if (!user) {
      toast.error('Entre para assinar', 'Crie sua conta ou faça login para continuar.');
      navigate('login'); return;
    }
    setLoadingId(planId);
    try {
      await window.BCServices.PlansService.subscribe(user.id, planId);
      refresh();
      toast.success('Plano ativado!', 'Bem-vindo ao Boxing Club. Vamos treinar!');
    } catch (e) { toast.error('Erro', e.message); }
    finally { setLoadingId(null); }
  };

  const cancel = async () => {
    const ok = await confirm({ title: 'Cancelar plano?', message: 'Você manterá o acesso até a próxima cobrança.', confirmLabel: 'Sim, cancelar', danger: true });
    if (!ok) return;
    try {
      await window.BCServices.PlansService.cancel(user.id);
      refresh();
      toast.info('Plano cancelado', 'Acesso mantido até o fim do ciclo.');
    } catch (e) { toast.error('Erro', e.message); }
  };

  // SUBSCRIBED state ----------------------------------------------------
  if (user?.plan) {
    const p = user.plan;
    const startStr = new Date(p.startDate).toLocaleDateString('pt-BR');
    const nextStr  = new Date(p.nextBilling).toLocaleDateString('pt-BR');
    const active = p.status === 'active';

    return (
      <section data-screen-label="Meu Plano" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-cream min-h-[80vh] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 animate-reveal-up">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-bc-green"/>
            <span className="text-xs tracking-[0.3em] uppercase text-bc-green font-semibold">Sua assinatura</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9] mb-10">MEU PLANO <span className="text-bc-red">ATUAL</span></h1>

          <Card accent="green" className="p-8 sm:p-10 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-bc-green font-semibold mb-2">Plano ativo</div>
                <h2 className="font-display text-4xl sm:text-5xl tracking-wider text-ink leading-none mb-3">{p.planName}</h2>
                <Badge color={active ? 'green' : 'red'}>● {active ? 'Ativo' : 'Cancelado'}</Badge>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-stone-500">R$</span>
                  <span className="font-display text-5xl tracking-wider text-ink">{p.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="text-xs uppercase tracking-widest text-stone-500 mt-1">por mês</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-8 pb-8 border-b border-stone-200">
              <InfoTile icon={<IconCalendar size={16}/>} label="Início" value={startStr} />
              <InfoTile icon={<IconCreditCard size={16}/>} label={active ? 'Próxima cobrança' : 'Acesso até'} value={nextStr} accent={active ? 'green' : 'red'} />
              <InfoTile icon={<IconDumbbell size={16}/>} label="Treinos no período" value="Ilimitados" />
            </div>

            <div className="mb-8">
              <h3 className="font-display text-xl tracking-wider text-ink mb-4">O que está incluso</h3>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {(p.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-stone-700">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-bc-green/10 text-bc-green flex items-center justify-center"><IconCheck size={12} strokeWidth={3}/></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {active && (
                <>
                  <Button variant="green" size="lg" onClick={() => setChanging(true)} leftIcon={<IconArrowRight size={16}/>}>Mudar plano</Button>
                  <Button variant="ghost" size="lg" onClick={cancel}>Cancelar assinatura</Button>
                </>
              )}
              {!active && (
                <Button variant="green" size="lg" onClick={() => subscribe(p.planId)} loading={loadingId === p.planId}>Reativar plano</Button>
              )}
            </div>
          </Card>

          <PartnersSection compact />
        </div>

        {changing && <ChangePlanModal current={p} catalog={catalog} loadingId={loadingId} onClose={() => setChanging(false)} onSubscribe={async (id) => { await subscribe(id); setChanging(false); }}/>}
      </section>
    );
  }

  // UNSUBSCRIBED ---------------------------------------------------------
  return (
    <section data-screen-label="Planos" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green"/><div className="flex-1 bg-white"/><div className="flex-1 bg-bc-red"/></div>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14 animate-reveal-up">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-10 h-px bg-bc-green"/>
            <span className="text-xs tracking-[0.3em] uppercase text-bc-green font-semibold">Planos & Mensalidades</span>
            <span className="w-10 h-px bg-bc-green"/>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9] mb-5">ESCOLHA O <span className="text-bc-red">SEU</span><br/>CAMINHO</h1>
          <p className="text-stone-700 max-w-xl mx-auto">Treinos ilimitados, professores qualificados e ambiente de elite. Sem letras miúdas. Sem surpresas.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {catalog.map((p, idx) => <PlanCard key={p.id} p={p} idx={idx} loadingId={loadingId} onSubscribe={subscribe} />)}
        </div>

        <PartnersSection />

        <p className="text-center text-xs text-stone-500 mt-10 uppercase tracking-widest">* Forma de pagamento: Pix ou cartão.</p>
      </div>
    </section>
  );
}

function PlanCard({ p, idx, loadingId, onSubscribe, compact }) {
  const isHighlight = p.highlight;
  return (
    <div className="relative animate-reveal-up" style={{ animationDelay: `${idx * 150 + 100}ms` }}>
      {isHighlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-bc-red text-white text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 flex items-center gap-1.5 shadow-[0_8px_20px_-8px_rgba(196,30,42,0.6)]">
            <IconStar size={11} fill="white"/> {p.badge}
          </div>
        </div>
      )}
      <div className={`relative h-full ${compact ? 'p-6' : 'p-8 sm:p-10'} transition-all duration-500 bg-white ${
        isHighlight ? 'border-2 border-bc-red shadow-[0_30px_80px_-30px_rgba(196,30,42,0.4)]'
                    : 'border border-stone-200 hover:border-bc-green/40 shadow-[0_20px_50px_-30px_rgba(13,107,58,0.2)]'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${p.accent === 'green' ? 'bg-bc-green' : 'bg-bc-red'}`} />

        <div className="mb-6">
          <div className={`text-xs uppercase tracking-[0.3em] font-semibold mb-3 ${p.accent === 'green' ? 'text-bc-green' : 'text-bc-red'}`}>{p.name}</div>
          <p className="text-sm text-stone-600">{p.tagline}</p>
        </div>

        <div className="mb-8 pb-8 border-b border-stone-200">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-stone-500">R$</span>
            <span className={`font-display ${compact ? 'text-5xl' : 'text-7xl sm:text-8xl'} text-ink leading-none`}>{p.price.toFixed(2).split('.')[0]}</span>
            <span className="text-2xl text-stone-500">,{p.price.toFixed(2).split('.')[1]}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-sm text-stone-500">{p.period}</span>
            {p.originalPrice && <span className="text-sm text-stone-400 line-through">R$ {p.originalPrice.toFixed(2).replace('.', ',')}</span>}
            {p.originalPrice && <span className="text-[10px] uppercase tracking-widest bg-bc-green text-white px-2 py-0.5 font-semibold">Economize 10%</span>}
          </div>
        </div>

        <ul className="space-y-3 mb-9">
          {p.features.map((feat) => (
            <li key={feat} className="flex items-start gap-3 text-sm text-stone-700">
              <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${p.accent === 'green' ? 'bg-bc-green/10 text-bc-green' : 'bg-bc-red/10 text-bc-red'}`}>
                <IconCheck size={12} strokeWidth={3}/>
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isHighlight ? 'primary' : 'green'}
          className="w-full"
          size="lg"
          loading={loadingId === p.id}
          onClick={() => onSubscribe(p.id)}
          rightIcon={<IconArrowRight size={16}/>}
        >
          Assinar
        </Button>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value, accent = 'green' }) {
  const color = accent === 'red' ? 'text-bc-red' : 'text-bc-green';
  return (
    <div className="bg-cream border border-stone-200 p-4">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] ${color} font-semibold mb-2`}>{icon}{label}</div>
      <div className="font-display text-2xl tracking-wider text-ink">{value}</div>
    </div>
  );
}

function ChangePlanModal({ current, catalog, onClose, onSubscribe, loadingId }) {
  return (
    <Modal onClose={onClose} size="xl">
      <h3 className="font-display text-3xl sm:text-4xl tracking-wider text-ink mb-2">Mudar plano</h3>
      <p className="text-stone-600 text-sm mb-7">Selecione abaixo o plano para onde deseja migrar. A cobrança seguinte será no novo valor.</p>
      <div className="grid md:grid-cols-2 gap-5">
        {catalog.map((p, idx) => {
          const isCurrent = p.id === current.planId;
          return (
            <div key={p.id} className="relative">
              {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-ink text-white text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1">Plano atual</div>}
              <div className={isCurrent ? 'opacity-60 pointer-events-none' : ''}>
                <PlanCard p={p} idx={idx} compact onSubscribe={onSubscribe} loadingId={loadingId}/>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

Object.assign(window, { PlanosPage });
