import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import MusicPlayer from '../component/musicPlayer'
import glbLoader from '../util/glbLoader'
import GUI from 'lil-gui'
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
// console.log(GUI)

let mesh, renderer, camera, controls;



//scene
const scene = new THREE.Scene();

// const clock = new THREE.Clock();

const cubeTextureLoader = new THREE.CubeTextureLoader()
// cubeTextureLoader.setPath('textures/cubeMaps/sky/')
// scene.background = cubeTextureLoader.setPath('textures/cubeMaps/sky/').load([
//     'px.png',
//     'nx.png',
//     'py.png',
//     'ny.png',
//     'pz.png',
//     'nz.png'
// ])

// scene.background = cubeTextureLoader.setPath('textures/cubeMaps/toonSky/').load([
//     'px.png',
//     'nx.png',
//     'py.png',
//     'ny.png',
//     'pz.png',
//     'nz.png'
// ])

scene.background = cubeTextureLoader.setPath('textures/cubeMaps/toonSky/').load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png'
])


// scene.background = cubeTextureLoader.load([
//     'px.png',
//     'nx.png',
//     'py.png',
//     'ny.png',
//     'pz.png',
//     'nz.png'
// ])
console.log("wtf")
// console.log(background)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

let water, sun;
// let waterBody
let waterGroup


export default function Main() {
    const canvasRef = useRef();


    useEffect(() => {
        Init(canvasRef);
        SceneInit()
        Tick()
    }, []);

    return (
        <div>
            <MusicPlayer videoId="pYnLO7MVKno" />
            <canvas ref={canvasRef} className="webgl"></canvas>
        </div>
    );
}


function SceneInit() {
    // load kamehouse glb
    glbLoader('/models/kameHouse.glb').then((glb) => {
        // 1cm 단위로 작업했나봄 ,
        // 1cm => 1m
        glb.scale.set(0.01, 0.01, 0.01)
        glb.position.set(0, 2.45, 0)
        glb.castShadow = true
        glb.receiveShadow = true
        console.log(glb)
        recursiveShadowToggle(glb)
        scene.add(glb)
    })

    glbLoader('/models/ground.glb').then((glb) => {
        // 1cm 단위로 작업했나봄 ,
        // 1cm => 1m
        glb.scale.set(10, 10, 10)
        glb.position.set(0, 0.01, 0)
        glb.receiveShadow = true
        recursiveShadowToggle(glb)
        scene.add(glb)
    })

    glbLoader('/models/palm.glb').then((glb) => {
        // 1cm 단위로 작업했나봄 ,
        // 1cm => 1m
        glb.scale.set(3, 3, 3)
        glb.position.set(4, 2.4, 0)
        // glb.receiveShadow = true
        recursiveShadowToggle(glb)
        scene.add(glb)

        const secondPalm = glb.clone()

        secondPalm.position.set(-4, 2.2, 4)
        secondPalm.rotation.y = Math.PI
        scene.add(secondPalm)

        const thirdPalm = glb.clone()

        thirdPalm.position.set(-4, 2.0, -4)
        thirdPalm.rotation.y = Math.PI / 2
        scene.add(thirdPalm)
    })

    // grass
    let grassGeometry = new THREE.CircleGeometry(7, 8)
    let grassMaterial = new THREE.MeshStandardMaterial({ color: 'green' })
    let grass = new THREE.Mesh(grassGeometry, grassMaterial)
    grass.rotation.x = -Math.PI * 0.5
    grass.position.y = 2.46
    grass.receiveShadow = true
    grassMaterial.roughness = 0.7
    scene.add(grass)

    const gui = new GUI();
    gui.close()

    // light setup 
    let ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    gui.addColor(ambientLight, 'color')
    gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
    scene.add(ambientLight)

    let directionalLight = new THREE.DirectionalLight('#ffffff', 0.5)
    gui.addColor(directionalLight, 'color')
    gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
    gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
    gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
    gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
    directionalLight.castShadow = true
    directionalLight.shadow.normalBias = 0.11
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 60;
    // directionalLight.shadow.radius = 10

    const directionalLightCameraHelper = new THREE.CameraHelper(
        directionalLight.shadow.camera
    );
    scene.add(directionalLightCameraHelper);
    directionalLightCameraHelper.visible = false

    //hemisphere Light ...

    const hemisphereLight = new THREE.HemisphereLight(0xf7b1b1, 0x2be228, 0.3);
    scene.add(hemisphereLight);
    let hemisphereLightFolder = gui.addFolder("hemisphereLight");
    hemisphereLightFolder.addColor(hemisphereLight, "color").name("skyColor");
    hemisphereLightFolder.addColor(hemisphereLight, "groundColor");
    hemisphereLightFolder
        .add(hemisphereLight, "intensity")
        .min(0)
        .max(1)
        .step(0.001);
    // const hemisphereLightHelper = new THREE.HemisphereLightHelper(
    //     hemisphereLight,
    //     5
    // );
    // scene.add(hemisphereLightHelper);

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


    // lil gui

    // copy right 권고 ..

    // 바닥에 물 ??

    //

    sun = new THREE.Vector3();

    // Water
    waterGroup = new THREE.Group();

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    // const waterGeometry = new THREE.BoxGeometry( 100, 100,100 );
    // const waterBodyGeo = new THREE.BoxGeometry(10000, 100, 10000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            }),
            // sunDirection: new THREE.Vector3(),
            sunDirection: new THREE.Vector3(100, 100, 100),
            sunColor: 0xffffff,
            waterColor: "#00aaff",
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    console.log(water)
    //0x7F7F7F
    water.rotation.x = - Math.PI / 2;
    // const waterBodyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.62, color: 0x001e0f })
    // waterBody = new THREE.Mesh(waterBodyGeo, waterBodyMat)

    // waterBody.position.y = -50.01

    // scene.add(waterBody)
    // scene.add( water );

    // waterGroup.add(waterBody);
    waterGroup.add(water)
    scene.add(waterGroup)

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar(10000);
    // scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;


    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {

        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;

    }

    updateSun();


    const folderSky = gui.addFolder('Sky');
    // let elevationController = folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    // let azimuthController = folderSky.add(parameters, 'azimuth', - 180, 180, 0.1).onChange(updateSun);

    folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, 'azimuth', - 180, 180, 0.1).onChange(updateSun);

}



function Init(canvasRef) {

    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.7
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.set(0, 5, 5)
    // scene.add(mesh);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        10000
    );


    camera.position.x = 3;
    camera.position.y = 4;
    camera.position.z = 8;
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
    // renderer.physicallyCorrectLights = true
    // renderer.outputEncoding = THREE.sRGBEncoding
    // renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 3
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    //Controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI*0.5

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

    water.material.uniforms['time'].value += 1.0 / 120.0;
    // water.material.uniforms['time'].value += elapsedTime;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    requestAnimationFrame(Tick);
}


function recursiveShadowToggle(obj) {

    obj.receiveShadow = true;
    obj.castShadow = true

    obj.children.map((v, i) => {
        recursiveShadowToggle(v)
        return null
    })

}