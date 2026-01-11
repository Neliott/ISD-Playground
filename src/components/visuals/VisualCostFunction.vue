<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue'
import ThreeScene from './ThreeScene.vue'
import * as THREE from 'three'

const props = defineProps({
  step: {
    type: String, 
    default: 'surface' // 'surface' | 'gradient' | 'min'
  }
})

const canvasLeft = ref(null)
let animationId = null

// Fixed Data Points (normalized 0-1)
const dataPoints = [
    { x: 0.1, y: 0.2 },
    { x: 0.3, y: 0.4 },
    { x: 0.5, y: 0.45 },
    { x: 0.7, y: 0.8 },
    { x: 0.9, y: 0.85 }
]

const optimalM = 0.8
const optimalB = 0.15

// State shared between 2D and 3D
const currentM = ref(0.2)
const currentB = ref(0.8)

// 2D Drawing Logic (Left Panel)
const drawLineGraph = (ctx, w, h, m, b) => {
    ctx.clearRect(0, 0, w, h)
    
    // Grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let i=0.1; i<1; i+=0.2) {
        ctx.moveTo(i*w, 0); ctx.lineTo(i*w, h)
        ctx.moveTo(0, i*h); ctx.lineTo(w, i*h)
    }
    ctx.stroke()
    
    const mapX = (v) => v * w
    const mapY = (v) => h - (v * h)
    
    // Points
    dataPoints.forEach(p => {
        ctx.fillStyle = '#f8fafc'
        ctx.beginPath()
        ctx.arc(mapX(p.x), mapY(p.y), 4, 0, Math.PI*2)
        ctx.fill()
    })
    
    // Line
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 3
    ctx.beginPath()
    const x1 = 0; const y1 = m*x1 + b
    const x2 = 1; const y2 = m*x2 + b
    ctx.moveTo(mapX(x1), mapY(y1))
    ctx.lineTo(mapX(x2), mapY(y2))
    ctx.stroke()
    
    // Residuals
    ctx.lineWidth = 1
    ctx.strokeStyle = '#ef4444'
    ctx.setLineDash([2, 2])
    dataPoints.forEach(p => {
        const predY = m*p.x + b
        ctx.beginPath()
        ctx.moveTo(mapX(p.x), mapY(p.y))
        ctx.lineTo(mapX(p.x), mapY(predY))
        ctx.stroke()
    })
    ctx.setLineDash([])
}

// 3D Logic (Right Panel)
let ballMesh, surfaceMesh
const scale = 2

const getCost = (m, b) => {
    return 1.5 * ((m - optimalM)**2 + (b - optimalB)**2)
}

const initThree = ({ scene }) => {
    // 1. Create Cost Surface
    const geometry = new THREE.PlaneGeometry(4, 4, 32, 32)
    const count = geometry.attributes.position.count
    
    for (let i = 0; i < count; i++) {
        const x = geometry.attributes.position.getX(i) // represents (m - optimalM)
        const y = geometry.attributes.position.getY(i) // represents (b - optimalB)
        
        // Z is cost (height)
        // We map plane X,Y to our M,B space deviation
        // Plane is centered at 0,0. 
        // Let's say range is -2 to 2.
        
        const mDev = x * 0.5 
        const bDev = y * 0.5
        const cost = 1.5 * (mDev**2 + bDev**2)
        
        geometry.attributes.position.setZ(i, cost)
    }
    
    geometry.computeVertexNormals()
    
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x3b82f6, 
        wireframe: true,
        side: THREE.DoubleSide
    })
    surfaceMesh = new THREE.Mesh(geometry, material)
    surfaceMesh.rotation.x = -Math.PI / 2 // Flat on ground initially
    // Actually typically surfaces are XZ plane in Three.js, but PlaneGeometry is XY.
    // Let's keep it XY for "Wall" view or rotate to lie down.
    // Standard 3D plot: Z is up (Cost). X and Y are parameters.
    // Plan: Rotate -90 deg X so 'Z' of geometry points UP in world Y.
    surfaceMesh.rotation.x = -Math.PI / 2 
    
    scene.add(surfaceMesh)

    // 2. Ball (Current State)
    const ballGeo = new THREE.SphereGeometry(0.1, 16, 16)
    const ballMat = new THREE.MeshPhongMaterial({ color: 0xfacc15 })
    ballMesh = new THREE.Mesh(ballGeo, ballMat)
    scene.add(ballMesh)
    
    // Add grid helper
    const grid = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b)
    scene.add(grid)
}

const updateThree = ({ scene }) => {
    if (!ballMesh) return

    // Update Ball Position based on currentM, currentB
    // We need to map M,B back to the Plane Geometry coordinates
    // Geometry X = (m - optimalM) / 0.5
    // Geometry Y = (b - optimalB) / 0.5
    // But we rotated the mesh. 
    // Mesh X acts as World X.
    // Mesh Y acts as World Z (depth).
    // Mesh Z (height) acts as World Y (up).
    
    const mDev = currentM.value - optimalM
    const bDev = currentB.value - optimalB
    
    const worldX = mDev / 0.5
    const worldZ = - (bDev / 0.5) // Y in geometry became -Z in world due to rotation? Let's check visually.
    // Actually PlaneGeometry Y goes UP. Rotation -90 deg X makes +Y point to -Z.
    
    const cost = getCost(currentM.value, currentB.value)
    
    ballMesh.position.set(worldX, cost, - (bDev / 0.5)) 
}

onMounted(() => {
  const ctx = canvasLeft.value.getContext('2d')
  let startTime = Date.now()

  const loop = () => {
    if (!canvasLeft.value) return 
    const w = canvasLeft.value.width = canvasLeft.value.offsetWidth
    const h = canvasLeft.value.height = canvasLeft.value.offsetHeight
    
    // Animation Logic
    const time = (Date.now() - startTime) / 1000
    
    if (props.step === 'surface') {
        currentM.value = 0.2
        currentB.value = 0.8
    } else if (props.step === 'gradient') {
        const t = (Math.sin(time * 2) + 1) / 2
        // Simple Lerp
        const startM = 0.2; const startB = 0.8
        currentM.value = startM + (optimalM - startM) * t
        currentB.value = startB + (optimalB - startB) * t
    } else if (props.step === 'min') {
        currentM.value = optimalM
        currentB.value = optimalB
    }

    drawLineGraph(ctx, w, h, currentM.value, currentB.value)
    
    animationId = requestAnimationFrame(loop)
  }
  loop()
})

onUnmounted(() => cancelAnimationFrame(animationId))
</script>

<template>
  <div class="w-full h-full flex flex-row bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <!-- LEFT: Data Space -->
      <div class="w-1/2 h-full relative border-r border-slate-700">
          <canvas ref="canvasLeft" class="w-full h-full block"></canvas>
          <div class="absolute top-2 left-2 bg-black/40 p-1 px-2 rounded text-xs text-white">
              Data Space (Line Fitting)
          </div>
      </div>
      
      <!-- RIGHT: Parameter Space (Three.js) -->
      <div class="w-1/2 h-full relative">
           <ThreeScene 
                :cameraPosition="{ x: 3, y: 4, z: 4 }"
                @init="initThree"
                @tick="updateThree"
           />
           <div class="absolute bottom-2 right-2 bg-black/40 p-1 px-2 rounded text-xs text-white text-right pointer-events-none">
              Parameter Space (3D)<br>
              <span class="text-text-muted">Drag to Rotate • Scroll to Zoom</span>
          </div>
      </div>
  </div>
</template>
