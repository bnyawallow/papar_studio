'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Html, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { Mesh, TextureLoader, Texture } from 'three'

function Scene({ onPointerMissed, isObjectSelected, setIsObjectSelected, transformMode }: {
  onPointerMissed?: () => void
  isObjectSelected: boolean
  setIsObjectSelected: (selected: boolean) => void
  transformMode: 'translate' | 'rotate' | 'scale'
}) {
  const meshRef = useRef<Mesh>(null!)
  const [texture, setTexture] = useState<Texture | null>(null)
  const [orbitEnabled, setOrbitEnabled] = useState(true)

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      const loader = new TextureLoader()
      loader.load(url, (newTexture) => {
        setTexture(newTexture)
      })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleObjectClick = () => {
    setIsObjectSelected(true)
  }

  const handlePointerMissed = () => {
    setIsObjectSelected(false)
    onPointerMissed?.()
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
      {/* Textured plane */}
      {isObjectSelected ? (
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
        >
          <mesh
            ref={meshRef}
            onClick={handleObjectClick}
          >
            <planeGeometry args={[5, 5]} />
            <meshBasicMaterial map={texture} />
          </mesh>
        </TransformControls>
      ) : (
        <mesh
          ref={meshRef}
          onClick={handleObjectClick}
        >
          <planeGeometry args={[5, 5]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}
      {/* Blender-style outline highlight */}
      {isObjectSelected && (
        <group>
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
      <Html
        position={[0, 0, 0]}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          padding: '16px',
          border: '2px dashed #9ca3af',
          borderRadius: '8px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          pointerEvents: 'auto'
        }}
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ width: '100%', height: '100%' }}
        >
          Drop an image here to update the texture
        </div>
      </Html>
    </>
  )
}

export default function EditorScene({ transformMode }: { transformMode: 'translate' | 'rotate' | 'scale' }) {
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
        onPointerMissed={() => setIsObjectSelected(false)}
      />
    </Canvas>
  )
}