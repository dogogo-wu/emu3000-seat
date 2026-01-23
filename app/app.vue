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
  6:  { max: 30, type: '騰雲座艙', isReversed: false, business: true }, // 2+1 配置
  7:  { max: 28, type: '友善設施車', isReversed: false, skip: [3, 4] },
  8:  { max: 52, type: '標準車廂', isReversed: false },
  9:  { max: 52, type: '標準車廂', isReversed: true },
  10: { max: 52, type: '標準車廂', isReversed: true },
  11: { max: 52, type: '標準車廂', isReversed: true },
  12: { max: 38, type: '駕駛端 / 大件行李', isReversed: true }
}

// 3. 核心邏輯
const analysis = computed(() => {
  const sn = parseInt(seatInput.value)
  if (!sn || isNaN(sn) || sn <= 0) return null
  
  const config = carConfigs[carNumber.value as keyof typeof carConfigs]
  if (sn > config.max) return { error: `⚠️ 此車廂僅至 ${config.max} 號` }
  
  // A. 判定座位是否存在
  if (config.business) {
    // 騰雲座艙邏輯：不存在 2, 6, 10... (即 2+4n)
    if (sn % 4 === 2) return { error: `⚠️ 騰雲座艙不存在 ${sn} 號 (無此編號)` }
  } else {
    if (config.skip?.includes(sn)) return { error: `⚠️ 座位 ${sn} 號不存在` }
  }

  const isOdd = sn % 2 !== 0
  let isMountainSide = false
  
  // B. 判定山海景 (考慮 9-12 車反轉)
  if (config.isReversed) {
    isMountainSide = !isOdd 
  } else {
    isMountainSide = isOdd
  }

  // C. 計算座位繪圖順序 (物理位置鏡像處理)
  let rowSeats: (number | null)[] = []
  let isWindow = false
  const rowBase = Math.floor((sn - 1) / 4) * 4

  if (config.business) {
    // 騰雲座艙 2+1 佈局：[1(窗), 3(走)] - [走] - [4(窗)]
    // 雖然 2 不存在，但為了對齊 4 的倍數 rowBase 邏輯不變
    rowSeats = [rowBase + 1, rowBase + 3, null, rowBase + 4]
    isWindow = (sn % 4 === 1 || sn % 4 === 0) // 1 是左窗, 4(0) 是右窗
  } else {
    isWindow = (sn % 4 === 1 || sn % 4 === 2)
    if (config.isReversed) {
      // 反向編組：[2(窗), 4(走), 走道, 3(走), 1(窗)]
      rowSeats = [rowBase + 2, rowBase + 4, null, rowBase + 3, rowBase + 1]
    } else {
      // 正向編組：[1(窗), 3(走), 走道, 4(走), 2(窗)]
      rowSeats = [rowBase + 1, rowBase + 3, null, rowBase + 4, rowBase + 2]
    }
  }

  const viewSide = isMountainSide ? '山景 (Mountain)' : '海景 (Ocean)'
  return { isWindow, rowSeats, seatNo: sn, viewSide, isMountain: isMountainSide }
})
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 flex flex-col items-center">
    <header class="w-full max-w-md pt-8 pb-6 text-center">
      <h1 class="text-4xl font-black tracking-tighter text-slate-800 uppercase">
        EMU3000<span class="text-emerald-500 ml-1">Seat</span>
      </h1>
      <p class="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase italic">Eastern Line Express</p>
    </header>

    <main class="w-full max-w-md space-y-6">
      <div class="bg-white p-1.5 rounded-2xl shadow-sm flex border border-slate-200">
        <button @click="direction = 'north'" :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all', direction === 'north' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500']">往台北</button>
        <button @click="direction = 'south'" :class="['flex-1 py-3 rounded-xl text-sm font-bold transition-all', direction === 'south' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500']">往花東</button>
      </div>

      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[11px] font-black text-slate-400 uppercase ml-1">Car 車廂</label>
            <select v-model="carNumber" class="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold text-lg outline-none appearance-none focus:border-emerald-500 transition-all">
              <option v-for="n in 12" :key="n" :value="n">第 {{ n }} 車</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[11px] font-black text-slate-400 uppercase ml-1">Seat 座位</label>
            <input v-model="seatInput" type="number" placeholder="00" class="w-full h-14 bg-slate-100 border-2 border-transparent rounded-2xl text-center font-black text-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all" />
          </div>
        </div>
        <div class="text-center bg-slate-50 py-2 rounded-xl border border-slate-100">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
            {{ carConfigs[carNumber as keyof typeof carConfigs].type }} 
            • {{ carConfigs[carNumber as keyof typeof carConfigs].isReversed ? '反向編組' : '正向編組' }}
          </p>
        </div>
      </div>

      <div class="min-h-[440px] flex flex-col relative">
        <div class="h-14 flex items-center justify-center">
          <div v-if="direction === 'north'" class="flex flex-col items-center animate-pulse">
            <span class="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Front 往台北</span>
            <UIcon name="i-heroicons-chevron-double-up-20-solid" class="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div class="flex gap-4 flex-1">
          <div class="w-10 flex flex-col items-center justify-center bg-amber-50 border border-amber-100 text-amber-500 rounded-3xl py-6">
            <span class="vertical-text font-black text-[10px] tracking-widest uppercase italic">Mountain 山 🏔️</span>
          </div>

          <div class="flex-1 relative">
            <Transition name="scale-fade" mode="out-in">
              <div v-if="analysis && !analysis.error" :key="seatInput + carNumber" class="h-full bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center flex flex-col justify-between overflow-hidden">
                <div class="space-y-4">
                  <div :class="['inline-block px-8 py-2 rounded-full text-sm font-black tracking-widest uppercase border-2 shadow-sm', 
                    analysis.isMountain ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-blue-50 border-blue-200 text-blue-600']">
                    {{ analysis.viewSide }}
                  </div>
                  <h2 class="text-5xl font-black tracking-tighter text-slate-800">
                    {{ analysis.isWindow ? '靠窗邊' : '靠走道' }}
                  </h2>
                </div>

                <div class="flex justify-between items-end gap-2 px-2 pb-4">
                  <div v-for="(s, i) in analysis.rowSeats" :key="i" class="flex flex-col items-center flex-1">
                    <template v-if="s === null">
                      <div class="h-12 w-px border-l-2 border-dashed border-slate-200"></div>
                    </template>
                    <template v-else>
                      <div :class="['w-full aspect-[3/4] rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2', 
                        s === analysis.seatNo ? 'bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg z-10' : 'bg-slate-50 border-transparent text-slate-200']">
                        {{ s }}
                      </div>
                      <span class="text-[8px] mt-3 font-bold opacity-30 tracking-tighter">
                        {{ (carConfigs[carNumber as keyof typeof carConfigs].business) 
                           ? (i===0 || i===3 ? '窗' : '走') 
                           : (i===0 || i===4 ? '窗' : '走') }}
                      </span>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else-if="analysis?.error" class="h-full bg-red-50 border-2 border-red-100 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mb-2" />
                <p class="text-red-500 font-black text-sm">{{ analysis.error }}</p>
              </div>

              <div v-else class="h-full border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-200 p-8">
                <UIcon name="i-heroicons-magnifying-glass" class="w-12 h-12 mb-4 opacity-10" />
                <p class="font-bold text-xs tracking-widest uppercase">Waiting for Input</p>
              </div>
            </Transition>
          </div>

          <div class="w-10 flex flex-col items-center justify-center bg-blue-50 border border-blue-100 text-blue-400 rounded-3xl py-6">
            <span class="vertical-text font-black text-[10px] tracking-widest uppercase italic">Ocean 海 🌊</span>
          </div>
        </div>

        <div class="h-14 flex items-center justify-center mt-4">
          <div v-if="direction === 'south'" class="flex flex-col items-center animate-pulse">
            <UIcon name="i-heroicons-chevron-double-down-20-solid" class="w-5 h-5 text-emerald-500" />
            <span class="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest">Front 往花東</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.vertical-text { writing-mode: vertical-rl; text-orientation: mixed; }
.scale-fade-enter-active, .scale-fade-leave-active { transition: all 0.35s ease; }
.scale-fade-enter-from, .scale-fade-leave-to { opacity: 0; transform: scale(0.98); }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>