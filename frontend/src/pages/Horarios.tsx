import { useState, useMemo } from 'react';
import { Skeleton, EmptyState } from '@/components/ui';
import { IconSearch, IconCalendar, IconClock } from '@/icons';
import { useSchedule, useCategories, ClassSchedule, ClassCategory } from '@/api/hooks';
import { SCHEDULE_DAYS_LABEL as DAYS_FULL, SCHEDULE_DAYS_SHORT as DAYS_SHORT } from '@/lib/scheduleConstants';

// ── Grid build helpers ─────────────────────────────────────────────
function buildGrid(items: ClassSchedule[]) {
  if (!items.length) return { times: [] as string[], byCell: {} as Record<string, ClassSchedule[]> };
  const timeSet = new Set<string>();
  const byCell: Record<string, ClassSchedule[]> = {};
  items.forEach((it) => {
    timeSet.add(it.time);
    const key = `${it.time}|${it.day}`;
    (byCell[key] ||= []).push(it);
  });
  const times = [...timeSet].sort((a, b) => a.localeCompare(b));
  return { times, byCell };
}

// ── Skeleton ──────────────────────────────────────────────────────
function ScheduleSkeleton() {
  return (
    <div className="border border-stone-200 bg-white">
      <div className="grid bg-stone-100 p-4 gap-3" style={{ gridTemplateColumns: '110px repeat(6, minmax(0, 1fr))' }}>
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
      </div>
      {Array.from({ length: 6 }).map((_, r) => (
        <div key={r} className="grid p-3 gap-3 border-t border-stone-100" style={{ gridTemplateColumns: '110px repeat(6, minmax(0, 1fr))' }}>
          {Array.from({ length: 7 }).map((_, c) => <Skeleton key={c} className="h-12" />)}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export function Horarios() {
  const { data: rawSchedule, isLoading: loadingSchedule } = useSchedule();
  const { data: categories = [], isLoading: loadingCats } = useCategories();

  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch]       = useState('');

  const isLoading = loadingSchedule || loadingCats;

  const filtered = useMemo(() => {
    if (!rawSchedule) return [];
    return rawSchedule.filter((it) => {
      if (filterCat !== 'all' && it.categoryId !== filterCat) return false;
      if (search) {
        const cat = it.category?.label || '';
        const hay = `${it.time} ${cat} ${it.teacher} ${it.notes}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rawSchedule, filterCat, search]);

  const grid = useMemo(() => buildGrid(filtered), [filtered]);

  const catById = useMemo(() => {
    const map: Record<string, ClassCategory> = {};
    categories.forEach((c) => { map[c.id] = c; });
    return map;
  }, [categories]);

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 bg-cream overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-bc-green" /><div className="flex-1 bg-white" /><div className="flex-1 bg-bc-red" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-reveal-up">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-bc-red" />
              <span className="text-xs tracking-[0.3em] uppercase text-bc-red font-semibold">Grade de aulas</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[0.9]">
              HORÁRIOS<br />DOS <span className="text-bc-green">TREINOS</span>
            </h1>
          </div>
          <p className="text-stone-700 max-w-md">
            Aulas de segunda a sábado, manhã e noite. Chegue 10 minutos antes para preparação e venha conhecer a equipe.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2 animate-reveal-up" style={{ animationDelay: '100ms' }}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por hora, professor, categoria…"
              className="w-full bg-white border border-stone-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
          </div>
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold border ${filterCat === 'all' ? 'bg-ink text-white border-ink' : 'bg-white text-stone-700 border-stone-300 hover:border-ink'}`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold border inline-flex items-center gap-2 ${filterCat === c.id ? 'text-white border-transparent' : 'bg-white text-stone-700 border-stone-300 hover:border-ink'}`}
              style={filterCat === c.id ? { background: c.color } : {}}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: filterCat === c.id ? 'white' : c.color }} />
              {c.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <ScheduleSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma aula encontrada"
            message="Tente ajustar os filtros ou a busca."
            icon={<IconCalendar size={28} />}
          />
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hidden md:block animate-reveal-up" style={{ animationDelay: '200ms' }}>
              <div className="border border-stone-200 bg-white shadow-[0_30px_80px_-40px_rgba(13,107,58,0.25)] overflow-hidden">
                <div className="grid bg-ink" style={{ gridTemplateColumns: '110px repeat(6, minmax(0, 1fr))' }}>
                  <div className="px-4 py-4 border-r border-white/10 flex items-center justify-center">
                    <IconClock size={16} className="text-stone-400" />
                  </div>
                  {DAYS_FULL.map((d, i) => (
                    <div key={d} className="px-3 py-4 text-center border-r last:border-r-0 border-white/10 relative">
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: i === 5 ? '#c41e2a' : '#0d6b3a' }} />
                      <div className="font-display text-xl tracking-wider text-white">{DAYS_SHORT[i]}</div>
                      <div className="text-[9px] uppercase tracking-widest text-stone-400 mt-0.5">{d}</div>
                    </div>
                  ))}
                </div>

                {grid.times.map((time) => (
                  <div key={time} className="grid border-t border-stone-200" style={{ gridTemplateColumns: '110px repeat(6, minmax(0, 1fr))' }}>
                    <div className="px-4 py-4 border-r border-stone-200 bg-stone-50 flex items-center justify-center">
                      <span className="font-display text-2xl tracking-wider text-ink">{time}<span className="text-stone-400 text-base">h</span></span>
                    </div>
                    {[0, 1, 2, 3, 4, 5].map((d) => {
                      const cellItems = grid.byCell[`${time}|${d}`] || [];
                      if (cellItems.length === 0) {
                        return (
                          <div
                            key={d}
                            className="border-r last:border-r-0 border-stone-200 min-h-[68px] bg-[linear-gradient(135deg,transparent_46%,#f1efe7_47%,#f1efe7_53%,transparent_54%)] bg-[size:14px_14px]"
                          />
                        );
                      }
                      return (
                        <div key={d} className="border-r last:border-r-0 border-stone-200 min-h-[68px] p-1.5 flex flex-col gap-1">
                          {cellItems.map((it) => {
                            const cat = it.category || catById[it.categoryId];
                            return (
                              <div
                                key={it.id}
                                className="flex-1 rounded-sm px-2 py-1.5 flex flex-col items-center justify-center text-center text-white transition-transform hover:scale-[1.03] cursor-pointer min-h-[36px]"
                                style={{ background: cat?.color || '#0e1410' }}
                                title={`${cat?.label || ''} · ${it.teacher}${it.notes ? ' · ' + it.notes : ''}`}
                              >
                                <span className="font-display text-sm tracking-wider leading-none">{(cat?.label || '').toUpperCase()}</span>
                                {it.notes && <span className="text-[8px] uppercase tracking-widest mt-0.5 opacity-80">{it.notes}</span>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile per-day */}
            <div className="md:hidden space-y-3">
              {DAYS_FULL.map((day, di) => {
                const dayItems = filtered.filter((i) => i.day === di).sort((a, b) => a.time.localeCompare(b.time));
                return (
                  <div
                    key={day}
                    className="border border-stone-200 bg-white p-5 animate-reveal-up"
                    style={{ animationDelay: `${di * 60 + 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-2xl tracking-wider text-ink">{day.toUpperCase()}</h3>
                      <span className="text-xs text-stone-500 uppercase tracking-widest">
                        {dayItems.length === 0 ? 'Sem aulas' : `${dayItems.length} aula${dayItems.length > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    {dayItems.length === 0 ? (
                      <div className="py-4 text-center text-stone-400 text-xs uppercase tracking-widest">— Descanso —</div>
                    ) : (
                      <ul className="space-y-2">
                        {dayItems.map((it) => {
                          const cat = it.category || catById[it.categoryId];
                          return (
                            <li key={it.id} className="flex items-center gap-3">
                              <span className="font-display text-lg tracking-wider text-ink w-16 shrink-0">{it.time}h</span>
                              <span className="flex-1 px-3 py-2 text-xs font-display tracking-widest uppercase text-white" style={{ background: cat?.color || '#0e1410' }}>
                                {cat?.label || it.categoryId}{it.notes ? ` · ${it.notes}` : ''}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p className="text-center text-xs text-stone-500 mt-8 uppercase tracking-widest">
          * Horários sujeitos a alteração. Confirme pelo Instagram @team_boxing_club.
        </p>
      </div>
    </section>
  );
}
