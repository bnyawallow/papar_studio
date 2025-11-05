'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import AssetSidebar from '@/components/AssetSidebar'
import PropertiesPanel from '@/components/PropertiesPanel'

// Dynamically import the 3D scene to avoid SSR issues
const EditorScene = dynamic(() => import('./EditorScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p>Loading 3D Editor...</p>
    </div>
  )
})

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

export default function EditorPage() {
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')
  const [draggedAsset, setDraggedAsset] = useState<AssetItem | null>(null)
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('default-plane')
  const [defaultPlane, setDefaultPlane] = useState<DefaultPlane>({
    id: 'default-plane',
    name: 'Default Plane',
    type: 'plane',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  })

  const handleAssetDrag = (asset: AssetItem) => {
    setDraggedAsset(asset)
  }

  const handleObjectSelect = (objectId: string) => {
    setSelectedObjectId(objectId)
  }

  const handleObjectUpdate = (objectId: string, updates: Partial<SceneObject>) => {
    setSceneObjects(prev =>
      prev.map(obj =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      )
    )
  }

  const handleDefaultPlaneUpdate = (updates: Partial<DefaultPlane>) => {
    setDefaultPlane(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="h-screen flex">
      <AssetSidebar
        onAssetDrag={handleAssetDrag}
        sceneObjects={sceneObjects}
        selectedObjectId={selectedObjectId}
        onObjectSelect={handleObjectSelect}
        onSceneObjectsUpdate={setSceneObjects}
        defaultPlane={defaultPlane}
      />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Editor</h1>
        </div>
        <div className="flex-1 relative">
          {/* Transform controls positioned at top center of editor */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex gap-1 bg-white p-2 rounded-md shadow-md border">
              <button
                onClick={() => setTransformMode('translate')}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  transformMode === 'translate'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ↔
              </button>
              <button
                onClick={() => setTransformMode('rotate')}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  transformMode === 'rotate'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⟲
              </button>
              <button
                onClick={() => setTransformMode('scale')}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  transformMode === 'scale'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⇅
              </button>
            </div>
          </div>
          <EditorScene
            transformMode={transformMode}
            draggedAsset={draggedAsset}
            sceneObjects={sceneObjects}
            selectedObjectId={selectedObjectId}
            onObjectSelect={handleObjectSelect}
            onSceneObjectsUpdate={setSceneObjects}
            defaultPlane={defaultPlane}
            onDefaultPlaneUpdate={handleDefaultPlaneUpdate}
          />
        </div>
      </div>
      <PropertiesPanel
        selectedObjectId={selectedObjectId}
        sceneObjects={sceneObjects}
        onObjectUpdate={handleObjectUpdate}
        defaultPlane={defaultPlane}
        onDefaultPlaneUpdate={handleDefaultPlaneUpdate}
      />
    </div>
  )
}