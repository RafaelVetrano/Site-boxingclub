import { IconCheck } from '@/icons';

function WellhubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l2.5 8 3-5.5 3 5.5L14 9" />
      <path d="M16.5 17V7" />
      <circle cx="20.5" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TotalPassMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h8" />
      <path d="M8 6v12" />
      <path d="M14 18V6h3.5a2.5 2.5 0 0 1 0 5H14" />
    </svg>
  );
}

function PartnerCard({ brand }: { brand: 'wellhub' | 'totalpass' }) {
  if (brand === 'wellhub') {
    return (
      <a href="https://wellhub.com/pt-br/" target="_blank" rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-white border border-stone-200 hover:border-[#FF4F12] hover:shadow-[0_10px_25px_-10px_rgba(255,79,18,0.4)] transition-all px-5 py-3.5 min-w-[200px]"
        title="Aceitamos Wellhub">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF4F12] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_4px_12px_-4px_rgba(255,79,18,0.5)]">
          <WellhubMark className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[9px] uppercase tracking-[0.25em] text-stone-500 font-semibold">Aceitamos</div>
          <div className="font-display text-xl tracking-[0.04em] text-[#1E2330] leading-none mt-0.5">wellhub</div>
        </div>
      </a>
    );
  }
  return (
    <a href="https://totalpass.com/" target="_blank" rel="noopener noreferrer"
      className="group flex items-center gap-3 bg-white border border-stone-200 hover:border-[#1C3FA8] hover:shadow-[0_10px_25px_-10px_rgba(28,63,168,0.4)] transition-all px-5 py-3.5 min-w-[200px]"
      title="Aceitamos TotalPass">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C5BD9] to-[#1C3FA8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_4px_12px_-4px_rgba(28,63,168,0.5)]">
        <TotalPassMark className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-[9px] uppercase tracking-[0.25em] text-stone-500 font-semibold">Aceitamos</div>
        <div className="font-display text-xl tracking-[0.04em] text-[#0D1F4E] leading-none mt-0.5">
          <span>Total</span><span className="text-[#2C5BD9]">Pass</span>
        </div>
      </div>
    </a>
  );
}

export function PartnersSection({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? 'mt-10' : 'mt-16'} relative animate-reveal-up`} style={{ animationDelay: '300ms' }}>
      <div className="relative max-w-4xl mx-auto">
        <div className="bg-white border border-stone-200 shadow-[0_20px_50px_-30px_rgba(13,107,58,0.2)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
          </div>
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center p-7 sm:p-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-px bg-bc-green" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-bc-green font-semibold">Parceiros aceitos</span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl tracking-wider text-ink leading-[0.95] mb-2">
                JÁ TEM UM <span className="text-bc-red">PLANO CORPORATIVO</span>?
              </h3>
              <p className="text-sm text-stone-600 max-w-md">
                Somos parceiros oficiais das principais plataformas de bem-estar. Apresente seu acesso na recepção e venha treinar.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 items-stretch md:items-end">
              <PartnerCard brand="wellhub" />
              <PartnerCard brand="totalpass" />
            </div>
          </div>
          <div className="px-7 sm:px-8 py-3 bg-stone-50 border-t border-stone-200 text-[10px] uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
            <IconCheck size={12} className="text-bc-green" strokeWidth={3} />
            Aulas ilimitadas conforme o seu plano · Sem mensalidade adicional
          </div>
        </div>
      </div>
    </div>
  );
}
