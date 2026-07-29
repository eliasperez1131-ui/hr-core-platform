'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardClientLayout({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [empresaModal, setEmpresaModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    giro_industrial: 'Seguridad_Privada',
    plan_activo: 'Trial',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const menuItems = [
    { href: '/dashboard-saas', label: 'Inicio', icon: 'home' },
    { href: '/dashboard-saas/vacantes/nueva', label: 'Nueva vacante', icon: 'plus' },
    { href: '/dashboard-saas/empresas', label: 'Workspaces', icon: 'building' },
    { href: '/dashboard-saas/usuarios', label: 'Usuarios', icon: 'users' },
    { href: '/dashboard-saas/prospectos', label: 'Prospectos', icon: 'inbox' },
    { href: '/dashboard-saas/configuracion', label: 'Config global', icon: 'settings' },
  ];

  const isActive = (href) => {
    if (href === '/dashboard-saas') return pathname === '/dashboard-saas';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('✓ Empresa creada');
        setFormData({ nombre_empresa: '', giro_industrial: 'Seguridad_Privada', plan_activo: 'Trial' });
        setTimeout(() => {
          setEmpresaModal(false);
          window.location.reload();
        }, 1500);
      } else {
        setMessage('✗ ' + (data.error || 'Error'));
      }
    } catch (err) {
      setMessage('✗ ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-100 min-h-screen border-r border-slate-200">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">HR</div>
              <div>
                <div className="text-sm font-bold text-slate-900">HR<span className="text-blue-600">CORE</span></div>
                <div className="text-xs text-slate-500">SUPER ADMIN</div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{item.icon === 'home' ? '⌂' : item.icon === 'plus' ? '+' : item.icon === 'building' ? '🏢' : item.icon === 'users' ? '👥' : item.icon === 'inbox' ? '📥' : '⚙'}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div>
              <h1 className="text-sm text-slate-600">Hola, {user?.workspace?.nombre_empresa || 'Empresa'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-600">
                {user?.nombre_completo || user?.email || 'Admin'}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-600 hover:text-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 bg-slate-50">
            {children}
          </div>
        </main>
      </div>

      {/* Modal para crear empresa */}
      {empresaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Crear Nueva Empresa</h2>
            <form onSubmit={handleCrearEmpresa} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre de la empresa *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_empresa}
                  onChange={(e) => setFormData({...formData, nombre_empresa: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  placeholder="Grupo HR Demo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Giro</label>
                <select
                  value={formData.giro_industrial}
                  onChange={(e) => setFormData({...formData, giro_industrial: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="Seguridad_Privada">Seguridad Privada</option>
                  <option value="Logística">Logística</option>
                  <option value="Retail">Retail</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Salud">Salud</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Plan</label>
                <select
                  value={formData.plan_activo}
                  onChange={(e) => setFormData({...formData, plan_activo: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="Trial">Trial</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              {message && (
                <div className={`text-sm ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creando...' : 'Crear Empresa'}
                </button>
                <button
                  type="button"
                  onClick={() => setEmpresaModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botón flotante para crear empresa */}
      <button
        onClick={() => setEmpresaModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2"
      >
        <span className="text-xl">+</span>
        Crear Empresa
      </button>
    </div>
  );
}
