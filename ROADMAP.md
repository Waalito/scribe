# ROADMAP

## Objetivo inicial
Crear la base de Scribe como juego web inmersivo con Astro y Three.js.

## Fases

1. Estructura de proyecto y carpetas.
2. Página de entrada con diseño limpio y oscuro.
3. Configuración de tipos y localización mínima.
4. Preparar assets, documentos y componentes.

## Próximos pasos
- Agregar escenas 3D básicas en `src/scripts/three`
- Definir contenido de documentos por locale
- Implementar sistema de navegación de UI
- Añadir audio ambiental y efectos


# WEEKLY RESET RULE
────────────────────────────────────

El reinicio semanal es independiente
del reinicio de una Run.

RUN RESET:
• ocurre al morir
• elimina estado temporal
• inicia una nueva tentativa

WEEKLY RESET:
• ocurre al cambiar la semana
• evalúa condiciones de permanencia
• reinicia documentos que no cumplen
  las condiciones establecidas
• reinicia score
• reinicia progreso

Los elementos persistentes se definirán
posteriormente.

# DOCUMENT STATE
────────────────────────────────

Balas:
• pertenecen al documento actual
• son acumulativas
• no se eliminan al sobrevivir
• aumentan cada 3 errores
• máximo 6
• 6/6 = muerte segura
• se eliminan al terminar/abandonar el documento

Corrupción:
• pertenece al documento actual
• aumenta al sobrevivir al disparo
• es acumulativa
• no se reinicia después de sobrevivir
• se elimina al terminar/abandonar el documento

### Documento completado:

El jugador alcanza el 100% del contenido, independientemente de los errores.

### Documento conservado:

El jugador completa el documento y cumple simultáneamente la condición específica de su categoría.

### Reinicio semanal:

Los documentos completados que no cumplieron su condición desaparecen/no se conservan. Los documentos que cumplieron su condición permanecen en la biblioteca.

# CORE — DOCUMENT RUN & CONSEQUENCES

### Estado

🟢 CORE DEFINIDO
🟡 BALANCE PENDIENTE

---

### 1. Documento de la Run

Cada Run comienza con un documento seleccionado aleatoriamente.

Un documento puede contener:

- Párrafos
- Líneas
- Pausas
- Palabras
- Categoría
- Condición de conservación
- Contenido en español o inglés

El jugador comienza siempre desde el inicio del documento.

---

### 2. Typing

El jugador transcribe el documento mediante el Typing Engine.

Cada error:

- Cuenta como un fallo.
- Incrementa el contador de errores del documento.
- Hace que el jugador vuelva a la línea inicial correspondiente.
- Contribuye al sistema de consecuencias.

Los errores son acumulativos durante el documento.

---

### CHECKPOINT
│
├── currentParagraph → siguiente párrafo
├── currentLine → inicio del siguiente párrafo
├── errors → 0
├── bullets → 0
├── timeRemaining → tiempo máximo
│
├── totalErrors → SE MANTIENE
├── corruption → SE MANTIENE
└── survivedCount → SE MANTIENE

### 3. Sistema de errores → arma

El contador de errores funciona por bloques de 3.

```text
ERROR → 1
ERROR → 2
ERROR → 3
          ↓
       +1 BALA
          ↓
    ERRORES → 0
          ↓
       DISPARO


             ┌─────────────────┐
             │ RANDOM DOCUMENT │
             └────────┬────────┘
                      │
                      ▼
                 TRANSCRIBE
                      │
               ┌──────┴──────┐
               │             │
            CORRECT        ERROR
               │             │
               │       return to line
               │             │
               │          error +1
               │             │
               │        every 3 errors
               │             │
               │          bullet +1
               │             │
               │           SHOT
               │          /    \
               │       DEATH   SURVIVE
               │         │        │
               │         │        ├─ corruption ↑
               │         │        └─ survived +1
               │         │
               │         ▼
               │      RUN SUMMARY
               │
               └──────────┐
                          │
                       100%
                          │
                          ▼
                  DOCUMENT SUMMARY
                          │
                  CHECK CONDITION
                     /          \
                   ✓              ✗
                   │              │
                   ▼              ▼
                LIBRARY       NOT SAVED
                   │              │
                   │       can appear again
                   │        during the week
                   │              │
                   └──────┬───────┘
                          │
                          ▼
                   NEXT DOCUMENT
                          │
                     or BREAK
                    /           \
               LIBRARY         ROOM


/////////////////////////////////////////////////

# ROADMAP — SCRIBE

> **SOURCE OF TRUTH**
>
> Este documento define la visión, reglas, arquitectura, estado y próximos pasos de Scribe.
>
> Antes de implementar una nueva funcionalidad:
>
> 1. Revisar este roadmap.
> 2. Comprobar si la funcionalidad ya existe.
> 3. Comprobar si está contemplada en la arquitectura.
> 4. Si no está contemplada, discutir primero si debe incorporarse.
>
> **Filosofía:** Inmersión > Cantidad > Complejidad
>
> **Stack:** Astro + TypeScript + Tailwind CSS + HTML/CSS/JS + WebGL + Three.js
>
> **Restricción:** No React.

---

# 1. OBJETIVO

Crear **Scribe**, un juego web narrativo de typing con ambientación dark fantasy.

La escritura es el núcleo del juego.

El jugador transcribe documentos mientras cada error tiene consecuencias progresivas que pueden terminar en muerte.

La experiencia debe priorizar:

* Inmersión
* Tensión
* Narrativa
* Minimalismo
* Consecuencias
* Rejugabilidad

---

# 2. PRINCIPIOS DE DISEÑO

### Inmersión > Cantidad > Complejidad

No añadir sistemas únicamente porque puedan resultar interesantes.

Cada sistema debe justificar su existencia dentro de la experiencia de Scribe.

### Separación de responsabilidades

Los sistemas de gameplay, UI y presentación deben mantenerse separados.

La UI representa estados.

Los sistemas controlan reglas.

Los componentes Astro presentan elementos visuales.

---

# 3. STACK

* Astro
* TypeScript
* Tailwind CSS
* HTML
* CSS
* JavaScript
* WebGL
* Three.js

No utilizar React.

---

# 4. ESTRUCTURA GENERAL

```text
src/
├── components/
│   └── ui/
│
├── config/
│
├── data/
│
├── documents/
│
├── pages/
│
├── scripts/
│   ├── systems/
│   ├── game.ts
│   └── three/
│
├── types/
│
└── layouts/
```

La arquitectura debe mantenerse modular.

No crear managers/sistemas innecesarios.

---

# 5. GAME LOOP

Scribe utiliza un único Game Loop.

El Game Loop actualiza los sistemas que necesitan actualización temporal.

No crear múltiples loops independientes para sistemas que puedan integrarse en el loop principal.

---

# 6. RUN

Una **Run** representa una tentativa del jugador.

### Una Run:

* comienza con un documento aleatorio
* permite transcribirlo
* acumula consecuencias
* puede terminar en muerte
* puede terminar completando el documento
* puede continuar hacia otro documento

### RUN RESET

Ocurre cuando el jugador muere.

El estado temporal de la Run se elimina y comienza una nueva tentativa.

---

# 7. DOCUMENTOS

Un documento puede contener:

* Párrafos
* Líneas
* Palabras
* Pausas
* Categoría
* Condición de conservación
* Locale

Idiomas iniciales:

* Español
* Inglés

El jugador comienza cada documento desde el inicio.

---

# 8. DOCUMENT STATE

## Balas

Las balas:

* pertenecen al documento actual
* son acumulativas
* no desaparecen al sobrevivir
* aumentan cada 3 errores
* tienen máximo 6
* 6/6 = muerte segura
* se eliminan al terminar o abandonar el documento

## Corrupción

La corrupción:

* pertenece al documento actual
* aumenta al sobrevivir a un disparo
* es acumulativa durante el documento
* no se reinicia después de sobrevivir
* se elimina al terminar o abandonar el documento

---

# 9. TYPING

El jugador transcribe el documento mediante el Typing Engine.

Cada error:

* incrementa `errors`
* incrementa `totalErrors`
* registra el punto donde ocurrió
* hace que el jugador vuelva al inicio de la línea correspondiente
* contribuye al sistema de consecuencias

Los errores son acumulativos hasta llegar al siguiente checkpoint o disparo.

---

# 10. ERROR SYSTEM

El contador de errores utiliza bloques de 3.

```text
ERROR → 1
ERROR → 2
ERROR → 3
           ↓
        +1 BALA
           ↓
      ERRORES → 0
           ↓
         DISPARO
```

La UI de errores es independiente de la UI del revolver.

### Error UI

Representación:

```text
[ X ] [   ] [   ]
[ X ] [ X ] [   ]
[ X ] [ X ] [ X ]
```

Son tres indicadores visuales independientes.

### IMPORTANTE

**El Error UI y el Revolver UI NO son el mismo sistema.**

La relación entre ambos existe únicamente en la lógica de gameplay:

```text
3 errores → +1 bala → disparo
```

No deben mezclarse sus responsabilidades ni sus componentes.

### Estado

🟢 **IMPLEMENTADO Y FUNCIONAL**

El Error Counter:

* utiliza 3 slots
* mantiene los frames visibles
* muestra cada `X` progresivamente
* muestra temporalmente los 3 `X` al alcanzar el tercer error
* mantiene la indicación durante la secuencia de consecuencia
* vuelve a 0 después de la resolución visual
* está sincronizado temporalmente con la animación del revolver

El timing visual fue ajustado para coincidir correctamente con el giro del revolver.

---

# 11. REVOLVER

El revolver representa visualmente las balas acumuladas.

Características actuales:

* 6 cámaras
* cada bala ocupa una cámara
* las cámaras se seleccionan aleatoriamente
* las balas permanecen hasta checkpoint
* el jugador no puede girarlo manualmente
* el disparo visual ocurre después de alcanzar 3 errores
* la animación del cilindro dura aproximadamente 3 segundos

El `WeaponSystem` es la fuente de verdad del resultado.

El componente `Revolver.astro` es únicamente presentación.

No crear `RevolverSystem`.

---

# 12. WEAPON SYSTEM

Resultado:

```ts
type WeaponResult =
  | "survived"
  | "dead";
```

Probabilidad:

```text
1 bala → 16.7% muerte
2 balas → 33.3%
3 balas → 50%
4 balas → 66.7%
5 balas → 83.3%
6 balas → 100%
```

Si sobrevive:

* `survivedCount += 1`
* aumenta corrupción

Si muere:

* termina la Run

---

# 13. CHECKPOINT

Al completar un párrafo:

```text
CHECKPOINT
│
├── currentParagraph → siguiente párrafo
├── currentLine → inicio del siguiente párrafo
├── errors → 0
├── bullets → 0
├── timeRemaining → tiempo máximo
│
├── totalErrors → SE MANTIENE
├── corruption → SE MANTIENE
└── survivedCount → SE MANTIENE
```

El revolver se reinicia visualmente.

La corrupción NO se reinicia.

El checkpoint actualmente resetea correctamente el estado definido para el documento:

* errores
* balas
* tiempo

Los valores persistentes de la Run continúan:

* `totalErrors`
* corrupción
* `survivedCount`

---

# 14. CORRUPTION

La corrupción aumenta después de sobrevivir a un disparo.

El sistema de corrupción controla:

* nivel actual
* stage
* efectos
* transición visual

La presentación de la corrupción está separada de su lógica.

---

# 15. DEATH

La muerte ocurre cuando:

* el jugador pierde un disparo
* alcanza 6 balas
* el tiempo llega a 0

Al morir:

```text
RUN
 ↓
DEATH
 ↓
DEATH SCREEN
 ↓
RESTART
 ↓
NEW RUN
```

No existe un `DeathSystem` separado.

`RunCoordinator` controla el estado de muerte.

`DeathScreen.astro` controla únicamente la presentación y la interacción de restart.

---

# 16. COMPLETION

Un documento se considera completado cuando el jugador alcanza el 100% del contenido.

Los errores no impiden completar el documento.

```text
100%
 ↓
DOCUMENT SUMMARY
 ↓
CHECK CONDITION
```

---

# 17. DOCUMENT CONSERVATION

### Documento completado

El jugador alcanza el 100% del documento independientemente de los errores.

### Documento conservado

El jugador completa el documento y cumple simultáneamente la condición específica de su categoría.

### Documento no conservado

El jugador completa el documento pero no cumple su condición.

Puede volver a aparecer durante la semana.

---

# 18. WEEKLY RESET

El reinicio semanal es independiente del reinicio de una Run.

## RUN RESET

* ocurre al morir
* elimina estado temporal
* inicia una nueva tentativa

## WEEKLY RESET

* ocurre al cambiar la semana
* evalúa condiciones de permanencia
* elimina documentos que no cumplen sus condiciones
* reinicia score
* reinicia progreso

Los elementos persistentes se definirán posteriormente.

---

# 19. SYSTEMS ACTUALES

## Document

* `DocumentParser`
* `DocumentLoader`
* `DocumentSystem`

## Run

* `RunSystem`
* `RunCoordinator`

## Typing

* `TypingSystem`

## Time

* `TimerSystem`

## Consequences

* `WeaponSystem`
* `CorruptionSystem`
* `CorruptionEffectsSystem`
* `CorruptionTransitionSystem`

## Feedback

* `ErrorFeedbackSystem`
* `CheckpointFeedbackSystem`

## Core

* `GameLoop`

---

# 20. UI ACTUAL

Componentes relevantes:

```text
DeathScreen.astro
CompletionScreen.astro
Revolver.astro
ErrorCounter.astro
ErrorIndicator.astro
```

### ErrorCounter

Estado actual:

🟢 **COMPLETADO**

Comportamiento:

```text
[ ] [ ] [ ]

[X] [ ] [ ]

[X] [X] [ ]

[X] [X] [X]
       ↓
 resolución
       ↓
[ ] [ ] [ ]
```

Los frames permanecen siempre visibles.

Los `X` aparecen progresivamente.

El tercer `X` se muestra correctamente antes de que el contador visual vuelva a 0.

El tiempo de visualización está coordinado con la secuencia visual del revolver.

### Revolver

Estado actual:

🟢 **COMPLETADO**

La UI de balas funciona de forma independiente al Error Counter.

El revolver mantiene sus balas hasta checkpoint.

El checkpoint limpia correctamente su estado visual.

---

# 21. INPUT / RESTART

El restart pertenece a las pantallas finales.

`DeathScreen.astro`:

```text
R → run:restart
```

`CompletionScreen.astro`:

```text
R → run:restart
```

`game.ts` escucha directamente ambos eventos.

No utilizar eventos globales innecesarios.

---

# 22. THREE.JS

Three.js forma parte de la arquitectura prevista.

Pendiente:

```text
src/scripts/three/
```

La integración visual 3D debe añadirse cuando tenga una función clara dentro de la experiencia.

No introducir Three.js únicamente por utilizar la tecnología.

---

# 23. BALANCE

🟡 **PENDIENTE**

El sistema de consecuencias está implementado conceptualmente.

El balance final de:

* errores
* probabilidades
* corrupción
* tiempo
* condiciones de documentos

todavía puede ajustarse mediante pruebas.

---

# 24. ROADMAP DE DESARROLLO

## FASE 1 — FUNDAMENTOS

🟢 COMPLETADA

* Estructura de proyecto
* Astro
* TypeScript
* Tailwind
* Tipos
* Configuración inicial
* Arquitectura base

---

## FASE 2 — GAMEPLAY CORE

🟢 IMPLEMENTADO

* Game Loop
* Document System
* Document Parser
* Document Loader
* Run System
* Run Coordinator
* Typing Engine
* Timer
* Error System
* Weapon System
* Checkpoints
* Corruption
* Death
* Completion
* Restart

---

## FASE 3 — UI / FEEDBACK

🟢 **IMPLEMENTADO**

* Document viewport
* Typing feedback
* Error feedback
* Error Counter
* Revolver UI
* Death Screen
* Completion Screen
* Checkpoint feedback
* Corruption feedback
* Sincronización temporal Error Counter / Revolver

🟡 **PULIDO PENDIENTE**

* Pulido visual general
* Animaciones adicionales
* Ajustes de feedback
* Balance de tiempos si las pruebas futuras lo requieren

---

## FASE 4 — CONTENIDO

🟡 **EN PROGRESO**

* Documentos Markdown
* Categorías
* Condiciones de conservación
* Español
* Inglés
* Parser
* Selección aleatoria

Pendiente:

* ampliar biblioteca
* definir condiciones definitivas
* contenido narrativo

---

## FASE 5 — INMERSIÓN

⚪ **PENDIENTE**

* Three.js
* Escenas 3D
* Audio ambiental
* SFX
* VFX
* Transiciones
* Ambientación narrativa
* UI final

---

## FASE 6 — PROGRESIÓN

⚪ **PENDIENTE**

* Biblioteca
* Weekly Reset
* Persistencia
* Document conservation
* Progreso semanal
* Estadísticas
* Achievements

---

# 25. BACKLOG

🟢 **COMPLETADO**

* Error Counter
* Error timing
* Sincronización visual con revolver
* Reset visual del checkpoint

🟡 **PRIORIDAD ALTA**

* Pruebas generales del Gameplay Core
* Balance
* Document content
* Pulido de Checkpoint feedback
* Pulido de Death / Completion

🟡 **PRIORIDAD MEDIA**

* Three.js
* Audio
* VFX
* Biblioteca
* Weekly Reset

⚪ **PRIORIDAD BAJA**

* Estadísticas avanzadas
* Achievements
* Features adicionales

---

# 26. IDEAS DESCARTADAS

No volver a introducir estas ideas salvo nueva decisión explícita:

* Sistema de vidas
* `DeathSystem`
* `CompletionSystem`
* `RevolverSystem`
* Múltiples Game Loops
* React
* Mezclar Error UI con Revolver UI
* Usar Three.js únicamente porque forma parte del stack
* Run Score como sistema principal

---

# 27. CURRENT STATE — CONTINUITY CHECKPOINT

> **ESTA SECCIÓN ES LA MÁS IMPORTANTE PARA CONTINUAR EL PROYECTO EN OTRO CHAT.**

## 🟢 ÚLTIMO ESTADO CONFIRMADO

### Error Counter

**ESTADO: COMPLETADO**

El bug del tercer `X` fue resuelto.

El comportamiento confirmado es:

```text
0 → 1 → 2 → 3 → 0
```

El tercer `X` aparece correctamente.

El tiempo de visualización de los errores fue ajustado para coincidir con la secuencia visual del giro del revolver.

### Estado de checkpoint

El reset del checkpoint funciona correctamente:

```text
errors  → 0
bullets → 0
timer   → reset
```

Los valores persistentes continúan correctamente.

---

## 📍 PUNTO ACTUAL DEL PROYECTO

La implementación del **Gameplay Core + UI principal de feedback** está en un estado funcional.

No existe actualmente un bug bloqueante relacionado con:

* Error Counter
* Error Indicator
* Revolver UI
* sincronización temporal entre ambos
* checkpoint reset

---

# 28. PRÓXIMO PASO

Antes de comenzar una nueva gran funcionalidad:

### 1. Realizar prueba general del flujo actual

```text
NEW RUN
   ↓
DOCUMENT
   ↓
TYPE
   ↓
ERROR 1
   ↓
ERROR 2
   ↓
ERROR 3
   ↓
BULLET
   ↓
REVOLVER
   ↓
SURVIVE / DEATH
   ↓
CHECKPOINT / RESTART
   ↓
NEXT DOCUMENT
```

### 2. Confirmar que no existen regresiones.

### 3. Después seleccionar el siguiente bloque de trabajo.

El siguiente gran bloque previsto es:

🟡 **CONTENIDO / PULIDO DEL CORE**

antes de pasar definitivamente a:

⚪ **THREE.JS / INMERSIÓN**

---

# 29. REGLA DE CONTINUIDAD

Cuando se continúe Scribe desde otro chat:

### Primero leer:

```text
ROADMAP.md
```

### Después buscar:

```text
CURRENT STATE — CONTINUITY CHECKPOINT
```

### No asumir que una funcionalidad está pendiente si este documento la marca como completada.

### Si una decisión nueva contradice el roadmap:

Detener la implementación y discutir primero el cambio.

---

# 30. DEFINITION OF DONE

Una funcionalidad se considera terminada cuando:

* funciona
* respeta la arquitectura
* no duplica responsabilidades
* no introduce sistemas innecesarios
* está integrada con el flujo existente
* no rompe sistemas anteriores
* su comportamiento está probado
* el roadmap queda actualizado

---

# 31. REGLA PARA ACTUALIZAR ESTE ROADMAP

Después de completar una tarea importante:

```text
IMPLEMENTAR
    ↓
PROBAR
    ↓
CONFIRMAR
    ↓
ACTUALIZAR ROADMAP
    ↓
ACTUALIZAR CURRENT STATE
    ↓
SIGUIENTE TAREA
```

El `CURRENT STATE — CONTINUITY CHECKPOINT` debe mantenerse siempre actualizado.

Si se cambia de conversación, este bloque debe permitir continuar el desarrollo sin reconstruir el contexto desde cero.


               SCRIBE
                       │
                       ▼
              GAMEPLAY CORE
                       │
                       ▼
                UI / FEEDBACK
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
     GAMEPLAY UI              FEEDBACK UI
          │                         │
          ├─ Document              ├─ Errors ✅
          ├─ Timer                 ├─ Checkpoint
          ├─ Run state             ├─ Death
          ├─ Bullets               ├─ Completion
          ├─ Corruption            └─ Transitions
          └─ Progress
                       │
                       ▼
                 PULIDO / TEST
                       │
                       ▼
              EXPERIENCIA SÓLIDA
                       │
                       ▼
              ┌────────────────┐
              │ ATMOSPHERE     │
              │ CSS + THREE.JS │
              │ VFX + SFX      │
              └────────────────┘