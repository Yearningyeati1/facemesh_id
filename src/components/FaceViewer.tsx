import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

interface FaceViewerProps {
  objData?: string; // Raw OBJ string
  objUrl?: string; // URL to OBJ file
}

const MeshComponent: React.FC<{ objData?: string; objUrl?: string }> = ({ objData, objUrl }) => {
  const obj = useMemo(() => {
    const loader = new OBJLoader();
    if (objData) {
        try {
            return loader.parse(objData);
        } catch(e) {
            console.error("Failed to parse OBJ data", e);
            return null;
        }
    }
    return null;
  }, [objData]);

  const fetchedObj = useLoader(OBJLoader, objUrl || '', (loader) => {
     if (!objUrl) return; // Don't load if no URL
  });

  const model = objData ? obj : (objUrl ? fetchedObj : null);

  if (!model) return null;

  // Apply a standard material to all children
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={model} />;
};

const FaceViewer: React.FC<FaceViewerProps> = ({ objData, objUrl }) => {
  // If neither is provided, show placeholder
  if (!objData && !objUrl) {
      return (
          <div className="w-full h-96 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center text-slate-500">
              <div className="text-center">
                  <i className="fa-solid fa-cube text-4xl mb-2"></i>
                  <p>No mesh data loaded</p>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
                 <Center>
                    <MeshComponent objData={objData} objUrl={objUrl} />
                 </Center>
            </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
};

export default FaceViewer;