import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';

function ChairModel(props) {
  const { scene } = useGLTF('/models/chair.glb'); // Adjust the path to your chair.glb file
  return <primitive object={scene} {...props} />;
}

function ModelViewer() {
  return (
    <Canvas style={{ width: '600px', height: '400px' }} camera={{ position: [0, 2, 10], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <ChairModel position={[0, -1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]} /> {/* Adjust the scale */}
      <Environment preset="city" />
      <OrbitControls minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.5} />
    </Canvas>
  );
}

export default ModelViewer;
