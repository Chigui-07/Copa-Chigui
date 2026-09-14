# Copa Chigui ⚽🏆

**Copa Chigui** es un juego de simulación de torneos internacionales de selecciones. Cada partida crea una historia futbolística nueva desde cero: nuevos anfitriones, participantes, campeones, récords, rankings y rivalidades.

> La historia del juego comienza únicamente dentro de cada partida. No existe ningún campeón, ranking o torneo previo.

## 🎮 Concepto principal

El jugador crea un universo nuevo y compite contra un rival controlado por el juego en un sistema de predicciones mientras se disputan las Copas Chigui.

Al comenzar una partida se pedirá:

- Nombre del jugador.
- Nombre del rival/bot.
- Nombre del universo o partida.

El título del juego no hará referencia a IA ni a ChatGPT; el rival será simplemente otro participante dentro de la experiencia.

## 🌍 Copa Chigui #1

La primera Copa será generada **completamente desde cero**.

- 🎲 El anfitrión será elegido aleatoriamente entre las selecciones disponibles.
- 🎲 Se elegirán 64 selecciones de forma aleatoria.
- ✅ El anfitrión estará incluido obligatoriamente entre las 64.
- 🎲 Las 64 selecciones se sortearán aleatoriamente en 16 grupos de 4.
- 🏆 No existirá campeón defensor.
- 📊 Todas las selecciones comenzarán con 100 puntos de ranking.
- 📜 No habrá historial previo.

Los resultados de los partidos no estarán escritos previamente: serán producidos por el sistema de simulación del juego y podrán incluir sorpresas, empates y goleadas.

## 🏆 Formato base

- 64 selecciones.
- 16 grupos de 4.
- 3 jornadas por grupo.
- Los 2 mejores de cada grupo avanzan.
- 32 selecciones pasan a eliminación directa.
- Dieciseisavos de final.
- Octavos de final.
- Cuartos de final.
- Semifinales.
- Partido por el tercer puesto.
- Final.

A partir de la Copa #2, el campeón vigente tendrá clasificación automática. El resto de plazas y el nuevo anfitrión se volverán a generar según las reglas del juego.

## ⭐ Títulos y banderas

El juego utilizará banderas para representar a las selecciones.

Cada Copa Chigui ganada añadirá una estrella al historial visual de la selección.

Ejemplos:

- 🇯🇵⭐ = 1 Copa Chigui.
- 🇧🇷⭐⭐⭐ = 3 Copas Chigui.
- Cuando una selección tenga muchas estrellas, la interfaz podrá mostrar un formato compacto como `⭐ × 7`.

## 📊 Ranking Mundial Chigui

Todas las selecciones comenzarán con **100 puntos**.

El ranking será persistente dentro de cada universo y cambiará según los resultados de los partidos.

La interfaz mostrará:

- Posición actual.
- Posición anterior.
- Subidas y bajadas de puestos.
- Puntos actuales.
- Puntos ganados o perdidos.
- Mejor posición histórica.

Ejemplo:

`🇬🇹 Guatemala — #8 → #5 ⬆️ +3 | 112 pts → 126 pts (+14)`

La fuerza interna utilizada por el simulador será independiente de la posición del ranking. El ranking representa el rendimiento conseguido dentro de la historia de esa partida.

### Penales

Ganar una eliminatoria por penales contará como victoria para el sistema de ranking del juego. La tanda también se guardará de forma separada en las estadísticas del partido para conservar el resultado del tiempo reglamentario/prórroga y el ganador de la serie.

## ⚽ Sistema de partidos

Cada selección tendrá una fuerza interna para ayudar a generar resultados creíbles sin hacer que el equipo más fuerte gane siempre.

El simulador podrá considerar:

- Fuerza base.
- Forma durante el torneo.
- Localía del anfitrión.
- Azar controlado.

Modos previstos:

1. **Simulación rápida:** muestra directamente el resultado.
2. **Resultado manual:** el usuario introduce un resultado obtenido fuera del juego.
3. **Simulación visual:** futura representación minuto a minuto.

## 🎯 Sistema de predicciones

Antes de cada partido, el jugador y su rival realizan una predicción.

Las predicciones deben bloquearse antes de generar o introducir el resultado para evitar modificaciones posteriores.

Puntuación propuesta:

| Predicción | Puntos |
|---|---:|
| Marcador exacto | 3 |
| Ganador o empate correcto | 1 |
| Incorrecta | 0 |

También se registrará por separado el número de marcadores exactos.

Cada Copa tendrá su propia competencia de predicciones, pero el juego guardará un historial global de Copas ganadas por cada participante.

## 🪙 Chigui Coins

El juego tendrá una moneda virtual llamada **Chigui Coins**.

No tendrá valor real, no podrá comprarse con dinero real y no podrá retirarse o intercambiarse por dinero.

Se podrá ganar mediante:

- Predicciones correctas.
- Marcadores exactos.
- Rachas de aciertos.
- Predicciones difíciles o sorpresas.
- Completar Copas.
- Logros especiales.

Las monedas se usarán para personalización y elementos cosméticos, no para dar ventajas competitivas.

Posibles usos:

- Temas de interfaz.
- Fondos.
- Animaciones de sorteo.
- Marcos y decoraciones.
- Sala de trofeos.
- Elementos visuales del perfil.

## 🔥 Predicción de confianza

En determinados momentos el jugador podrá marcar una predicción como especial o de alta confianza.

Si acierta, obtiene una recompensa adicional. Si falla, simplemente pierde esa oportunidad; no se quitarán monedas.

## 🏅 Premios de cada Copa

Premios iniciales previstos:

- 🏆 Campeón.
- 🥈 Subcampeón.
- 🥉 Tercer lugar.
- ⚽ Mejor ataque.
- 🧤 Mejor defensa.
- 💥 Mayor goleada.
- 😱 Mayor sorpresa.
- 🌟 Selección revelación.

En versiones futuras, si se añaden jugadores individuales, podrán incorporarse premios como goleador, mejor portero y mejor jugador.

## 📚 Historial permanente

Cada universo guardará toda su historia.

Por Copa:

- Anfitrión.
- Participantes.
- Grupos.
- Resultados.
- Eliminatorias.
- Campeón, subcampeón y tercero.
- Premios.
- Ranking posterior.
- Predicciones.
- Récords.

Por selección:

- Participaciones.
- Títulos.
- Mejor actuación.
- Partidos jugados.
- Victorias, empates y derrotas.
- Goles a favor y en contra.
- Ranking actual.
- Mejor ranking histórico.
- Historial de estrellas/títulos.

## 💾 Universos y partidas

El juego podrá admitir varios universos independientes.

Cada universo tendrá sus propios:

- Campeones.
- Rankings.
- Historiales.
- Chigui Coins.
- Predicciones.
- Récords.
- Sorteos.

Nada de un universo deberá modificar a otro.

## 🌱 Semillas de generación

Cada edición podrá guardar una semilla de generación para recrear un sorteo concreto de anfitrión, participantes y grupos.

## 🧱 Tecnología inicial

Primera versión prevista como juego web:

- HTML.
- CSS.
- JavaScript.
- GitHub Pages para publicación y pruebas.

Estructura propuesta:

```text
Copa-Chigui/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  ├─ app.js
│  ├─ teams.js
│  ├─ tournament.js
│  └─ ranking.js
├─ assets/
│  ├─ flags/
│  └─ ui/
└─ data/
   └─ teams.json
```

## 🗺️ Ruta inicial de desarrollo

1. Crear base de selecciones.
2. Generar anfitrión aleatorio.
3. Seleccionar 64 participantes.
4. Sortear 16 grupos.
5. Crear sistema de jornadas y tablas.
6. Añadir resultados manuales y simulados.
7. Crear eliminatorias.
8. Implementar ranking mundial.
9. Implementar predicciones jugador vs rival.
10. Guardar historial y estadísticas.
11. Añadir Chigui Coins y premios.
12. Mejorar interfaz, animaciones y presentación.

---

# 📝 Bitácora

## v0.0.1 — Inicio del proyecto

- ✅ Repositorio creado.
- ✅ Nombre definido: **Copa Chigui**.
- ✅ Nueva historia desde cero para cada universo.
- ✅ Copa Chigui #1 con anfitrión, participantes y grupos aleatorios.
- ✅ 64 selecciones por edición.
- ✅ Ranking inicial de 100 puntos para todas las selecciones.
- ✅ Estrellas junto a la bandera para representar títulos.
- ✅ Jugador y rival con nombres personalizables.
- ✅ Sistema de predicciones planificado.
- ✅ Chigui Coins definidas como moneda virtual cosmética.
- ✅ Historial, premios y múltiples universos planificados.

### Próximo objetivo

Diseñar la base de datos de selecciones (`teams.json`) y definir exactamente cómo funcionará la fuerza inicial y la simulación de partidos antes de programar la primera Copa completa.
