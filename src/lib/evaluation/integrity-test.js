/**
 * ============================================================
 *  Banco de Reactivos — Prueba de Integridad Organizacional
 * ============================================================
 *  - 90 preguntas distribuidas en 18 dimensiones (5 por dimensión)
 *  - Escala Likert de 5 puntos (1=Totalmente en desacuerdo, 5=Totalmente de acuerdo)
 *  - 18 dimensiones; la dimensión 7 ("Honestidad y Confiabilidad")
 *    tiene DOBLE PESO (weight = 2) por ser el núcleo del constructo.
 *  - Las preguntas marcadas como "(Invertida)" invierten su puntaje
 *    en el cálculo (1↔5, 2↔4, 3=3) para controlar aquiescencia.
 *
 *  Estructura de cada reactivo:
 *    id         -> número secuencial 1..90
 *    dimension  -> nombre legible de la dimensión
 *    reactivo   -> enunciado del reactivo
 *    isInverted -> true si requiere inversión del puntaje
 *    weight     -> 2 para dimensión 7, 1 para el resto
 *    tipo       -> 'directa' | 'invertida' (cosmético)
 *
 *  El puntaje crudo de un reactivo se calcula como:
 *    if (isInverted) 6 - valorElegido; else valorElegido
 *    puntos = valor * weight
 * ============================================================
 */

export const DIMENSIONES_INTEGRIDAD = [
  '1. Cumplimiento de Normas',
  '2. Responsabilidad',
  '3. Honestidad',
  '4. Confidencialidad',
  '5. Manejo de Recursos',
  '6. Tolerancia a la Presión',
  '7. Honestidad y Confiabilidad (Dimensión con Doble Peso)',
  '8. Respeto a la Autoridad',
  '9. Compromiso Ético',
  '10. Transparencia',
  '11. Lealtad',
  '12. Prudencia',
  '13. Probidad',
  '14. Justicia',
  '15. Autenticidad',
  '16. Integridad en Relaciones Laborales',
  '17. Integridad Digital',
  '18. Conducta Fuera del Trabajo',
];

export const REACTIVOS_INTEGRIDAD = [
  // ── Dimensión 1 · Cumplimiento de Normas ─────────────────────
  { id: 1,  dimension: '1. Cumplimiento de Normas', reactivo: 'Siempre sigo las políticas de la empresa aunque nadie me esté vigilando.', isInverted: false, weight: 1 },
  { id: 2,  dimension: '1. Cumplimiento de Normas', reactivo: 'A veces es necesario saltarse las reglas para terminar el trabajo a tiempo.', isInverted: true,  weight: 1 },
  { id: 3,  dimension: '1. Cumplimiento de Normas', reactivo: 'Cumplo los procedimientos establecidos aunque me parezcan innecesarios.', isInverted: false, weight: 1 },
  { id: 4,  dimension: '1. Cumplimiento de Normas', reactivo: 'Cuando una regla no tiene sentido, la ignoro sin avisar a nadie.', isInverted: true,  weight: 1 },
  { id: 5,  dimension: '1. Cumplimiento de Normas', reactivo: 'Respeto los horarios de entrada y salida pactados con mi empleador.', isInverted: false, weight: 1 },

  // ── Dimensión 2 · Responsabilidad ───────────────────────────
  { id: 6,  dimension: '2. Responsabilidad',        reactivo: 'Asumo la responsabilidad de mis errores sin buscar culpables.', isInverted: false, weight: 1 },
  { id: 7,  dimension: '2. Responsabilidad',        reactivo: 'Cuando algo sale mal, prefiero que otro se haga cargo.', isInverted: true,  weight: 1 },
  { id: 8,  dimension: '2. Responsabilidad',        reactivo: 'Cumplir con mis obligaciones es una prioridad, incluso bajo presión.', isInverted: false, weight: 1 },
  { id: 9,  dimension: '2. Responsabilidad',        reactivo: 'Entrego mis tareas en el tiempo acordado sin necesidad de que me lo recuerden.', isInverted: false, weight: 1 },
  { id: 10, dimension: '2. Responsabilidad',        reactivo: 'Me cuesta admitir cuando me equivoco en algo.', isInverted: true,  weight: 1 },

  // ── Dimensión 3 · Honestidad ────────────────────────────────
  { id: 11, dimension: '3. Honestidad',             reactivo: 'Digo la verdad aunque me perjudique personalmente.', isInverted: false, weight: 1 },
  { id: 12, dimension: '3. Honestidad',             reactivo: 'A veces, pequeñas mentiras son inofensivas y hasta necesarias.', isInverted: true,  weight: 1 },
  { id: 13, dimension: '3. Honestidad',             reactivo: 'Soy transparente con mis compañeros sobre información que afecta al equipo.', isInverted: false, weight: 1 },
  { id: 14, dimension: '3. Honestidad',             reactivo: 'Reconozco abiertamente cuando no sé algo, en vez de inventar una respuesta.', isInverted: false, weight: 1 },
  { id: 15, dimension: '3. Honestidad',             reactivo: 'Es aceptable exagerar los logros propios para destacar en una entrevista.', isInverted: true,  weight: 1 },

  // ── Dimensión 4 · Confidencialidad ─────────────────────────
  { id: 16, dimension: '4. Confidencialidad',       reactivo: 'Respeto la privacidad de la información que manejo en mi trabajo.', isInverted: false, weight: 1 },
  { id: 17, dimension: '4. Confidencialidad',       reactivo: 'Compartir información confidencial con amigos cercanos no es algo grave.', isInverted: true,  weight: 1 },
  { id: 18, dimension: '4. Confidencialidad',       reactivo: 'No divulgo datos de la empresa en redes sociales ni conversaciones casuales.', isInverted: false, weight: 1 },
  { id: 19, dimension: '4. Confidencialidad',       reactivo: 'Cuido los documentos sensibles como si fueran propios.', isInverted: false, weight: 1 },
  { id: 20, dimension: '4. Confidencialidad',       reactivo: 'Si me ofrecen dinero a cambio de datos internos, podría considerarlo.', isInverted: true,  weight: 1 },

  // ── Dimensión 5 · Manejo de Recursos ───────────────────────
  { id: 21, dimension: '5. Manejo de Recursos',     reactivo: 'Cuido el equipo y los materiales de trabajo como si fueran míos.', isInverted: false, weight: 1 },
  { id: 22, dimension: '5. Manejo de Recursos',     reactivo: 'Es normal llevarse a casa cosas pequeñas de la oficina (bolígrafos, libretas, etc.).', isInverted: true,  weight: 1 },
  { id: 23, dimension: '5. Manejo de Recursos',     reactivo: 'Reporto de inmediato cuando algo se daña o desaparece en mi área.', isInverted: false, weight: 1 },
  { id: 24, dimension: '5. Manejo de Recursos',     reactivo: 'Uso los recursos de la empresa únicamente para fines laborales.', isInverted: false, weight: 1 },
  { id: 25, dimension: '5. Manejo de Recursos',     reactivo: 'A veces uso el equipo de la empresa para asuntos personales.', isInverted: true,  weight: 1 },

  // ── Dimensión 6 · Tolerancia a la Presión ──────────────────
  { id: 26, dimension: '6. Tolerancia a la Presión',reactivo: 'Mantengo la calma cuando me piden algo bajo presión o en momentos críticos.', isInverted: false, weight: 1 },
  { id: 27, dimension: '6. Tolerancia a la Presión',reactivo: 'Bajo mucha presión, puedo justificar hacer trampa si nadie se entera.', isInverted: true,  weight: 1 },
  { id: 28, dimension: '6. Tolerancia a la Presión',reactivo: 'No cedo ante compañeros que me piden romper las reglas para "salir del paso".', isInverted: false, weight: 1 },
  { id: 29, dimension: '6. Tolerancia a la Presión',reactivo: 'Afronto situaciones estresantes sin perder mi ética profesional.', isInverted: false, weight: 1 },
  { id: 30, dimension: '6. Tolerancia a la Presión',reactivo: 'En momentos críticos, las reglas se pueden flexibilizar para lograr resultados.', isInverted: true,  weight: 1 },

  // ── Dimensión 7 · Honestidad y Confiabilidad (DOBLE PESO) ─
  { id: 31, dimension: '7. Honestidad y Confiabilidad (Dimensión con Doble Peso)', reactivo: 'Las personas pueden confiar plenamente en mi palabra.', isInverted: false, weight: 2 },
  { id: 32, dimension: '7. Honestidad y Confiabilidad (Dimensión con Doble Peso)', reactivo: 'A veces prometo cosas que sé que no voy a cumplir.', isInverted: true,  weight: 2 },
  { id: 33, dimension: '7. Honestidad y Confiabilidad (Dimensión con Doble Peso)', reactivo: 'Si descubro un error que me beneficia a mí, lo corrijo de inmediato.', isInverted: false, weight: 2 },
  { id: 34, dimension: '7. Honestidad y Confiabilidad (Dimensión con Doble Peso)', reactivo: 'Soy una persona de palabra en todos los aspectos de mi vida, no solo en el trabajo.', isInverted: false, weight: 2 },
  { id: 35, dimension: '7. Honestidad y Confiabilidad (Dimensión con Doble Peso)', reactivo: 'He inventado excusas para no cumplir con un compromiso importante.', isInverted: true,  weight: 2 },

  // ── Dimensión 8 · Respeto a la Autoridad ───────────────────
  { id: 36, dimension: '8. Respeto a la Autoridad', reactivo: 'Respeto las decisiones de mis superiores aunque no las comparta.', isInverted: false, weight: 1 },
  { id: 37, dimension: '8. Respeto a la Autoridad', reactivo: 'Cuestiono las órdenes de mis jefes en público cuando no estoy de acuerdo.', isInverted: true,  weight: 1 },
  { id: 38, dimension: '8. Respeto a la Autoridad', reactivo: 'Sigo la cadena de mando para resolver problemas laborales.', isInverted: false, weight: 1 },
  { id: 39, dimension: '8. Respeto a la Autoridad', reactivo: 'A veces ignoro instrucciones si no estoy de acuerdo con ellas.', isInverted: true,  weight: 1 },
  { id: 40, dimension: '8. Respeto a la Autoridad', reactivo: 'Acepto con apertura la crítica constructiva de mis superiores.', isInverted: false, weight: 1 },

  // ── Dimensión 9 · Compromiso Ético ─────────────────────────
  { id: 41, dimension: '9. Compromiso Ético',       reactivo: 'Prefiero renunciar antes que participar en actos deshonestos.', isInverted: false, weight: 1 },
  { id: 42, dimension: '9. Compromiso Ético',       reactivo: 'Todos exageran en su currículum, no es tan grave.', isInverted: true,  weight: 1 },
  { id: 43, dimension: '9. Compromiso Ético',       reactivo: 'Denunciaría a un compañero que comete una falta grave contra la empresa.', isInverted: false, weight: 1 },
  { id: 44, dimension: '9. Compromiso Ético',       reactivo: 'Mis valores personales guían mi comportamiento laboral cotidiano.', isInverted: false, weight: 1 },
  { id: 45, dimension: '9. Compromiso Ético',       reactivo: 'La ética depende de la situación y de las personas involucradas.', isInverted: true,  weight: 1 },

  // ── Dimensión 10 · Transparencia ───────────────────────────
  { id: 46, dimension: '10. Transparencia',         reactivo: 'Comunico con claridad lo que hago y por qué lo hago.', isInverted: false, weight: 1 },
  { id: 47, dimension: '10. Transparencia',         reactivo: 'A veces oculto información para protegerme de consecuencias.', isInverted: true,  weight: 1 },
  { id: 48, dimension: '10. Transparencia',         reactivo: 'Documento mis decisiones importantes para que otros las puedan entender.', isInverted: false, weight: 1 },
  { id: 49, dimension: '10. Transparencia',         reactivo: 'Soy claro cuando no entiendo algo, en lugar de asentir por quedar bien.', isInverted: false, weight: 1 },
  { id: 50, dimension: '10. Transparencia',         reactivo: 'La opacidad es a veces necesaria para proteger los intereses del negocio.', isInverted: true,  weight: 1 },

  // ── Dimensión 11 · Lealtad ─────────────────────────────────
  { id: 51, dimension: '11. Lealtad',               reactivo: 'Defiendo a la empresa frente a críticas externas injustificadas.', isInverted: false, weight: 1 },
  { id: 52, dimension: '11. Lealtad',               reactivo: 'Si me ofrecen mejor sueldo, no dudaría en irme sin previo aviso.', isInverted: true,  weight: 1 },
  { id: 53, dimension: '11. Lealtad',               reactivo: 'No hablo mal de la empresa en redes sociales ni en reuniones sociales.', isInverted: false, weight: 1 },
  { id: 54, dimension: '11. Lealtad',               reactivo: 'Cumplo el periodo de preaviso antes de renunciar a un puesto.', isInverted: false, weight: 1 },
  { id: 55, dimension: '11. Lealtad',               reactivo: 'Es normal buscar trabajo activamente mientras se está empleado.', isInverted: true,  weight: 1 },

  // ── Dimensión 12 · Prudencia ───────────────────────────────
  { id: 56, dimension: '12. Prudencia',             reactivo: 'Pienso dos veces antes de actuar bajo presión emocional.', isInverted: false, weight: 1 },
  { id: 57, dimension: '12. Prudencia',             reactivo: 'Las decisiones impulsivas son parte del éxito en los negocios.', isInverted: true,  weight: 1 },
  { id: 58, dimension: '12. Prudencia',             reactivo: 'Evito tomar riesgos innecesarios en mi trabajo diario.', isInverted: false, weight: 1 },
  { id: 59, dimension: '12. Prudencia',             reactivo: 'Consulto con mi superior antes de tomar decisiones importantes.', isInverted: false, weight: 1 },
  { id: 60, dimension: '12. Prudencia',             reactivo: 'A veces hay que actuar sin pensar para destacar y avanzar.', isInverted: true,  weight: 1 },

  // ── Dimensión 13 · Probidad ────────────────────────────────
  { id: 61, dimension: '13. Probidad',              reactivo: 'No acepto regalos que puedan comprometer mi objetividad profesional.', isInverted: false, weight: 1 },
  { id: 62, dimension: '13. Probidad',              reactivo: 'Los regalos de proveedores son una práctica normal del mundo de los negocios.', isInverted: true,  weight: 1 },
  { id: 63, dimension: '13. Probidad',              reactivo: 'Me alejo de situaciones que puedan parecer conflicto de interés.', isInverted: false, weight: 1 },
  { id: 64, dimension: '13. Probidad',              reactivo: 'Rechazo favores de terceros que buscan obtener una ventaja indebida.', isInverted: false, weight: 1 },
  { id: 65, dimension: '13. Probidad',              reactivo: 'Pequeños favores a cambio de algo no son corrupción, son cortesía.', isInverted: true,  weight: 1 },

  // ── Dimensión 14 · Justicia ────────────────────────────────
  { id: 66, dimension: '14. Justicia',              reactivo: 'Trato a todos mis compañeros con equidad, sin favoritismos.', isInverted: false, weight: 1 },
  { id: 67, dimension: '14. Justicia',              reactivo: 'En el trabajo, los favores se dan a quienes mejor nos caen.', isInverted: true,  weight: 1 },
  { id: 68, dimension: '14. Justicia',              reactivo: 'No discrimino a nadie por su origen, género, religión o ideología.', isInverted: false, weight: 1 },
  { id: 69, dimension: '14. Justicia',              reactivo: 'Reconozco abiertamente el mérito de los demás, sin atribuírmelo.', isInverted: false, weight: 1 },
  { id: 70, dimension: '14. Justicia',              reactivo: 'Es natural ayudar más a quienes me caen bien que al resto.', isInverted: true,  weight: 1 },

  // ── Dimensión 15 · Autenticidad ────────────────────────────
  { id: 71, dimension: '15. Autenticidad',          reactivo: 'Soy la misma persona en el trabajo que fuera de él.', isInverted: false, weight: 1 },
  { id: 72, dimension: '15. Autenticidad',          reactivo: 'En el trabajo hay que "ponerse la máscara" para sobrevivir.', isInverted: true,  weight: 1 },
  { id: 73, dimension: '15. Autenticidad',          reactivo: 'No finjo ser alguien que no soy para conseguir un puesto.', isInverted: false, weight: 1 },
  { id: 74, dimension: '15. Autenticidad',          reactivo: 'Mis colegas me describen como una persona coherente entre lo que dice y hace.', isInverted: false, weight: 1 },
  { id: 75, dimension: '15. Autenticidad',          reactivo: 'La hipocresía es parte inevitable de la política de oficina.', isInverted: true,  weight: 1 },

  // ── Dimensión 16 · Integridad en Relaciones Laborales ─────
  { id: 76, dimension: '16. Integridad en Relaciones Laborales', reactivo: 'Mantengo relaciones profesionales con todos mis colegas, sin favoritismos.', isInverted: false, weight: 1 },
  { id: 77, dimension: '16. Integridad en Relaciones Laborales', reactivo: 'Las relaciones personales se pueden mezclar con el trabajo sin problema.', isInverted: true,  weight: 1 },
  { id: 78, dimension: '16. Integridad en Relaciones Laborales', reactivo: 'No difundo rumores que puedan dañar la reputación de un compañero.', isInverted: false, weight: 1 },
  { id: 79, dimension: '16. Integridad en Relaciones Laborales', reactivo: 'Resuelvo los conflictos directamente con la persona involucrada.', isInverted: false, weight: 1 },
  { id: 80, dimension: '16. Integridad en Relaciones Laborales', reactivo: 'El chisme es parte normal del ambiente laboral.', isInverted: true,  weight: 1 },

  // ── Dimensión 17 · Integridad Digital ──────────────────────
  { id: 81, dimension: '17. Integridad Digital',    reactivo: 'No comparto las contraseñas de la empresa con terceros, ni siquiera compañeros.', isInverted: false, weight: 1 },
  { id: 82, dimension: '17. Integridad Digital',    reactivo: 'Está bien revisar redes sociales personales en horario de trabajo.', isInverted: true,  weight: 1 },
  { id: 83, dimension: '17. Integridad Digital',    reactivo: 'Reporto de inmediato los correos de phishing o intentos de fraude.', isInverted: false, weight: 1 },
  { id: 84, dimension: '17. Integridad Digital',    reactivo: 'Respeto la propiedad intelectual del contenido que encuentro en internet.', isInverted: false, weight: 1 },
  { id: 85, dimension: '17. Integridad Digital',    reactivo: 'Descargar contenido pirata de forma ocasional es inofensivo.', isInverted: true,  weight: 1 },

  // ── Dimensión 18 · Conducta Fuera del Trabajo ──────────────
  { id: 86, dimension: '18. Conducta Fuera del Trabajo', reactivo: 'Mi conducta fuera del trabajo refleja los valores de la empresa que represento.', isInverted: false, weight: 1 },
  { id: 87, dimension: '18. Conducta Fuera del Trabajo', reactivo: 'Lo que hago en mi tiempo libre no afecta en nada mi trabajo.', isInverted: true,  weight: 1 },
  { id: 88, dimension: '18. Conducta Fuera del Trabajo', reactivo: 'Cuido mi reputación online porque me representa profesionalmente.', isInverted: false, weight: 1 },
  { id: 89, dimension: '18. Conducta Fuera del Trabajo', reactivo: 'Evito comportamientos que puedan dañar la imagen pública de la empresa.', isInverted: false, weight: 1 },
  { id: 90, dimension: '18. Conducta Fuera del Trabajo', reactivo: 'Las redes sociales personales son completamente independientes del trabajo.', isInverted: true,  weight: 1 },
];

/**
 * Escala Likert de 5 puntos.
 * El candidato responde 1..5 según su grado de acuerdo.
 */
export const ESCALA_LIKERT = [
  { value: 1, label: 'Totalmente en desacuerdo', tono: 'rose'    },
  { value: 2, label: 'En desacuerdo',            tono: 'orange'  },
  { value: 3, label: 'Neutral',                  tono: 'slate'   },
  { value: 4, label: 'De acuerdo',               tono: 'sky'     },
  { value: 5, label: 'Totalmente de acuerdo',    tono: 'emerald' },
];

/**
 * Tiempo límite de la prueba en segundos.
 */
export const DURACION_SEGUNDOS = 45 * 60; // 45 minutos

/**
 * Número máximo de abandonos (tab switch / blur) antes de cancelar.
 */
export const MAX_ABANDONOS = 3;

/**
 * Metadata de la prueba (id, nombre, etc.) para el header.
 */
export const PRUEBA_META = {
  id: 'INT-01',
  codigo: 'INT-01',
  nombre: 'Test de Integridad Organizacional',
  descripcion: 'Evalúa la disposición del candidato a seguir políticas internas y resistir presiones externas que comprometan la ética.',
  duracion_minutos: 45,
  total_preguntas: 90,
  escala: 'Likert 1-5',
};