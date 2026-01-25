<script setup lang="ts">
// 1. 狀態管理
const direction = ref('north') // 'north' (往台北), 'south' (往花東)
const carNumber = ref(1)
const seatInput = ref('')

// 2. 定義車廂配置
const carConfigs = {
  1:  { max: 40, type: '駕駛端 / 大件行李', isReversed: false },
  2:  { max: 52, type: '標準車廂', isReversed: false },
  3:  { max: 40, type: '輪椅友善車', isReversed: false, skip: [3, 4] },
  4:  { max: 52, type: '標準車廂', isReversed: false },
  5:  { max: 52, type: '標準車廂', isReversed: false },
  6:  { max: 30, type: '騰雲座艙', isReversed: false, business: true },
  7:  { max: 28, type: '友善設施車', isReversed: false, skip: [3, 4] },
  8:  { max: 52, type: '標準車廂', isReversed: false },
  9:  { max: 52, type: '標準車廂', isReversed: true },
  10: { max: 52, type: '標準車廂', isReversed: true },
  11: { max: 52, type: '標準車廂', isReversed: true },
  12: { max: 38, type: '駕駛端 / 大件行李', isReversed: true }
}

// 3. 核心邏輯 (包含騰雲座艙排除 2+4n 與 9-12車物理反轉)
const analysis = computed(() => {
  const sn = parseInt(seatInput.value)
  if (!sn || isNaN(sn) || sn <= 0) return null
  
  const config = carConfigs[carNumber.value as keyof typeof carConfigs]
  if (sn > config.max) return { error: `⚠️ 此車廂最高 ${config.max} 號` }
  
  // 排除不存在座位
  if (config.business) {
    if (sn % 4 === 2) return { error: `⚠️ 騰雲座艙不存在 ${sn} 號 (無此編號)` }
  } else {
    if (config.skip?.includes(sn)) return { error: `⚠️ 座位 ${sn} 號不存在` }
  }

  const isOdd = sn % 2 !== 0
  let isMountainSide = config.isReversed ? !isOdd : isOdd
  const rowBase = Math.floor((sn - 1) / 4) * 4

  let rowSeats: (number | null)[] = []
  let isWindow = false

  if (config.business) {
    // 騰雲座艙 2+1 佈局
    rowSeats = [rowBase + 1, rowBase + 3, null, rowBase + 4]
    isWindow = (sn % 4 === 1 || sn % 4 === 0)
  } else {
    isWindow = (sn % 4 === 1 || sn % 4 === 2)
    // 考慮物理位置反轉
    if (config.isReversed) {
      rowSeats = [rowBase + 2, rowBase + 4, null, rowBase + 3, rowBase + 1]
    } else {
      rowSeats = [rowBase + 1, rowBase + 3, null, rowBase + 4, rowBase + 2]
    }
  }

  return { 
    isWindow, 
    rowSeats, 
    seatNo: sn, 
    viewSide: isMountainSide ? '🏔️山景' : '🌊海景', 
    isMountain: isMountainSide 
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FDF8F5] text-slate-900 font-sans p-4 flex flex-col items-center">
    <header class="w-full max-w-md pt-8 pb-6 text-center">
      <h1 class="text-4xl font-black tracking-tight text-slate-800">
        EMU3000<span class="text-orange-500 ml-2">Seat</span>
      </h1>
      <p class="text-gray-500 text-sm mt-1 font-bold italic tracking-[0.2em]">尋找你的東部幹線最佳視野</p>
    </header>

    <main class="w-full max-w-md space-y-6">
      <div class="bg-white p-1.5 rounded-2xl shadow-sm flex border border-orange-100">
        <button @click="direction = 'north'" :class="['flex-1 py-3 rounded-xl text-md font-bold transition-all', direction === 'north' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500']">往台北<span class="text-[12px] ml-1">(北上)</span></button>
        <button @click="direction = 'south'" :class="['flex-1 py-3 rounded-xl text-md font-bold transition-all', direction === 'south' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500']">往花東<span class="text-[12px] ml-1">(南下)</span></button>
      </div>

      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[12px] font-black text-slate-400 uppercase ml-1">Car 車廂</label>
            <select v-model="carNumber" class="w-full h-14 bg-orange-50/50 border-2 border-orange-200 rounded-2xl px-4 font-bold text-lg text-center outline-none appearance-none focus:border-orange-500 transition-all">
              <option v-for="n in 12" :key="n" :value="n">第 {{ n }} 車</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[12px] font-black text-slate-400 uppercase ml-1">Seat 座位</label>
            <input v-model="seatInput" type="number" placeholder="00" class="w-full h-14 bg-orange-50/50 border-2 border-orange-100 rounded-2xl text-center font-black text-2xl focus:bg-white focus:border-orange-500 outline-none transition-all" />
          </div>
        </div>
        <div class="text-center bg-orange-50/30 py-2 rounded-xl border border-orange-100/50">
          <p class="text-[11px] font-bold text-orange-600/70 uppercase tracking-widest italic">
            {{ carConfigs[carNumber as keyof typeof carConfigs].type }} 
            • {{ carConfigs[carNumber as keyof typeof carConfigs].isReversed ? '反向編組' : '正向編組' }}
          </p>
        </div>
      </div>

      <div class="min-h-[380px] md:min-h-[420px] flex flex-col relative">
        <div class="h-14 flex items-center justify-center">
          <div v-if="direction === 'north'" class="flex flex-col items-center animate-pulse">
            <span class="text-[11px] md:text-[12px] font-black text-orange-600 tracking-widest uppercase">Front 往台北</span>
            <svg class="w-8 md:w-10 h-8 md:h-10 text-orange-500" viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M9.47 4.72a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 6.31l-3.72 3.72a.75.75 0 1 1-1.06-1.06zm-4.25 9.25l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 11.31l-3.72 3.72a.75.75 0 0 1-1.06-1.06" clip-rule="evenodd"/></svg>
          </div>
        </div>

        <div class="flex gap-2 md:gap-4 flex-1">
          <div class="w-8 flex flex-col items-center justify-center bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-3xl py-6">
            <span class="vertical-text font-black text-[10px] tracking-widest uppercase italic">Mountain 山 🏔️</span>
          </div>

          <div class="flex-1 relative">
            <Transition name="scale-fade" mode="out-in">
              <div v-if="analysis && !analysis.error" :key="seatInput + carNumber" class="h-full bg-white rounded-[3rem] pt-6 md:pt-8 p-4 shadow-md border border-orange-50 text-center flex flex-col justify-between overflow-hidden">
                <div class="space-y-4">
                  <div :class="['inline-block px-8 py-2 rounded-full text-sm font-black tracking-widest uppercase border-2 shadow-sm', 
                    analysis.isMountain ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600']">
                    {{ analysis.viewSide }}
                  </div>
                  <h2 class="text-3xl font-black tracking-tighter text-slate-800">
                    {{ analysis.isWindow ? '窗邊座位' : '走道座位' }}
                  </h2>
                </div>

                <div class="flex justify-between items-end gap-2 md:px-2 pb-4 mt-4">
                  <div v-for="(s, i) in analysis.rowSeats" :key="i" class="flex flex-col items-center flex-1">
                    <template v-if="s === null">
                      <div class="h-20 w-px border-l-2 border-dashed border-slate-200"></div>
                    </template>
                    <template v-else>
                      <div :class="['w-full aspect-[4/5] rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2', 
                        s === analysis.seatNo ? 'bg-orange-500 border-orange-400 text-white scale-110 shadow-lg z-10' : 'bg-slate-50 border-transparent text-slate-200']">
                        {{ s }}
                      </div>
                      <span class="text-[11px] mt-3 font-bold opacity-30 tracking-tighter">
                        {{ (carConfigs[carNumber as keyof typeof carConfigs].business) ? (i===0 || i===3 ? '窗' : '走') : (i===0 || i===4 ? '窗' : '走') }}
                      </span>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else-if="analysis?.error" class="h-full bg-red-50 border-2 border-red-100 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center">
                <svg class="w-12 h-12 text-red-400 mb-2" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0a9 9 0 0 1 18 0m-9 3.75h.008v.008H12z"/></svg>
                <p class="text-red-500 font-black text-sm">{{ analysis.error }}</p>
              </div>
              <div v-else class="h-full border-4 border-dashed border-orange-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-200 p-8">
                <svg class="w-12 h-12 mb-4 opacity-10 text-orange-400" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607"/></svg>
                <p class="font-bold text-[10px] tracking-[0.3em] uppercase text-orange-300">Enter Seat Number</p>
              </div>
            </Transition>
          </div>

          <div class="w-8 flex flex-col items-center justify-center bg-blue-50 border-2 border-blue-100 text-blue-400 rounded-3xl py-6">
            <span class="vertical-text font-black text-[10px] tracking-widest uppercase italic">Ocean 海 🌊</span>
          </div>
        </div>

        <div class="h-14 flex items-center justify-center mt-4">
          <div v-if="direction === 'south'" class="flex flex-col items-center animate-pulse">
            <svg class="w-8 md:w-10 h-8 md:h-10 text-orange-500" viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M9.47 15.28a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 1 0-1.06-1.06L10 13.69L6.28 9.97a.75.75 0 0 0-1.06 1.06zM5.22 6.03l4.25 4.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 0-1.06-1.06L10 8.69L6.28 4.97a.75.75 0 0 0-1.06 1.06" clip-rule="evenodd"/></svg>
            <span class="text-[11px] md:text-[12px] font-black text-orange-600 mt-1 uppercase tracking-widest">Front 往花東</span>
          </div>
        </div>
      </div>
    </main>

    <footer class="relative w-full max-w-md text-center mt-auto py-8 text-[10px] text-slate-400 ">
      Copyright © 2026 Leon Wu (dogogo-wu). All rights reserved.
      <div class="absolute right-0 bottom-0 text-orange-300">ver 1.2</div>
    </footer>
  </div>
</template>

<style scoped>
.vertical-text { writing-mode: vertical-rl; text-orientation: mixed; }
.scale-fade-enter-active, .scale-fade-leave-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-fade-enter-from, .scale-fade-leave-to { opacity: 0; transform: scale(0.95); }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>