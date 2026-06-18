// ============================================================
// Footer — present on every public page
// ============================================================
function Footer() {
  const { navigate, path } = useRoute();
  const C = window.BC_CONTACT;
  const isAdminArea = path.startsWith('admin');
  if (isAdminArea) return null;

  const navLinks = [
    { to: 'sobre', label: 'Sobre' },
    { to: 'horarios', label: 'Horários' },
    { to: 'planos', label: 'Planos' },
    { to: 'loja', label: 'Loja' },
  ];
  const go = (e, to) => { e.preventDefault(); navigate(to); };

  return (
    <footer id="contato-footer" className="relative bg-ink text-cream pt-20 pb-8 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-4">
            <a href="#/home" onClick={(e) => go(e, 'home')} className="flex items-center gap-3 mb-5">
              <img src={window.LOGO_DATA} alt="Boxing Club" className="w-12 h-12 object-contain" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-2xl tracking-wider text-white">
                  BOXING<span className="text-bc-red">.</span>CLUB
                </span>
                <span className="text-[10px] text-stone-400 tracking-[0.3em] uppercase">Ribeirão Preto · SP</span>
              </div>
            </a>
            <p className="text-sm text-stone-300 leading-relaxed mb-6">
              Academia especializada em boxe. Técnica de verdade, comunidade real e treinos para todos os níveis.
            </p>
            <div className="flex items-center gap-3">
              <a href={C.instagram} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-stone-700 hover:border-bc-red hover:bg-bc-red transition-all"
                aria-label="Instagram">
                <IconInstagram size={16} className="text-white" />
              </a>
              <a href={C.whatsapp} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-stone-700 hover:border-bc-green hover:bg-bc-green transition-all"
                aria-label="WhatsApp">
                <IconWhatsApp size={16} className="text-white" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-sm tracking-[0.25em] uppercase text-white mb-5">Navegue</h4>
            <ul className="space-y-3 text-sm">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <a href={`#/${l.to}`} onClick={(e) => go(e, l.to)} className="text-stone-300 hover:text-bc-green transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display text-sm tracking-[0.25em] uppercase text-white mb-5">Funcionamento</h4>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex justify-between gap-4"><span>Seg — Sex</span><span className="text-white">06:30 — 21:00</span></li>
              <li className="flex justify-between gap-4"><span>Sábado</span><span className="text-white">08:00 — 11:00</span></li>
              <li className="flex justify-between gap-4"><span>Domingo</span><span className="text-stone-500">Fechado</span></li>
            </ul>
          </div>

          <div className="md:col-span-3" id="contato">
            <h4 className="font-display text-sm tracking-[0.25em] uppercase text-white mb-5">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-stone-300">
                <IconMapPin size={16} className="text-bc-green flex-shrink-0 mt-0.5"/>
                <a href={C.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors leading-snug">
                  {C.addressLines.map((l, i) => <div key={i}>{l}</div>)}
                </a>
              </li>
              <li className="flex items-start gap-3 text-stone-300">
                <IconWhatsApp size={16} className="text-bc-green flex-shrink-0 mt-0.5"/>
                <a href={C.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{C.phoneDisplay}</a>
              </li>
              <li className="flex items-start gap-3 text-stone-300"><IconMail size={16} className="text-bc-green flex-shrink-0 mt-0.5"/><a href={`mailto:${C.email}`} className="hover:text-white transition-colors">{C.email}</a></li>
              <li className="flex items-start gap-3 text-stone-300"><IconInstagram size={16} className="text-bc-green flex-shrink-0 mt-0.5"/><a href={C.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{C.instagramHandle}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500 uppercase tracking-[0.2em]">© 2026 Boxing Club. Todos os direitos reservados.</p>
          <p className="text-xs text-stone-600 tracking-wider">Feito com <span className="text-bc-red">♥</span> em Ribeirão Preto</p>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
