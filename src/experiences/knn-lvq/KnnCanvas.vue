<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'

const props = defineProps({
  points: {
    type: Array,
    required: true
  },
  k: {
    type: Number,
    required: true
  },
  classes: {
    type: Array,
    required: true
  },
  showLvq: {
    type: Boolean,
    default: false
  },
  prototypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-point'])

const webglCanvasRef = ref(null)
const uiCanvasRef = ref(null)
const containerRef = ref(null)
const width = ref(800)
const height = ref(600)

// WebGL Context and State
let gl = null
let program = null
let pointsTexture = null
let vao = null

// Constants
const MAX_CLASSES = 20
const MAX_K = 50
const MAX_POINTS_TEXTURE_WIDTH = 4096 // Support up to 4096 points

// Shaders
const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int u_k;
uniform int u_numPoints;
uniform sampler2D u_pointsTexture; // (x, y, classId, 0)

uniform vec3 u_classColors[${MAX_CLASSES}];
uniform int u_classIds[${MAX_CLASSES}];
uniform int u_numClasses;

out vec4 fragColor;

struct Neighbor {
  float dist;
  int classId;
};

void main() {
  vec2 st = gl_FragCoord.xy;
  float x = st.x;
  float y = u_resolution.y - st.y; // Flip Y to match Canvas2D top-left origin

  if (u_numPoints == 0) {
    fragColor = vec4(0.07, 0.07, 0.07, 1.0);
    return;
  }

  // Initialize neighbors with max distance
  Neighbor neighbors[${MAX_K}];
  for(int i = 0; i < ${MAX_K}; i++) {
    neighbors[i].dist = 1e10; // Large number
    neighbors[i].classId = -1;
  }

  int effectiveK = u_k;
  if (effectiveK > ${MAX_K}) effectiveK = ${MAX_K};
  if (effectiveK > u_numPoints) effectiveK = u_numPoints;

  // Iterate over all points
  // We read from the texture. Texture width is large enough.
  for (int i = 0; i < ${MAX_POINTS_TEXTURE_WIDTH}; i++) {
    if (i >= u_numPoints) break;
    
    vec4 p = texelFetch(u_pointsTexture, ivec2(i, 0), 0);
    float dist = distance(vec2(x, y), p.xy);
    
    // Insertion sort into neighbors array
    // We only care if this point is closer than the furthest neighbor we have so far
    // (which is neighbors[effectiveK-1] after the array is full)
    
    if (dist < neighbors[effectiveK-1].dist) {
      // Find insertion index
      int insertIndex = -1;
      for(int j = 0; j < effectiveK; j++) {
        if (dist < neighbors[j].dist) {
          insertIndex = j;
          break;
        }
      }
      
      if (insertIndex != -1) {
        // Shift elements right
        for (int j = effectiveK - 1; j > 0; j--) {
          if (j > insertIndex) {
            neighbors[j] = neighbors[j-1];
          }
        }
        neighbors[insertIndex].dist = dist;
        neighbors[insertIndex].classId = int(p.z);
      }
    }
  }

  // Vote
  int counts[${MAX_CLASSES}];
  for(int i = 0; i < ${MAX_CLASSES}; i++) counts[i] = 0;

  for(int i = 0; i < effectiveK; i++) {
    int cId = neighbors[i].classId;
    // Find index in u_classIds
    for(int j = 0; j < ${MAX_CLASSES}; j++) {
      if (j >= u_numClasses) break;
      if (u_classIds[j] == cId) {
        counts[j]++;
        break;
      }
    }
  }

  // Find winner
  int maxCount = -1;
  int winnerIndex = -1;
  bool tie = false;

  for(int i = 0; i < ${MAX_CLASSES}; i++) {
    if (i >= u_numClasses) break;
    if (counts[i] > maxCount) {
      maxCount = counts[i];
      winnerIndex = i;
      tie = false;
    } else if (counts[i] == maxCount) {
      tie = true;
    }
  }

  vec3 color = vec3(0.07); // Background
  if (!tie && winnerIndex != -1) {
    color = u_classColors[winnerIndex] * 0.5; // Dimmed color
  }

  fragColor = vec4(color, 1.0);
}
`

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initWebGL() {
  const canvas = webglCanvasRef.value
  gl = canvas.getContext('webgl2')
  if (!gl) {
    console.error('WebGL 2 not supported')
    return
  }

  // Enable float textures extension just in case (standard in WebGL2 usually)
  gl.getExtension('EXT_color_buffer_float')

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  
  program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return
  }

  // Setup Quad
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ])
  
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  
  vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  
  const positionLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(positionLoc)
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

  // Create Texture for points
  pointsTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, pointsTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

function updateWebGL() {
  if (!gl || !program) return

  gl.viewport(0, 0, width.value, height.value)
  gl.useProgram(program)

  // Update Uniforms
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width.value, height.value)
  
  const activePoints = props.showLvq ? props.prototypes : props.points
  const kValue = props.showLvq ? 1 : props.k
  
  gl.uniform1i(gl.getUniformLocation(program, 'u_k'), kValue)
  gl.uniform1i(gl.getUniformLocation(program, 'u_numPoints'), activePoints.length)
  
  // Update Points Texture
  if (activePoints.length > 0) {
    const data = new Float32Array(MAX_POINTS_TEXTURE_WIDTH * 4)
    for (let i = 0; i < activePoints.length; i++) {
      data[i * 4 + 0] = activePoints[i].x
      data[i * 4 + 1] = activePoints[i].y
      data[i * 4 + 2] = activePoints[i].classId
      data[i * 4 + 3] = 0
    }
    
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, pointsTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_POINTS_TEXTURE_WIDTH, 1, 0, gl.RGBA, gl.FLOAT, data)
    gl.uniform1i(gl.getUniformLocation(program, 'u_pointsTexture'), 0)
  }

  // Update Classes
  gl.uniform1i(gl.getUniformLocation(program, 'u_numClasses'), props.classes.length)
  
  const classColorsLoc = gl.getUniformLocation(program, 'u_classColors')
  const classIdsLoc = gl.getUniformLocation(program, 'u_classIds')
  
  const colorsFlat = []
  const idsFlat = []
  
  for (let i = 0; i < MAX_CLASSES; i++) {
    if (i < props.classes.length) {
      const c = props.classes[i]
      const rgb = hexToRgb(c.color)
      colorsFlat.push(...rgb)
      idsFlat.push(c.id)
    } else {
      colorsFlat.push(0, 0, 0)
      idsFlat.push(-1)
    }
  }
  
  gl.uniform3fv(classColorsLoc, new Float32Array(colorsFlat))
  gl.uniform1iv(classIdsLoc, new Int32Array(idsFlat))

  // Draw
  gl.bindVertexArray(vao)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

function drawUI() {
  const canvas = uiCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width.value, height.value)

  // Draw points
  for (const p of props.points) {
    const cls = props.classes.find(c => c.id === p.classId)
    if (cls) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = cls.color
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Draw prototypes
  if (props.showLvq) {
    for (const p of props.prototypes) {
      const cls = props.classes.find(c => c.id === p.classId)
      if (cls) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - 10)
        ctx.lineTo(p.x + 10, p.y)
        ctx.lineTo(p.x, p.y + 10)
        ctx.lineTo(p.x - 10, p.y)
        ctx.closePath()
        
        ctx.fillStyle = cls.color
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
}

function handleDoubleClick(event) {
  const rect = uiCanvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  emit('add-point', { x, y })
}

let resizeObserver = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
        // Need to wait for next tick or force update
        requestAnimationFrame(() => {
          updateWebGL()
          drawUI()
        })
      }
    })
    resizeObserver.observe(containerRef.value)
  }
  
  initWebGL()
  updateWebGL()
  drawUI()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => [props.points, props.k, props.classes, props.showLvq, props.prototypes], () => {
  requestAnimationFrame(() => {
    updateWebGL()
    drawUI()
  })
}, { deep: true })

</script>

<template>
  <div ref="containerRef" class="canvas-container">
    <canvas 
      ref="webglCanvasRef"
      class="bg-canvas"
      :width="width"
      :height="height"
    ></canvas>
    <canvas 
      ref="uiCanvasRef"
      class="ui-canvas"
      :width="width"
      :height="height"
      @dblclick="handleDoubleClick"
    ></canvas>
    <div v-if="points.length === 0" class="hint">
      Double-click to add points
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
}

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.bg-canvas {
  z-index: 0;
}

.ui-canvas {
  z-index: 1;
  cursor: crosshair;
}

.hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  font-size: 1.2rem;
  z-index: 2;
}
</style>
