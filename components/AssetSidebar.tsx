'use client'

import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Plus, Upload, Video, Type, Image, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface AssetSidebarProps {
  onAssetDrag: (asset: AssetItem) => void
  sceneObjects: SceneObject[]
  selectedObjectId: string | null
  onObjectSelect: (objectId: string) => void
  onSceneObjectsUpdate: (objects: SceneObject[]) => void
  defaultPlane: DefaultPlane
}

export default function AssetSidebar({ onAssetDrag, sceneObjects, selectedObjectId, onObjectSelect, onSceneObjectsUpdate, defaultPlane }: AssetSidebarProps) {
  const [assets, setAssets] = useState<AssetItem[]>([])

  const handleFileUpload = async (type: '3d' | 'video' | 'text' | 'image', file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `assets/${fileName}`

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file)

      if (error) {
        console.error('Error uploading file:', error)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath)

      const newAsset: AssetItem = {
        id: `${type}-${Date.now()}`,
        name: file.name,
        type,
        url: publicUrl
      }
      setAssets(prev => [...prev, newAsset])
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleDragStart = (asset: AssetItem) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset))
    setDraggedAsset(asset)
    onAssetDrag(asset)
  }

  const [draggedAsset, setDraggedAsset] = useState<AssetItem | null>(null)

  const handleAssetDrop = useState(() => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (draggedAsset) {
      const timestamp = Date.now()
      const newObject: SceneObject = {
        id: `${draggedAsset.id}-${timestamp}`,
        asset: draggedAsset,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        videoLoop: false,
        chromaKey: '#00ff00',
        textColor: '#000000',
        textFont: 'Arial',
        imageOpacity: 1.0
      }

      onSceneObjectsUpdate([...sceneObjects, newObject])
      setDraggedAsset(null)
    }
  })[0]

  const handleAssetDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col mx-2">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Scene</h2>

          {/* Scene Hierarchy */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Hierarchy</h3>
            <div className="space-y-1">
              {/* Default Plane */}
              <div
                onClick={() => onObjectSelect(defaultPlane.id)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedObjectId === defaultPlane.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{defaultPlane.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{defaultPlane.type}</div>
                </div>
              </div>

              {/* Scene Objects */}
              {sceneObjects.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => onObjectSelect(obj.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedObjectId === obj.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{obj.asset.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{obj.asset.type}</div>
                  </div>
                </div>
              ))}
              {sceneObjects.length === 0 && (
                <div className="text-sm text-gray-500 italic p-2 ml-5">No additional objects</div>
              )}
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Assets</h2>
          <Accordion type="multiple" className="w-full">
          <AccordionItem value="3d">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                3D
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload GLTF</span>
                  <input
                    type="file"
                    accept=".gltf,.glb"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('3d', file)
                    }}
                  />
                </label>
                {assets.filter(asset => asset.type === '3d').map(asset => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={handleDragStart(asset)}
                    className="p-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium">{asset.name}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="video">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('video', file)
                    }}
                  />
                </label>
                {assets.filter(asset => asset.type === 'video').map(asset => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={handleDragStart(asset)}
                    className="p-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium">{asset.name}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="image">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload('image', file)
                    }}
                  />
                </label>
                {assets.filter(asset => asset.type === 'image').map(asset => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={handleDragStart(asset)}
                    className="p-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium">{asset.name}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="text">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const newAsset: AssetItem = {
                      id: `text-${Date.now()}`,
                      name: 'New Text',
                      type: 'text'
                    }
                    setAssets(prev => [...prev, newAsset])
                  }}
                  className="w-full flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Text</span>
                </button>
                {assets.filter(asset => asset.type === 'text').map(asset => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={handleDragStart(asset)}
                    className="p-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-sm font-medium">{asset.name}</div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>
      </div>

      {/* Drag objects scene box at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div
          className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onDrop={handleAssetDrop}
          onDragOver={handleAssetDragOver}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm font-medium mb-1">Drop Zone</div>
            <div className="text-xs">Drag assets here</div>
          </div>
        </div>
      </div>
    </div>
  )
}