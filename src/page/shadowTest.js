import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

let mesh, renderer, scene, camera, controls;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg')
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg')
console.log(simpleShadow)

const clock = new THREE.Clock();

//scene
scene = new THREE.Scene();

/**
 * Debug
 */
const gui = new GUI({ closed: true });

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};



/**
 * Camera
 */
// Base camera
// camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
// camera.position.x = 1;
// camera.position.y = 1;
// camera.position.z = 2;
// scene.add(camera);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);
scene.add(directionalLight);

directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.width = 1024 * 64
// directionalLight.shadow.mapSize.height = 1024 * 64
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
// directionalLight.shadow.radius = 10

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
scene.add(directionalLightCameraHelper);
directionalLightCameraHelper.visible = false

// Spot light
const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3)

spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 0.3)

pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5

pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)



/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.castShadow = true;

// const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5),
//   new THREE.MeshBasicMaterial({
//     map: bakedShadow
//   })
// );
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5),
  material
);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;
plane.receiveShadow = true;

// scene.add(sphere, plane);
scene.add(sphere);

  // grass
  let grassGeometry = new THREE.CircleGeometry(7, 8)
  let grassMaterial = new THREE.MeshStandardMaterial({ color: 'green' })
  let grass = new THREE.Mesh(grassGeometry, grassMaterial)
  grass.rotation.x = -Math.PI * 0.5
  grass.position.y = -0.5
  grass.receiveShadow = true
  grassMaterial.roughness = 0.7
  scene.add(grass)

// const sphereShadow = new THREE.Mesh(
//   new THREE.PlaneGeometry(1.5, 1.5),
//   new THREE.MeshBasicMaterial({
//     color: 0x000000,
//     transparent: true,
//     alphaMap: simpleShadow
//   })
// )
// sphereShadow.rotation.x = - Math.PI * 0.5
// sphereShadow.position.y = plane.position.y + 0.01

// scene.add(sphereShadow)


export default function Main() {
  const canvasRef = useRef();
  useEffect(() => {
    baseInit();
    sceneInit();
    tick();
  }, []);

  function baseInit() {
    const canvas = canvasRef.current;

    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 2;
    scene.add(camera);

    // Controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    // Renderer

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      // antialias:true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    window.addEventListener("resize", () => {
      // console.log("window has been resized")
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      //Update camera
      console.log(camera)
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      //Update Renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  function sceneInit() { }

  function tick() {
    const elapsedTime = clock.getElapsedTime();
    
 

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    requestAnimationFrame(tick);
  }

  return <canvas ref={canvasRef} className="webgl"></canvas>;
}
