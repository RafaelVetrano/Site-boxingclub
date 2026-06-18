// ============================================================
// Home — Hero (and a follow-on Instagram strip)
// ============================================================
function HomePage() {
  const { navigate } = useRoute();
  return <>
    <Hero onCta={(to) => navigate(to)} />
    <InstagramStrip />
  </>;
}

function Hero({ onCta }) {
  return (
    <section
      id="top"
      data-screen-label="Hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-cream pt-24 pb-16">
      
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -right-32 top-0 w-[40%] h-full bg-bc-green/[0.05] -skew-x-12" />
        <div className="absolute -right-64 top-0 w-[30%] h-full bg-bc-red/[0.05] -skew-x-12" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(14,20,16,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,16,0.6)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center w-full">
        <div className="lg:col-span-7 reveal-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-bc-green/40 bg-bc-green/5 rounded-sm mb-7">
            <span className="w-1.5 h-1.5 bg-bc-green rounded-full animate-pulse" />
            <span className="text-[11px] tracking-[0.3em] uppercase text-bc-green font-semibold">Academia de Boxe · Ribeirão Preto</span>
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.85] tracking-tight text-ink mb-7" data-comment-anchor="f79f3cf360-h1-36-11">
            ONDE A<br />
            <span className="relative inline-block">
              <span className="text-bc-red">DISCIPLINA</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path d="M0,10 Q75,2 150,7 T300,5" stroke="#0d6b3a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            VIRA <span className="text-bc-green">SOCO</span>.
          </h1>

          <p className="text-stone-700 text-lg sm:text-xl max-w-xl mb-9 leading-relaxed">
            Treinos sérios, ambiente acolhedor e técnica de verdade. No Boxing Club,
            cada round é um passo para a melhor versão de você — dentro e fora do ringue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" rightIcon={<IconArrowRight size={18} />} onClick={() => onCta('planos')}>
              Agende uma aula experimental
            </Button>
            <Button variant="outline" size="lg" onClick={() => onCta('sobre')}>
              Conheça a academia
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-12 pt-10 border-t border-stone-300 max-w-xl">
            {[
            { value: '500+', label: 'Alunos ativos', accent: 'text-bc-green' },
            { value: '15+', label: 'Aulas por semana', accent: 'text-ink' },
            { value: '100%', label: 'Foco em técnica', accent: 'text-bc-red' }].
            map((s) =>
            <div key={s.label}>
                <div className={`font-display text-4xl sm:text-5xl ${s.accent}`}>{s.value}</div>
                <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 mt-1">{s.label}</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 reveal-up reveal-delay-200">
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-full bg-white shadow-[0_30px_80px_-20px_rgba(13,107,58,0.25)]" />
            <div className="absolute inset-2 rounded-full border-[6px] border-bc-green" />
            <div className="absolute inset-6 rounded-full border-2 border-bc-red animate-spin-slow" style={{ borderStyle: 'dashed' }} />
            <div className="absolute inset-10 rounded-full border border-stone-200" />
            <div className="relative h-full flex items-center justify-center p-16">
              <img src={window.LOGO_DATA} alt="Boxing Club Logo" className="w-full h-full object-contain animate-float drop-shadow-[0_10px_25px_rgba(13,107,58,0.25)]" />
            </div>
            <div className="absolute -top-2 -left-2 w-10 h-10 border-t-[3px] border-l-[3px] border-bc-green" />
            <div className="absolute -top-2 -right-2 w-10 h-10 border-t-[3px] border-r-[3px] border-bc-red" />
            <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b-[3px] border-l-[3px] border-bc-red" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-[3px] border-r-[3px] border-bc-green" />
          </div>
        </div>
      </div>

      <div className="hidden xl:flex absolute bottom-6 right-8 flex-col items-center gap-2 text-stone-500 pointer-events-none">
        <span className="text-[10px] tracking-[0.3em] uppercase [writing-mode:vertical-rl] rotate-180">Role para descer</span>
        <div className="w-px h-10 bg-gradient-to-b from-bc-green to-transparent" />
      </div>
    </section>);

}

function InstagramStrip() {
  const posts = [
  { type: 'green', label: 'Treino #001' },
  { type: 'red', label: 'Sparring' },
  { type: 'photo', label: 'Técnica' },
  { type: 'green', label: 'Aluno do mês' },
  { type: 'red', label: 'Ambiente' },
  { type: 'photo', label: 'Evento' }];

  const tile = (t, label) => {
    if (t === 'green') return (
      <><div className="absolute inset-0 bg-bc-green" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" /><div className="absolute inset-0 flex items-center justify-center font-display tracking-widest text-sm sm:text-base text-white/85">{label.toUpperCase()}</div></>);

    if (t === 'red') return (
      <><div className="absolute inset-0 bg-bc-red" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.18),transparent_60%)]" /><div className="absolute inset-0 flex items-center justify-center font-display tracking-widest text-sm sm:text-base text-white/85">{label.toUpperCase()}</div></>);

    return (
      <><div className="absolute inset-0 bg-stone-100" /><div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(14,20,16,0.07)_50%,transparent_52%)] bg-[size:12px_12px]" /><div className="absolute inset-3 border border-dashed border-stone-400 flex flex-col items-center justify-center text-stone-500 gap-1"><span className="font-display text-xs tracking-widest">{label.toUpperCase()}</span><span className="text-[9px] font-mono uppercase">foto</span></div></>);

  };

  return (
    <section data-screen-label="Instagram" className="relative py-20 sm:py-24 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <IconInstagram size={18} className="text-bc-red" />
            <span className="text-xs tracking-[0.3em] uppercase text-bc-red font-semibold">@team_boxing_club</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[0.9]">SIGA A <span className="text-bc-green">BOXING CLUB</span></h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-8">
          {posts.map((p, i) =>
          <a key={i} href={window.BC_CONTACT.instagram} target="_blank" rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden border border-stone-200 hover:border-ink transition-all">
              {tile(p.type, p.label)}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <IconInstagram size={28} className="text-white" />
              </div>
            </a>
          )}
        </div>
        <div className="flex justify-center">
          <a href={window.BC_CONTACT.instagram} target="_blank" rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 bg-ink hover:bg-bc-green text-white font-semibold tracking-[0.2em] uppercase text-sm px-7 py-3.5 transition-all">
            <IconInstagram size={16} /> Ver Instagram <IconArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>);

}

Object.assign(window, { HomePage });