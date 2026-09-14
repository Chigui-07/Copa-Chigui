# Copa Chigui ⚽🏆

**Copa Chigui** es un juego web de simulación de torneos internacionales de selecciones. Cada universo comienza desde cero y crea su propia historia: anfitriones, participantes, campeones, estrellas, récords, rankings y rivalidades.

> Dentro del juego no existe ninguna Copa anterior: la historia comienza únicamente cuando se crea una nueva partida.

## 🎮 Concepto principal

Al comenzar un universo, el jugador elige:

- Su nombre.
- El nombre de su rival controlado por el juego.
- El nombre del universo o partida.

El título del juego no hace referencia a IA ni a ChatGPT. El rival es simplemente el segundo participante del sistema de predicciones.

## 🌍 Copa Chigui #1

La primera Copa será generada completamente al azar:

- 🎲 Anfitrión aleatorio.
- 🎲 64 selecciones aleatorias.
- ✅ El anfitrión siempre queda incluido entre las 64.
- 🎲 Sorteo aleatorio de 16 grupos de 4.
- 🏆 No existe campeón defensor.
- 📊 Todas las selecciones comienzan con 100 puntos.
- 📜 No existe historial previo.

Los resultados no estarán prefijados. El simulador generará victorias, empates, derrotas, sorpresas y goleadas.

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

## ⭐ Títulos y banderas

Las selecciones se representan con banderas.

Cada Copa Chigui ganada añade una estrella visual:

- 🇯🇵⭐ = 1 título.
- 🇧🇷⭐⭐⭐ = 3 títulos.
- Para cantidades grandes podrá usarse `⭐ × 7`.

## 📊 Ranking y fuerza

En Copa Chigui, **ranking y fuerza nacen juntos**. No se utilizará una fuerza basada en el fútbol real.

Todas las selecciones comienzan exactamente iguales:

`100 puntos`

Regla inicial:

| Resultado | Cambio |
|---|---:|
| Victoria | +2 pts |
| Empate | 0 pts |
| Derrota | -2 pts |

Por lo tanto, las propias Copas crearán las potencias de cada universo. Una selección que gane mucho se volverá progresivamente más fuerte en el simulador; una que acumule derrotas perderá fuerza.

La diferencia de goles no modifica directamente los puntos: ganar 1-0 y ganar 7-0 cuentan como una victoria para este sistema. Las goleadas sí quedan guardadas en estadísticas y récords.

La interfaz mostrará:

- Posición actual.
- Posición anterior.
- Puestos ganados o perdidos.
- Puntos actuales.
- Cambio de puntos.
- Mejor posición histórica.

Ejemplo:

`🇬🇹 Guatemala — #8 → #5 ⬆️ +3 | 106 pts → 110 pts (+4)`

### Penales

Ganar una eliminatoria por penales cuenta como victoria completa para el sistema; perderla cuenta como derrota. Además se guardarán por separado el resultado antes de la tanda y el marcador de penales.

## ⚽ Sistema de partidos

El simulador utilizará principalmente:

- Puntos/fuerza actual de ambas selecciones.
- Forma reciente.
- Pequeña ventaja de localía para el anfitrión.
- Azar controlado.

El equipo con más puntos tendrá mayor probabilidad de ganar, pero nunca una victoria garantizada.

Modos previstos:

1. **Simulación rápida:** genera directamente el resultado.
2. **Resultado manual:** el usuario introduce un resultado obtenido externamente.
3. **Simulación visual:** futura representación del partido minuto a minuto.

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

Se obtendrá por:

- Predicciones correctas.
- Marcadores exactos.
- Rachas.
- Sorpresas acertadas.
- Completar Copas.
- Logros.

Se gastará únicamente en contenido cosmético como temas, fondos, animaciones, marcos, decoraciones y elementos de la sala de trofeos.

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

Cada universo guardará por Copa:

- Anfitrión.
- Participantes.
- Grupos.
- Resultados.
- Eliminatorias.
- Podio.
- Premios.
- Ranking posterior.
- Predicciones.
- Récords.

Y por selección:

- Participaciones.
- Títulos.
- Estrellas.
- Mejor actuación.
- PJ, G, E y P.
- GF y GC.
- Ranking actual.
- Mejor ranking histórico.

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

Estructura inicial:

```text
Copa-Chigui/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ teams.js
│  ├─ tournament.js
│  └─ app.js
└─ README.md
```

## 🗺️ Ruta de desarrollo

1. Crear base inicial de selecciones.
2. Crear pantalla de nuevo universo.
3. Elegir anfitrión y 64 participantes aleatorios.
4. Sortear 16 grupos.
5. Crear jornadas y tablas.
6. Añadir resultados manuales y simulados.
7. Crear eliminatorias.
8. Implementar cambios de ranking/fuerza.
9. Implementar predicciones.
10. Guardar historial y estadísticas.
11. Añadir Chigui Coins y premios.
12. Mejorar interfaz y animaciones.

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

## v0.0.2 — Inicio de programación

- ✅ Ranking y fuerza unificados.
- ✅ Todas las selecciones comienzan en 100.
- ✅ Victoria `+2`, empate `0`, derrota `-2`.
- ✅ Penales cuentan como victoria/derrota completa.
- 🚧 Primera pantalla y generación de Copa #1 en desarrollo.

### Objetivo actual

Conseguir que una nueva partida pueda introducir los nombres del jugador/rival, generar un anfitrión, elegir 64 selecciones y mostrar los 16 grupos de la primera Copa Chigui.
