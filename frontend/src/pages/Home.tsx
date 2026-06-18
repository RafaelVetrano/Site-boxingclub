import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Skeleton } from '@/components/ui';
import { PartnersSection } from '@/components/layout/PartnersSection';
import {
  IconArrowRight, IconInstagram, IconTarget, IconUsers, IconFlame, IconShield, IconCheck, IconStar,
} from '@/icons';
import { usePlans } from '@/api/hooks';

// ── Reveal on scroll ─────────────────────────────────────────────
function useRevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('animate-reveal-up');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden bg-cream pt-24 pb-16"
    >
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

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.85] tracking-tight text-ink mb-7">
            RESERVADO<br />
            <span className="relative inline-block">
              <span className="text-bc-red">PARA</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path d="M0,10 Q75,2 150,7 T300,5" stroke="#0d6b3a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            <span className="text-bc-green">CAMPEÕES</span>.
          </h1>

          <p className="text-stone-700 text-lg sm:text-xl max-w-xl mb-9 leading-relaxed">
            Treinos sérios, ambiente acolhedor e técnica de verdade. No Boxing Club,
            cada round é um passo para a melhor versão de você — dentro e fora do ringue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" rightIcon={<IconArrowRight size={18} />} onClick={() => navigate('/planos')}>
              Agende uma aula experimental
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/sobre')}>
              Conheça a academia
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-12 pt-10 border-t border-stone-300 max-w-xl">
            {[
              { value: '500+', label: 'Alunos ativos', accent: 'text-bc-green' },
              { value: '15+', label: 'Aulas por semana', accent: 'text-ink' },
              { value: '100%', label: 'Foco em técnica', accent: 'text-bc-red' },
            ].map((s) => (
              <div key={s.label}>
                <div className={`font-display text-4xl sm:text-5xl ${s.accent}`}>{s.value}</div>
                <div className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-stone-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 reveal-up reveal-delay-200">
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-full bg-white shadow-[0_30px_80px_-20px_rgba(13,107,58,0.25)]" />
            <div className="absolute inset-2 rounded-full border-[6px] border-bc-green" />
            <div className="absolute inset-6 rounded-full border-2 border-bc-red animate-spin-slow" style={{ borderStyle: 'dashed' }} />
            <div className="absolute inset-10 rounded-full border border-stone-200" />
            <div className="relative h-full flex items-center justify-center p-16">
              <img
                src="/logo.png"
                alt="Boxing Club Logo"
                className="w-full h-full object-contain animate-float drop-shadow-[0_10px_25px_rgba(13,107,58,0.25)]"
              />
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
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: IconTarget, color: 'green', title: 'Técnica acima de tudo', desc: 'Aulas focadas em fundamentos sólidos. Postura, footwork e jab bem colocado.' },
  { icon: IconUsers,  color: 'red',   title: 'Ambiente acolhedor',     desc: 'Iniciantes, mulheres, jovens e atletas. Cada um no seu ritmo, com respeito e treino de verdade.' },
  { icon: IconFlame,  color: 'green', title: 'Condicionamento real',   desc: 'Cardio, força, mobilidade e resistência — você sai do treino mais leve por dentro e por fora.' },
  { icon: IconShield, color: 'red',   title: 'Professores qualificados', desc: 'Equipe técnica preparada para te levar do básico ao avançado com segurança e desempenho.' },
] as const;

function FeaturesSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14" data-reveal>
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-10 h-px bg-bc-green" />
            <span className="text-xs tracking-[0.3em] uppercase text-bc-green font-semibold">Por que Boxing Club</span>
            <span className="w-10 h-px bg-bc-green" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[0.9]">
            O QUE NOS <span className="text-bc-red">DIFERENCIA</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const green = f.color === 'green';
            return (
              <div
                key={f.title}
                className="group relative p-7 bg-cream border border-stone-200 hover:border-transparent transition-all duration-500"
                data-reveal
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${green ? 'bg-bc-green' : 'bg-bc-red'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`} />
                <f.icon className={`${green ? 'text-bc-green' : 'text-bc-red'} mb-5 transition-transform group-hover:scale-110 group-hover:rotate-[-6deg]`} size={32} strokeWidth={1.6} />
                <h3 className="font-display text-2xl tracking-wide text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Plans Preview ─────────────────────────────────────────────────
function PlansPreview() {
  const navigate = useNavigate();
  const { data: plans, isLoading } = usePlans();

  return (
    <section className="relative py-20 sm:py-24 bg-cream overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,20,16,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,16,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14" data-reveal>
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-10 h-px bg-bc-green" />
            <span className="text-xs tracking-[0.3em] uppercase text-bc-green font-semibold">Planos & Mensalidades</span>
            <span className="w-10 h-px bg-bc-green" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[0.9] mb-4">
            ESCOLHA O <span className="text-bc-red">SEU</span><br />CAMINHO
          </h2>
          <p className="text-stone-700 max-w-xl mx-auto">Treinos ilimitados, professores qualificados e ambiente de elite. Sem letras miúdas.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white border border-stone-200 p-8 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-20 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            : (plans || []).map((p, idx) => {
                const isHighlight = p.highlight;
                return (
                  <div key={p.id} className="relative" data-reveal style={{ animationDelay: `${idx * 150}ms` }}>
                    {isHighlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-bc-red text-white text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 flex items-center gap-1.5 shadow-[0_8px_20px_-8px_rgba(196,30,42,0.6)]">
                          <IconStar size={11} /> {p.badge}
                        </div>
                      </div>
                    )}
                    <div className={`relative h-full p-8 sm:p-10 transition-all duration-500 bg-white ${
                      isHighlight
                        ? 'border-2 border-bc-red shadow-[0_30px_80px_-30px_rgba(196,30,42,0.4)]'
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
                          <span className="font-display text-7xl sm:text-8xl text-ink leading-none">{Number(p.price).toFixed(2).split('.')[0]}</span>
                          <span className="text-2xl text-stone-500">,{Number(p.price).toFixed(2).split('.')[1]}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-sm text-stone-500">{p.period}</span>
                          {p.originalPrice && (
                            <>
                              <span className="text-sm text-stone-400 line-through">R$ {Number(p.originalPrice).toFixed(2).replace('.', ',')}</span>
                              <span className="text-[10px] uppercase tracking-widest bg-bc-green text-white px-2 py-0.5 font-semibold">Economize 10%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-3 mb-9">
                        {p.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-3 text-sm text-stone-700">
                            <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${p.accent === 'green' ? 'bg-bc-green/10 text-bc-green' : 'bg-bc-red/10 text-bc-red'}`}>
                              <IconCheck size={12} strokeWidth={3} />
                            </span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isHighlight ? 'primary' : 'green'}
                        className="w-full"
                        size="lg"
                        onClick={() => navigate('/planos')}
                        rightIcon={<IconArrowRight size={16} />}
                      >
                        Ver plano
                      </Button>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="text-center mt-10" data-reveal>
          <Button variant="outline" size="lg" onClick={() => navigate('/planos')} rightIcon={<IconArrowRight size={16} />}>
            Ver todos os planos
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Instagram Strip ───────────────────────────────────────────────
const INSTAGRAM_URL = 'https://www.google.com/url?q=https://www.instagram.com/team_boxing_club';

const POSTS = [
  { type: 'green', label: 'Treino #001' },
  { type: 'red',   label: 'Sparring' },
  { type: 'photo', label: 'Técnica' },
  { type: 'green', label: 'Aluno do mês' },
  { type: 'red',   label: 'Ambiente' },
  { type: 'photo', label: 'Evento' },
] as const;

function InstagramTile({ type, label }: { type: string; label: string }) {
  if (type === 'green') return (
    <>
      <div className="absolute inset-0 bg-bc-green" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
      <div className="absolute inset-0 flex items-center justify-center font-display tracking-widest text-sm sm:text-base text-white/85">{label.toUpperCase()}</div>
    </>
  );
  if (type === 'red') return (
    <>
      <div className="absolute inset-0 bg-bc-red" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
      <div className="absolute inset-0 flex items-center justify-center font-display tracking-widest text-sm sm:text-base text-white/85">{label.toUpperCase()}</div>
    </>
  );
  return (
    <>
      <div className="absolute inset-0 bg-stone-100" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(14,20,16,0.07)_50%,transparent_52%)] bg-[size:12px_12px]" />
      <div className="absolute inset-3 border border-dashed border-stone-400 flex flex-col items-center justify-center text-stone-500 gap-1">
        <span className="font-display text-xs tracking-widest">{label.toUpperCase()}</span>
        <span className="text-[9px] font-mono uppercase">foto</span>
      </div>
    </>
  );
}

function InstagramStrip() {
  return (
    <section className="relative py-20 sm:py-24 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10" data-reveal>
          <div className="flex items-center justify-center gap-3 mb-4">
            <IconInstagram size={18} className="text-bc-red" />
            <span className="text-xs tracking-[0.3em] uppercase text-bc-red font-semibold">@team_boxing_club</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[0.9]">
            SIGA A <span className="text-bc-green">BOXING CLUB</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-8">
          {POSTS.map((p, i) => (
            <a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden border border-stone-200 hover:border-ink transition-all"
            >
              <InstagramTile type={p.type} label={p.label} />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <IconInstagram size={28} className="text-white" />
              </div>
            </a>
          ))}
        </div>
        <div className="flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-ink hover:bg-bc-green text-white font-semibold tracking-[0.2em] uppercase text-sm px-7 py-3.5 transition-all"
          >
            <IconInstagram size={16} /> Ver Instagram <IconArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export function Home() {
  useRevealObserver();
  return (
    <>
      <Hero />
      <FeaturesSection />
      <PlansPreview />
      <InstagramStrip />
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <PartnersSection />
        </div>
      </section>
    </>
  );
}
