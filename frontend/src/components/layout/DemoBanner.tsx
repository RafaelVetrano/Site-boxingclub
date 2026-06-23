import { useState } from 'react';
import { IconX } from '@/icons';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-ink text-white text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-3 px-4 py-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-bc-red flex-shrink-0" />
      <span>
        Versão demo para portfólio —{' '}
        <span className="text-stone-300 font-normal normal-case tracking-normal">
          pagamentos via Mercado Pago estão desativados.
        </span>
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fechar aviso"
        className="ml-2 text-stone-400 hover:text-white transition-colors flex-shrink-0"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}
