// node src/game.test.js
import assert from 'node:assert/strict'
import { newGame, play, fading, bestMove, freeCells } from './game.js'

const seq = (s, cells) => cells.reduce(play, s)

// Il quarto segno fa sparire il più vecchio dello stesso giocatore.
let s = seq(newGame(), [0, 4, 1, 5, 8, 3]) // O chiude 3-4-5
assert.equal(s.winner, 'O')
assert.deepEqual(s.line, [3, 4, 5])

s = seq(newGame(), [0, 4, 1, 3, 8, 7]) // X:0,1,8  O:4,3,7
assert.equal(s.winner, null)
assert.equal(fading(s, 'X'), 0)
s = play(s, 2) // X piazza il 4°: sparisce 0, quindi niente tris su 0-1-2
assert.equal(s.board[0], null)
assert.equal(s.board[2], 'X')
assert.equal(s.winner, null)
assert.deepEqual(s.moves.X, [1, 8, 2])

// Mai più di 3 segni per giocatore, mai pareggio.
for (let g = 0; g < 200; g++) {
    let t = newGame(g % 2 ? 'O' : 'X')
    while (!t.winner && t.ply < 60) {
        const f = freeCells(t)
        t = play(t, f[Math.floor(Math.random() * f.length)])
        assert.ok(t.board.filter(v => v === 'X').length <= 3)
        assert.ok(t.board.filter(v => v === 'O').length <= 3)
        assert.ok(freeCells(t).length >= 3)
    }
}

// Mosse illegali ignorate.
s = play(newGame(), 4)
assert.equal(play(s, 4), s)

// L'IA vince subito se può e blocca se deve.
s = seq(newGame(), [0, 4, 1, 8]) // X:0,1  O:4,8 — tocca a X
assert.equal(bestMove(s, 'hard'), 2)
s = seq(newGame(), [0, 4, 6, 8]) // X chiude 0-3-6
assert.equal(bestMove(s, 'hard'), 3)
s = seq(newGame(), [4, 0, 8, 1]) // O minaccia 0-1-2: X deve bloccare
assert.equal(bestMove(s, 'hard'), 2)

// Il gioco è una vittoria forzata per chi inizia (verificato con analisi retrograda),
// quindi qui controlliamo solo che l'IA difficile resti veloce su una partita intera.
let t = newGame()
const t0 = performance.now()
while (!t.winner && t.ply < 60) t = play(t, bestMove(t, 'hard'))
const ms = (performance.now() - t0) / t.ply
assert.ok(ms < 150, `IA troppo lenta: ${ms.toFixed(0)} ms/mossa`)
console.log(`ok — hard vs hard: vince ${t.winner ?? 'nessuno'} in ${t.ply} mosse, ${ms.toFixed(1)} ms/mossa`)
