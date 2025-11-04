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
        <EditorScene />
      </div>
    </div>
  )
}