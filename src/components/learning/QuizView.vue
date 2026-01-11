<script setup>
import { ref, computed } from 'vue'
import Button from '../controls/Button.vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    // { id, question, options: [{id, text, isCorrect}], explanation }
  },
  title: {
      type: String,
      default: 'Quiz Time!'
  }
})

const emit = defineEmits(['complete'])

const currentQuestionIndex = ref(0)
const selectedOptionId = ref(null)
const isSubmitted = ref(false)
const score = ref(0)
const showResults = ref(false)

const currentQuestion = computed(() => props.questions[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === props.questions.length - 1)

const selectOption = (optionId) => {
  if (isSubmitted.value) return
  selectedOptionId.value = optionId
}

const submitAnswer = () => {
  if (!selectedOptionId.value) return
  
  isSubmitted.value = true
  
  const correctOption = currentQuestion.value.options.find(o => o.isCorrect)
  if (selectedOptionId.value === correctOption.id) {
    score.value++
  }
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    showResults.value = true
    emit('complete', score.value)
  } else {
    currentQuestionIndex.value++
    selectedOptionId.value = null
    isSubmitted.value = false
  }
}

const reset = () => {
    currentQuestionIndex.value = 0
    selectedOptionId.value = null
    isSubmitted.value = false
    score.value = 0
    showResults.value = false
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-6">
    <div v-if="!showResults" class="flex flex-col h-full">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono text-primary-400 uppercase tracking-widest">Question {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
            <span class="text-xs text-text-muted">Score: {{ score }}</span>
        </div>
        <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"></div>
        </div>
      </div>

      <!-- Question -->
      <h2 class="text-2xl font-bold text-white mb-8">{{ currentQuestion.question }}</h2>

      <!-- Options -->
      <div class="space-y-3 mb-8">
        <div 
          v-for="option in currentQuestion.options" 
          :key="option.id"
          @click="selectOption(option.id)"
          class="p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group"
          :class="[
            isSubmitted 
              ? option.isCorrect 
                ? 'bg-green-500/10 border-green-500/50' 
                : selectedOptionId === option.id 
                  ? 'bg-red-500/10 border-red-500/50' 
                  : 'bg-white/5 border-white/5 opacity-50'
              : selectedOptionId === option.id
                ? 'bg-primary-500/10 border-primary-500 text-white'
                : 'bg-surface border-white/10 hover:border-white/20 text-text-muted hover:text-white'
          ]"
        >
          <div class="flex items-center justify-between relative z-10">
            <span>{{ option.text }}</span>
            
            <!-- Icons for result -->
            <span v-if="isSubmitted && option.isCorrect" class="text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span v-if="isSubmitted && selectedOptionId === option.id && !option.isCorrect" class="text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </span>
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div v-if="isSubmitted && currentQuestion.explanation" class="mb-8 p-4 bg-white/5 rounded-lg border border-white/5 text-sm text-text-muted">
        <span class="font-bold text-white block mb-1">Explanation:</span>
        {{ currentQuestion.explanation }}
      </div>

      <!-- Controls -->
      <div class="mt-auto">
        <Button 
            v-if="!isSubmitted"
            variant="primary" 
            class="w-full justify-center py-4"
            :disabled="!selectedOptionId"
            @click="submitAnswer"
        >
            Check Answer
        </Button>
        <Button 
            v-else
            variant="primary"
            class="w-full justify-center py-4"
            @click="nextQuestion"
        >
            {{ isLastQuestion ? 'See Results' : 'Next Question' }}
        </Button>
      </div>
    </div>

    <!-- Results View -->
    <div v-else class="text-center py-12">
        <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
            <span class="text-4xl font-bold text-white">{{ Math.round((score / questions.length) * 100) }}%</span>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
        <p class="text-text-muted mb-8">You got {{ score }} out of {{ questions.length }} correct.</p>
        
        <div class="flex justify-center gap-4">
            <Button variant="secondary" @click="reset">Try Again</Button>
            <!-- Slot for continuing to next lesson -->
            <slot name="finish" /> 
        </div>
    </div>
  </div>
</template>
