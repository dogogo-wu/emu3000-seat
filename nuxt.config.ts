// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: '/emu3000-seat/',
    head: {
      title: 'EMU3000 座位查詢器 | 靠窗視野與地雷位分析',
      meta: [
        { name: 'description', content: '2026 最新版台鐵 EMU3000 座位查詢。即時判斷靠窗、走道、窗框地雷位與山海景。' }
      ]
    }
  }
})