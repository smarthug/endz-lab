import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
// import { install } from "@github/hotkey";
import {useHotkey} from 'use-github-hotkey'

CameraControls.install({ THREE: THREE });

let water, sun;
let waterGroup;
let cameraRig = new THREE.Group();
let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();

//   const teleportBtnRef = useRef();
//   const waterToggleBtnRef = useRef();

  const setTeleportHotkey = useHotkey("t")
  const setWaterToggleHotkey = useHotkey("w")

  useEffect(() => {
    Init();
    waterInit();
    // install(teleportBtnRef.current, "t");
    // install(waterToggleBtnRef.current, "w");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    camera.position.y = 35;
    camera.position.z = 35;
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current
    });
    renderer.xr.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.xr.setFramebufferScaleFactor(2.0);
    renderer.setAnimationLoop(Animate);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cameraControls = new CameraControls(camera, renderer.domElement);

    vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

    cameraRig.add(camera);

    scene.add(cameraRig);
  }

  function waterInit() {
    sun = new THREE.Vector3();

    // Water
    waterGroup = new THREE.Group();
    waterGroup.name = "water";

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);

    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "textures/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      // sunDirection: new THREE.Vector3(),
      sunDirection: new THREE.Vector3(100, 100, 100),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    });
    //0x7F7F7F
    water.rotation.x = -Math.PI / 2;

    waterGroup.add(water);
    scene.add(waterGroup);

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
      elevation: 2,
      azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      sky.material.uniforms["sunPosition"].value.copy(sun);
      water.material.uniforms["sunDirection"].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;
    }

    updateSun();
  }

  function Animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    cameraControls.update(delta);

    water.material.uniforms["time"].value += delta;

    renderer.render(scene, camera);
  }

  function teleport() {
    cameraRig.position.add(new THREE.Vector3(10, 10, 10));

    console.log(`camera.matrix : ${cameraRig.children[0].matrix.elements}`);
    console.log(
      `camera.matrixWorld : ${cameraRig.children[0].matrixWorld.elements}`
    );
  }

  function waterToggle() {
    if (scene.getObjectByName("water") === undefined) {
      scene.add(waterGroup);
    } else {
      scene.remove(waterGroup);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden"
      }}
      ref={containerRef}
    >
      <div style={{ position: "absolute" }}>
        <button ref={setTeleportHotkey} onClick={teleport}>
          Press 't' to teleport
        </button>
        <button ref={setWaterToggleHotkey} onClick={waterToggle}>
          Press 'w' to Add/Remove the water in the scene
        </button>
      </div>
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}
