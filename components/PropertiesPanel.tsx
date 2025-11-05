'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AssetItem {
  id: string
  name: string
  type: '3d' | 'video' | 'text'
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
}

interface DefaultPlane {
  id: string
  name: string
  type: 'plane'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

interface PropertiesPanelProps {
  selectedObjectId: string | null
  sceneObjects: SceneObject[]
  onObjectUpdate: (objectId: string, updates: Partial<SceneObject>) => void
  defaultPlane: DefaultPlane
  onDefaultPlaneUpdate: (updates: Partial<DefaultPlane>) => void
}

export default function PropertiesPanel({ selectedObjectId, sceneObjects, onObjectUpdate, defaultPlane, onDefaultPlaneUpdate }: PropertiesPanelProps) {
  const selectedObject = sceneObjects.find(obj => obj.id === selectedObjectId)
  const isDefaultPlaneSelected = selectedObjectId === defaultPlane.id

  if (!selectedObject && !isDefaultPlaneSelected) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex items-center justify-center mx-2">
        <p className="text-gray-500">Select an object to view properties</p>
      </div>
    )
  }

  const currentObject = selectedObject || defaultPlane

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0
    const newPosition = [...currentObject.position] as [number, number, number]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newPosition[axisIndex] = numValue
    if (isDefaultPlaneSelected) {
      onDefaultPlaneUpdate({ position: newPosition })
    } else if (selectedObject) {
      onObjectUpdate(selectedObject.id, { position: newPosition })
    }
  }

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0
    const newRotation = [...currentObject.rotation] as [number, number, number]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newRotation[axisIndex] = numValue
    if (isDefaultPlaneSelected) {
      onDefaultPlaneUpdate({ rotation: newRotation })
    } else if (selectedObject) {
      onObjectUpdate(selectedObject.id, { rotation: newRotation })
    }
  }

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0
    const newScale = [...currentObject.scale] as [number, number, number]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newScale[axisIndex] = numValue
    if (isDefaultPlaneSelected) {
      onDefaultPlaneUpdate({ scale: newScale })
    } else if (selectedObject) {
      onObjectUpdate(selectedObject.id, { scale: newScale })
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto mx-2">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">
              {isDefaultPlaneSelected ? defaultPlane.name : selectedObject?.asset.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Transform Properties */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Position</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentObject.position[0].toFixed(2)}
                    onChange={(e) => handlePositionChange('x', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentObject.position[1].toFixed(2)}
                    onChange={(e) => handlePositionChange('y', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Z</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentObject.position[2].toFixed(2)}
                    onChange={(e) => handlePositionChange('z', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Rotation</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">X</Label>
                  <Input
                    type="number"
                    step="1"
                    value={currentObject.rotation[0].toFixed(1)}
                    onChange={(e) => handleRotationChange('x', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Y</Label>
                  <Input
                    type="number"
                    step="1"
                    value={currentObject.rotation[1].toFixed(1)}
                    onChange={(e) => handleRotationChange('y', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Z</Label>
                  <Input
                    type="number"
                    step="1"
                    value={currentObject.rotation[2].toFixed(1)}
                    onChange={(e) => handleRotationChange('z', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Scale</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentObject.scale[0].toFixed(2)}
                    onChange={(e) => handleScaleChange('x', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentObject.scale[1].toFixed(2)}
                    onChange={(e) => handleScaleChange('y', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Z</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentObject.scale[2].toFixed(2)}
                    onChange={(e) => handleScaleChange('z', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Video-specific properties */}
            {selectedObject && selectedObject.asset.type === 'video' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Loop</Label>
                  <Switch
                    checked={selectedObject.videoLoop || false}
                    onCheckedChange={(checked) =>
                      onObjectUpdate(selectedObject.id, { videoLoop: checked })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Chroma Key</Label>
                  <Input
                    type="color"
                    value={selectedObject.chromaKey || '#00ff00'}
                    onChange={(e) =>
                      onObjectUpdate(selectedObject.id, { chromaKey: e.target.value })
                    }
                    className="h-8 w-full"
                  />
                </div>
              </div>
            )}

            {/* Image-specific properties */}
            {selectedObject && selectedObject.asset.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Opacity</Label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedObject.imageOpacity || 1.0}
                    onChange={(e) =>
                      onObjectUpdate(selectedObject.id, { imageOpacity: parseFloat(e.target.value) })
                    }
                    className="h-8 w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedObject.imageOpacity || 1.0) * 100}%
                  </div>
                </div>
              </div>
            )}

            {/* Text-specific properties */}
            {selectedObject && selectedObject.asset.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Text Color</Label>
                  <Input
                    type="color"
                    value={selectedObject.textColor || '#000000'}
                    onChange={(e) =>
                      onObjectUpdate(selectedObject.id, { textColor: e.target.value })
                    }
                    className="h-8 w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Font</Label>
                  <Select
                    value={selectedObject.textFont || 'Arial'}
                    onValueChange={(value) =>
                      onObjectUpdate(selectedObject.id, { textFont: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}