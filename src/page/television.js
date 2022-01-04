import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let mesh, renderer, scene, camera, controls;

const clock = new THREE.Clock();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Cursor
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

export default function Main() {
  const canvasRef = useRef();
  useEffect(() => {
      console.log("useEffect called")
    Init();
    tick();

    window.addEventListener("dblclick", () => {
      const fullscreenElement =
        document.fullscreenElement || document.webkitFullscreenElement;

      if (!fullscreenElement) {
        if (canvasRef.current.requestFullscreen) {
          canvasRef.current.requestFullscreen();
        } else if (canvasRef.current.webkitRequestFullscreen) {
          canvasRef.current.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });

    window.addEventListener("resize", () => {
      // console.log("window has been resized")
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      //Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      //Update Renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }, []);

  function Init() {
    //scene
    scene = new THREE.Scene();

    //Red Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    // const aspectRatio = sizes.width / sizes.height
    // console.log(aspectRatio)
    // camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1 , -1 , 0.1, 100)

    // camera.position.x = 2;
    // camera.position.y = 2;
    camera.position.z = 3;
    camera.lookAt(mesh.position);
    scene.add(camera);

    // Renderer
    const canvas = canvasRef.current;
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //Controls
    controls = new OrbitControls(camera, canvas);
    // controls.enabled = false
    // controls.target.y = 1;
    // controls.update()
    controls.enableDamping = true;
  }

  function tick() {
    const elapsedTime = clock.getElapsedTime();
    // mesh.rotation.y = elapsedTime;

    // Update camera
    // camera.position.x = cursor.x * 10
    // camera.position.y = cursor.y * 10
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    // camera.position.y = cursor.y * 5
    // camera.lookAt(mesh.position)

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    requestAnimationFrame(tick);
  }

  return <canvas ref={canvasRef} className="webgl"></canvas>;
}
