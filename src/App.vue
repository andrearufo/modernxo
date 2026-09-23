<template>
    <main class="app">
        <!-- MENU -->
        <section v-if="screen === 'menu'" class="menu">
            <header class="logo">
                <span class="x">✕</span><span class="o">◯</span>
                <h1>Tris<em>∞</em></h1>
                <p>Il tris che non finisce mai in pareggio</p>
            </header>

            <div class="panel">
                <p class="label">Modalità</p>
                <div class="segmented" role="radiogroup">
                    <button v-for="m in MODES" :key="m.id" role="radio" :aria-checked="mode === m.id"
                        :class="{ on: mode === m.id }" @click="mode = m.id">{{ m.label }}</button>
                </div>

                <template v-if="mode === 'cpu'">
                    <p class="label">Difficoltà</p>
                    <div class="segmented" role="radiogroup">
                        <button v-for="l in LEVEL_LABELS" :key="l.id" role="radio" :aria-checked="level === l.id"
                            :class="{ on: level === l.id }" @click="level = l.id">{{ l.label }}</button>
                    </div>
                </template>
            </div>

            <button class="cta" @click="start">Gioca</button>

            <details class="rules">
                <summary>Come si gioca</summary>
                <ul>
                    <li>Metti tre segni in fila per vincere.</li>
                    <li>Ognuno può avere al massimo <b>3 segni</b> sulla griglia.</li>
                    <li>Quando ne piazzi un quarto, il tuo segno più vecchio <b>sparisce</b>: quello che lampeggia.</li>
                    <li>Niente pareggi: si gioca finché qualcuno vince. A ogni round inizia l'altro.</li>
                </ul>
            </details>
        </section>

        <!-- PARTITA -->
        <section v-else class="play">
            <nav class="topbar">
                <button class="icon" aria-label="Torna al menu" @click="toMenu">‹</button>
                <span>{{ subtitle }}</span>
                <button class="icon" aria-label="Ricomincia il round" @click="newRound(false)">↻</button>
            </nav>

            <div class="scores">
                <div v-for="p in ['X', 'O']" :key="p" class="player" :class="[p, { active: !game.winner && game.turn === p }]">
                    <span class="mark">{{ p === 'X' ? '✕' : '◯' }}</span>
                    <span class="name">{{ names[p] }}</span>
                    <strong>{{ score[p] }}</strong>
                </div>
            </div>

            <div class="board" :class="{ over: game.winner }">
                <button v-for="(v, i) in game.board" :key="i" class="cell"
                    :class="{ win: game.line?.includes(i), fade: !game.winner && (fadeX === i || fadeO === i), next: nextFade === i }"
                    :disabled="!!v || !!game.winner || cpuTurn" :aria-label="cellLabel(i, v)" @click="tap(i)">
                    <Transition name="pop">
                        <svg v-if="v" :key="v" viewBox="0 0 100 100" :class="['piece', v]" aria-hidden="true">
                            <template v-if="v === 'X'">
                                <path d="M26 26 L74 74" />
                                <path d="M74 26 L26 74" />
                            </template>
                            <circle v-else cx="50" cy="50" r="25" />
                        </svg>
                    </Transition>
                </button>

                <svg v-if="game.line" class="strike" :class="game.winner" viewBox="0 0 3 3" aria-hidden="true">
                    <line :x1="cx(game.line[0])" :y1="cy(game.line[0])" :x2="cx(game.line[2])" :y2="cy(game.line[2])" />
                </svg>
            </div>

            <p class="status" aria-live="polite">{{ status }}</p>

            <Transition name="sheet">
                <div v-if="showResult" class="sheet" :class="game.winner">
                    <p class="big">{{ resultText }}</p>
                    <p>{{ names.X }} {{ score.X }} – {{ score.O }} {{ names.O }}</p>
                    <button class="cta" @click="newRound(true)">Rivincita</button>
                </div>
            </Transition>
        </section>
    </main>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { newGame, play, fading, bestMove } from './game.js'

const MODES = [{ id: 'cpu', label: 'Contro CPU' }, { id: 'duo', label: 'In due' }]
const LEVEL_LABELS = [{ id: 'easy', label: 'Facile' }, { id: 'medium', label: 'Medio' }, { id: 'hard', label: 'Difficile' }]
const LEVEL_NAME = Object.fromEntries(LEVEL_LABELS.map(l => [l.id, l.label]))
const PREFS = 'trisinfinito:prefs'

function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS)) ?? {} } catch { return {} }
}
const prefs = loadPrefs()

const screen = ref('menu')
const mode = ref(prefs.mode === 'duo' ? 'duo' : 'cpu')
const level = ref(LEVEL_NAME[prefs.level] ? prefs.level : 'medium')
watch([mode, level], () => {
    try { localStorage.setItem(PREFS, JSON.stringify({ mode: mode.value, level: level.value })) } catch { }
})

const game = ref(newGame())
const score = ref({ X: 0, O: 0 })
const starter = ref('X')
const showResult = ref(false)
let timer = 0

const vsCpu = computed(() => mode.value === 'cpu')
const cpuTurn = computed(() => vsCpu.value && game.value.turn === 'O' && !game.value.winner)
const names = computed(() => (vsCpu.value ? { X: 'Tu', O: 'CPU' } : { X: 'Giocatore 1', O: 'Giocatore 2' }))
const subtitle = computed(() => (vsCpu.value ? `CPU · ${LEVEL_NAME[level.value]}` : 'Due giocatori'))
const fadeX = computed(() => fading(game.value, 'X'))
const fadeO = computed(() => fading(game.value, 'O'))
const nextFade = computed(() => (game.value.winner ? null : fading(game.value, game.value.turn)))

const status = computed(() => {
    const g = game.value
    if (g.winner) return resultText.value
    if (cpuTurn.value) return 'La CPU sta pensando…'
    const who = vsCpu.value ? 'Tocca a te' : `Tocca a ${names.value[g.turn]}`
    return nextFade.value !== null ? `${who} · il segno che lampeggia sparirà` : who
})
const resultText = computed(() => {
    const w = game.value.winner
    if (!vsCpu.value) return `Vince ${names.value[w]}!`
    return w === 'X' ? 'Hai vinto!' : 'Ha vinto la CPU'
})

const cx = i => (i % 3) + 0.5
const cy = i => Math.floor(i / 3) + 0.5
const cellLabel = (i, v) => `Riga ${Math.floor(i / 3) + 1}, colonna ${(i % 3) + 1}: ${v ?? 'vuota'}${i === nextFade.value ? ', sparirà' : ''}`
const buzz = p => navigator.vibrate?.(p)

function move(i) {
    game.value = play(game.value, i)
    buzz(game.value.winner ? [30, 50, 80] : 8)
    if (game.value.winner) {
        score.value[game.value.winner]++
        timer = setTimeout(() => (showResult.value = true), 700)
    }
}

function tap(i) {
    if (!cpuTurn.value) move(i)
}

// La CPU risponde con un piccolo ritardo, così la mossa si legge.
watch(game, () => {
    if (cpuTurn.value) timer = setTimeout(() => move(bestMove(game.value, level.value)), 450)
})

function newRound(alternate) {
    clearTimeout(timer)
    if (alternate) starter.value = starter.value === 'X' ? 'O' : 'X'
    showResult.value = false
    game.value = newGame(starter.value)
}

function start() {
    score.value = { X: 0, O: 0 }
    starter.value = 'X'
    newRound(false)
    screen.value = 'play'
}

function toMenu() {
    clearTimeout(timer)
    screen.value = 'menu'
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
