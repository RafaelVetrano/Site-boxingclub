import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import { IconInstagram, IconMapPin, IconArrowRight } from '@/icons';
import { IconWhatsApp } from '@/icons';
import { useToast } from '@/stores/toastStore';

// ── Contact constants (from contact.js) ───────────────────────────
const C = {
  phoneDisplay: '+55 16 99439-3133',
  whatsapp: 'https://wa.me/5516994393133',
  email: 'contato@boxingclub.com',
  instagramHandle: '@team_boxing_club',
  instagram: 'https://www.google.com/url?q=https://www.instagram.com/team_boxing_club',
  addressLines: ['R. Hilário Azzolini, 496', 'Nova Ribeirânia · Ribeirão Preto / SP'],
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('R Hilario Azzolini 496 Nova Ribeirania Ribeirão Preto'),
} as const;

// ── Contact Form ──────────────────────────────────────────────────
function ContactForm() {
  const toast = useToast();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    toast.success('Mensagem enviada!', 'Em breve entraremos em contato.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-7 sm:p-9 mt-10 text-left animate-reveal-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-7 h-px bg-bc-green" />
        <span className="text-[10px] tracking-[0.3em] uppercase text-bc-green font-semibold">Formulário de contato</span>
      </div>
      <h2 className="font-display text-3xl sm:text-4xl tracking-wider text-ink mb-6">ENVIE UMA <span className="text-bc-red">MENSAGEM</span></h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            className="bg-white border border-stone-300 focus-within:border-ink px-3 py-3 text-sm text-ink placeholder:text-stone-400 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="bg-white border border-stone-300 focus-within:border-ink px-3 py-3 text-sm text-ink placeholder:text-stone-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-6">
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">Mensagem</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Como podemos ajudar?"
          rows={4}
          required
          className="bg-white border border-stone-300 focus:border-ink px-3 py-3 text-sm text-ink placeholder:text-stone-400 focus:outline-none transition-colors resize-none"
        />
      </div>

      <Button
        type="submit"
        variant="green"
        size="lg"
        loading={sending}
        rightIcon={<IconArrowRight size={16} />}
      >
        Enviar mensagem
      </Button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export function Contato() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-cream min-h-[70vh] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center animate-reveal-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-10 h-px bg-bc-green" />
          <span className="text-xs tracking-[0.3em] uppercase font-semibold text-bc-green">Fale com a gente</span>
          <span className="w-10 h-px bg-bc-green" />
        </div>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9] mb-5">CONTATO</h1>
        <p className="text-stone-700 mb-10">
          O jeito mais rápido de falar com a gente é pelo WhatsApp ou Instagram. Veja abaixo como nos encontrar.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <a
            href={C.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-stone-200 p-6 hover:border-bc-red transition-colors text-left"
          >
            <IconInstagram size={24} className="text-bc-red mb-3" />
            <div className="font-display text-xl tracking-wider text-ink">INSTAGRAM</div>
            <div className="text-xs text-stone-500 mt-1 group-hover:text-bc-red transition-colors">{C.instagramHandle}</div>
          </a>

          <a
            href={C.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-stone-200 p-6 hover:border-bc-green transition-colors text-left"
          >
            <IconWhatsApp size={24} className="text-bc-green mb-3" />
            <div className="font-display text-xl tracking-wider text-ink">WHATSAPP</div>
            <div className="text-xs text-stone-500 mt-1 group-hover:text-bc-green transition-colors">{C.phoneDisplay}</div>
          </a>

          <a
            href={C.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-stone-200 p-6 hover:border-ink transition-colors text-left"
          >
            <IconMapPin size={24} className="text-ink mb-3" />
            <div className="font-display text-xl tracking-wider text-ink">ENDEREÇO</div>
            <div className="text-xs text-stone-500 mt-1 group-hover:text-ink transition-colors leading-snug">
              {C.addressLines.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-bc-green font-semibold mt-2 flex items-center gap-1">
              Abrir no Maps <IconArrowRight size={11} />
            </div>
          </a>
        </div>

        <a
          href={C.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-bc-green hover:bg-bc-green-dark text-white font-semibold tracking-wider uppercase text-sm px-7 py-4 rounded-sm transition-all"
        >
          <IconWhatsApp size={16} /> Falar no WhatsApp <IconArrowRight size={16} />
        </a>

        <ContactForm />
      </div>
    </section>
  );
}
