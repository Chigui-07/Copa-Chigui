# Copa Chigui ⚽🏆

**Copa Chigui** es un juego web de simulación de torneos internacionales de selecciones. Cada universo comienza desde cero y crea su propia historia: anfitriones, participantes, campeones, estrellas, récords, rankings y rivalidades.

> Dentro del juego no existe ninguna Copa anterior: la historia comienza únicamente cuando se crea una nueva partida.

## 🎮 Concepto principal

Al comenzar un universo, el jugador elige:

- Su nombre.
- El nombre de su rival controlado por el juego.
- El nombre del universo o partida.
- El modo de la Copa: **manual** o **simulada**.

El título del juego no hace referencia a IA ni a ChatGPT. El rival es simplemente el segundo participante del sistema de predicciones.

## 🌍 Copa Chigui #1

La primera Copa se genera completamente al azar:

- 🎲 Anfitrión aleatorio.
- 🎲 64 selecciones aleatorias.
- ✅ El anfitrión siempre queda incluido entre las 64.
- 🎲 Sorteo aleatorio de 16 grupos de 4.
- 🏆 No existe campeón defensor.
- 📊 Todas las selecciones comienzan con 100 puntos.
- 📜 No existe historial previo.

Los resultados no están prefijados. En modo simulado, el juego puede producir victorias, empates, derrotas, sorpresas y goleadas. En modo manual, el jugador registra cada resultado.

## 🏆 Formato base

- 64 selecciones.
- 16 grupos de 4.
- 3 jornadas por grupo.
- Los 2 mejores de cada grupo avanzan.
- Dieciseisavos de final.
- Octavos de final.
- Cuartos de final.
- Semifinales.
- Partido por el tercer puesto.
- Final.

Desde la Copa #2, el campeón vigente clasifica automáticamente. El resto de plazas y el nuevo anfitrión se generan según las reglas de la nueva edición.

## 👥 Copa con amigos

Además del modo principal de historia, se planea un modo separado para jugar una Copa con amigos.

En este modo:

- Los jugadores podrán elegir manualmente qué selecciones participan.
- El anfitrión seguirá siendo elegido aleatoriamente entre las selecciones participantes.
- La Copa tendrá su propio historial separado del universo principal.
- El sistema de predicciones podrá admitir varios jugadores humanos en una misma competencia.
- Las reglas deportivas serán las mismas que en una Copa Chigui normal salvo que se configure otra cosa en el futuro.

## ⭐ Títulos y banderas

Las selecciones se representan con banderas.

Cada Copa Chigui ganada añade una estrella visual:

- 🇯🇵⭐ = 1 título.
- 🇧🇷⭐⭐⭐ = 3 títulos.
- Para cantidades grandes podrá usarse `⭐ × 7`.

La carpeta `assets/flags/` queda reservada para las imágenes de bandera. Mientras se conectan esas imágenes, los emojis funcionan como respaldo.

## 📊 Ranking y fuerza

En Copa Chigui, **ranking y fuerza nacen juntos**. No se utiliza una fuerza basada en el fútbol real.

Todas las selecciones comienzan exactamente iguales:

`100 puntos`

Regla inicial:

| Resultado | Cambio |
|---|---:|
| Victoria | +2 pts |
| Empate | 0 pts |
| Derrota | -2 pts |

Por lo tanto, las propias Copas crean las potencias de cada universo. Una selección que gane mucho se vuelve progresivamente más fuerte en el simulador; una que acumule derrotas pierde fuerza.

La diferencia de goles no modifica directamente los puntos: ganar 1-0 y ganar 7-0 cuentan como una victoria para este sistema. Las goleadas sí quedan guardadas en estadísticas y récords.

### Bonos por podio

Al completar una Copa se entregan puntos adicionales de fuerza/ranking:

| Posición | Bono |
|---|---:|
| 🥇 Campeón | +6 pts |
| 🥈 Subcampeón | +4 pts |
| 🥉 Tercer lugar | +2 pts |

Estos puntos se suman a los cambios obtenidos por los resultados de los partidos.

La interfaz del ranking completo deberá mostrar:

- Posición actual.
- Posición anterior.
- Puestos ganados o perdidos.
- Puntos actuales.
- Cambio de puntos.
- Mejor posición histórica.

Ejemplo:

`🇬🇹 Guatemala — #8 → #5 ⬆️ +3 | 106 pts → 110 pts (+4)`

### Penales

Ganar una eliminatoria por penales cuenta como victoria completa para el sistema; perderla cuenta como derrota. Se guardan por separado el resultado antes de la tanda y el marcador de penales.

## ⚽ Sistema de partidos

El simulador utiliza:

- Puntos/fuerza actual de ambas selecciones.
- Pequeña ventaja de localía para el anfitrión.
- Azar controlado para permitir empates, sorpresas y goleadas.

El equipo con más puntos tiene mayor probabilidad de obtener un buen resultado, pero nunca una victoria garantizada.

### Modos de Copa

Al crear la Copa se elige uno de dos modos y queda fijado durante esa edición:

1. **✍️ Manual:** todos los resultados se escriben manualmente. Los botones de simulación quedan desactivados.
2. **🎮 Simulada:** todos los resultados los genera el juego. La edición manual queda desactivada.

Para el modo simulado se planea añadir un **minijuego opcional** que permita vivir los partidos sin reemplazar la lógica principal del simulador.

## 📋 Fase de grupos

Cada grupo tiene tres jornadas y seis partidos en total. Con 16 grupos, la fase completa contiene **96 partidos**.

La tabla usa:

- Victoria: 3 puntos de grupo.
- Empate: 1 punto de grupo.
- Derrota: 0 puntos de grupo.

Desempates provisionales:

1. Puntos de grupo.
2. Diferencia de goles.
3. Goles a favor.
4. Orden alfabético como último criterio técnico provisional.

Los dos primeros aparecen marcados como puestos de clasificación. Cuando terminan los 96 partidos, el juego muestra automáticamente las 32 selecciones clasificadas.

## 🥊 Eliminación directa

Los dieciseisavos se crean después de confirmar los 32 clasificados. En ese momento la fase de grupos queda bloqueada para que el cuadro no cambie accidentalmente.

Emparejamientos base:

- 1.º del Grupo A vs 2.º del Grupo B.
- 1.º del Grupo B vs 2.º del Grupo A.
- Se repite el patrón por parejas de grupos hasta O/P.

Después, los ganadores avanzan automáticamente a octavos, cuartos, semifinales, partido por el tercer puesto y final. Al crear una nueva ronda, la anterior queda bloqueada para evitar que un cambio posterior rompa el cuadro.

Si el marcador termina empatado, debe existir un ganador por penales. El ganador por penales obtiene la victoria completa de `+2` y el eliminado recibe `-2`.

Cuando terminan el tercer puesto y la final:

- Se guarda el campeón.
- Se guarda el subcampeón.
- Se guarda el tercer lugar.
- El campeón recibe una estrella adicional.
- Se aplican los bonos de podio `+6 / +4 / +2`.

## 🎯 Sistema de predicciones

Antes de cada partido, jugador y rival realizan una predicción. Ambas quedan bloqueadas antes de conocer el resultado.

| Predicción | Puntos |
|---|---:|
| Marcador exacto | 3 |
| Ganador o empate correcto | 1 |
| Incorrecta | 0 |

También se guardará el número de marcadores exactos.

Cada Copa reinicia el marcador de predicciones, pero el universo conservará cuántas competiciones de predicciones ganó cada participante.

## 🪙 Chigui Coins

Moneda completamente virtual, sin valor real y sin compra o retiro con dinero real.

Se obtendrá por predicciones correctas, marcadores exactos, rachas, sorpresas acertadas, completar Copas y logros. Se gastará únicamente en contenido cosmético.

## 🔥 Predicción de confianza

En determinados momentos podrá marcarse una predicción como especial. Si se acierta habrá recompensa adicional; si falla no se pierden monedas.

## 🏅 Premios de Copa

- 🏆 Campeón.
- 🥈 Subcampeón.
- 🥉 Tercer lugar.
- ⚽ Mejor ataque.
- 🧤 Mejor defensa.
- 💥 Mayor goleada.
- 😱 Mayor sorpresa.
- 🌟 Selección revelación.

## 📚 Historial permanente

Cada universo guardará por Copa anfitrión, participantes, grupos, resultados, eliminatorias, podio, premios, ranking posterior, predicciones y récords.

Por selección guardará participaciones, títulos, estrellas, mejor actuación, PJ, G, E, P, GF, GC, ranking actual y mejor ranking histórico.

## 💾 Universos

Cada universo será independiente y tendrá sus propios campeones, ranking, monedas, historial, récords y sorteos.

## 🌱 Semillas

Cada edición podrá guardar una semilla para recrear exactamente su anfitrión, participantes y sorteo de grupos.

## 🧱 Tecnología

Primera versión web sin dependencias externas:

- HTML.
- CSS.
- JavaScript.
- `localStorage` para los primeros guardados.
- GitHub Pages para publicación y pruebas.

Estructura actual principal:

```text
Copa-Chigui/
├─ index.html
├─ css/
│  ├─ style.css
│  └─ mode.css
├─ js/
│  ├─ teams.js
│  ├─ tournament.js
│  ├─ rules.js
│  └─ app.js
├─ assets/
│  └─ flags/
│     └─ README.md
└─ README.md
```

## 🗺️ Ruta de desarrollo

1. ✅ Crear base inicial de selecciones.
2. ✅ Crear pantalla de nuevo universo.
3. ✅ Elegir anfitrión y 64 participantes aleatorios.
4. ✅ Sortear 16 grupos.
5. ✅ Crear jornadas y tablas.
6. ✅ Añadir resultados manuales y simulados.
7. ✅ Crear eliminatorias completas hasta coronar campeón.
8. ✅ Añadir elección de modo manual o simulado por Copa.
9. 🚧 Implementar ranking mundial completo y cambios de posiciones.
10. Diseñar e implementar minijuego del modo simulado.
11. Implementar predicciones.
12. Guardar historial y estadísticas completas.
13. Añadir Chigui Coins y premios.
14. Añadir modo Copa con amigos.
15. Mejorar interfaz y animaciones.

---

# 📝 Bitácora

## v0.0.1 — Diseño inicial

- ✅ Repositorio creado.
- ✅ Nombre definido: **Copa Chigui**.
- ✅ Historia independiente desde cero por universo.
- ✅ Copa #1 totalmente aleatoria.
- ✅ 64 selecciones y 16 grupos.
- ✅ Ranking inicial de 100 puntos.
- ✅ Banderas + estrellas para títulos.
- ✅ Jugador y rival personalizables.
- ✅ Predicciones, Chigui Coins, premios e historial planificados.

## v0.0.2 — Primer prototipo funcional

- ✅ Ranking y fuerza unificados.
- ✅ Todas las selecciones comienzan en 100.
- ✅ Victoria `+2`, empate `0`, derrota `-2`.
- ✅ Penales cuentan como victoria/derrota completa.
- ✅ Pantalla para crear un universo.
- ✅ Nombre del jugador, rival y universo.
- ✅ Base inicial de 98 selecciones.
- ✅ Anfitrión aleatorio.
- ✅ Selección aleatoria de 64 participantes.
- ✅ Sorteo automático de 16 grupos de 4.
- ✅ El anfitrión queda marcado dentro de su grupo.
- ✅ Guardado básico del universo en `localStorage`.

## v0.0.3 — Fase de grupos

- ✅ Generación automática de las 3 jornadas de cada grupo.
- ✅ 6 partidos por grupo y **96 partidos en total**.
- ✅ Tablas con PJ, G, E, P, GF, GC, DG y puntos.
- ✅ Resultados manuales editables.
- ✅ Victoria actualiza el ranking/fuerza en `+2/-2`.
- ✅ Empate no cambia el ranking/fuerza.
- ✅ Compatibilidad con partidas locales anteriores.
- 📝 Planeado el modo **Copa con amigos**.

## v0.0.4 — Simulación automática y clasificados

- ✅ Simulación automática basada en la fuerza/puntos actuales.
- ✅ Ventaja pequeña y temporal para el anfitrión.
- ✅ Botón de simulación por partido.
- ✅ Botón para simular el siguiente partido pendiente.
- ✅ Botón para simular todos los partidos pendientes.
- ✅ Progreso visible de `0/96` hasta `96/96`.
- ✅ Al finalizar los grupos aparecen automáticamente los 32 clasificados.
- ✅ Corregido el conteo total de la fase de grupos: son 96 partidos, no 48.

## v0.0.5 — Dieciseisavos de final

- ✅ Botón para confirmar los clasificados y crear los 16 cruces.
- ✅ La fase de grupos se bloquea al iniciar eliminatorias.
- ✅ Resultados manuales en dieciseisavos.
- ✅ Simulación automática por partido.
- ✅ Simulación de todos los partidos pendientes.
- ✅ Tandas de penales cuando el partido termina empatado.
- ✅ Ganar por penales cuenta como victoria completa `+2/-2`.
- ✅ El ganador de cada cruce queda resaltado y marcado como clasificado.
- ✅ Progreso visible de `0/16` a `16/16`.

## v0.0.6 — Cuadro completo y primer campeón

- ✅ Octavos de final con 8 partidos.
- ✅ Cuartos de final con 4 partidos.
- ✅ Semifinales con 2 partidos.
- ✅ Partido por el tercer puesto.
- ✅ Gran final.
- ✅ Resultados manuales y simulación automática en todas las rondas.
- ✅ Penales disponibles en todas las eliminatorias.
- ✅ Cada ronda queda bloqueada cuando se crea la siguiente.
- ✅ El juego guarda campeón, subcampeón y tercer lugar.
- ✅ El campeón recibe automáticamente una estrella.
- ✅ Pantalla final con el podio de la Copa.
- ✅ Creada la carpeta `assets/flags/` para recibir las banderas reales del proyecto.

## v0.0.7 — Modos de Copa y bonos de podio

- ✅ Al comenzar una Copa se elige entre **modo manual** y **modo simulado**.
- ✅ En modo manual se desactivan los controles de simulación.
- ✅ En modo simulado se desactiva la edición manual de resultados.
- ✅ El modo queda guardado dentro de la Copa.
- ✅ Campeón recibe un bono adicional de `+6` puntos de fuerza/ranking.
- ✅ Subcampeón recibe `+4` puntos.
- ✅ Tercer lugar recibe `+2` puntos.
- ✅ Los bonos se recalculan de forma segura si se corrige un resultado final.
- 📝 Planeado un minijuego opcional para las Copas simuladas.

### Objetivo actual

Construir el **Ranking Mundial Chigui** con posiciones, subidas/bajadas y cambios de puntos, y diseñar el primer minijuego del modo simulado antes de integrar por completo el sistema de predicciones.
