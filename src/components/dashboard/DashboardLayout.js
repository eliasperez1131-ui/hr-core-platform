/**
 * Layout compartido para todos los dashboards.
 * Sidebar fija a la izquierda + Topbar arriba + contenido.
 *
 * Props:
 *   rol      -> string del rol de RBAC
 *   active   -> item de menú activo
 *   titulo   -> título del Topbar
 *   subtitulo-> subtítulo del Topbar
 *   children -> contenido principal
 */
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({
  rol,
  active,
  titulo,
  subtitulo,
  topbarExtra,
  children,
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar rol={rol} active={active} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar titulo={titulo} subtitulo={subtitulo}>
          {topbarExtra}
        </Topbar>
        <main className="flex-1 px-6 lg:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}