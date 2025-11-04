'use client';

import { useEffect, useRef } from 'react';

interface Asset {
  type: 'gltf' | 'video' | 'text';
  url?: string;
  content?: string;
  position?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

interface ProjectData {
  target?: string; // URL to .mind file
  assets?: Asset[];
}

interface ARViewerProps {
  projectData: ProjectData;
}

export default function ARViewer({ projectData }: ARViewerProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !projectData.target) return;

    // Load MindAR.js and A-Frame scripts dynamically
    const loadScripts = async () => {
      if (!document.querySelector('script[src*="mindar"]')) {
        const mindarScript = document.createElement('script');
        mindarScript.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js';
        document.head.appendChild(mindarScript);
        await new Promise(resolve => mindarScript.onload = resolve);
      }

      if (!document.querySelector('script[src*="aframe"]')) {
        const aframeScript = document.createElement('script');
        aframeScript.src = 'https://aframe.io/releases/1.5.0/aframe.min.js';
        document.head.appendChild(aframeScript);
        await new Promise(resolve => aframeScript.onload = resolve);
      }

      // Initialize MindAR scene
      const scene = document.createElement('a-scene');
      scene.setAttribute('mindar-image', `imageTargetSrc: ${projectData.target};`);
      scene.setAttribute('embedded', '');
      scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');

      // Add camera
      const camera = document.createElement('a-camera');
      camera.setAttribute('position', '0 0 0');
      camera.setAttribute('look-controls', 'enabled: false');
      scene.appendChild(camera);

      // Add assets
      if (projectData.assets) {
        projectData.assets.forEach((asset, index) => {
          const entity = document.createElement('a-entity');

          if (asset.position) {
            entity.setAttribute('position', `${asset.position.x} ${asset.position.y} ${asset.position.z}`);
          }
          if (asset.scale) {
            entity.setAttribute('scale', `${asset.scale.x} ${asset.scale.y} ${asset.scale.z}`);
          }
          if (asset.rotation) {
            entity.setAttribute('rotation', `${asset.rotation.x} ${asset.rotation.y} ${asset.rotation.z}`);
          }

          entity.setAttribute('mindar-image-target', `targetIndex: ${index};`);

          switch (asset.type) {
            case 'gltf':
              if (asset.url) {
                entity.setAttribute('gltf-model', asset.url);
              }
              break;
            case 'video':
              if (asset.url) {
                const video = document.createElement('a-video');
                video.setAttribute('src', asset.url);
                video.setAttribute('autoplay', '');
                video.setAttribute('loop', '');
                entity.appendChild(video);
              }
              break;
            case 'text':
              if (asset.content) {
                const text = document.createElement('a-text');
                text.setAttribute('value', asset.content);
                text.setAttribute('color', 'white');
                text.setAttribute('align', 'center');
                entity.appendChild(text);
              }
              break;
          }

          scene.appendChild(entity);
        });
      }

      if (sceneRef.current) {
        sceneRef.current.appendChild(scene);
      }
    };

    loadScripts();

    return () => {
      if (sceneRef.current) {
        sceneRef.current.innerHTML = '';
      }
    };
  }, [projectData]);

  return (
    <div className="w-full h-screen relative">
      <div ref={sceneRef} className="w-full h-full"></div>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
        <p>Point your camera at the target image to see AR content</p>
        <p className="text-sm mt-2">Mobile-friendly AR experience</p>
      </div>
    </div>
  );
}