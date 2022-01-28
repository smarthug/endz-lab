import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import MusicPlayer from '../component/musicPlayer'

let renderer, camera, controls;

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 360 })
gui.close()

// Scene
const scene = new THREE.Scene()

const clock = new THREE.Clock()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
// const particleTexture = textureLoader.load('/textures/particles/1.png')
const particleTexture = textureLoader.load('/textures/particles/1.png')

const background = new THREE.CubeTextureLoader()
    .setPath("textures/cubeMaps/MilkyWay/")
    .load([
        "dark-s_px.jpg",
        "dark-s_nx.jpg",
        "dark-s_py.jpg",
        "dark-s_ny.jpg",
        "dark-s_pz.jpg",
        "dark-s_nz.jpg",
    ]);

scene.background = background;

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let geometry = null
let material = null
let points = null




const generateGalaxy = () => {

    // Destroy old galaxy
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)



    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        // if (i < 20) {
        //     console.log(i, branchAngle)
        // }

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        //Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    // 방향 벡터의 개념인건가 ...

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent: true,
        alphaMap: particleTexture
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)

}



// scene.add(new THREE.AxesHelper(5))

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
        camera = new THREE.PerspectiveCamera(
            75,
            sizes.width / sizes.height,
            0.1,
            100
        );
        camera.position.x = 3
        camera.position.y = 3
        camera.position.z = 3
        scene.add(camera);

        // Controls
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;

        // Renderer

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
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

        generateGalaxy()

        gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
        gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
        gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
        gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
        gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
        gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
        gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
        gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
        gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
    }

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        points.rotation.y = elapsedTime * 0.2

        // Update controls
        controls.update();

        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        requestAnimationFrame(tick);
    }

    return (<div>
        <MusicPlayer videoId="ECK-mJnOetM" />
        <canvas ref={canvasRef} className="webgl"></canvas>
    </div>);
}
