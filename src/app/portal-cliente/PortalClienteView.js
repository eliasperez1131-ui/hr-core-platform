'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PortalLayout      from '@/components/portal-cliente/PortalLayout';
import EvaluacionesTab   from '@/components/portal-cliente/EvaluacionesTab';
import TalentoVipTab     from '@/components/portal-cliente/TalentoVipTab';
import FacturacionTab    from '@/components/portal-cliente/FacturacionTab';
import PaymentModal      from '@/components/portal-cliente/PaymentModal';
import {
  DEMO_WORKSPACE_ID,
  getFacturasByWorkspace,
  getResumenFinanciero,
  getFacturaById,
  esVacanteBloqueada,
} from '@/lib/facturas-data';
import { WORKSPACE_DEMO } from '@/lib/dashboard-data';

/**
 * PortalClienteView — Orquestador del Portal Cliente HR CORE.
 *
 * Maneja el estado del tab activo + el callback de Stripe (?paid=1).
 *
 * Props:
 *   searchParams -> { tab, paid, factura, cancelled, demo }
 */
export default function PortalClienteView({ searchParams }) {
  const router = useRouter();
  const params = searchParams || {};

  const [activeTab, setActiveTab] = useState(params.tab || 'tus-evaluaciones');
  const [facturas, setFacturas] = useState(() => getFacturasByWorkspace(DEMO_WORKSPACE_ID));
  const [resumen, setResumen]   = useState(() => getResumenFinanciero(DEMO_WORKSPACE_ID));
  const [payingFactura, setPayingFactura] = useState(null);

  // Si llegamos del callback de Stripe (?paid=1&factura=xxx), actualizamos estado
  useEffect(() => {
    if (!params.paid || !params.factura) return;
    const facturaId = params.factura;
    const f = getFacturaById(facturaId);
    if (!f) return;

    // En modo demo, marcamos como Pagada localmente (el webhook hace lo mismo en producción)
    setFacturas((prev) => prev.map((x) =>
      x.id === facturaId
        ? { ...x, estatus: 'Pagada', metodo_pago: 'Tarjeta', fecha_pago: new Date().toISOString() }
        : x,
    ));
    setResumen((r) => {
      const old = facturas.find((x) => x.id === facturaId);
      if (!old) return r;
      return {
        ...r,
        pendiente: r.pendiente - old.monto,
        pagado:    r.pagado    + old.monto,
        count: {
          ...r.count,
          pagadas:    r.count.pagadas + 1,
          pendientes: Math.max(0, r.count.pendientes - 1),
        },
      };
    });

    // Si el candidato VIP tenía paywall, lo limpiamos cambiando a tab facturacion con el banner
    setActiveTab('facturacion');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.paid, params.factura]);

  const onChangeTab = (tab) => {
    setActiveTab(tab);
    router.replace(`/portal-cliente?tab=${tab}`, { scroll: false });
  };

  // Cuando se hace clic en "Pagar" desde Talento VIP, abre el modal con la factura pendiente
  const handlePagarDesdeTalentoVip = () => {
    const pendiente = facturas.find((f) => f.estatus === 'Pendiente' || f.estatus === 'En_Revision');
    if (pendiente) {
      setPayingFactura(pendiente);
    } else {
      onChangeTab('facturacion');
    }
  };

  const cliente = {
    empresa: ws_nombre(),
    plan: ws_plan(),
    creditos_disponibles: 213, // demo
  };

  return (
    <PortalLayout active={activeTab} onChange={onChangeTab} cliente={cliente}>
      {activeTab === 'tus-evaluaciones' && <EvaluacionesTab />}
      {activeTab === 'talento-vip' && (
        <TalentoVipTab onPagarFactura={handlePagarDesdeTalentoVip} />
      )}
      {activeTab === 'facturacion' && (
        <FacturacionTab
          workspaceId={DEMO_WORKSPACE_ID}
          facturas={facturas}
          resumen={resumen}
          paidFacturaId={params.paid ? params.factura : null}
          cancelled={params.cancelled}
        />
      )}

      {/* Modal de pago global (cuando se abre desde Talento VIP) */}
      <PaymentModal
        factura={payingFactura}
        open={!!payingFactura}
        onClose={() => setPayingFactura(null)}
        onSuccess={(f) => {
          setFacturas((prev) => prev.map((x) => (x.id === f.id ? f : x)));
          setResumen((r) => {
            const old = facturas.find((x) => x.id === f.id);
            if (!old) return r;
            return {
              ...r,
              pendiente: r.pendiente   - old.monto,
              en_revision: r.en_revision - old.monto,
              pagado:    r.pagado      + old.monto,
              count: {
                ...r.count,
                pendientes:  Math.max(0, r.count.pendientes - 1),
                en_revision: Math.max(0, r.count.en_revision - 1),
                pagadas:     r.count.pagadas + 1,
              },
            };
          });
        }}
      />
    </PortalLayout>
  );
}

function ws_nombre()  { return WORKSPACE_DEMO?.nombre_empresa || 'HR CORE Cliente Demo'; }
function ws_plan()    { return WORKSPACE_DEMO?.plan_activo   || 'Professional'; }