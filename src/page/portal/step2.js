import React, { useEffect, useRef } from "react";
import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


import firefliesVertexShader from './shaders/fireflies/vertex.js'
import firefliesFragmentShader from './shaders/fireflies/fragment.js'

import portalVertexShader from './shaders/portal/vertex.js'
import portalFragmentShader from './shaders/portal/fragment.js'

import {Loader2} from '../../util/glbLoader'

console.log(portalVertexShader)

let renderer, camera, controls;

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new GUI({
    width: 400
})

// Scene
const scene = new THREE.Scene()

const clock = new THREE.Clock()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('draco/')

// // GLTF loader
// const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('../textures/baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding
// console.log(bakedTexture);

/**
 * Materials
 */
//Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })


// Pole Light material
// const poleLightMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

// Portal Light material
debugObject.portalColorStart = '#ff4d4d'
debugObject.portalColorEnd = '#fedcfb'

gui.addColor(debugObject, 'portalColorStart').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})

gui.addColor(debugObject, 'portalColorEnd').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})
// const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
// const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})



/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(cube)

let firefliesMaterial

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
        camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
        camera.position.x = 4
        camera.position.y = 2
        camera.position.z = 4
        scene.add(camera)

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
        renderer.outputEncoding = THREE.sRGBEncoding

        debugObject.clearColor = '#201919'
        renderer.setClearColor(debugObject.clearColor)
        gui.addColor(debugObject, 'clearColor').onChange(() => {
            renderer.setClearColor(debugObject.clearColor)
        })

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

            // Update fireflies
            firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
        });
    }

    function sceneInit() {




        /**
         * Model
         */
    

        Loader2('../models/portal.glb').then((gltf) => {
            // gltf.scene.traverse((child) => {
            //     child.material = bakedMaterial;
            // })
            const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')

            const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')
            const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA')
            const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB')
            // console.log(poleLightAMesh);

            bakedMesh.material = bakedMaterial
            portalLightMesh.material = portalLightMaterial
            poleLightAMesh.material = poleLightMaterial
            poleLightBMesh.material = poleLightMaterial

            scene.add(gltf.scene)

        })


        /**
         * Fireflies
         */
        //Geometry
        const firefliesGeometry = new THREE.BufferGeometry()
        const firefliesCount = 30
        const positionArray = new Float32Array(firefliesCount * 3)
        const scaleArray = new Float32Array(firefliesCount)

        for (let i = 0; i < firefliesCount; i++) {
            positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
            positionArray[i * 3 + 1] = Math.random() * 1.5
            positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

            scaleArray[i] = Math.random()
        }

        firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
        firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

        // Material
        // const firefliesMaterial = new THREE.PointsMaterial({ size: 0.1, sizeAttenuation: true })
        firefliesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uSize: { value: 100 }
            },
            vertexShader: firefliesVertexShader,
            fragmentShader: firefliesFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')

        // Points
        const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
        scene.add(fireflies)
    }

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        // Update materials
        portalLightMaterial.uniforms.uTime.value = elapsedTime
        firefliesMaterial.uniforms.uTime.value = elapsedTime

        // Update controls
        controls.update();

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        requestAnimationFrame(tick);
    }

    return <canvas ref={canvasRef} className="webgl"></canvas>;
}
