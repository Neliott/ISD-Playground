<script setup>
import { ref, computed } from 'vue'

const items = ref([
    { id: 1, text: "Height (1.75m)", type: 'continuous' },
    { id: 2, text: "Siblings (3)", type: 'discrete' },
    { id: 3, text: "Zip Code (10001)", type: 'nominal' },
    { id: 4, text: "Size (S, M, L)", type: 'ordinal' },
    { id: 5, text: "Temperature (22.5°C)", type: 'continuous' },
    { id: 6, text: "Rank (1st, 2nd)", type: 'ordinal' },
    { id: 7, text: "Hair (Brown)", type: 'nominal' },
    { id: 8, text: "Pixels (1920x1080)", type: 'discrete' } // Discrete count of pixels
])

const buckets = [
    { id: 'nominal', title: 'Nominal', desc: 'Labels / Names' },
    { id: 'ordinal', title: 'Ordinal', desc: 'Ordered Categories' },
    { id: 'discrete', title: 'Discrete', desc: 'Countable (Integers)' },
    { id: 'continuous', title: 'Continuous', desc: 'Measurable (Real Numbers)' }
]

const placedItems = ref([])
const feedback = ref(null)

const onDragStart = (evt, item) => {
    evt.dataTransfer.dropEffect = 'move'
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('itemId', item.id)
}

const onDrop = (evt, bucketId) => {
    const itemId = parseInt(evt.dataTransfer.getData('itemId'))
    const item = items.value.find(i => i.id === itemId)
    
    if (item) {
        if (item.type === bucketId) {
            // Correct
            placedItems.value.push({ ...item, listId: bucketId })
            // Remove from pool
            items.value = items.value.filter(i => i.id !== itemId)
            showFeedback(true, "Correct!")
        } else {
            // Incorrect
            showFeedback(false, "Try again!")
        }
    }
}

const showFeedback = (isSuccess, msg) => {
    feedback.value = { success: isSuccess, msg }
    setTimeout(() => { feedback.value = null }, 1500)
}

const reset = () => {
    // Restore all items
    items.value = [...items.value, ...placedItems.value]
    placedItems.value = []
    items.value.sort((a,b) => a.id - b.id)
}

const isComplete = computed(() => items.value.length === 0)

</script>

<template>
    <div class="flex flex-col h-full p-4 relative">
        <!-- Header / Pool -->
        <div class="mb-8">
            <h3 class="text-lg font-bold mb-4 text-center">Drag items to the correct Data Type</h3>
            
            <div class="flex flex-wrap gap-3 justify-center min-h-[60px] p-4 bg-white/5 rounded-lg border border-white/10">
                <div 
                    v-for="item in items" 
                    :key="item.id"
                    draggable="true"
                    @dragstart="onDragStart($event, item)"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full cursor-move shadow-lg active:scale-95 transition-all text-sm font-medium select-none"
                >
                    {{ item.text }}
                </div>
                <div v-if="items.length === 0" class="text-green-400 font-bold self-center">
                    All sorted! Good job!
                    <button @click="reset" class="ml-4 text-xs underline text-white/50 hover:text-white">Reset</button>
                </div>
            </div>
        </div>

        <!-- Buckets -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <div 
                v-for="bucket in buckets" 
                :key="bucket.id"
                @dragover.prevent
                @dragenter.prevent
                @drop="onDrop($event, bucket.id)"
                class="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center transition-colors hover:bg-white/10 relative overflow-hidden"
            >
                <div class="text-center mb-4 pointer-events-none">
                    <div class="font-bold text-yellow-400">{{ bucket.title }}</div>
                    <div class="text-xs text-white/50">{{ bucket.desc }}</div>
                </div>

                <!-- Placed Items -->
                <div class="flex flex-col gap-2 w-full flex-1">
                    <div 
                        v-for="item in placedItems.filter(i => i.listId === bucket.id)"
                        :key="item.id"
                        class="px-3 py-2 bg-green-500/20 border border-green-500/40 rounded text-center text-xs animate-in fade-in zoom-in duration-300"
                    >
                        {{ item.text }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Feedback Overlay -->
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4"
        >
            <div 
                v-if="feedback" 
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-xl font-bold shadow-2xl z-50 pointer-events-none"
                :class="feedback.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
            >
                {{ feedback.msg }}
            </div>
        </Transition>
    </div>
</template>
