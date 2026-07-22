import LogoutButton from './LogoutButton';

export default function Topbar({ titulo, subtitulo, children }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 lg:px-10 py-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{titulo}</h1>
          {subtitulo && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitulo}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {children}
          <button
            type="button"
            className="relative p-2 rounded-md hover:bg-slate-100 text-slate-600"
            aria-label="Notificaciones"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center text-sm font-bold text-white">
              DC
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-ink-900 leading-tight">Daniela C.</p>
              <p className="text-xs text-slate-500 leading-tight">daniela@empresa.com</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}