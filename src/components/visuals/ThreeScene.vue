<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  cameraPosition: {
    type: Object,
    default: () => ({ x: 5, y: 5, z: 5 })
  },
  enableControls: {
    type: Boolean,
    default: true
  },
  backgroundColor: {
    type: String,
    default: '#0f172a' // slate-900
  }
})

const emit = defineEmits(['init', 'tick'])
const container = ref(null)

let scene, camera, renderer, controls, animationId

onMounted(() => {
  if (!container.value) return

  // 1. Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(props.backgroundColor)

  // 2. Camera
  const aspect = container.value.offsetWidth / container.value.offsetHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(props.cameraPosition.x, props.cameraPosition.y, props.cameraPosition.z)
  camera.lookAt(0, 0, 0)

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.offsetWidth, container.value.offsetHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  // 4. Controls
  if (props.enableControls) {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
  }

  // 5. Lights (Default Setup)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 7)
  scene.add(directionalLight)

  // Emit Init so parent can add objects
  emit('init', { scene, camera, renderer, controls })

  // 6. Loop
  const tick = () => {
    if (controls) controls.update()
    
    emit('tick', { scene, camera, renderer })
    
    renderer.render(scene, camera)
    animationId = requestAnimationFrame(tick)
  }
  tick()

  // Resize Handler
  const handleResize = () => {
    if (!container.value) return
    const w = container.value.offsetWidth
    const h = container.value.offsetHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationId)
    if (renderer) renderer.dispose()
    if (controls) controls.dispose()
  })
})
</script>

<template>
  <div ref="container" class="w-full h-full block"></div>
</template>
