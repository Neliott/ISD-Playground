<script setup>
import { ref } from 'vue'

const actual = ref(true)    // The Truth: Positive (True) or Negative (False)
const predicted = ref(true) // The AI: Says Yes (True) or No (False)

</script>

<template>
  <div class="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg p-4">
      <div class="grid grid-cols-2 gap-4">
          <!-- TP -->
          <div 
            class="w-32 h-32 flex flex-col items-center justify-center rounded border transition-all duration-300"
            :class="[
                actual && predicted 
                ? 'bg-green-500/20 border-green-500 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'bg-slate-800 border-slate-700 opacity-50'
            ]"
          >
            <div class="text-3xl font-bold text-white mb-2">TP</div>
            <div class="text-xs text-center text-slate-300 px-2">True Positive<br>(Correct Hit)</div>
          </div>
          
          <!-- FN -->
          <div 
            class="w-32 h-32 flex flex-col items-center justify-center rounded border transition-all duration-300"
            :class="[
                actual && !predicted 
                ? 'bg-red-500/20 border-red-500 scale-105 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-slate-800 border-slate-700 opacity-50'
            ]"
          >
            <div class="text-3xl font-bold text-white mb-2">FN</div>
            <div class="text-xs text-center text-slate-300 px-2">False Negative<br>(Missed)</div>
          </div>
          
          <!-- FP -->
          <div 
            class="w-32 h-32 flex flex-col items-center justify-center rounded border transition-all duration-300"
            :class="[
                !actual && predicted 
                ? 'bg-yellow-500/20 border-yellow-500 scale-105 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                : 'bg-slate-800 border-slate-700 opacity-50'
            ]"
          >
            <div class="text-3xl font-bold text-white mb-2">FP</div>
            <div class="text-xs text-center text-slate-300 px-2">False Positive<br>(False Alarm)</div>
          </div>
          
          <!-- TN -->
          <div 
            class="w-32 h-32 flex flex-col items-center justify-center rounded border transition-all duration-300"
            :class="[
                !actual && !predicted 
                ? 'bg-blue-500/20 border-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-slate-800 border-slate-700 opacity-50'
            ]"
          >
            <div class="text-3xl font-bold text-white mb-2">TN</div>
            <div class="text-xs text-center text-slate-300 px-2">True Negative<br>(Correct Reject)</div>
          </div>
      </div>
      
      <!-- Controls -->
      <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-8">
          <div class="flex flex-col items-center">
              <span class="text-xs text-slate-400 mb-1">Reality (Actual)</span>
              <div class="flex bg-slate-800 rounded p-1">
                  <button @click="actual=true" :class="['px-3 py-1 rounded text-xs', actual ? 'bg-indigo-600 text-white' : 'text-slate-400']">Positive</button>
                  <button @click="actual=false" :class="['px-3 py-1 rounded text-xs', !actual ? 'bg-indigo-600 text-white' : 'text-slate-400']">Negative</button>
              </div>
          </div>
          
          <div class="flex flex-col items-center">
              <span class="text-xs text-slate-400 mb-1">AI Prediction</span>
              <div class="flex bg-slate-800 rounded p-1">
                  <button @click="predicted=true" :class="['px-3 py-1 rounded text-xs', predicted ? 'bg-indigo-600 text-white' : 'text-slate-400']">Positive</button>
                  <button @click="predicted=false" :class="['px-3 py-1 rounded text-xs', !predicted ? 'bg-indigo-600 text-white' : 'text-slate-400']">Negative</button>
              </div>
          </div>
      </div>
  </div>
</template>
