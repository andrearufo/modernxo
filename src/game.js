// Tris infinito: ogni giocatore ha al massimo MAX_PIECES segni in campo.
// Piazzando il successivo, il proprio segno più vecchio sparisce. Niente pareggi.
// Lo stato è immutabile: play() restituisce sempre un nuovo stato.

export const MAX_PIECES = 3
export const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]

export const other = p => (p === 'X' ? 'O' : 'X')

export function newGame(first = 'X') {
    return { board: Array(9).fill(null), moves: { X: [], O: [] }, turn: first, winner: null, line: null, ply: 0 }
}

export function play(s, i) {
    if (s.winner || s.board[i] || i < 0 || i > 8) return s
    const p = s.turn
    const board = [...s.board]
    const mine = [...s.moves[p], i]
    board[i] = p
    if (mine.length > MAX_PIECES) board[mine.shift()] = null
    const line = LINES.find(l => l.every(j => board[j] === p)) ?? null
    return {
        board,
        moves: { ...s.moves, [p]: mine },
        turn: line ? p : other(p),
        winner: line ? p : null,
        line,
        ply: s.ply + 1,
    }
}

// Cella del segno di p che sparirà alla sua prossima mossa (null se ha meno di 3 segni).
export const fading = (s, p) => (s.moves[p].length === MAX_PIECES ? s.moves[p][0] : null)

export const freeCells = s => s.board.flatMap((v, i) => (v ? [] : [i]))

// Centro, angoli, lati: migliora la potatura alpha-beta.
const ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7]

// Negamax con alpha-beta: punteggio dal punto di vista di chi muove.
// Vittorie più vicine valgono di più; a profondità esaurita la posizione vale 0.
function search(s, depth, alpha, beta) {
    if (depth === 0) return 0
    let best = -Infinity
    for (const i of ORDER) {
        if (s.board[i]) continue
        const c = play(s, i)
        const v = c.winner ? 100 + depth : -search(c, depth - 1, -beta, -alpha)
        if (v > best) best = v
        if (v > alpha) alpha = v
        if (alpha >= beta) break
    }
    return best
}

export const LEVELS = {
    easy: { depth: 2, noise: 0.45 },
    medium: { depth: 4, noise: 0.12 },
    hard: { depth: 11, noise: 0 },
}

// Sceglie la mossa del computer; rnd iniettabile per test deterministici.
export function bestMove(s, level = 'hard', rnd = Math.random) {
    const { depth, noise } = LEVELS[level]
    const free = freeCells(s)
    if (rnd() < noise) return free[Math.floor(rnd() * free.length)]
    let best = -Infinity
    let picks = []
    for (const i of free) {
        const c = play(s, i)
        const v = c.winner ? 100 + depth : -search(c, depth - 1, -Infinity, Infinity)
        if (v > best) [best, picks] = [v, [i]]
        else if (v === best) picks.push(i)
    }
    return picks[Math.floor(rnd() * picks.length)]
}
