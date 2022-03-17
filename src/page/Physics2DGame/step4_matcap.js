import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import p2 from 'p2-es'

// eslint-disable-next-line import/no-webpack-loader-syntax
import worker from 'workerize-loader!./worker'

let instance = worker()  // `new` is optional

// instance.expensive(1000).then( count => {
//     console.log(`Ran ${count} loops`)
// })

let renderer, camera, controls;
// let array = new Float32Array(6);
let array = [];
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
console.log(matcap1)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}




const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshMatcapMaterial({
        side: THREE.DoubleSide,
        matcap: matcap1
    })
)
ground.rotation.x = -Math.PI * 0.5
scene.add(ground)

//material
const boxMaterial = new p2.Material()


debugObject.createBox = () => {
    // createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 5 })
}
gui.add(debugObject, 'createBox')

debugObject.test = () => {
    console.log(objectsToUpdate.length);
}
gui.add(debugObject, 'test')

// debugObject.reset = () => {
//     for (const object of objectsToUpdate) {
//         // Remove
//         instance.removeBody(object.body)

//         // Remove mesh
//         scene.remove(object.mesh)


//     }
//     objectsToUpdate.splice(0, objectsToUpdate.length)
// }
// gui.add(debugObject, 'reset')

debugObject.reset = () => {
    instance.reset();
    for (const object of objectsToUpdate) {
        // Remove



        // Remove mesh
        scene.remove(object)


    }
    objectsToUpdate.splice(0, objectsToUpdate.length)
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

        // instance.initWorld(array);
        instance.initWorld();


        //

        // objectsToUpdate.push({
        //     mesh: box,
        //     body: boxBody
        // })

        // objectsToUpdate.push(ground)

        setInterval(() => {
            createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 10 })
            // console.log(objectsToUpdate)
        }, 1500)


        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 2 }, true)
        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 3 }, false)
        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 4 }, true)

        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 5 }, false)
        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 6 }, true)
        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 7 }, false)
        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: -1, y: 8 }, true)
        createMovingPlatform({ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 9 }, false)
    }

    // const boxGeo = new THREE.BoxGeometry(width, height, depth)
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
        instance.createBox({ width, height, depth }, { x, y }).then(() => {

            let box = new THREE.Mesh(
                boxGeo,
                matcapArray[objectsToUpdate.length%8]
            )
            box.position.set(x, y, 0);
            scene.add(box)
            objectsToUpdate.push(box)
        });
    }
    //{ width: 3, height: 0.2, depth: 1 }, { x: 1, y: 7 }
    function createMovingPlatform({ width, height, depth }, { x, y }, right) {
        instance.createMovingPlatform({ width, height, depth }, { x, y }, right).then(() => {
            let box = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                boxMat4
            )
            box.position.set(x, y, 0);
            scene.add(box)
            // objectsToUpdate.push
        })
    }

    function tick() {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime
        oldElapsedTime = elapsedTime

        // Update physics world
        // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

        // world.step(1 / 60, deltaTime, 3)

        // instance.tick(deltaTime).then((result) => {
        //     // console.log(result);

        //     // for (const object of objectsToUpdate) {

        //     //     object.position.set(object.interpolatedPosition[0], object.interpolatedPosition[1], 0)
        //     //     object.rotation.z = object.interpolatedAngle

        //     // }

        //     for (let i = 0; i < objectsToUpdate.length; i++) {
        //         objectsToUpdate[i].position.x = result[3 * i + 0]
        //         objectsToUpdate[i].position.y = result[3 * i + 1]
        //         objectsToUpdate[i].rotation.z = result[3 * i + 2]
        //     }
        // })



        instance.tick(deltaTime).then(array => {

            for (let i = 0; i < objectsToUpdate.length; i++) {
                objectsToUpdate[i].position.x = array[3 * i + 0]
                objectsToUpdate[i].position.y = array[3 * i + 1]
                objectsToUpdate[i].rotation.z = array[3 * i + 2]
            }
        })



        // console.log(array)

        // Update controls
        controls.update();

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        requestAnimationFrame(tick);
    }

    return <canvas ref={canvasRef} className="webgl"></canvas>;
}
