/* eslint-disable no-loop-func */
/* eslint-disable no-mixed-operators */
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";


import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Stats from 'stats.js';

import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import nipplejs from 'nipplejs'

import { Fab } from '@mui/material'


import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";


const gltfLoader = new GLTFLoader()
    .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
    .setKTX2Loader(new KTX2Loader().setTranscoderPath("assets/wasm/"))
    .setMeshoptDecoder(MeshoptDecoder);

let horizonAxis = 0;
let verticalAxis = 0;


let mixer = { update: () => { } };

let idleAction = { play: () => { }, stop: () => { } };
let walkAction = { play: () => { }, stop: () => { } };
let runAction = { play: () => { }, stop: () => { } };
let jumpAction = { play: () => { }, stop: () => { } };









// const target 
const proxy = new Proxy({ speed: 0 },
    {
        set(obj, prop, newval) {

            // let oldval = obj[prop]

            // if (newval > 0.2 && newval < 0.5) {
            //     idleAction.stop()
            //     runAction.stop()
            //     walkAction.play()
            // } else if (newval > 0.5) {
            //     idleAction.stop();
            //     walkAction.stop();
            //     runAction.play()
            // }
            // 이거 이하는 살금 살금?
            if (newval > 0.1 && newval < 0.5) {
                newval = 0.35
                idleAction.stop()
                runAction.stop()
                // walkAction.reset()
                walkAction.play()
                // walkAction.crossFadeFrom(idleAction,1)
                // 애니메이션 수업 듣기 전에는 하지말자 .
            } else if (newval > 0.5) {
                newval = 1;
                idleAction.stop();
                walkAction.stop();
                runAction.play()
            }

            obj[prop] = newval

            return true
        }
    }
)

const params = {

    firstPerson: false,

    displayCollider: false,
    displayBVH: false,
    visualizeDepth: 10,
    gravity: - 30,
    playerSpeed: 5.5,
    physicsSteps: 5,
    jump: 10,

    reset: reset,

};

// let renderer, camera, scene, clock, gui, stats;
let renderer, camera, gui, stats;
// let environment, collider, visualizer, player, controls;
let collider, visualizer, player, controls;
let playerIsOnGround = false;
let fwdPressed = false, bkdPressed = false, lftPressed = false, rgtPressed = false;
let playerVelocity = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);
let tempVector = new THREE.Vector3();
let tempVector2 = new THREE.Vector3();
let tempBox = new THREE.Box3();
let tempMat = new THREE.Matrix4();
let tempSegment = new THREE.Line3();

let tempVectorNormalized = new THREE.Vector3();
let tempVectorWalkSpeed = new THREE.Vector3();
let playerDirectionVector = new THREE.Vector3();

let raycaster
/**
 * Base
 */


// Scene
const scene = new THREE.Scene()

// scene.add(new THREE.AxesHelper(5))

const clock = new THREE.Clock()
let oldElapsedTime = 0;

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader()

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(4, 4, 4),
//     new THREE.MeshBasicMaterial()
// )
// // cube.scale.setScalar(4)
// cube.name = "test"
// scene.add(cube)

/**
 * Raycaster
 */
raycaster = new THREE.Raycaster()
raycaster.far = 1;

const rayOrigin = new THREE.Vector3(-3, 0, 0)
const rayDirection = new THREE.Vector3(1, 0, 0)
rayDirection.normalize()
raycaster.set(rayOrigin, rayDirection)


let currentIntersect = null

const dir = new THREE.Vector3(1, 2, 0);

//normalize the direction vector (convert to vector of length 1)
dir.normalize();

const origin = new THREE.Vector3(0, 0, 0);
const length = 1;
const hex = 0xffff00;

const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
scene.add(arrowHelper);


/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

const object4 = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object4.position.set(4, 1, -4)
object4.name = "normalize!!"
object4.interact = () => {
    console.log("interaction!");
}
scene.add(object4)

const objectsToTest = [object1, object2, object3, object4]

/**
 * Sizes
 */
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }

export default function Main() {
    const canvasRef = useRef();
    const joystickConRef = useRef();
    useEffect(() => {
        // baseInit();
        init();
        sceneInit();
        tick();

        let manager = nipplejs.create({
            zone: joystickConRef.current,
            mode: 'semi',
            // mode: 'static',
            // position: { left: '10%', top: '90%' },
            // color: 'red'
        });

        manager.on("move", function (evt, { vector }) {
            const { x, y } = vector;
            // console.log(vector)
            // set({ controls: { horizonAxis: -x, verticalAxis: y } })
            // 여기서도 0.5 이상이면 1을 넣는 ??
            horizonAxis = x;
            verticalAxis = -y;
            // runAction.play();
            // idleAction.stop();
        });

        manager.on("end", function (evt, data) {

            // set({ controls: { horizonAxis: 0, verticalAxis: 0 } })
            horizonAxis = 0;
            verticalAxis = 0;
            runAction.stop();
            walkAction.stop();
            idleAction.play();
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    function init() {

        const bgColor = 0x263238 / 2;

        const canvas = canvasRef.current;
        // renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas, });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(bgColor, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        // document.body.appendChild(renderer.domElement);

        // scene setup
        // scene = new THREE.Scene();
        scene.fog = new THREE.Fog(bgColor, 20, 70);

        // lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1.5, 1).multiplyScalar(50);
        light.shadow.mapSize.setScalar(2048);
        light.shadow.bias = - 1e-4;
        light.shadow.normalBias = 0.05;
        light.castShadow = true;

        const shadowCam = light.shadow.camera;
        shadowCam.bottom = shadowCam.left = - 30;
        shadowCam.top = 30;
        shadowCam.right = 45;

        scene.add(light);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.4));

        // camera setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 99999);
        // camera.position.set(10, 10, - 10);
        camera.position.set(-4, 2, 0);
        // camera.far = 100;
        camera.updateProjectionMatrix();
        window.camera = camera;

        // clock = new THREE.Clock();

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        // stats setup
        stats = new Stats();
        document.body.appendChild(stats.dom);

        loadColliderEnvironment();

        // character
        player = new THREE.Mesh(
            new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
            new THREE.MeshStandardMaterial({
                wireframe: true,
                transparent: true,
                opacity: 0
            })
        );
        player.geometry.translate(0, - 0.5, 0);
        player.capsuleInfo = {
            radius: 0.5,
            segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, - 1.0, 0.0))
        };
        // player.castShadow = true;
        // player.receiveShadow = true;
        // player.material.shadowSide = 2;

        gltfLoader.load("models/hosuk.glb", (gltf) => {
            const scene = gltf.scene || gltf.scenes[0];
            // scene.rotation.y = Math.PI;
            scene.position.y = -1.5


            scene.castShadow = true;
            scene.receiveShadow = true;

            updateAllMaterials(scene)

            player.add(scene)



            const animations = gltf.animations;
            console.log(animations);
            mixer = new THREE.AnimationMixer(player);
            idleAction = mixer.clipAction(animations[0]);
            walkAction = mixer.clipAction(animations[4]);
            runAction = mixer.clipAction(animations[3]);
            jumpAction = mixer.clipAction(animations[1]);
            jumpAction.setLoop(THREE.LoopOnce);
            jumpAction.clampWhenFinished = true;
            jumpAction.enable = true;
            idleAction.play();

        })



        scene.add(player);
        reset();

        // dat.gui
        gui = new GUI();
        gui.add(params, 'firstPerson').onChange(v => {

            if (!v) {
                player.visible = true
                camera
                    .position
                    .sub(controls.target)
                    .normalize()
                    .multiplyScalar(10)
                    .add(controls.target);

            } else {
                player.visible = false;
            }

        });

        const visFolder = gui.addFolder('Visualization');
        visFolder.add(params, 'displayCollider');
        visFolder.add(params, 'displayBVH');
        visFolder.add(params, 'visualizeDepth', 1, 20, 1).onChange(v => {

            visualizer.depth = v;
            visualizer.update();

        });
        visFolder.open();

        const physicsFolder = gui.addFolder('Player');
        physicsFolder.add(params, 'physicsSteps', 0, 30, 1);
        physicsFolder.add(params, 'gravity', - 100, 100, 0.01).onChange(v => {

            params.gravity = parseFloat(v);

        });
        physicsFolder.add(params, 'playerSpeed', 1, 20);
        physicsFolder.add(params, 'jump', 1, 30);
        physicsFolder.open();

        gui.add(params, 'reset');
        gui.open();

        window.addEventListener('resize', function () {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }, false);

        window.addEventListener('keydown', function (e) {

            switch (e.code) {

                case 'KeyW': fwdPressed = true; break;
                case 'KeyS': bkdPressed = true; break;
                case 'KeyD': rgtPressed = true; break;
                case 'KeyA': lftPressed = true; break;
                case 'Space':
                    // if (playerIsOnGround) {

                    //     playerVelocity.y = 10.0;

                    // }
                    jump()
                    break;
                case 'KeyZ':
                    interact();
                    break;
                default:

            }

        });

        window.addEventListener('keyup', function (e) {

            switch (e.code) {

                case 'KeyW': fwdPressed = false; break;
                case 'KeyS': bkdPressed = false; break;
                case 'KeyD': rgtPressed = false; break;
                case 'KeyA': lftPressed = false; break;
                default:


            }

        });

    }

    function interact() {
        console.log("interact")

        // playerDirectionVector.addVectors(player.position, tempVectorNormalized).normalize();
        // console.log(player.position)
        // console.log(tempVectorNormalized);
        // raycaster.set(player.position, playerDirectionVector)

        // console.log(player.position)
        // console.log(tempVectorNormalized);
        raycaster.set(player.position, tempVectorNormalized)

        const intersects = raycaster.intersectObjects(objectsToTest)
        console.log(intersects)
        if (intersects.length > 0) {

            intersects[0].object.interact();
        }

        arrowHelper.position.copy(player.position);
        arrowHelper.setDirection(tempVectorNormalized)
        // // console.log(intersects.length)
    }

    function loadColliderEnvironment() {


        // gltfLoader.load('../models/TheRoom13.glb', (res) => {
        // gltfLoader.load('../models/TheRoom8.glb', (res) => {
        //     const gltfScene = res.scene;
        //     scene.add(gltfScene)
        // })


        gltfLoader.load('../models/TheRoom_bsp1.glb', (res) => {
            const gltfScene = res.scene;
            console.log(gltfScene)
            const geo = gltfScene.children[0].geometry;

            geo.boundsTree = new MeshBVH(geo, { lazyGeneration: false });
            collider = new THREE.Mesh(geo);
            collider.material.wireframe = true;
            collider.material.opacity = 0.5;
            collider.material.transparent = true;
            visualizer = new MeshBVHVisualizer(collider, params.visualizeDepth);

            // objectsToTest.push(gltfScene)
            scene.add(gltfScene)
            scene.add(visualizer);
            scene.add(collider);
            // scene.add(environment);
        })

    }

    function updatePlayer(delta) {

        playerVelocity.y += playerIsOnGround ? 0 : delta * params.gravity;
        player.position.addScaledVector(playerVelocity, delta);

        // move the player
        const angle = controls.getAzimuthalAngle();

        if (fwdPressed) {

            tempVector.set(0, 0, - 1).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

            player.rotation.y = Math.atan2(tempVector.x, tempVector.z)

        }

        if (bkdPressed) {

            tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

            player.rotation.y = Math.atan2(tempVector.x, tempVector.z)

        }

        if (lftPressed) {

            tempVector.set(- 1, 0, 0).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

            player.rotation.y = Math.atan2(tempVector.x, tempVector.z)

        }

        if (rgtPressed) {

            tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);


            player.rotation.y = Math.atan2(tempVector.x, tempVector.z)
        }

        if (horizonAxis !== 0 && verticalAxis !== 0) {

            // tempVector.set(horizonAxis, 0, verticalAxis).applyAxisAngle(upVector, angle).normalize();
            tempVector.set(horizonAxis, 0, verticalAxis).applyAxisAngle(upVector, angle);

            const length = tempVector.length()
            tempVectorNormalized.copy(tempVector).normalize()
            if (length > 0.5) {
                // tempVector.set(horizonAxis, 0, verticalAxis).applyAxisAngle(upVector, angle).normalize();
                // new vec needs
                // tempVectorNormalized.copy(tempVector).normalize()

                player.position.addScaledVector(tempVectorNormalized, params.playerSpeed * delta);
            } else if(length > 0.1 && length < 0.5) {
                tempVectorWalkSpeed.copy(tempVectorNormalized).multiplyScalar(0.35)
                player.position.addScaledVector(tempVectorWalkSpeed, params.playerSpeed * delta);
            }

            player.rotation.y = Math.atan2(tempVector.x, tempVector.z)
            proxy.speed = length;
        }
        // angle 을 바로 넣자 , rotation 에 z 에 ...
        // player.rotation.y = zeroVector.angleTo(tempVector)


        player.updateMatrixWorld();

        // adjust player position based on collisions
        const capsuleInfo = player.capsuleInfo;
        tempBox.makeEmpty();
        tempMat.copy(collider.matrixWorld).invert();
        tempSegment.copy(capsuleInfo.segment);

        // get the position of the capsule in the local space of the collider
        tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
        tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

        // get the axis aligned bounding box of the capsule
        tempBox.expandByPoint(tempSegment.start);
        tempBox.expandByPoint(tempSegment.end);

        tempBox.min.addScalar(- capsuleInfo.radius);
        tempBox.max.addScalar(capsuleInfo.radius);

        collider.geometry.boundsTree.shapecast({

            intersectsBounds: box => box.intersectsBox(tempBox),

            intersectsTriangle: tri => {

                // check if the triangle is intersecting the capsule and adjust the
                // capsule position if it is.
                const triPoint = tempVector;
                const capsulePoint = tempVector2;

                const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
                if (distance < capsuleInfo.radius) {

                    const depth = capsuleInfo.radius - distance;
                    const direction = capsulePoint.sub(triPoint).normalize();

                    tempSegment.start.addScaledVector(direction, depth);
                    tempSegment.end.addScaledVector(direction, depth);

                }

            }

        });

        // get the adjusted position of the capsule collider in world space after checking
        // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
        // the origin of the player model.
        const newPosition = tempVector;
        newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

        // check how much the collider was moved
        const deltaVector = tempVector2;
        deltaVector.subVectors(newPosition, player.position);

        // if the player was primarily adjusted vertically we assume it's on something we should consider ground
        playerIsOnGround = deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

        const offset = Math.max(0.0, deltaVector.length() - 1e-5);
        deltaVector.normalize().multiplyScalar(offset);

        // adjust the player model
        player.position.add(deltaVector);

        if (!playerIsOnGround) {

            deltaVector.normalize();
            playerVelocity.addScaledVector(deltaVector, - deltaVector.dot(playerVelocity));

        } else {

            playerVelocity.set(0, 0, 0);

        }

        // adjust the camera
        camera.position.sub(controls.target);
        controls.target.copy(player.position);
        camera.position.add(player.position);

        // if the player has fallen too far below the level reset their position to the start
        if (player.position.y < - 25) {

            reset();

        }

    }



    function sceneInit() {

        /**
        * Raycaster
        */
        // raycaster = new THREE.Raycaster(player.position, playerDirectionVector, 0.3, 1)
        // raycaster = new THREE.Raycaster(player.position, playerDirectionVector)


        // const material = new THREE.LineBasicMaterial({
        //     color: 0x0000ff
        // });

        // const points = [];
        // points.push(player.position);
        // points.push(tempVectorNormalized);
        // // points.push( new THREE.Vector3( 10, 0, 0 ) );

        // const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // const line = new THREE.Line(geometry, material);
        // scene.add(line);

        // setInterval(() => {
        //     console.log("interact raycast shoot");
        // }, 500)

        /**
 * Objects
 */

        // objectsToTest.push(object1)

        // setInterval(interactRay, 1500)
    }

    function interactRay() {

        // test cube 로 테스트 하자 .
        // raycaster 한계선 설정 해놓기 ... ,far 값 ... 
        // 큐브 크기 좀 키우고 ..
        // z 값으로 조금 위로 ... 
        //player.position + tempVectorNormalized 가 목적지 여야지 .. 
        playerDirectionVector.addVectors(player.position, tempVectorNormalized)
        raycaster.set(player.position, playerDirectionVector)

        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        const points = [];
        points.push(player.position);
        points.push(playerDirectionVector);
        // points.push( new THREE.Vector3( 10, 0, 0 ) );

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        // const objectsToTest = [object1, object2, object3]

        console.log(objectsToTest)
        const intersects = raycaster.intersectObjects(objectsToTest)
        // interacting 할 오브젝트들은 따로 빼자 ...
        // const intersects = raycaster.intersectObjects(scene.children)
        console.log(intersects);
        if (intersects.length !== 0) {

            console.log(intersects[0])
        }
    }

    function tick() {
        // const elapsedTime = clock.getElapsedTime();

        // // Update controls
        // controls.update();

        // // Render
        // renderer.render(scene, camera);

        // // Call tick again on the next frame
        // requestAnimationFrame(tick);

        stats.update();
        requestAnimationFrame(tick);

        const elapsedTime = clock.getElapsedTime();
        // const deltaTime = elapsedTime - oldElapsedTime
        const delta = elapsedTime - oldElapsedTime
        oldElapsedTime = elapsedTime


        // Animate objects
        object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
        object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
        object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

        // const delta = Math.min(clock.getDelta(), 0.1);
        if (params.firstPerson) {

            controls.maxPolarAngle = Math.PI;
            controls.minDistance = 1e-4;
            controls.maxDistance = 1e-4;

        } else {

            controls.maxPolarAngle = Math.PI / 2;
            controls.minDistance = 1;
            controls.maxDistance = 20;

        }

        if (collider) {

            collider.visible = params.displayCollider;
            visualizer.visible = params.displayBVH;

            const physicsSteps = params.physicsSteps;

            for (let i = 0; i < physicsSteps; i++) {

                updatePlayer(delta / physicsSteps);

            }

        }

        mixer.update(delta);

        // TODO: limit the camera movement based on the collider
        // raycast in direction of camera and move it if it's further than the closest point

        controls.update();






        renderer.render(scene, camera);
    }

    function jump() {
        if (playerIsOnGround) {

            // playerVelocity.y = 10.0;
            idleAction.stop()
            walkAction.stop()
            runAction.stop()
            // jumpAction.play().reset();
            jumpAction.play().reset();

            window.setTimeout(() => {

                playerVelocity.y = params.jump;
            }, 500)
            // jumpAction.stop();
            window.setTimeout(() => {

                jumpAction.crossFadeTo(idleAction, 0.3)
                jumpAction.stop();
                idleAction.play();
            }, 2000)

        }
    }

    return <div>
        <div
            ref={joystickConRef}
            style={{
                position: "absolute",
                bottom: "50px",
                // left: "50px",
                zIndex: 99,
                color: "white",
                width: "100px",
                height: "100px",
            }}
        />
        <div

            style={{
                position: "absolute",
                bottom: "25px",
                right: "25px",
                zIndex: 99,
                color: "white",
                // width: "100px",
                // height: "100px",
            }}
        >
            <Fab color="primary" onClick={jump}>
                Jump
            </Fab>
        </div>
        <canvas ref={canvasRef} className="webgl"></canvas>;
    </div>
}


function reset() {

    playerVelocity.set(0, 0, 0);
    player.position.set(3, 2, -6);
    // player.position.set(15.75, - 3, 30);
    camera.position.sub(controls.target);
    controls.target.copy(player.position);
    camera.position.add(player.position);
    controls.update();

}

/**
 * Update all materials
 */
const updateAllMaterials = (scene) => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMapIntensity = 1
            // child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}