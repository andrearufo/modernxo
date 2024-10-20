<template>
    <div class="game">
      <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="row">
        <div v-for="(cell, cellIndex) in row" :key="cellIndex" class="cell" 
             :class="{
               'highlight': isMoveToBeRemoved(rowIndex, cellIndex) && !gameOver,
               'winning': winningLine && winningLine.some(pos => pos.row === rowIndex && pos.col === cellIndex)
             }" 
             @click="makeMove(rowIndex, cellIndex)">
          {{ cell }}
        </div>
      </div>
      <p>{{ message }}</p>
      <button v-if="gameOver" @click="resetGame">Nuova Partita</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
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
      };
    },
    methods: {
      makeMove(row, col) {
        // Controlla se la cella è già occupata o se il gioco è concluso
        if (this.grid[row][col] !== null || this.gameOver) {
          return;
        }
        
        // Effettua la mossa
        this.grid[row][col] = this.currentPlayer;
        this.moves.push({ row, col });
  
        // Controlla se è necessario rimuovere la quinta mossa precedente
        if (this.moves.length > 5) {
          const oldMove = this.moves.shift();
          this.grid[oldMove.row][oldMove.col] = null;
        }
  
        // Controlla se c'è un vincitore
        const winner = this.checkWinner();
        if (winner) {
          this.message = `Il giocatore ${this.currentPlayer} ha vinto!`;
          this.gameOver = true;
          this.winningLine = winner;
          return;
        }
  
        // Cambia giocatore
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.message = `Tocca al giocatore ${this.currentPlayer}`;
      },
      checkWinner() {
        // Controlla righe, colonne e diagonali
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
      isMoveToBeRemoved(row, col) {
        if (this.moves.length >= 5) {
          const oldMove = this.moves[0];
          return oldMove.row === row && oldMove.col === col;
        }
        return false;
      },
      resetGame() {
        this.grid = [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ];
        this.currentPlayer = 'X';
        this.moves = [];
        this.message = "Tocca al giocatore X";
        this.gameOver = false;
        this.winningLine = null;
      }
    }
  };
  </script>
  
  <style>
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .row {
    display: flex;
  }
  .cell {
    width: 50px;
    height: 50px;
    border: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
  }
  .cell.highlight {
    background-color: red;
  }
  .cell.winning {
    background-color: green;
  }
  button {
    margin-top: 20px;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  