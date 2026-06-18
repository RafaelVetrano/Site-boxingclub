// ============================================================
// MultiImageUpload — drag-drop, reorder, primary, multiple files
// Used inside ProductForm in admin.
// ============================================================
function MultiImageUpload({ value = [], onChange, max = 8 }) {
  const [dragOver, setDragOver] = React.useState(false);
  const [dragIdx, setDragIdx] = React.useState(null);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const inputRef = React.useRef(null);

  const readFiles = (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    Promise.all(
      list.map((f) => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      }))
    ).then((urls) => {
      const next = [...value, ...urls].slice(0, max);
      onChange(next);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) readFiles(e.dataTransfer.files);
  };

  const remove = (i) => onChange(value.filter((_, j) => j !== i));

  const setPrimary = (i) => {
    if (i === 0) return;
    const next = [...value];
    const [moved] = next.splice(i, 1);
    next.unshift(moved);
    onChange(next);
  };

  const reorder = (from, to) => {
    if (from === to || from == null || to == null) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOver(false); }}
        onDrop={onDrop}
        className={`relative border-2 border-dashed transition-all ${dragOver ? 'border-bc-green bg-bc-green/5 scale-[1.01]' : 'border-stone-300 bg-cream hover:border-ink hover:bg-stone-50'} p-7 text-center cursor-pointer`}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/png, image/jpeg, image/webp, image/gif" multiple onChange={(e) => readFiles(e.target.files)} className="hidden"/>
        <div className={`mx-auto w-12 h-12 rounded-full ${dragOver ? 'bg-bc-green text-white' : 'bg-white border border-stone-300 text-stone-500'} flex items-center justify-center mb-3 transition-colors`}>
          <IconPlus size={20} strokeWidth={2.5}/>
        </div>
        <div className="font-display text-lg tracking-wider text-ink leading-none">
          {dragOver ? 'SOLTE PARA ENVIAR' : 'ARRASTE IMAGENS AQUI'}
        </div>
        <div className="text-xs text-stone-500 mt-2">
          ou <span className="text-bc-green font-semibold underline">selecione do computador</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mt-3">
          PNG · JPG · WEBP · GIF · até {max} imagens
        </div>
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500">
            <span>{value.length} {value.length === 1 ? 'imagem' : 'imagens'}{value.length >= max ? ' (máximo)' : ''}</span>
            <span className="text-stone-400 normal-case tracking-normal">Arraste para reordenar · A primeira é a capa</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {value.map((src, i) => {
              const isCover = i === 0;
              const isDragging = dragIdx === i;
              const isDropTarget = dragIdx !== null && hoverIdx === i && dragIdx !== i;
              return (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragEnter={() => setHoverIdx(i)}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDragLeave={() => setHoverIdx((h) => (h === i ? null : h))}
                  onDrop={(e) => { e.preventDefault(); reorder(dragIdx, i); setDragIdx(null); setHoverIdx(null); }}
                  onDragEnd={() => { setDragIdx(null); setHoverIdx(null); }}
                  className={`group relative aspect-square bg-stone-50 border-2 overflow-hidden cursor-move transition-all
                    ${isCover ? 'border-bc-green ring-2 ring-bc-green/20' : 'border-stone-200'}
                    ${isDragging ? 'opacity-40 scale-95' : ''}
                    ${isDropTarget ? 'ring-2 ring-bc-red border-bc-red' : ''}
                  `}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" draggable={false}/>

                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 bg-bc-green text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 flex items-center gap-1 z-10">
                      <IconStar size={9} fill="white"/> Capa
                    </span>
                  )}

                  {/* Position handle */}
                  <span className="absolute top-1.5 right-1.5 bg-ink/70 text-white text-[9px] font-mono font-bold w-5 h-5 flex items-center justify-center z-10">{i + 1}</span>

                  {/* Hover actions */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end gap-1 p-1.5">
                    {!isCover && (
                      <button type="button" onClick={() => setPrimary(i)} title="Definir como capa"
                        className="flex-1 bg-white text-ink text-[10px] uppercase font-semibold tracking-[0.15em] px-2 py-1.5 hover:bg-bc-green hover:text-white transition-colors flex items-center justify-center gap-1">
                        <IconStar size={10}/> Capa
                      </button>
                    )}
                    <button type="button" onClick={() => remove(i)} title="Remover"
                      className={`bg-white text-bc-red w-8 h-8 flex items-center justify-center hover:bg-bc-red hover:text-white transition-colors ${isCover ? 'flex-1' : ''}`}>
                      <IconTrash size={12}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MultiImageUpload });
