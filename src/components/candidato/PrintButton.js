'use client';

import { useReactToPrint } from 'react-to-print';

/**
 * PrintButton — botón que descarga/imprime la vista del candidato.
 *
 * @param {object} props
 * @param {React.RefObject} props.targetRef  - ref al contenedor imprimible
 * @param {string}          props.fileName  - nombre del PDF
 * @param {string}          props.label     - texto del botón
 */
export default function PrintButton({ targetRef, fileName = 'reporte-candidato.pdf', label = 'Descargar PDF' }) {
  const handlePrint = useReactToPrint({
    contentRef: targetRef,
    documentTitle: fileName.replace(/\.pdf$/, ''),
    pageStyle: `
      @page {
        size: A4;
        margin: 16mm;
      }
      @media print {
        body { background: white !important; }
        .no-print, nav, header.app-header, aside { display: none !important; }
        .print-break { page-break-before: always; }
        section { break-inside: avoid; }
        .recharts-wrapper svg { max-width: 100% !important; }
      }
    `,
  });

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-md bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-4 py-2.5 transition shadow-glow print:hidden"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      {label}
    </button>
  );
}