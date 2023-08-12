import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function ModelViewer() {
  const containerRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);
  const previousMouseY = useRef(0);

  useEffect(() => {
    console.log('Initializing...');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Attach the renderer's DOM element to the container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);

    // Set up camera position
    camera.position.z = 1;

    let model = null;

    // Load a GLTF model
    const loader = new GLTFLoader();
    loader.load('/assets/models/Sarcosuchus.glb', (gltf) => {
      model = gltf.scene;

      // Set basic material for the model
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial();
        }
      });

      scene.add(model);

      console.log('Model loaded:', model); // Log the loaded model for debugging
    }, undefined, (error) => {
      console.error('Error loading GLTF model:', error);
    });

    // Function to handle mouse down event
    function onMouseDown(event) {
      isDragging.current = true;
      previousMouseX.current = event.clientX;
      previousMouseY.current = event.clientY;
    }

    // Function to handle mouse up event
    function onMouseUp() {
      isDragging.current = false;
    }

    // Function to handle mouse move event
    function onMouseMove(event) {
      if (!isDragging.current) return;

      const deltaX = event.clientX - previousMouseX.current;
      const deltaY = event.clientY - previousMouseY.current;

      if (model) {
        // Adjust model's rotation based on mouse movement
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
      }

      previousMouseX.current = event.clientX;
      previousMouseY.current = event.clientY;
    }

    // Add event listeners for mouse interaction
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Render the scene with the camera
      renderer.render(scene, camera);
    }

    // Start the animation loop
    animate();

    // Cleanup function
    return () => {
      console.log('Cleaning up...');
      // Remove event listeners and dispose of resources
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  console.log('Rendering component...');
  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

export default ModelViewer;
