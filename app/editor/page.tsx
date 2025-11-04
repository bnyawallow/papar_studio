'use client'

import dynamic from 'next/dynamic'

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
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Editor</h1>
      </div>
      <div className="flex-1 relative">
        {/* Transform controls positioned at top center of editor */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2 bg-white p-3 rounded-lg shadow-lg border">
            <button className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              ↔ Move
            </button>
            <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
              ⟲ Rotate
            </button>
            <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
              ⇅ Scale
            </button>
          </div>
        </div>
        <EditorScene />
      </div>
    </div>
  )
}