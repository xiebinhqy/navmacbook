import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// 初始化 stores
import { useSettingsStore } from './stores/settingsStore'

const app = createApp(App)
const pinia = createPinia()

// 安装 pinia 和 router
app.use(pinia)
app.use(router)

// 初始化 settings store
const settingsStore = useSettingsStore()
settingsStore.initFromStorage()

app.mount('#app')
