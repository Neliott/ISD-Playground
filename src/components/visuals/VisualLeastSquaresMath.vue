<script setup>
import { ref, computed } from 'vue'

const step = ref(0)
const maxSteps = 4

// Simple Dataset (3 points for easy math)
const points = [
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 5 }
]

const n = points.length

// Calculations
const meanX = points.reduce((s, p) => s + p.x, 0) / n // (1+2+3)/3 = 2
const meanY = points.reduce((s, p) => s + p.y, 0) / n // (2+4+5)/3 = 3.66... -> 11/3 = 3.67

// Detailed Rows
const rows = computed(() => {
    return points.map(p => {
        const diffX = p.x - meanX
        const diffY = p.y - meanY
        const prod = diffX * diffY
        const sqX = diffX * diffX
        return {
            x: p.x,
            y: p.y,
            diffX: diffX,       // (xi - xbar)
            diffY: diffY.toFixed(2),       // (yi - ybar)
            prod: prod.toFixed(2),         // (xi-xbar)(yi-ybar)
            sqX: sqX            // (xi-xbar)^2
        }
    })
})

const Sxy = rows.value.reduce((s, r) => s + parseFloat(r.prod), 0)
const Sxx = rows.value.reduce((s, r) => s + r.sqX, 0)

const beta = Sxy / Sxx
const alpha = meanY - beta * meanX

</script>

<template>
  <div class="h-full w-full bg-slate-900 border border-slate-700 rounded-lg p-6 flex flex-col text-slate-200 overflow-y-auto">
      
      <!-- HEADER -->
      <div class="mb-6 border-b border-slate-700 pb-4">
          <h3 class="text-xl text-white font-bold mb-2">OLS Calculation: Step-by-Step</h3>
          <div class="flex space-x-2">
              <button 
                v-for="s in maxSteps + 1" 
                :key="s"
                @click="step = s-1"
                :class="['h-2 w-8 rounded-full transition-all', step === s-1 ? 'bg-indigo-500 scale-110' : 'bg-slate-700 hover:bg-slate-600']"
              ></button>
          </div>
      </div>

      <!-- STEP 0: THE DATA -->
      <div v-if="step === 0" class="flex-grow flex flex-col items-center justify-center animate-fade-in-up">
          <div class="text-lg mb-4 text-center">
              We start with <strong class="text-white">3 data points</strong>:
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
              <table class="w-full text-center">
                  <thead><tr class="text-slate-400 border-b border-slate-700"><th>i</th><th class="px-4">X</th><th class="px-4">Y</th></tr></thead>
                  <tbody>
                      <tr v-for="(p, i) in points" :key="i" class="border-b border-slate-700/50">
                          <td class="py-2 text-slate-500">{{i+1}}</td>
                          <td class="py-2 text-white font-mono">{{p.x}}</td>
                          <td class="py-2 text-white font-mono">{{p.y}}</td>
                      </tr>
                  </tbody>
              </table>
          </div>
          <div class="mt-4 text-indigo-400">
              Calculate Means:<br>
              x̄ = (1+2+3)/3 = <strong>{{meanX}}</strong><br>
              ȳ = (2+4+5)/3 ≈ <strong>{{meanY.toFixed(2)}}</strong>
          </div>
      </div>

      <!-- STEP 1: DEVIATIONS -->
      <div v-if="step === 1" class="flex-grow flex flex-col items-center animate-fade-in-up">
           <div class="text-lg mb-4">Calculate deviations from the mean</div>
           <div class="w-full overflow-x-auto">
               <table class="w-full text-center text-sm">
                  <thead>
                      <tr class="text-slate-400 border-b border-slate-700">
                          <th>X</th><th>Y</th>
                          <th class="text-indigo-400">x - x̄</th>
                          <th class="text-pink-400">y - ȳ</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="r in rows" :key="r.x" class="border-b border-slate-700/50 font-mono">
                          <td class="py-2">{{r.x}}</td>
                          <td>{{r.y}}</td>
                          <td class="text-indigo-300">{{r.x}} - {{meanX}} = <strong>{{r.diffX}}</strong></td>
                          <td class="text-pink-300">{{r.y}} - {{meanY.toFixed(2)}} ≈ <strong>{{r.diffY}}</strong></td>
                      </tr>
                  </tbody>
               </table>
           </div>
      </div>

      <!-- STEP 2: Sxy and Sxx -->
      <div v-if="step === 2" class="flex-grow flex flex-col items-center animate-fade-in-up">
           <div class="text-lg mb-4">Calculate squares and products</div>
           <div class="w-full overflow-x-auto bg-slate-800 rounded p-2">
               <table class="w-full text-center text-sm">
                  <thead>
                      <tr class="text-slate-400 border-b border-slate-700">
                          <th class="text-indigo-400">(x - x̄)²</th>
                          <th class="text-yellow-400">(x-x̄)(y-ȳ)</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="r in rows" :key="r.x" class="border-b border-slate-700/50 font-mono">
                          <td class="py-2 text-indigo-200">{{r.diffX}}² = <strong>{{r.sqX}}</strong></td>
                          <td class="text-yellow-200">{{r.diffX}} * {{r.diffY}} = <strong>{{r.prod}}</strong></td>
                      </tr>
                      <tr class="bg-indigo-500/20 font-bold">
                          <td class="py-2 text-white">Sum(Sxx) = {{Sxx}}</td>
                          <td class="text-white">Sum(Sxy) = {{Sxy.toFixed(2)}}</td>
                      </tr>
                  </tbody>
               </table>
           </div>
           <div class="mt-4 flex space-x-8">
               <div class="text-center">
                   <div class="text-xs text-slate-400">Sxx</div>
                   <div class="text-2xl font-mono text-indigo-400">{{Sxx}}</div>
               </div>
               <div class="text-center">
                   <div class="text-xs text-slate-400">Sxy</div>
                   <div class="text-2xl font-mono text-yellow-400">{{Sxy.toFixed(2)}}</div>
               </div>
           </div>
      </div>
      
      <!-- STEP 3: BETA -->
      <div v-if="step === 3" class="flex-grow flex flex-col items-center justify-center animate-fade-in-up">
          <div class="text-2xl mb-2 font-mono text-white">β = Sxy / Sxx</div>
          <div class="text-4xl mb-6 font-mono text-green-400">
              {{Sxy.toFixed(2)}} / {{Sxx}} = {{beta.toFixed(2)}}
          </div>
          <div class="p-4 bg-green-900/30 border border-green-500/50 rounded text-center">
              Slope (β) is <strong>{{beta.toFixed(2)}}</strong>
          </div>
      </div>

      <!-- STEP 4: ALPHA -->
      <div v-if="step === 4" class="flex-grow flex flex-col items-center justify-center animate-fade-in-up">
          <div class="text-2xl mb-2 font-mono text-white">α = ȳ - β * x̄</div>
          <div class="font-mono text-xl text-slate-300 mb-4">
              {{meanY.toFixed(2)}} - ({{beta.toFixed(2)}} * {{meanX}})
          </div>
          <div class="text-4xl mb-6 font-mono text-blue-400">
              = {{alpha.toFixed(2)}}
          </div>
          
          <div class="p-4 bg-white/10 rounded w-full text-center">
              <div class="text-sm text-slate-400 mb-1">Final Model</div>
              <div class="text-2xl font-mono font-bold text-white">
                  Y = {{alpha.toFixed(2)}} + {{beta.toFixed(2)}}X
              </div>
          </div>
      </div>

      <!-- CONTROLS -->
      <div class="mt-6 flex justify-between">
          <button 
            @click="step = Math.max(0, step-1)"
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold disabled:opacity-50"
            :disabled="step===0"
          >
            ← Back
          </button>
          <button 
            @click="step = Math.min(maxSteps, step+1)"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold disabled:opacity-50"
            :disabled="step===maxSteps"
          >
            Next Step →
          </button>
      </div>

  </div>
</template>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
