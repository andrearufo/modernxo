<template>
    <div class="home">
      <h1>Benvenuto al Tris Moderno!</h1>
      <Game />
    </div>
  </template>
  
  <script>
  import Game from '@/components/Game.vue'
  
  export default {
    name: 'Home',
    components: {
      Game
    }
  }
  </script>
  
  <style scoped>
  .home {
    text-align: center;
    margin-top: 20px;
  }
  </style>
  