// ============================================================
// Contato — Instagram, WhatsApp, Address (with Google Maps link)
// ============================================================
function ContatoPage() {
  const C = window.BC_CONTACT;
  return (
    <section data-screen-label="Contato" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-cream min-h-[70vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex"><div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" /></div>
      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center animate-reveal-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-10 h-px bg-bc-green" />
          <span className="text-xs tracking-[0.3em] uppercase font-semibold text-bc-green">Fale com a gente</span>
          <span className="w-10 h-px bg-bc-green" />
        </div>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9] mb-5">CONTATO</h1>
        <p className="text-stone-700 mb-10">O jeito mais rápido de falar com a gente é pelo WhatsApp ou Instagram. Veja abaixo como nos encontrar.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <a href={C.instagram} target="_blank" rel="noopener noreferrer" className="group bg-white border border-stone-200 p-6 hover:border-bc-red transition-colors text-left">
            <IconInstagram size={24} className="text-bc-red mb-3" />
            <div className="font-display text-xl tracking-wider text-ink">INSTAGRAM</div>
            <div className="text-xs text-stone-500 mt-1 group-hover:text-bc-red transition-colors">{C.instagramHandle}</div>
          </a>

          <a href={C.whatsapp} target="_blank" rel="noopener noreferrer" className="group bg-white border border-stone-200 p-6 hover:border-bc-green transition-colors text-left" data-comment-anchor="9ae835cce5-a-23-11">
            <IconWhatsApp size={24} className="text-bc-green mb-3" />
            <div className="font-display text-xl tracking-wider text-ink">WHATSAPP</div>
            <div className="text-xs text-stone-500 mt-1 group-hover:text-bc-green transition-colors">{C.phoneDisplay}</div>
          </a>

          <a href={C.mapsUrl} target="_blank" rel="noopener noreferrer" className="group bg-white border border-stone-200 p-6 hover:border-ink transition-colors text-left" data-comment-anchor="165bd50b3b-div-28-11">
            <IconMapPin size={24} className="text-ink mb-3" />
            <div className="font-display text-xl tracking-wider text-ink">ENDEREÇO</div>
            <div className="text-xs text-stone-500 mt-1 group-hover:text-ink transition-colors leading-snug">
              {C.addressLines.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-bc-green font-semibold mt-2 flex items-center gap-1">
              Abrir no Maps <IconArrowRight size={11}/>
            </div>
          </a>
        </div>

        <a href={C.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-bc-green hover:bg-bc-green-dark text-white font-semibold tracking-wider uppercase text-sm px-7 py-4 rounded-sm transition-all">
          <IconWhatsApp size={16} /> Falar no WhatsApp <IconArrowRight size={16} />
        </a>
      </div>
    </section>);

}

Object.assign(window, { ContatoPage });
