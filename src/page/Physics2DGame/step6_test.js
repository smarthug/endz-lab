import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./pureWorker'


let renderer, camera, controls;
// let array = new Float32Array(6);
let N = 300
let array = new Float32Array(N * 3);

const worker = new Worker();
worker.postMessage = worker.webkitPostMessage || worker.postMessage;


worker.postMessage('hi');
worker.onmessage = function ({ data }) {
    // console.log(data)
    array = data
    // 이 안에서 루프 해보기 ... 

};

let count = 0;
/**
 * Base
 */
// Debug
const gui = new GUI()
const debugObject = {}

// Scene
const scene = new THREE.Scene()

const clock = new THREE.Clock()
let oldElapsedTime = 0;

const objectsToUpdate = [];

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcap1 = textureLoader.load('/textures/matcaps/1.png')
const matcap2 = textureLoader.load('/textures/matcaps/2.png')
const matcap3 = textureLoader.load('/textures/matcaps/3.png')
const matcap4 = textureLoader.load('/textures/matcaps/4.png')
const matcap5 = textureLoader.load('/textures/matcaps/5.png')
const matcap6 = textureLoader.load('/textures/matcaps/6.png')
const matcap7 = textureLoader.load('/textures/matcaps/7.png')
const matcap8 = textureLoader.load('/textures/matcaps/8.png')

/**
 * Sizes 
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

debugObject.createBox = () => {
    // createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 5 })
}
gui.add(debugObject, 'createBox')

debugObject.test = () => {
    console.log(objectsToUpdate.length);
}
gui.add(debugObject, 'test')

debugObject.reset = () => {

    worker.postMessage({ operation: "reset" })
    for (const object of objectsToUpdate) {
        scene.remove(object)
    }
    objectsToUpdate.splice(0, objectsToUpdate.length)
    count = 0
}
gui.add(debugObject, 'reset')



export default function Main() {
    const canvasRef = useRef();
    useEffect(() => {
        baseInit();
        sceneInit();
        tick();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function pushMax(mesh) {
        let oldMesh = objectsToUpdate[count % N];
        if (oldMesh) {

            scene.remove(oldMesh);
        }
        objectsToUpdate[count % N] = mesh;

        count++;
    }

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
        // camera = new THREE.OrthographicCamera(
        //     sizes.width / - 2, sizes.width / 2, sizes.height / 2, sizes.height / - 2,
        //     0.1,
        //     100
        // );
        camera.position.y = 10
        camera.position.z = 13
        scene.add(camera);

        // Controls
        controls = new OrbitControls(camera, canvas);
        controls.target = new THREE.Vector3(0, 1, 0)
        controls.enableDamping = true;

        // Renderer

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

    function sceneInit() {
        worker.postMessage({ operation: "initWorld" })

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshMatcapMaterial({
                side: THREE.DoubleSide,
                matcap: matcap1
            })
        )
        ground.position.set(0, 1, 0)
        ground.rotation.x = -Math.PI * 0.5
        scene.add(ground)

        setInterval(() => {
            createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 10 })

        }, 1500)

        // createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 5 })

        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 2 }, true)
        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 3 }, false)
        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 4 }, true)

        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 5 }, false)
        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 6 }, true)
        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 7 }, false)
        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 8 }, true)
        // createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 9 }, false)
    }

    const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const boxMat1 = new THREE.MeshMatcapMaterial({ matcap: matcap1 })
    const boxMat2 = new THREE.MeshMatcapMaterial({ matcap: matcap2 })
    const boxMat3 = new THREE.MeshMatcapMaterial({ matcap: matcap3 })
    const boxMat4 = new THREE.MeshMatcapMaterial({ matcap: matcap4 })
    const boxMat5 = new THREE.MeshMatcapMaterial({ matcap: matcap5 })
    const boxMat6 = new THREE.MeshMatcapMaterial({ matcap: matcap6 })
    const boxMat7 = new THREE.MeshMatcapMaterial({ matcap: matcap7 })
    const boxMat8 = new THREE.MeshMatcapMaterial({ matcap: matcap8 })
    const matcapArray = [
        boxMat1,
        boxMat2,
        boxMat3,
        boxMat4,
        boxMat5,
        boxMat6,
        boxMat7,
        boxMat8,
    ]
    function createBox({ width, height, depth }, { x, y }) {

        worker.postMessage({ operation: "createBox", props: [{ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 5 }] })

        let box = new THREE.Mesh(
            boxGeo,
            matcapArray[count % 8]
        )
        box.position.set(x, y + 1, 0);
        scene.add(box)
        pushMax(box)
    }
    //{ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 7 }
    function createMovingPlatform({ width, height, depth }, { x, y }, right) {
        // instance.createMovingPlatform({ width, height, depth }, { x, y }, right).then(() => {
        //     let box = new THREE.Mesh(
        //         new THREE.BoxGeometry(width, height, depth),
        //         boxMat4
        //     )
        //     box.position.set(x, y, 0);
        //     scene.add(box)
        //     // objectsToUpdate.push
        // })
    }

    function tick() {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime
        oldElapsedTime = elapsedTime

        if (array) {

            for (let i = 0; i < objectsToUpdate.length; i++) {
                objectsToUpdate[i].position.x = array[3 * i + 0]
                objectsToUpdate[i].position.y = array[3 * i + 1]
                objectsToUpdate[i].rotation.z = array[3 * i + 2]
            }

            sendBuffer(deltaTime)
        }

        // Update controls
        controls.update();

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        requestAnimationFrame(tick);
    }

    return <canvas ref={canvasRef} className="webgl"></canvas>;
}



function sendBuffer(deltaTime) {
    worker.postMessage({ operation: "step", props: [deltaTime], array: array }, [array.buffer])
    array = null
}