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