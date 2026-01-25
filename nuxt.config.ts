// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'nuxt-gtag'],
  gtag: {
    id: 'G-92GCKQ7C8B'
  },
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: '/emu3000-seat/',
    head: {
      title: 'EMU3000 新自強號火車座位方位查詢器｜秒懂山/海景、靠窗/走道的物理方位 (含騰雲座艙)',
      meta: [
        { name: 'description', content: '精準查詢 EMU3000 新自強號火車座位，提供視覺化山/海景判定、靠窗/走道的物理位置。' }
      ]
    }
  }
})