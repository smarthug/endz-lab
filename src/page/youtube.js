import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import IconButton from "@mui/material/IconButton";
import VolumeOff from "@mui/icons-material/VolumeOff";
import VolumeUp from "@mui/icons-material/VolumeUp";

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
  const iframeRef = useRef();
  const [sound, setSound] = useState(true);

  useEffect(() => {
    console.log("useEffect called");
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

  function play() {
    // var audio = new Audio("video/dragonballz.mp3");
    // audio.play();

    // document.querySelector(".ytp-cued-thumbnail-overlay-image").click();
    //ytp-cued-thumbnail-overlay-image
    // document.querySelector(".ytp-cued-thumbnail-overlay-image").click()

    // var click_event = new MouseEvent("click");

    // console.log(click_event)

    // document.dispatchEvent(click_event);

    if (iframeRef.current.style.visibility === "hidden") {
      iframeRef.current.style.visibility = "visible";
    } else {
      iframeRef.current.style.visibility = "hidden";
    }

    setSound(!sound);
  }

  function Init() {
    //scene
    scene = new THREE.Scene();

    //Red Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const material = new THREE.MeshNormalMaterial();
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
      antialias: true,
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

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <IconButton
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 999,
        }}
        onClick={play}
      >
        {sound ? (
          <VolumeOff color="primary" fontSize="large" />
        ) : (
          <VolumeUp color="primary" fontSize="large" />
        )}
      </IconButton>
      <iframe
        ref={iframeRef}
        className="yt-iframe"
        width="560"
        height="315"
        src="https://www.youtube.com/embed/pYnLO7MVKno"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          zIndex: 999,
        }}
      ></iframe>
      {/* <button onClick={play}>Play</button> */}
      <canvas ref={canvasRef} className="webgl"></canvas>
    </div>
  );
}

{
  /* <iframe
        width="420"
        height="315"
        src="https://www.youtube.com/embed/tgbNymZ7vqY"
      ></iframe> */
}

// https://www.youtube.com/watch?v=pYnLO7MVKno&t=108s
