'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DURACION_SEGUNDOS, MAX_ABANDONOS } from '@/lib/evaluation/integrity-test';

/**
 * ============================================================
 *  useCountdown — cronómetro regresivo con auto-submit a 0:00
 * ============================================================
 *
 *  @param {Function} onExpire  -> callback cuando llega a 0
 *  @param {boolean}  paused    -> si está pausado (ej. en modal de seguridad)
 *
 *  @returns { segundos, mm, ss, percent, critical }
 */
export function useCountdown({ duracionSegundos = DURACION_SEGUNDOS, onExpire, paused = false } = {}) {
  const [segundos, setSegundos] = useState(duracionSegundos);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (paused) return undefined;
    if (segundos <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
      return undefined;
    }
    const t = setInterval(() => {
      setSegundos((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [segundos, paused]);

  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');
  const percent = Math.round((segundos / duracionSegundos) * 100);
  const critical = segundos <= 60;

  return { segundos, mm, ss, percent, critical, expired: segundos <= 0 };
}

/**
 * ============================================================
 *  useAbandonDetector — detecta cambio de pestaña / blur
 * ============================================================
 *
 *  Usa visibilitychange y window.blur. Cada "abandono" se cuenta
 *  y se muestra en un modal. Al alcanzar MAX_ABANDONOS, se cancela.
 *
 *  @param {Function} onCancel      -> callback al llegar a MAX_ABANDONOS
 *  @param {Function} onAbandon     -> callback en cada abandono (para modal)
 *  @param {boolean}  active        -> true mientras la prueba está activa
 *
 *  @returns { abandonos, inFocus }
 */
export function useAbandonDetector({ onCancel, onAbandon, active = true } = {}) {
  const [abandonos, setAbandonos] = useState(0);
  const [inFocus, setInFocus] = useState(true);
  const canceladoRef = useRef(false);
  const onCancelRef = useRef(onCancel);
  const onAbandonRef = useRef(onAbandon);

  useEffect(() => { onCancelRef.current = onCancel; }, [onCancel]);
  useEffect(() => { onAbandonRef.current = onAbandon; }, [onAbandon]);

  useEffect(() => {
    if (!active) return undefined;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && !canceladoRef.current) {
        triggerAbandono();
      } else if (document.visibilityState === 'visible') {
        setInFocus(true);
      }
    };
    const handleBlur = () => {
      if (!canceladoRef.current) triggerAbandono();
    };
    const handleFocus = () => setInFocus(true);

    function triggerAbandono() {
      setInFocus(false);
      setAbandonos((prev) => {
        const next = prev + 1;
        onAbandonRef.current?.(next);
        if (next >= MAX_ABANDONOS && !canceladoRef.current) {
          canceladoRef.current = true;
          // pequeño delay para que el modal de advertencia se vea antes
          setTimeout(() => onCancelRef.current?.({ abandonos: next }), 200);
        }
        return next;
      });
    }

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [active]);

  return { abandonos, inFocus, cancelado: canceladoRef.current };
}

/**
 * ============================================================
 *  useFullscreenLock — sugiere pantalla completa (best-effort)
 * ============================================================
 *
 *  No podemos FORZAR fullscreen desde el navegador, pero podemos
 *  sugerirlo y detectar cuando el usuario sale.
 */
export function useFullscreenPrompt() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* usuario rechazó o el navegador no lo soporta */
    }
  }, []);

  return { isFullscreen, enter };
}

/**
 * ============================================================
 *  useCopyPasteBlocker — bloquea copiar / pegar / context menu
 * ============================================================
 */
export function useCopyPasteBlocker(active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const block = (e) => e.preventDefault();
    const onKey = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', block);
    document.addEventListener('paste', block);
    document.addEventListener('cut', block);
    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', onKey);
    };
  }, [active]);
}