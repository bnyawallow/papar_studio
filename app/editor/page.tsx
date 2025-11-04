'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamically import the 3D scene to avoid SSR issues
const EditorScene = dynamic(() => import('./EditorScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p>Loading 3D Editor...</p>
    </div>
  )
})

export default function EditorPage() {
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')

  return (
    <div className="h-screen flex flex-col">
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
        <EditorScene transformMode={transformMode} />
      </div>
    </div>
  )
}