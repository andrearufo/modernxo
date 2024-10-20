<template>
    <div class="game">
        <div v-for="(row, rowIndex) in gameStore.grid" :key="rowIndex" class="row">
            <div v-for="(cell, cellIndex) in row" :key="cellIndex" class="cell" :class="{
                'highlight': isMoveToBeRemoved(rowIndex, cellIndex) && !gameStore.gameOver,
                'winning': gameStore.winningLine && gameStore.winningLine.some(pos => pos.row === rowIndex && pos.col === cellIndex)
            }" @click="gameStore.makeMove(rowIndex, cellIndex)">
                {{ cell }}
            </div>
        </div>
        <p>{{ gameStore.message }}</p>
        <p>Vittorie Giocatore X: {{ gameStore.score.X }} | Vittorie Giocatore O: {{ gameStore.score.O }}</p>
        <button v-if="gameStore.gameOver" @click="gameStore.resetGame">Nuova Partita</button>
    </div>
</template>

<script>
import { useGameStore } from '@/stores/gameStore';
import { mapState } from 'pinia';

export default {
    name: 'Game',
    setup() {
        const gameStore = useGameStore();
        return { gameStore };
    },
    computed: {
        ...mapState(useGameStore, ['grid', 'currentPlayer', 'message', 'score', 'gameOver', 'winningLine', 'moves'])
    },
    methods: {
        isMoveToBeRemoved(row, col) {
            if (this.gameStore.moves.length >= 5) {
                const oldMove = this.gameStore.moves[0];
                return oldMove.row === row && oldMove.col === col;
            }
            return false;
        }
    }
};
</script>