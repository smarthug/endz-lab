import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import MusicPlayer from '../component/musicPlayer'


let mesh, renderer, scene, camera, controls;



// const clock = new THREE.Clock();

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};




export default function Main() {
    const canvasRef = useRef();


    useEffect(() => {
        Init(canvasRef);
        Tick()
    }, []);

    return (
        <div>
            <MusicPlayer videoId="pYnLO7MVKno" />
            <canvas ref={canvasRef} className="webgl"></canvas>
        </div>
    );
}



function Init(canvasRef) {
    //scene
    scene = new THREE.Scene();

    //Red Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
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
    // renderer.setAnimationLoop(Tick)

    //Controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

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
}

function Tick() {
    // const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    requestAnimationFrame(Tick);
}