'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Html, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { Mesh, TextureLoader, Texture, Group } from 'three'

interface AssetItem {
  id: string
  name: string
  type: '3d' | 'video' | 'text' | 'image'
  url?: string
}

interface SceneObject {
  id: string
  asset: AssetItem
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

interface SceneObject {
  id: string
  asset: AssetItem
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  videoLoop?: boolean
  chromaKey?: string
  textColor?: string
  textFont?: string
  imageOpacity?: number
}

interface DefaultPlane {
  id: string
  name: string
  type: 'plane'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

function Scene({
  onPointerMissed,
  isObjectSelected,
  setIsObjectSelected,
  transformMode,
  draggedAsset,
  sceneObjects,
  selectedObjectId,
  onObjectSelect,
  onSceneObjectsUpdate,
  defaultPlane,
  onDefaultPlaneUpdate
}: {
  onPointerMissed?: () => void
  isObjectSelected: boolean
  setIsObjectSelected: (selected: boolean) => void
  transformMode: 'translate' | 'rotate' | 'scale'
  draggedAsset: AssetItem | null
  sceneObjects: SceneObject[]
  selectedObjectId: string | null
  onObjectSelect: (objectId: string) => void
  onSceneObjectsUpdate: (objects: SceneObject[]) => void
  defaultPlane: DefaultPlane
  onDefaultPlaneUpdate: (updates: Partial<DefaultPlane>) => void
}) {
  const meshRef = useRef<Mesh>(null!)
  const [texture, setTexture] = useState<Texture | null>(null)
  const [orbitEnabled, setOrbitEnabled] = useState(true)
  const [highlightPosition, setHighlightPosition] = useState<[number, number, number]>([0, 0, 0])
  const [highlightRotation, setHighlightRotation] = useState<[number, number, number]>([0, 0, 0])
  const [highlightScale, setHighlightScale] = useState<[number, number, number]>([1, 1, 1])

  // Auto-select the default object on mount
  useEffect(() => {
    if (!isObjectSelected) {
      setIsObjectSelected(true)
    }
  }, [])

  useEffect(() => {
    const loader = new TextureLoader()
    loader.load('/next.svg', (loadedTexture) => {
      setTexture(loadedTexture)
    })
  }, [])

  // Update highlight position, rotation, and scale when mesh transforms
  useEffect(() => {
    if (meshRef.current) {
      const updateTransform = () => {
        setHighlightPosition([meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z])
        setHighlightRotation([meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z])
        setHighlightScale([meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z])
      }
      updateTransform()
      // Listen to transform controls changes
      const handleTransformChange = () => updateTransform()
      // Since TransformControls modifies the object directly, we need to poll for changes
      const interval = setInterval(updateTransform, 16) // ~60fps
      return () => {
        clearInterval(interval)
      }
    }
  }, [isObjectSelected])

  const handleObjectClick = (objectId: string) => () => {
    onObjectSelect(objectId)
    setIsObjectSelected(true)
  }

  const handlePointerMissed = () => {
    onObjectSelect('')
    setIsObjectSelected(false)
    onPointerMissed?.()
  }

  const handleAssetDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (draggedAsset) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      // Convert screen coordinates to world coordinates (simplified)
      const worldX = x * 5
      const worldZ = y * 5

      const newObject: SceneObject = {
        id: `${draggedAsset.id}-${Date.now()}`,
        asset: draggedAsset,
        position: [worldX, 0, worldZ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        videoLoop: false,
        chromaKey: '#00ff00',
        textColor: '#000000',
        textFont: 'Arial'
      }

      onSceneObjectsUpdate([...sceneObjects, newObject])
    }
  }

  const handleAssetDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <>
      <color attach="background" args={['#f3f4f6']} />
      <OrbitControls
        enablePan={orbitEnabled}
        enableZoom={orbitEnabled}
        enableRotate={orbitEnabled}
      />
      {/* Infinite axis lines */}
      <group>
        {/* X-axis (Red) - extends infinitely in both directions */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 2000]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[1000, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-1000, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Y-axis (Green) - extends infinitely in both directions */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 2000]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, 1000, 0]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, -1000, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        {/* Z-axis (Blue) - extends infinitely in both directions */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 2000]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, 0, 1000]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, 0, -1000]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.05, 0.15]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>
      {/* Grid ground plane */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#d1d5db"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={25}
        fadeStrength={1}
        infiniteGrid
      />
      {/* Render scene objects */}
      {sceneObjects.map((obj) => (
        <group
          key={obj.id}
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          onClick={handleObjectClick(obj.id)}
        >
          {obj.asset.type === '3d' && obj.asset.url && (
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#ff6b6b" />
            </mesh>
          )}
          {obj.asset.type === 'image' && obj.asset.url && (
            <mesh>
              <planeGeometry args={[2, 2]} />
              <meshBasicMaterial
                map={new TextureLoader().load(obj.asset.url)}
                transparent
                opacity={obj.imageOpacity || 1.0}
              />
            </mesh>
          )}
          {obj.asset.type === 'video' && obj.asset.url && (
            <mesh>
              <planeGeometry args={[2, 1]} />
              <meshBasicMaterial color={obj.chromaKey || "#4ecdc4"} />
            </mesh>
          )}
          {obj.asset.type === 'text' && (
            <mesh>
              <planeGeometry args={[1, 0.5]} />
              <meshBasicMaterial color={obj.textColor || "#45b7d1"} />
            </mesh>
          )}
        </group>
      ))}

      {/* Default plane */}
      <mesh
        ref={meshRef}
        position={defaultPlane.position}
        rotation={defaultPlane.rotation}
        scale={defaultPlane.scale}
        onClick={handleObjectClick(defaultPlane.id)}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Transform controls for selected object */}
      {isObjectSelected && selectedObjectId && selectedObjectId === defaultPlane.id && (
        <TransformControls
          object={meshRef}
          mode={transformMode}
          showX
          showY
          showZ
          size={1}
          space="world"
          onMouseDown={() => setOrbitEnabled(false)}
          onMouseUp={() => setOrbitEnabled(true)}
        />
      )}

      {/* Blender-style outline highlight */}
      {isObjectSelected && selectedObjectId === defaultPlane.id && (
        <group position={defaultPlane.position} rotation={defaultPlane.rotation} scale={defaultPlane.scale}>
          {/* Outline edges - top */}
          <mesh position={[0, 2.5, 0.01]}>
            <boxGeometry args={[5, 0.05, 0.01]} />
            <meshBasicMaterial color="#007bff" />
          </mesh>
          {/* Outline edges - bottom */}
          <mesh position={[0, -2.5, 0.01]}>
            <boxGeometry args={[5, 0.05, 0.01]} />
            <meshBasicMaterial color="#007bff" />
          </mesh>
          {/* Outline edges - left */}
          <mesh position={[-2.5, 0, 0.01]}>
            <boxGeometry args={[0.05, 5, 0.01]} />
            <meshBasicMaterial color="#007bff" />
          </mesh>
          {/* Outline edges - right */}
          <mesh position={[2.5, 0, 0.01]}>
            <boxGeometry args={[0.05, 5, 0.01]} />
            <meshBasicMaterial color="#007bff" />
          </mesh>
        </group>
      )}
      {/* Axis gizmo */}
      <GizmoHelper
        alignment="top-right"
        margin={[80, 80]}
      >
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="black" />
      </GizmoHelper>
    </>
  )
}

export default function EditorScene({
  transformMode,
  draggedAsset,
  sceneObjects,
  selectedObjectId,
  onObjectSelect,
  onSceneObjectsUpdate,
  defaultPlane,
  onDefaultPlaneUpdate
}: {
  transformMode: 'translate' | 'rotate' | 'scale'
  draggedAsset: AssetItem | null
  sceneObjects: SceneObject[]
  selectedObjectId: string | null
  onObjectSelect: (objectId: string) => void
  onSceneObjectsUpdate: (objects: SceneObject[]) => void
  defaultPlane: DefaultPlane
  onDefaultPlaneUpdate: (updates: Partial<DefaultPlane>) => void
}) {
  const [isObjectSelected, setIsObjectSelected] = useState(false)

  return (
    <Canvas
      camera={{ position: [0, 0, 10] }}
      style={{ height: '100%', width: '100%' }}
      onPointerMissed={() => setIsObjectSelected(false)}
    >
      <Scene
        isObjectSelected={isObjectSelected}
        setIsObjectSelected={setIsObjectSelected}
        transformMode={transformMode}
        draggedAsset={draggedAsset}
        sceneObjects={sceneObjects}
        selectedObjectId={selectedObjectId}
        onObjectSelect={onObjectSelect}
        onSceneObjectsUpdate={onSceneObjectsUpdate}
        defaultPlane={defaultPlane}
        onDefaultPlaneUpdate={onDefaultPlaneUpdate}
        onPointerMissed={() => setIsObjectSelected(false)}
      />
    </Canvas>
  )
}