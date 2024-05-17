import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import plugin from './plugin'

createApp(App).use(plugin).mount('#app')
