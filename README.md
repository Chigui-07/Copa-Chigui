# Copa Chigui ⚽🏆

**Copa Chigui** es un juego web de simulación de torneos internacionales de selecciones. Cada universo comienza desde cero y construye su propia historia: anfitriones, participantes, campeones, estrellas, récords, rankings y rivalidades.

> Dentro del juego no existe ninguna Copa previa. La historia comienza cuando se crea una nueva partida.

## 🎮 Concepto principal

Al comenzar un universo, el jugador elige:

- Su nombre.
- El nombre de su rival.
- El nombre del universo.
- El modo de la Copa: **manual** o **simulada**.

El título del juego no hace referencia a IA ni a ChatGPT. El rival es simplemente el segundo participante del futuro sistema de predicciones.

## 🌍 Copa Chigui #1

La primera edición nace completamente desde cero:

- 🎲 Anfitrión aleatorio.
- 🎲 64 selecciones aleatorias.
- ✅ El anfitrión siempre está entre las 64.
- 🎲 16 grupos de 4 sorteados al azar.
- 🏆 Sin campeón defensor.
- 📊 Todas las selecciones empiezan con 100 puntos de fuerza/ranking.
- 📜 Sin historial previo.

## 🏆 Formato

- 64 selecciones.
- 16 grupos de 4.
- 3 jornadas y 6 partidos por grupo.
- 96 partidos en toda la fase de grupos.
- Los 2 primeros avanzan.
- Dieciseisavos.
- Octavos.
- Cuartos.
- Semifinales.
- Partido por el tercer puesto.
- Final.

Desde la Copa #2, el campeón vigente tendrá clasificación automática. El resto de plazas y el nuevo anfitrión se generarán según las reglas de la nueva edición.

## 👥 Copa con amigos

Se planea un modo separado para competir con amigos:

- Los jugadores elegirán manualmente las selecciones participantes.
- El anfitrión seguirá siendo aleatorio entre esas selecciones.
- Tendrá historial separado del universo principal.
- El sistema de predicciones podrá admitir varios jugadores humanos.

## ⭐ Banderas y títulos

Las selecciones se representan con banderas. Cada Copa Chigui ganada añade una estrella visual:

- 🇯🇵⭐ = 1 título.
- 🇧🇷⭐⭐⭐ = 3 títulos.
- Para cantidades grandes podrá mostrarse `⭐ × 7`.

La carpeta `assets/flags/` está reservada para las imágenes reales de bandera del proyecto. Mientras se integran, los emojis funcionan como respaldo.

## 📊 Fuerza y Ranking Mundial Chigui

No se utiliza una fuerza basada en el fútbol real. Todas las selecciones nacen iguales con **100 puntos** y el propio universo crea sus potencias.

| Resultado | Cambio de fuerza/ranking |
|---|---:|
| Victoria | +2 pts |
| Empate | 0 pts |
| Derrota | -2 pts |

La diferencia de goles no modifica directamente la fuerza. Ganar 1-0 y ganar 7-0 valen lo mismo para este sistema, aunque las goleadas sí quedan registradas en estadísticas.

### Bonos de podio

| Posición | Bono adicional |
|---|---:|
| 🥇 Campeón | +6 pts |
| 🥈 Subcampeón | +4 pts |
| 🥉 Tercer lugar | +2 pts |

Los bonos se suman a los cambios conseguidos partido a partido.

### Ranking Mundial Chigui

El juego ya mantiene un ranking de **todas las selecciones disponibles**, participen o no en la Copa actual.

La tabla muestra:

- Posición actual.
- Posición al comenzar la Copa.
- Puestos ganados o perdidos.
- Puntos actuales.
- Cambio de puntos durante la Copa.
- Mejor posición alcanzada.
- Estrellas por títulos.

Ejemplo:

`#8 → #5 ▲3 | 110 pts (+4)`

Mientras una Copa está en curso, el ranking aparece como **provisional**. Al terminar la Copa pasa a mostrarse como **oficial** e incluye los bonos de podio.

Como todas las selecciones parten empatadas en 100 puntos, el primer orden utiliza un criterio alfabético únicamente para mantener una tabla estable. Ese desempate visual no da ninguna ventaja en la simulación.

## 🥅 Penales

Ganar una eliminatoria por penales cuenta como victoria completa para la fuerza/ranking y perderla cuenta como derrota. El marcador del partido y la tanda se guardan por separado.

## ⚽ Modos de Copa

El modo se elige antes de comenzar y queda fijado durante toda la edición:

1. **✍️ Manual:** el usuario escribe todos los resultados y los controles de simulación quedan desactivados.
2. **🎮 Simulada:** el juego genera todos los resultados y la edición manual queda desactivada.

No es necesario añadir un minijuego para este modo; la simulación automática es suficiente para el núcleo actual del proyecto.

## 📋 Fase de grupos

Puntuación de grupo:

- Victoria: 3 puntos.
- Empate: 1 punto.
- Derrota: 0 puntos.

Desempates provisionales:

1. Puntos.
2. Diferencia de goles.
3. Goles a favor.
4. Orden alfabético como criterio técnico provisional.

Al completar los 96 partidos se muestran automáticamente las 32 selecciones clasificadas.

## 🥊 Eliminación directa

Los dieciseisavos se crean después de confirmar los clasificados. Al crear una ronda nueva, la anterior queda bloqueada para evitar romper el cuadro.

Emparejamientos iniciales:

- A1 vs B2.
- B1 vs A2.
- El patrón continúa por parejas de grupos hasta O/P.

El cuadro completo llega hasta tercer puesto y final. Al terminar:

- Se guarda campeón, subcampeón y tercero.
- El campeón recibe una estrella.
- Se aplican los bonos de podio.

## 🎯 Predicciones — planificado

Antes de cada partido, jugador y rival harán una predicción que quedará bloqueada antes de conocer el resultado.

| Predicción | Puntos |
|---|---:|
| Marcador exacto | 3 |
| Ganador o empate correcto | 1 |
| Incorrecta | 0 |

También se guardará el número de marcadores exactos y el historial de competiciones de predicciones ganadas.

## 🪙 Chigui Coins — planificado

Moneda completamente virtual, sin valor real, compra con dinero real ni retiro.

Se obtendrá por predicciones, rachas, logros y completar Copas. Se usará únicamente en personalización y elementos cosméticos.

## 🏅 Premios — planificado

- 🏆 Campeón.
- 🥈 Subcampeón.
- 🥉 Tercer lugar.
- ⚽ Mejor ataque.
- 🧤 Mejor defensa.
- 💥 Mayor goleada.
- 😱 Mayor sorpresa.
- 🌟 Selección revelación.

## 📚 Historial permanente — planificado

Cada universo conservará anfitriones, participantes, resultados, eliminatorias, podios, rankings, récords, predicciones y premios.

Por selección se guardarán participaciones, títulos, estrellas, mejor actuación, PJ, G, E, P, GF, GC, ranking actual y mejor ranking histórico.

## 💾 Universos

Cada universo será independiente y tendrá sus propios campeones, ranking, monedas, historial, récords y sorteos.

## 🌱 Semillas — planificado

Cada edición podrá guardar una semilla para recrear exactamente su anfitrión, participantes y sorteo.

## 🧱 Tecnología

- HTML.
- CSS.
- JavaScript.
- `localStorage` para los primeros guardados.
- GitHub Pages para publicación y pruebas.

Estructura principal actual:

```text
Copa-Chigui/
├─ index.html
├─ css/
│  ├─ style.css
│  ├─ mode.css
│  └─ ranking.css
├─ js/
│  ├─ teams.js
│  ├─ tournament.js
│  ├─ rules.js
│  ├─ ranking.js
│  └─ app.js
├─ assets/
│  └─ flags/
│     └─ README.md
└─ README.md
```

## 🗺️ Ruta de desarrollo

1. ✅ Base inicial de selecciones.
2. ✅ Pantalla de nuevo universo.
3. ✅ Anfitrión y 64 participantes aleatorios.
4. ✅ Sorteo de 16 grupos.
5. ✅ Jornadas y tablas.
6. ✅ Resultados manuales y simulados.
7. ✅ Eliminatorias completas hasta coronar campeón.
8. ✅ Modos manual y simulado por Copa.
9. ✅ Ranking Mundial Chigui con movimientos y cambios de puntos.
10. 🚧 Integrar imágenes reales de banderas y probar el torneo completo.
11. Implementar predicciones.
12. Historial y estadísticas completas.
13. Chigui Coins y premios.
14. Copa con amigos.
15. Varias Copas dentro del mismo universo.
16. Mejorar interfaz y animaciones.

---

# 📝 Bitácora

## v0.0.1 — Diseño inicial

- ✅ Repositorio creado.
- ✅ Nombre **Copa Chigui**.
- ✅ Historia nueva desde cero por universo.
- ✅ Primera Copa aleatoria.
- ✅ Ranking inicial de 100 puntos.
- ✅ Banderas + estrellas.
- ✅ Jugador y rival personalizables.

## v0.0.2 — Primer prototipo

- ✅ 98 selecciones iniciales.
- ✅ Anfitrión aleatorio.
- ✅ 64 participantes.
- ✅ 16 grupos de 4.
- ✅ Guardado básico con `localStorage`.

## v0.0.3 — Fase de grupos

- ✅ 3 jornadas por grupo.
- ✅ 96 partidos en total.
- ✅ Tablas PJ, G, E, P, GF, GC, DG y puntos.
- ✅ Resultados manuales editables.
- ✅ Fuerza actualizada con `+2 / 0 / -2`.

## v0.0.4 — Simulación automática

- ✅ Simulación basada en fuerza actual.
- ✅ Pequeña ventaja del anfitrión.
- ✅ Simulación individual, siguiente partido y todos los pendientes.
- ✅ 32 clasificados automáticos.

## v0.0.5 — Dieciseisavos

- ✅ 16 cruces.
- ✅ Fase de grupos bloqueada al comenzar eliminatorias.
- ✅ Penales.
- ✅ Resultados manuales y simulados.

## v0.0.6 — Cuadro completo

- ✅ Octavos, cuartos, semifinales, tercer puesto y final.
- ✅ Podio completo.
- ✅ Primera estrella para el campeón.
- ✅ Carpeta `assets/flags/` creada.

## v0.0.7 — Modos y bonos

- ✅ Modo manual o simulado elegido antes de comenzar.
- ✅ Controles incompatibles desactivados según el modo.
- ✅ Bonos de podio: campeón `+6`, subcampeón `+4`, tercero `+2`.
- ✅ Los bonos pueden recalcularse si se corrige un resultado final.

## v0.0.8 — Ranking Mundial Chigui

- ✅ Ranking de todas las selecciones disponibles, no solo las 64 participantes.
- ✅ Posición actual y posición anterior.
- ✅ Flechas de subida/bajada y cantidad de puestos movidos.
- ✅ Cambio de puntos desde el comienzo de la Copa.
- ✅ Mejor posición histórica alcanzada dentro de la partida actual.
- ✅ Ranking provisional durante la Copa y oficial al finalizarla.
- ✅ Buscador de selecciones.
- ✅ Vista Top 20 y opción de mostrar la clasificación completa.
- ✅ Participantes y anfitrión diferenciados visualmente.
- ✅ Se eliminó del plan el minijuego del modo simulado por no ser necesario para el núcleo actual.

### Objetivo actual

Probar una Copa completa desde cero, integrar las banderas reales en `assets/flags/` y corregir cualquier error encontrado antes de comenzar el **sistema de predicciones jugador vs rival**.
