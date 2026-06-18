import React, { useId, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IconX, IconSparkles } from '@/icons';

// ── Spinner ──────────────────────────────────────────────────────
export function Spinner({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Button ────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'green' | 'dark' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-bc-red hover:bg-bc-red-dark text-white shadow-[0_8px_20px_-8px_rgba(196,30,42,0.5)]',
    green:   'bg-bc-green hover:bg-bc-green-dark text-white shadow-[0_8px_20px_-8px_rgba(13,107,58,0.5)]',
    dark:    'bg-ink hover:bg-stone-800 text-white',
    outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-white',
    ghost:   'text-stone-700 hover:bg-stone-100 hover:text-ink',
    danger:  'bg-bc-red hover:bg-bc-red-dark text-white',
  };
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-7 py-4 text-sm',
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 font-semibold tracking-wider uppercase transition-all rounded-sm ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading && <Spinner size={14} />}
      {!loading && leftIcon}
      <span className={loading ? 'opacity-80' : ''}>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, hint, type = 'text', icon, className = '', ...rest }: InputProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const effectiveType = isPwd ? (show ? 'text' : 'password') : type;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">{label}</label>}
      <div className={`relative flex items-center bg-white border ${error ? 'border-bc-red' : 'border-stone-300 focus-within:border-ink'} transition-colors`}>
        {icon && <div className="pl-3 text-stone-400 flex-shrink-0">{icon}</div>}
        <input
          id={id}
          type={effectiveType}
          className="flex-1 bg-transparent px-3 py-3 text-sm text-ink placeholder:text-stone-400 focus:outline-none"
          {...rest}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(!show)} className="pr-3 text-stone-400 hover:text-ink text-xs uppercase tracking-widest font-semibold">
            {show ? 'Ocultar' : 'Ver'}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-bc-red flex items-center gap-1.5"><span className="w-1 h-1 bg-bc-red rounded-full" />{error}</span>}
      {hint && !error && <span className="text-xs text-stone-500">{hint}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, children, className = '', ...rest }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">{label}</label>}
      <div className={`relative bg-white border ${error ? 'border-bc-red' : 'border-stone-300 focus-within:border-ink'}`}>
        <select className="appearance-none w-full bg-transparent px-3 py-3 text-sm text-ink focus:outline-none pr-9" {...rest}>{children}</select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {error && <span className="text-xs text-bc-red">{error}</span>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...rest }: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">{label}</label>}
      <textarea className={`bg-white border ${error ? 'border-bc-red' : 'border-stone-300 focus:border-ink'} px-3 py-3 text-sm text-ink focus:outline-none min-h-[80px] transition-colors`} {...rest} />
      {error && <span className="text-xs text-bc-red">{error}</span>}
    </div>
  );
}

// ── Stripe helper ─────────────────────────────────────────────────
export function ColorStripe() {
  return (
    <div className="h-1 flex flex-shrink-0">
      <div className="flex-1 bg-bc-green" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-bc-red" />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────
interface ModalProps {
  onClose?: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ onClose, children, size = 'md', className = '' }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [onClose]);

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center pointer-events-none">
        <div className={`relative bg-white w-full ${widths[size]} my-auto max-h-[calc(100dvh-3rem)] flex flex-col shadow-[0_30px_80px_-20px_rgba(13,107,58,0.4)] animate-modal-in pointer-events-auto ${className}`}>
          <ColorStripe />
          <button onClick={onClose} aria-label="Fechar" className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-stone-500 hover:text-ink hover:bg-stone-100 transition-colors z-10">
            <IconX size={18} />
          </button>
          <div className="p-7 sm:p-9 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Drawer ────────────────────────────────────────────────────────
interface DrawerProps {
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
}

export function Drawer({ onClose, children, title, width = 'max-w-md' }: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[90] animate-fade-in">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <aside className={`absolute right-0 top-0 bottom-0 w-full ${width} bg-white shadow-[0_0_80px_rgba(0,0,0,0.3)] flex flex-col animate-drawer-in`}>
        <ColorStripe />
        <header className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="font-display text-2xl tracking-wider text-ink">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-ink hover:bg-stone-100">
            <IconX size={18} />
          </button>
        </header>
        {children}
      </aside>
    </div>,
    document.body
  );
}

// ── Skeleton ──────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-stone-200 animate-pulse ${className}`} />;
}

// ── Avatar ────────────────────────────────────────────────────────
interface AvatarUser { firstName?: string; lastName?: string; avatar?: string | null; }

export function Avatar({ user, size = 36, className = '' }: { user?: AvatarUser | null; size?: number; className?: string }) {
  const initials = user ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() : '?';
  if (user?.avatar) {
    return <img src={user.avatar} alt={initials} className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-bc-green to-bc-green-dark text-white font-display tracking-wider flex items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || '?'}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title = 'Nada por aqui ainda', message, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-5">
        {icon || <IconSparkles size={28} />}
      </div>
      <h3 className="font-display text-3xl tracking-wider text-ink mb-2">{title}</h3>
      {message && <p className="text-stone-600 text-sm max-w-sm mx-auto mb-5">{message}</p>}
      {action}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
type BadgeColor = 'green' | 'red' | 'ink' | 'amber' | 'neutral';

export function Badge({ children, color = 'green', className = '' }: { children: React.ReactNode; color?: BadgeColor; className?: string }) {
  const colors: Record<BadgeColor, string> = {
    green:   'bg-bc-green/10 text-bc-green border-bc-green/30',
    red:     'bg-bc-red/10 text-bc-red border-bc-red/30',
    ink:     'bg-ink/10 text-ink border-ink/30',
    amber:   'bg-amber-100 text-amber-800 border-amber-300',
    neutral: 'bg-stone-100 text-stone-700 border-stone-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────
export function Card({ children, className = '', accent }: { children: React.ReactNode; className?: string; accent?: 'green' | 'red' }) {
  const stripe = accent === 'green' ? 'bg-bc-green' : accent === 'red' ? 'bg-bc-red' : null;
  return (
    <div className={`relative bg-white border border-stone-200 shadow-[0_20px_50px_-30px_rgba(13,107,58,0.18)] ${className}`}>
      {stripe && <div className={`absolute top-0 left-0 right-0 h-1 ${stripe}`} />}
      {children}
    </div>
  );
}

// ── BRL ───────────────────────────────────────────────────────────
export function brl(n: number | string | undefined | null): string {
  return 'R$ ' + (Number(n) || 0).toFixed(2).replace('.', ',');
}

// ── ProductGlyph ──────────────────────────────────────────────────
export function ProductGlyph({ glyph, color = '#0e1410', className = '' }: { glyph?: string; color?: string; className?: string }) {
  const map: Record<string, React.ReactNode> = {
    glove: <svg viewBox="0 0 120 120" className={className}><path d="M30 50c0-14 12-22 26-22h12c14 0 22 8 22 22v22c0 12-8 22-22 22H46c-10 0-16-6-16-14V50z" fill={color}/><path d="M50 28c0-8 6-12 14-12s14 4 14 12v8H50v-8z" fill={color}/><rect x="30" y="78" width="48" height="8" fill="rgba(255,255,255,0.25)"/></svg>,
    bandage: <svg viewBox="0 0 120 120" className={className}><rect x="20" y="55" width="80" height="10" rx="5" fill={color}/><path d="M20 60 Q40 50 60 60 T100 60" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none"/></svg>,
    shirt: <svg viewBox="0 0 120 120" className={className}><path d="M30 35 L50 28 L60 35 L70 28 L90 35 L96 50 L82 56 L82 92 L38 92 L38 56 L24 50 Z" fill={color}/></svg>,
    shinguard: <svg viewBox="0 0 120 120" className={className}><path d="M40 25 Q60 22 80 25 L78 95 Q60 100 42 95 Z" fill={color}/><rect x="44" y="38" width="32" height="3" fill="rgba(255,255,255,0.4)"/><rect x="44" y="55" width="32" height="3" fill="rgba(255,255,255,0.4)"/><rect x="44" y="72" width="32" height="3" fill="rgba(255,255,255,0.4)"/></svg>,
    rope: <svg viewBox="0 0 120 120" className={className}><rect x="20" y="40" width="14" height="22" rx="3" fill={color}/><rect x="86" y="40" width="14" height="22" rx="3" fill={color}/><path d="M34 50 Q60 90 86 50" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/></svg>,
    box: <svg viewBox="0 0 120 120" className={className}><rect x="28" y="34" width="64" height="58" fill={color}/><rect x="28" y="34" width="64" height="14" fill="rgba(255,255,255,0.2)"/><rect x="56" y="34" width="8" height="58" fill="rgba(255,255,255,0.2)"/></svg>,
  };
  return <>{map[glyph || 'box'] || map['box']}</>;
}

// ── ConfirmModal ──────────────────────────────────────────────────
interface ConfirmModalProps {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ title = 'Confirmar ação', message = 'Tem certeza?', confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel} size="sm">
      <h3 className="font-display text-3xl tracking-wider text-ink mb-3">{title}</h3>
      <p className="text-stone-600 text-sm mb-7">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

// ── ToastItem ─────────────────────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message?: string;
  duration?: number;
}

export function ToastItem({ t }: { t: Toast }) {
  const color = t.type === 'success' ? 'border-bc-green' : t.type === 'error' ? 'border-bc-red' : 'border-ink';
  const dot   = t.type === 'success' ? 'bg-bc-green'     : t.type === 'error' ? 'bg-bc-red'     : 'bg-ink';
  return (
    <div className={`pointer-events-auto bg-white border-l-4 ${color} shadow-[0_15px_40px_-15px_rgba(13,107,58,0.35)] px-4 py-3 pr-6 min-w-[280px] max-w-sm animate-toast-in`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
        <div className="flex-1">
          {t.title && <div className="font-display text-lg tracking-wider text-ink leading-tight">{t.title}</div>}
          {t.message && <div className="text-sm text-stone-600 mt-0.5">{t.message}</div>}
        </div>
      </div>
    </div>
  );
}

// ── ToastContainer ────────────────────────────────────────────────
export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return ReactDOM.createPortal(
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => <ToastItem key={t.id} t={t} />)}
    </div>,
    document.body
  );
}
