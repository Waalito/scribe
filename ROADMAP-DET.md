# SCRIBE — PROJECT ROADMAP

**PROJECT STATUS · 03 NOVEMBER 2026 · VERSION 0.1.0**

---

# 01. FOUNDATION — Fundamentos

<badge color="success">COMPLETADO</badge>

Definición de la identidad, filosofía y estructura técnica del proyecto.

- [x] Concepto y visión del juego.
- [x] Filosofía de diseño.
- [x] Reglas fundamentales.
- [x] Stack tecnológico.
- [x] Arquitectura general.
- [x] Convenciones de código.
- [x] Estructura de carpetas.
- [x] Configuración inicial de Astro y Tailwind.
- [x] Integración inicial de Three.js.

---

# 02. CORE SYSTEMS — Sistemas principales

<badge color="success">IMPLEMENTACIÓN PRINCIPAL REALIZADA</badge>

Construcción de las mecánicas que sostienen el funcionamiento del juego.

## Game Loop

- [x] Ciclo principal de ejecución.
- [x] Coordinación de sistemas.
- [x] Estados de partida.
- [x] Flujo de acciones y resultados.

## Typing Engine

- [x] Detección de caracteres.
- [x] Validación de escritura.
- [x] Gestión de errores.
- [x] Reinicio de línea tras error.
- [x] Rollback visual.
- [x] Finalización de líneas y párrafos.

## Run System

- [x] Gestión de partidas.
- [x] Contador de errores.
- [x] Progreso del documento.
- [x] Completado de documentos.
- [x] Resumen de partida.

## Weapon System

- [x] Sistema de revólver.
- [x] Cámara de seis posiciones.
- [x] Inserción de balas cada tres errores.
- [x] Comprobación de disparo.
- [x] Supervivencia.
- [x] Muerte.
- [x] Reinicio tras muerte.

## Corruption System

- [x] Sistema de corrupción.
- [x] Cinco etapas de corrupción.
- [x] Corrupción exclusivamente visual y ambiental.
- [x] Sin alteraciones de la dificultad ni de la estructura de escritura.

## Progress & Persistence

- [ ] Biblioteca de documentos conservados.
- [ ] Persistencia de documentos.
- [ ] Progreso semanal.
- [ ] Reinicio semanal.

---

# 03. CONTENT & IMMERSION — Contenido e inmersión

<badge color="warning">EN DESARROLLO</badge>

Construcción de la experiencia narrativa, audiovisual y visual.

## Document System

- [x] Estructura de documentos.
- [x] Document Metadata.
- [x] Document Content.
- [x] Document Loader.
- [x] Document Parser.
- [x] Document System.
- [ ] Validación completa de categorías.
- [ ] Biblioteca de documentos.
- [ ] Gestión de documentos por idioma.
- [ ] Sistema definitivo de persistencia.

## Narrative System

- [ ] Concepto narrativo.
- [ ] Fragmentos históricos.
- [ ] Categorías de documentos.
- [ ] Narrativa entre partidas.
- [ ] Narrativa de muerte y supervivencia.
- [ ] Transiciones narrativas.
- [ ] Progresión narrativa semanal.

## Audio System

**Integrado y probado**

- [x] Sonido de escritura.
- [x] Sonido de error.
- [x] Sonido de rollback.
- [x] Sonido de indicadores de error.
- [x] Sonido de checkpoint.
- [x] Sonido de finalización de línea.
- [x] Sonido de inserción de bala.
- [x] Sonido de giro del revólver.
- [x] Sonido de disparo fallido.
- [x] Sonido de disparo mortal.

**Pendiente**

- [ ] Audio ambiental.
- [ ] Música y diseño sonoro general.

## Visual Effects

- [x] Rollback visual.
- [x] Feedback visual de errores.
- [x] Animación del revólver.
- [ ] Efectos visuales de corrupción.
- [ ] Efectos de muerte.
- [ ] Efectos de supervivencia.
- [ ] Pulido de transiciones.

## Three.js / WebGL

- [x] Integración inicial de Three.js.
- [ ] Escena principal.
- [ ] Iluminación.
- [ ] Elementos tridimensionales.
- [ ] Integración con la corrupción.
- [ ] Optimización de recursos.

## UI / UX

- [x] Interfaz principal de juego.
- [x] Indicadores de partida.
- [x] Identidad visual y paleta.
- [ ] Pantalla de inicio definitiva.
- [x] Pantallas de resumen.
- [x] Pantalla de muerte.
- [ ] Biblioteca.
- [ ] Adaptación a resoluciones objetivo.

## Loading & Transition System

**Diseño definido · Implementación pendiente**

- [x] Diseño visual minimalista.
- [x] Barra de progreso centrada.
- [x] Texto inferior `GATHERING THE FRAGMENTS...`.
- [ ] Porcentaje de carga real.
- [ ] Gestión del estado de carga.
- [ ] Precarga de recursos.
- [ ] Transiciones entre páginas.
- [ ] Prevención de saltos visuales.
- [ ] Integración con Astro.

**Siguiente tarea acordada:** desarrollar el Loading & Transition System. Su dirección visual ya está definida; antes de implementarlo, revisaremos la navegación actual de Astro y la gestión de recursos.

---

# 04. GAME PROGRESSION — Progresión

<badge color="secondary">PENDIENTE</badge>

Sistemas que mantienen el avance del jugador entre partidas y semanas.

- [ ] Biblioteca de la estancia.
- [ ] Condiciones de conservación de documentos.
- [ ] Registro de documentos completados durante una run.
- [ ] Registro de documentos completados durante la semana.
- [ ] Sistema de progreso semanal.
- [ ] Reinicio semanal.
- [ ] Historial de documentos.
- [ ] Estadísticas del jugador.

## Condiciones de conservación establecidas

| Categoría | Errores máximos |
|---|---:|
| Poemas | 1 |
| Trabalenguas | 3 |
| Documentos históricos | 2 |
| Cartas | 0 |

Los documentos que cumplen sus respectivas condiciones se conservan en la biblioteca de la estancia.

---

# 05. ACHIEVEMENTS — Logros

<badge color="secondary">PENDIENTE DE DESARROLLO</badge>

Sistema de logros y presentación de acontecimientos.

- [ ] Arquitectura de logros.
- [ ] Condiciones de desbloqueo.
- [ ] Registro de logros.
- [ ] Persistencia.
- [ ] Notificaciones visuales.
- [ ] Animaciones de desbloqueo.
- [ ] Presentación estilo stream.

---

# 06. POLISH & OPTIMIZATION — Pulido

<badge color="secondary">PENDIENTE</badge>

Preparación del juego para una experiencia estable y consistente.

## Experiencia

- [ ] Transiciones generales.
- [ ] Feedback de interacción.
- [ ] Balance de dificultad.
- [ ] Consistencia audiovisual.
- [ ] Accesibilidad básica.

## Rendimiento

- [ ] Optimización de Three.js.
- [ ] Gestión de memoria.
- [ ] Optimización de audio.
- [ ] Carga de recursos.
- [ ] Pruebas de rendimiento.

## Resoluciones objetivo

- [ ] 1920 × 1080.
- [ ] 1600 × 1200.
- [ ] 1366 × 720.

## Validación

- [ ] Pruebas completas de Game Loop.
- [ ] Pruebas de muerte y reinicio.
- [ ] Pruebas de persistencia.
- [ ] Pruebas de navegación.
- [ ] Build de producción.
- [ ] Verificación en Preview.

---

# PROJECT STATUS — Estado general

| Fase | Estado |
|---|---|
| 01. Foundation | 🟢 Completado |
| 02. Core Systems | 🟢 Implementación principal |
| 03. Content & Immersion | 🟡 En desarrollo |
| 04. Game Progression | ⚪ Pendiente |
| 05. Achievements | ⚪ Pendiente |
| 06. Polish & Optimization | ⚪ Pendiente |

---

**SCRIBE · DEVELOPMENT ROADMAP**

*An evolving document. All new features, changes in scope and architectural decisions must be reviewed before being incorporated into the roadmap.*