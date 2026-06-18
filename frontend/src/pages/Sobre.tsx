import { IconTarget, IconUsers, IconFlame, IconShield } from '@/icons';

const FEATURES = [
  { icon: IconTarget, color: 'green', title: 'Técnica acima de tudo', desc: 'Aulas focadas em fundamentos sólidos. Aqui não tem atalho: tem postura, footwork e jab bem colocado.' },
  { icon: IconUsers,  color: 'red',   title: 'Ambiente acolhedor',     desc: 'Iniciantes, mulheres, jovens e atletas. Cada um no seu ritmo, todos com respeito e treino de verdade.' },
  { icon: IconFlame,  color: 'green', title: 'Condicionamento real',   desc: 'Cardio, força, mobilidade e resistência. Você sai do treino sentindo o corpo — e a mente — mais leves.' },
  { icon: IconShield, color: 'red',   title: 'Professores qualificados', desc: 'Equipe técnica preparada para evoluir você do básico ao avançado, com foco em segurança e desempenho.' },
] as const;

const TAGS = ['Iniciantes', 'Avançados', 'Mulheres', 'Jovens', 'Adultos', 'Quem quer perder peso', 'Quem quer competir', 'Saúde mental'];

export function Sobre() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-16 max-w-3xl animate-reveal-up">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-bc-green" />
            <span className="text-xs tracking-[0.3em] uppercase text-bc-green font-semibold">Quem somos</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9] mb-6">
            MAIS QUE UMA<br />ACADEMIA — UM<br /><span className="text-bc-red">TIME</span>.
          </h1>
          <p className="text-stone-700 text-lg leading-relaxed">
            O Boxing Club nasceu da paixão pelo boxe e da vontade de criar um espaço onde
            técnica, comunidade e evolução caminham juntos. Aqui em Ribeirão Preto, recebemos
            quem nunca calçou uma luva e quem já compete — todos com o mesmo cuidado e o mesmo padrão de treino.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {FEATURES.map((f, i) => {
            const green = f.color === 'green';
            return (
              <div
                key={f.title}
                className="group relative p-7 bg-cream border border-stone-200 hover:border-transparent transition-all duration-500 animate-reveal-up"
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${green ? 'bg-bc-green' : 'bg-bc-red'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`} />
                <f.icon
                  className={`${green ? 'text-bc-green' : 'text-bc-red'} mb-5 transition-transform group-hover:scale-110 group-hover:rotate-[-6deg]`}
                  size={32}
                  strokeWidth={1.6}
                />
                <h3 className="font-display text-2xl tracking-wide text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 animate-reveal-up" style={{ animationDelay: '500ms' }}>
          <span className="text-xs uppercase tracking-[0.25em] text-stone-500 mr-3">Para quem é:</span>
          {TAGS.map((tag, i) => (
            <span
              key={tag}
              className={`px-4 py-1.5 border text-xs uppercase tracking-wider transition-colors cursor-default ${
                i % 3 === 0 ? 'border-bc-green/40 text-bc-green hover:bg-bc-green hover:text-white hover:border-bc-green'
                : i % 3 === 1 ? 'border-bc-red/40 text-bc-red hover:bg-bc-red hover:text-white hover:border-bc-red'
                : 'border-stone-300 text-stone-700 hover:bg-ink hover:text-cream hover:border-ink'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
