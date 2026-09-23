import './style.css'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
}
