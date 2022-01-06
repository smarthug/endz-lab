import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

// import { resizer, SceneSetUp } from '../Utils/utils'
import GUI from 'lil-gui'

const gui = new GUI();

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  useEffect(() => {
    Init();
    SceneInit();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.xr.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.setFramebufferScaleFactor(2.0);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    camera.position.z = 5;

    cameraControls = new CameraControls(camera, renderer.domElement);

    vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

    renderer.setAnimationLoop(Animate);

    // window.addEventListener("resize", () => resizer(camera, renderer));

    // SceneSetUp(scene)
  }

  function SceneInit() {
    let axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshNormalMaterial();
    const torusKnot = new THREE.Mesh(geometry, material);
    torusKnot.scale.set(0.1,0.1,0.1)  
    // torusKnot.rotation.set(Math.PI/8,0,0)
    // torusKnot.rotation.set(0,Math.PI/8,0)
    // torusKnot.rotation.set(0,0,Math.PI/8)
    gui.add(torusKnot.rotation , 'x').min(-Math.PI*2).max(Math.PI*2).step(0.001)
    gui.add(torusKnot.rotation , 'y').min(-Math.PI*2).max(Math.PI*2).step(0.001)
    gui.add(torusKnot.rotation , 'z').min(-Math.PI*2).max(Math.PI*2).step(0.001)
    
    

    scene.add(torusKnot);
  }

  function Animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    renderer.render(scene, camera);
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
      }}
      ref={containerRef}
    >
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}
