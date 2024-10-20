// src/stores/gameStore.js
import { defineStore } from 'pinia';

export const useGameStore = defineStore('gameStore', {
    state: () => ({
        grid: [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ],
        currentPlayer: 'X',
        moves: [],
        message: "Tocca al giocatore X",
        gameOver: false,
        winningLine: null,
        score: {
            X: 0,
            O: 0
        },
        firstPlayer: 'X',
    }),
    actions: {
        makeMove(row, col) {
            if (this.grid[row][col] !== null || this.gameOver) {
                return;
            }

            this.grid[row][col] = this.currentPlayer;
            this.moves.push({ row, col });

            if (this.moves.length > 5) {
                const oldMove = this.moves.shift();
                this.grid[oldMove.row][oldMove.col] = null;
            }

            const winner = this.checkWinner();
            if (winner) {
                this.message = `Il giocatore ${this.currentPlayer} ha vinto!`;
                this.gameOver = true;
                this.winningLine = winner;
                this.score[this.currentPlayer]++;
                return;
            }

            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.message = `Tocca al giocatore ${this.currentPlayer}`;
        },
        checkWinner() {
            const lines = [
                [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
                [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
                [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }],
                [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
                [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
                [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }],
                [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
                [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }]
            ];

            for (const line of lines) {
                const [a, b, c] = line;
                if (
                    this.grid[a.row][a.col] &&
                    this.grid[a.row][a.col] === this.grid[b.row][b.col] &&
                    this.grid[a.row][a.col] === this.grid[c.row][c.col]
                ) {
                    return line;
                }
            }
            return null;
        },
        resetGame() {
            this.grid = [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ];
            this.firstPlayer = this.firstPlayer === 'X' ? 'O' : 'X';
            this.currentPlayer = this.firstPlayer;
            this.moves = [];
            this.message = `Tocca al giocatore ${this.currentPlayer}`;
            this.gameOver = false;
            this.winningLine = null;
        }
    }
});
