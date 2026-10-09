import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { statusStyles, type HealthStatus } from './ui/StatusPill'
import { RotateCcw, Play, Pause, Layers, Plus, Minus, MoveHorizontal, Sparkles } from 'lucide-react'

export interface AnatomicalHotspot {
  id: string
  label: string
  sublabel: string
  systemKey: string
  anchor3D: THREE.Vector3
  screenX: number
  screenY: number
  visible: boolean
  status: HealthStatus
}

// Calibrated landmark positions for targetHeight = 2.65:
// Floor: Y = -1.45 | Head Top: Y = +1.20 | Center: Y = -0.125
const DEFAULT_HOTSPOTS = [
  {
    id: 'heart',
    label: 'Chest & Cardiovascular',
    sublabel: 'BP: 120/80 · HR: 72 bpm',
    systemKey: 'cardiovascular',
    // Exact Right Pectoral surface on body mesh (matches upper marker in reference)
    pos: [0.14, 0.47, 0.20] as [number, number, number],
  },
  {
    id: 'pancreas',
    label: 'Endocrine & Pancreas',
    sublabel: 'HbA1c: 7.2% · Fasting: 142 mg/dL',
    systemKey: 'endocrine',
    // Exact Epigastric / Upper Abdomen surface on body mesh (matches middle marker in reference)
    pos: [0.0, 0.23, 0.18] as [number, number, number],
  },
  {
    id: 'knee',
    label: 'Lower Extremities & Joints',
    sublabel: 'Mobility intact · Mild stiffness',
    systemKey: 'musculoskeletal',
    // Exact Right Patella / Knee Joint surface on body mesh (matches lower marker in reference)
    pos: [0.17, -0.71, 0.14] as [number, number, number],
  },
  {
    id: 'brain',
    label: 'Cranial & Nervous System',
    sublabel: 'Headache & Chills reported',
    systemKey: 'neurological',
    pos: [0.0, 1.05, 0.17] as [number, number, number],
  },
  {
    id: 'liver',
    label: 'Hepatic (Liver)',
    sublabel: 'ALT: 28 U/L · Normal',
    systemKey: 'hepatic',
    pos: [-0.14, 0.30, 0.18] as [number, number, number],
  },
  {
    id: 'lungs',
    label: 'Respiratory (Lungs)',
    sublabel: 'RR: 22/min · SpO2: 98%',
    systemKey: 'respiratory',
    pos: [-0.14, 0.47, 0.18] as [number, number, number],
  },
]

// The 3 primary hotspots from user reference image (media_1791555297935.png)
const PRIMARY_REFERENCE_IDS = ['heart', 'pancreas', 'knee']

interface Props {
  selected: string
  onSelect: (organId: string) => void
  organStatuses?: Record<string, HealthStatus>
  className?: string
}

export default function BodyTwin3D({ selected, onSelect, organStatuses = {}, className = '' }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null)
  const [viewTheme, setViewTheme] = useState<'studio' | 'hologram'>('studio')
  const [xrayMode, setXrayMode] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [projectedHotspots, setProjectedHotspots] = useState<AnatomicalHotspot[]>([])
  const [isScrubbing, setIsScrubbing] = useState(false)

  // Scrubber drag refs
  const isScrubbingRef = useRef(false)
  const scrubStartXRef = useRef(0)
  const scrubStartAngleRef = useRef(0)
  const hasScrubMovedRef = useRef(false)

  // State refs to keep WebGL animation loop pure and single-mount
  const autoRotateRef = useRef(autoRotate)
  autoRotateRef.current = autoRotate

  const xrayModeRef = useRef(xrayMode)
  xrayModeRef.current = xrayMode

  const organStatusesRef = useRef(organStatuses)
  organStatusesRef.current = organStatuses

  const sceneRefs = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    modelGroup: THREE.Group
    organsGroup: THREE.Group
    bodyMesh?: THREE.Mesh
    originalMaterial?: THREE.Material | THREE.Material[]
    xrayMaterial?: THREE.Material
    currentRotationY: number
    targetRotationY: number
    isDragging: boolean
    prevX: number
    prevY: number
  } | null>(null)

  // Zoom handling
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!sceneRefs.current) return
    const { camera } = sceneRefs.current
    const step = direction === 'in' ? -0.7 : 0.7
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + step, 5.0, 9.8)
  }, [])

  // Turntable rotation handling
  const handleRotateStep = useCallback((delta: number) => {
    if (!sceneRefs.current) return
    sceneRefs.current.targetRotationY += delta
  }, [])

  // Reset View
  const handleReset = useCallback(() => {
    if (!sceneRefs.current) return
    sceneRefs.current.targetRotationY = 0 // Frontal anatomical view
    sceneRefs.current.camera.position.set(0, -0.72, 8.8)
  }, [])

  // Scrubber Pointer Drag Handlers (smooth 360° spin on drag)
  const handleScrubberPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    isScrubbingRef.current = true
    scrubStartXRef.current = e.clientX
    hasScrubMovedRef.current = false
    setIsScrubbing(true)
    if (sceneRefs.current) {
      scrubStartAngleRef.current = sceneRefs.current.targetRotationY
    }
  }

  const handleScrubberPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isScrubbingRef.current || !sceneRefs.current) return
    const dx = e.clientX - scrubStartXRef.current
    if (Math.abs(dx) > 2) {
      hasScrubMovedRef.current = true
    }
    // Smooth responsive turntable angle
    sceneRefs.current.targetRotationY = scrubStartAngleRef.current + dx * 0.02
  }

  const handleScrubberPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isScrubbingRef.current) return
    isScrubbingRef.current = false
    setIsScrubbing(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    // If click without drag, step 45 degrees
    if (!hasScrubMovedRef.current && sceneRefs.current) {
      sceneRefs.current.targetRotationY += Math.PI / 4
    }
  }

  // Single mount effect: initialize Three.js once
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 510

    // Scene
    const scene = new THREE.Scene()

    // Camera: positioned to encompass the full human body head-to-toe with ground reflection
    const camera = new THREE.PerspectiveCamera(31, width / height, 0.1, 50)
    camera.position.set(0, -0.72, 8.8)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // Lighting (Medical studio lighting setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(4, 5, 6)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.4)
    fillLight.position.set(-4, 2, 4)
    scene.add(fillLight)

    const backRim = new THREE.DirectionalLight(0x38bdf8, 1.8)
    backRim.position.set(0, 4, -5)
    scene.add(backRim)

    // Upward reflection illumination
    const reflFillLight = new THREE.DirectionalLight(0xffffff, 1.5)
    reflFillLight.position.set(0, -5, 4)
    scene.add(reflFillLight)

    const floorY = -1.45

    // Pedestal Ground Ring beneath feet (Matching Reference Image)
    const ringGeo = new THREE.RingGeometry(1.2, 1.23, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    const floorRing = new THREE.Mesh(ringGeo, ringMat)
    floorRing.rotation.x = -Math.PI / 2
    floorRing.position.y = floorY
    scene.add(floorRing)

    // Glossy Semi-Reflective Floor Disc
    const floorDiscGeo = new THREE.CircleGeometry(1.4, 48)
    const floorDiscMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
    const floorDisc = new THREE.Mesh(floorDiscGeo, floorDiscMat)
    floorDisc.rotation.x = -Math.PI / 2
    floorDisc.position.y = floorY - 0.002
    scene.add(floorDisc)

    // Soft Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 128
    shadowCanvas.height = 128
    const sCtx = shadowCanvas.getContext('2d')
    if (sCtx) {
      const g = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62)
      g.addColorStop(0, 'rgba(15, 23, 42, 0.42)')
      g.addColorStop(0.45, 'rgba(15, 23, 42, 0.14)')
      g.addColorStop(1, 'rgba(15, 23, 42, 0)')
      sCtx.fillStyle = g
      sCtx.fillRect(0, 0, 128, 128)
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 2.8),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
    )
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.y = floorY - 0.005
    scene.add(shadowMesh)

    // Model and Organs Groups
    const modelGroup = new THREE.Group()
    const organsGroup = new THREE.Group()
    scene.add(modelGroup)
    modelGroup.add(organsGroup)

    // Explicit 3D Anchor nodes attached directly to modelGroup for rock-solid 3D-to-2D tracking
    const hotspotAnchors = new Map<string, THREE.Object3D>()
    DEFAULT_HOTSPOTS.forEach((h) => {
      const anchor = new THREE.Object3D()
      anchor.position.set(...h.pos)
      modelGroup.add(anchor)
      hotspotAnchors.set(h.id, anchor)
    })

    // Initial rotation: 0 so front of anatomy faces camera
    modelGroup.rotation.y = 0

    // Internal Organs (for X-Ray mode, exactly aligned with anatomical coordinates)
    const organMeshes = new Map<string, THREE.Mesh>()
    const createOrgans = () => {
      // Heart (chest level)
      const heart = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.7, roughness: 0.3 })
      )
      heart.position.set(0.06, 0.47, 0.08)
      organsGroup.add(heart)
      organMeshes.set('heart', heart)

      // Lungs (bilateral chest)
      const lungMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.45, roughness: 0.4 })
      const lLung = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.26, 6, 12), lungMat)
      lLung.position.set(-0.16, 0.47, 0.06)
      const rLung = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.26, 6, 12), lungMat)
      rLung.position.set(0.16, 0.47, 0.06)
      organsGroup.add(lLung)
      organsGroup.add(rLung)
      organMeshes.set('lungs', lLung)

      // Pancreas (epigastric level)
      const pancreas = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.08, 0.09),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.7, roughness: 0.3 })
      )
      pancreas.position.set(0.0, 0.23, 0.08)
      organsGroup.add(pancreas)
      organMeshes.set('pancreas', pancreas)

      // Liver (right upper quadrant)
      const liver = new THREE.Mesh(
        new THREE.ConeGeometry(0.20, 0.24, 14),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.4, roughness: 0.4 })
      )
      liver.rotateZ(-Math.PI / 3)
      liver.position.set(-0.14, 0.30, 0.08)
      organsGroup.add(liver)
      organMeshes.set('liver', liver)

      // Brain (cranial vault)
      const brain = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x7c3aed, emissiveIntensity: 0.55, roughness: 0.3 })
      )
      brain.position.set(0.0, 1.02, 0.05)
      organsGroup.add(brain)
      organMeshes.set('brain', brain)

      organsGroup.visible = false
    }
    createOrgans()

    // X-Ray glass material
    const xrayMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.28,
      transmission: 0.75,
      thickness: 1.0,
    })

    let mainBodyMesh: THREE.Mesh | undefined
    let originalBodyMaterial: THREE.Material | THREE.Material[] | undefined

    // Load Anatomical Model (GLB)
    const loader = new GLTFLoader()
    loader.load(
      '/models/body.glb',
      (gltf) => {
        const bodyScene = gltf.scene

        const box = new THREE.Box3().setFromObject(bodyScene)
        const size = box.getSize(new THREE.Vector3())
        const targetHeight = 2.65
        const scale = targetHeight / (size.y || 1)
        bodyScene.scale.setScalar(scale)

        // Center vertically so feet rest on floorY (-1.45)
        const posY = -box.min.y * scale + floorY
        bodyScene.position.set(0, posY, 0)

        bodyScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            mainBodyMesh = child
            originalBodyMaterial = child.material
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material]
              mats.forEach((m) => {
                if (m instanceof THREE.MeshStandardMaterial) {
                  m.roughness = 0.40
                  m.metalness = 0.05
                }
              })
            }
          }
        })

        modelGroup.add(bodyScene)

        // Add Realistic Ground Reflection (Matching Reference Image)
        try {
          const reflectionScene = bodyScene.clone(true)
          reflectionScene.scale.set(scale, -scale, scale)
          // Invert below floorY: Y_refl = 2 * floorY - posY
          reflectionScene.position.set(0, 2 * floorY - posY, 0)

          reflectionScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshStandardMaterial({
                roughness: 0.5,
                metalness: 0.1,
                transparent: true,
                opacity: 0.38,
                depthWrite: false,
                side: THREE.DoubleSide,
              })
            }
          })
          modelGroup.add(reflectionScene)
        } catch (e) {
          console.warn('Reflection setup notice:', e)
        }

        if (sceneRefs.current) {
          sceneRefs.current.bodyMesh = mainBodyMesh
          sceneRefs.current.originalMaterial = originalBodyMaterial
          sceneRefs.current.xrayMaterial = xrayMaterial
        }

        setModelLoaded(true)
      },
      undefined,
      (err) => {
        console.warn('Fallback procedural model:', err)
        setModelLoaded(true)
      }
    )

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      modelGroup,
      organsGroup,
      currentRotationY: 0,
      targetRotationY: 0,
      isDragging: false,
      prevX: 0,
      prevY: 0,
    }

    // Pointer events for drag-to-rotate
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!sceneRefs.current) return
      sceneRefs.current.isDragging = true
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
      sceneRefs.current.prevX = cx
      sceneRefs.current.prevY = cy
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!sceneRefs.current || !sceneRefs.current.isDragging) return
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
      const dx = cx - sceneRefs.current.prevX
      const dy = cy - sceneRefs.current.prevY

      sceneRefs.current.targetRotationY += dx * 0.009
      camera.position.y = THREE.MathUtils.clamp(camera.position.y - dy * 0.005, -0.5, 0.9)

      sceneRefs.current.prevX = cx
      sceneRefs.current.prevY = cy
    }

    const onUp = () => {
      if (!sceneRefs.current) return
      sceneRefs.current.isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + (e.deltaY > 0 ? 0.35 : -0.35), 5.0, 9.8)
    }

    container.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    container.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    container.addEventListener('wheel', onWheel, { passive: false })

    // Animation Loop
    let animId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (!sceneRefs.current) return

      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // Auto rotation
      if (autoRotateRef.current && !sceneRefs.current.isDragging) {
        sceneRefs.current.targetRotationY += delta * 0.35
      }

      // Smooth rotation spring
      sceneRefs.current.currentRotationY += (sceneRefs.current.targetRotationY - sceneRefs.current.currentRotationY) * 0.12
      modelGroup.rotation.y = sceneRefs.current.currentRotationY

      // Heartbeat pulse if organs visible
      const heart = organMeshes.get('heart')
      if (heart && organsGroup.visible) {
        const beat = 1.0 + Math.pow(Math.sin(elapsed * 4.8), 6) * 0.15
        heart.scale.set(beat, beat, beat)
      }

      // Project hotspots to 2D screen coordinates using true 3D scene world positions
      const rect = container.getBoundingClientRect()
      const projectedList: AnatomicalHotspot[] = []

      // In model local space, front faces +Z
      const forwardVec = new THREE.Vector3(0, 0, 1).applyQuaternion(modelGroup.quaternion)

      DEFAULT_HOTSPOTS.forEach((h) => {
        const anchor = hotspotAnchors.get(h.id)
        if (!anchor) return

        const worldPos = new THREE.Vector3()
        anchor.getWorldPosition(worldPos)

        const toCam = camera.position.clone().sub(worldPos).normalize()
        const isFacingFront = forwardVec.dot(toCam) > -0.2

        const projected = worldPos.clone().project(camera)
        const sx = ((projected.x + 1) / 2) * rect.width
        const sy = ((-projected.y + 1) / 2) * rect.height

        const resolvedStatus = organStatusesRef.current[h.id] || 'normal'

        projectedList.push({
          id: h.id,
          label: h.label,
          sublabel: h.sublabel,
          systemKey: h.systemKey,
          anchor3D: worldPos,
          screenX: sx,
          screenY: sy,
          visible: isFacingFront && projected.z < 1.0,
          status: resolvedStatus,
        })
      })

      setProjectedHotspots(projectedList)

      renderer.render(scene, camera)
    }

    animate()

    // Resize
    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      container.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
      container.removeEventListener('wheel', onWheel)
      renderer.dispose()
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, []) // Mount ONCE

  // Toggle X-Ray mode smoothly without recreating WebGL context
  useEffect(() => {
    if (!sceneRefs.current) return
    const { organsGroup, bodyMesh, originalMaterial, xrayMaterial } = sceneRefs.current
    organsGroup.visible = xrayMode
    if (bodyMesh) {
      bodyMesh.material = xrayMode && xrayMaterial ? xrayMaterial : (originalMaterial || bodyMesh.material)
    }
  }, [xrayMode])

  return (
    <div
      className={`relative size-full select-none overflow-hidden ${
        viewTheme === 'studio'
          ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100'
          : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white'
      } ${className}`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="size-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {!modelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-slate-700">
            <span className="size-8 animate-spin rounded-full border-3 border-teal border-t-transparent" />
            <p className="font-mono text-xs font-semibold uppercase tracking-wider">Loading Anatomical Twin 3D...</p>
          </div>
        </div>
      )}

      {/* SVG Dynamic Dotted Curved Leader Lines (Exact match to reference) */}
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <defs>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {projectedHotspots.map((spot) => {
          if (!spot.visible) return null
          // Show leader line for the 3 target markers from the reference image, or if currently selected/hovered
          const isPrimary = PRIMARY_REFERENCE_IDS.includes(spot.id)
          const isSelected = selected === spot.id
          const isHovered = hoveredHotspot === spot.id
          const active = isSelected || isHovered

          if (!isPrimary && !active) return null

          const startX = spot.screenX
          const startY = spot.screenY
          // Extend curve smoothly towards right
          const endX = startX + 140
          const endY = startY - 14

          const strokeColor = active ? '#2563EB' : '#93C5FD'
          const strokeWidth = active ? 2.4 : 1.6

          return (
            <g key={spot.id} opacity={active ? 1.0 : 0.8}>
              <path
                d={`M ${startX} ${startY} C ${startX + 50} ${startY - 20}, ${endX - 35} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
                filter={active ? 'url(#lineGlow)' : undefined}
                className="transition-all duration-300"
              />
              <circle cx={endX} cy={endY} r={active ? 3.5 : 2.5} fill={strokeColor} />
            </g>
          )
        })}
      </svg>

      {/* Interactive 3D Hotspot Pins (Matching reference with concentric rings and '+' button) */}
      <div className="pointer-events-none absolute inset-0 size-full">
        {projectedHotspots.map((spot) => {
          if (!spot.visible) return null
          const isSelected = selected === spot.id
          const isHovered = hoveredHotspot === spot.id
          const active = isSelected || isHovered
          const statusColor = statusStyles[spot.status]?.hex || '#0EA5E9'
          const isPrimary = PRIMARY_REFERENCE_IDS.includes(spot.id)

          // Only show primary reference pins (Chest, Abdomen, Knee) unless user selected another organ
          if (!isPrimary && !active) return null

          return (
            <div
              key={spot.id}
              style={{
                left: `${spot.screenX}px`,
                top: `${spot.screenY}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-auto absolute flex items-center justify-center transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredHotspot(spot.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              onClick={() => onSelect(spot.id)}
            >
              {/* Outer Glowing Concentric Rings (Matching Reference) */}
              <div
                className={`absolute rounded-full transition-all duration-300 ${
                  active
                    ? 'size-12 ring-2 ring-blue-500 animate-ping opacity-60'
                    : 'size-10 ring-1.5 ring-blue-400/75 opacity-55'
                }`}
              />
              <div
                className={`absolute rounded-full border border-dashed transition-all ${
                  active
                    ? 'size-9 border-blue-500 animate-spin opacity-85'
                    : 'size-8 border-blue-400/60 opacity-60'
                }`}
                style={{ animationDuration: '9s' }}
              />

              {/* Central Plus Target Badge Button */}
              <button
                type="button"
                className={`relative flex items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
                  active
                    ? 'size-7 bg-blue-600 text-white scale-110 ring-2 ring-white shadow-blue-500/50'
                    : 'size-6 bg-white/95 text-blue-600 ring-1.5 ring-blue-300 hover:bg-blue-500 hover:text-white'
                }`}
                title={`Inspect ${spot.label}`}
                aria-label={`Inspect ${spot.label}`}
              >
                <Plus className="size-3.5 stroke-[2.8]" />
              </button>

              {/* Floating Clinical Card at end of leader line (matching reference cards) */}
              {(isPrimary || active) && (
                <div
                  className={`pointer-events-none absolute left-[142px] top-[-14px] z-20 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs shadow-xl backdrop-blur-md ring-1 transition-all duration-200 animate-in fade-in zoom-in-95 ${
                    active
                      ? 'bg-slate-900 text-white ring-blue-500 scale-105'
                      : 'bg-white/95 text-slate-800 ring-slate-200/90 shadow-slate-200/60'
                  }`}
                  style={{ borderLeft: `3.5px solid ${statusColor}` }}
                >
                  <p className="font-semibold text-[11px] leading-tight">{spot.label}</p>
                  <p className={`font-mono text-[10px] leading-tight ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                    {spot.sublabel}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Top Bar Status Badges */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-md ring-1 ${
            viewTheme === 'studio'
              ? 'bg-white/90 text-slate-800 ring-slate-200'
              : 'bg-slate-900/80 text-teal-300 ring-teal/30'
          }`}
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-teal" />
            <span className="relative size-2 rounded-full bg-teal" />
          </span>
          Live 3D Anatomical Twin
        </div>

        <button
          type="button"
          onClick={() => setXrayMode(!xrayMode)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-md transition-all ring-1 ${
            xrayMode
              ? 'bg-teal text-white ring-teal shadow-teal/30'
              : viewTheme === 'studio'
                ? 'bg-white/90 text-slate-700 ring-slate-200 hover:bg-slate-100'
                : 'bg-slate-900/80 text-slate-300 ring-slate-700 hover:text-white'
          }`}
        >
          <Layers className="size-3.5" />
          {xrayMode ? 'X-Ray Organs On' : 'Muscular Anatomy'}
        </button>
      </div>

      {/* Top Right Theme & Reset Actions */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewTheme(viewTheme === 'studio' ? 'hologram' : 'studio')}
          className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 backdrop-blur"
          title="Toggle Studio White / Hologram Dark"
        >
          <Sparkles className="size-3" />
          {viewTheme === 'studio' ? 'Studio Mode' : 'Hologram Mode'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 backdrop-blur"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="size-3" />
          Reset View
        </button>
      </div>

      {/* Bottom Turntable Arc Control (Exact Match to User Reference: [-] [<>] [+]) */}
      <div className="absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center">
        {/* Curved Track & Control Buttons */}
        <div className="relative flex h-16 w-56 items-center justify-between">
          {/* SVG Orbit Arc Track curving down gracefully beneath feet */}
          <svg viewBox="0 0 220 50" className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <path
              d="M 22 18 Q 110 50, 198 18"
              fill="none"
              stroke="#93C5FD"
              strokeWidth="2.2"
              strokeDasharray="4 4"
              opacity="0.85"
            />
          </svg>

          {/* Zoom Out Button (-) on left side of the arc */}
          <button
            type="button"
            onClick={() => handleZoom('out')}
            className="relative z-10 -mt-2 flex size-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 transition-transform hover:scale-110 active:scale-95"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus className="size-4 stroke-[2.5]" />
          </button>

          {/* Center 360° Turntable Rotation Handle (<>) right on the front apex of the curve */}
          <button
            type="button"
            onPointerDown={handleScrubberPointerDown}
            onPointerMove={handleScrubberPointerMove}
            onPointerUp={handleScrubberPointerUp}
            onPointerCancel={handleScrubberPointerUp}
            className={`relative z-10 mt-6 flex size-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-2 ring-white transition-all select-none ${
              isScrubbing
                ? 'cursor-grabbing scale-125 bg-blue-700 ring-4 ring-blue-300 shadow-blue-600/60'
                : 'cursor-grab hover:bg-blue-700 hover:scale-110 active:scale-95'
            }`}
            title="Drag horizontally to spin 360° turntable, or click to turn 45°"
            aria-label="Rotate Turntable"
          >
            <MoveHorizontal className={`size-4 stroke-[2.8] ${isScrubbing ? 'scale-110 text-cyan-200' : ''}`} />
          </button>

          {/* Zoom In Button (+) on right side of the arc */}
          <button
            type="button"
            onClick={() => handleZoom('in')}
            className="relative z-10 -mt-2 flex size-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 transition-transform hover:scale-110 active:scale-95"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus className="size-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Orbit Auto-Rotation pill */}
        <div className="-mt-0.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
              autoRotate
                ? 'bg-teal text-white shadow-sm'
                : 'bg-white/85 text-slate-600 ring-1 ring-slate-200 hover:bg-white'
            }`}
          >
            {autoRotate ? <Pause className="size-3" /> : <Play className="size-3" />}
            {autoRotate ? 'Auto Orbiting' : 'Orbit'}
          </button>
          <span className="text-[10px] text-slate-400">· Drag to spin 360°</span>
        </div>
      </div>
    </div>
  )
}
