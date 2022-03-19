import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";


import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Stats from 'stats.js';

import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';

import nipplejs from 'nipplejs'

let horizonAxis = 0;
let verticalAxis = 0;

const params = {

    firstPerson: false,

    displayCollider: false,
    displayBVH: false,
    visualizeDepth: 10,
    gravity: - 30,
    playerSpeed: 10,
    physicsSteps: 5,

    reset: reset,

};

// let renderer, camera, scene, clock, gui, stats;
let renderer, camera, gui, stats;
let environment, collider, visualizer, player, controls;
let playerIsOnGround = false;
let fwdPressed = false, bkdPressed = false, lftPressed = false, rgtPressed = false;
let playerVelocity = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);
let tempVector = new THREE.Vector3();
let tempVector2 = new THREE.Vector3();
let tempBox = new THREE.Box3();
let tempMat = new THREE.Matrix4();
let tempSegment = new THREE.Line3();

/**
 * Base
 */


// Scene
const scene = new THREE.Scene()

const clock = new THREE.Clock()
let oldElapsedTime = 0;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Test cube
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)
scene.add(cube)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
            // position: { left: '5%', top: '90%' },
            // color: 'red'
        });
        
        manager.on("move", function (evt, {vector}) {
            const { x, y } = vector;
            console.log(vector)
            // set({ controls: { horizonAxis: -x, verticalAxis: y } })
            horizonAxis = x;
            verticalAxis = -y;
            // runAction.play();
            // idleAction.stop();
        });
        
        manager.on("end", function (evt, data) {
        
            // set({ controls: { horizonAxis: 0, verticalAxis: 0 } })
            horizonAxis = 0;
            verticalAxis = 0;
            // runAction.stop();
            // idleAction.play();
        });

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
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
        camera.position.set(10, 10, - 10);
        camera.far = 100;
        camera.updateProjectionMatrix();
        window.camera = camera;

        // clock = new THREE.Clock();

        controls = new OrbitControls(camera, renderer.domElement);

        // stats setup
        stats = new Stats();
        document.body.appendChild(stats.dom);

        loadColliderEnvironment();

        // character
        player = new THREE.Mesh(
            new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
            new THREE.MeshStandardMaterial()
        );
        player.geometry.translate(0, - 0.5, 0);
        player.capsuleInfo = {
            radius: 0.5,
            segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, - 1.0, 0.0))
        };
        player.castShadow = true;
        player.receiveShadow = true;
        player.material.shadowSide = 2;
        scene.add(player);
        reset();

        // dat.gui
        gui = new GUI();
        gui.add(params, 'firstPerson').onChange(v => {

            if (!v) {

                camera
                    .position
                    .sub(controls.target)
                    .normalize()
                    .multiplyScalar(10)
                    .add(controls.target);

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
                    if (playerIsOnGround) {

                        playerVelocity.y = 10.0;

                    }

                    break;

            }

        });

        window.addEventListener('keyup', function (e) {

            switch (e.code) {

                case 'KeyW': fwdPressed = false; break;
                case 'KeyS': bkdPressed = false; break;
                case 'KeyD': rgtPressed = false; break;
                case 'KeyA': lftPressed = false; break;

            }

        });

    }

    function loadColliderEnvironment() {

        new GLTFLoader().load('../models/dungeon_low_poly_game_level_challenge/scene.gltf', res => {

            const gltfScene = res.scene;
            gltfScene.scale.setScalar(.01);

            const box = new THREE.Box3();
            box.setFromObject(gltfScene);
            box.getCenter(gltfScene.position).negate();
            gltfScene.updateMatrixWorld(true);

            // visual geometry setup
            const toMerge = {};
            gltfScene.traverse(c => {

                if (
                    /Boss/.test(c.name) ||
                    /Enemie/.test(c.name) ||
                    /Shield/.test(c.name) ||
                    /Sword/.test(c.name) ||
                    /Character/.test(c.name) ||
                    /Gate/.test(c.name) ||

                    // spears
                    /Cube/.test(c.name) ||

                    // pink brick
                    c.material && c.material.color.r === 1.0
                ) {

                    return;

                }

                if (c.isMesh) {

                    const hex = c.material.color.getHex();
                    toMerge[hex] = toMerge[hex] || [];
                    toMerge[hex].push(c);

                }

            });

            environment = new THREE.Group();
            for (const hex in toMerge) {

                const arr = toMerge[hex];
                const visualGeometries = [];
                arr.forEach(mesh => {

                    if (mesh.material.emissive.r !== 0) {

                        environment.attach(mesh);

                    } else {

                        const geom = mesh.geometry.clone();
                        geom.applyMatrix4(mesh.matrixWorld);
                        visualGeometries.push(geom);

                    }

                });

                if (visualGeometries.length) {

                    const newGeom = BufferGeometryUtils.mergeBufferGeometries(visualGeometries);
                    const newMesh = new THREE.Mesh(newGeom, new THREE.MeshStandardMaterial({ color: parseInt(hex), shadowSide: 2 }));
                    newMesh.castShadow = true;
                    newMesh.receiveShadow = true;
                    newMesh.material.shadowSide = 2;

                    environment.add(newMesh);

                }

            }

            // collect all geometries to merge
            const geometries = [];
            environment.updateMatrixWorld(true);
            environment.traverse(c => {

                if (c.geometry) {

                    const cloned = c.geometry.clone();
                    cloned.applyMatrix4(c.matrixWorld);
                    for (const key in cloned.attributes) {

                        if (key !== 'position') {

                            cloned.deleteAttribute(key);

                        }

                    }

                    geometries.push(cloned);

                }

            });

            // create the merged geometry
            const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries, false);
            mergedGeometry.boundsTree = new MeshBVH(mergedGeometry, { lazyGeneration: false });

            collider = new THREE.Mesh(mergedGeometry);
            collider.material.wireframe = true;
            collider.material.opacity = 0.5;
            collider.material.transparent = true;

            visualizer = new MeshBVHVisualizer(collider, params.visualizeDepth);
            scene.add(visualizer);
            scene.add(collider);
            scene.add(environment);

        });

    }

    function updatePlayer(delta) {

        playerVelocity.y += playerIsOnGround ? 0 : delta * params.gravity;
        player.position.addScaledVector(playerVelocity, delta);

        // move the player
        const angle = controls.getAzimuthalAngle();
        // if (fwdPressed) {

        //     tempVector.set(0, 0, - 1).applyAxisAngle(upVector, angle);
        //     player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        // }

        // if (bkdPressed) {

        //     tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
        //     player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        // }

        // if (lftPressed) {

        //     tempVector.set(- 1, 0, 0).applyAxisAngle(upVector, angle);
        //     player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        // }

        // if (rgtPressed) {

        //     tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
        //     player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        // }

        if (fwdPressed) {

            tempVector.set(0, 0, - 1).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        }

        if (bkdPressed) {

            tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        }

        if (lftPressed) {

            tempVector.set(- 1, 0, 0).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        }

        if (rgtPressed) {

            tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        }

        if (horizonAxis !==0 &&  verticalAxis !==0) {

            tempVector.set(horizonAxis, 0, verticalAxis).applyAxisAngle(upVector, angle).normalize();
            player.position.addScaledVector(tempVector, params.playerSpeed * delta);

        }
        // angle 을 바로 넣자 , rotation 에 z 에 ...

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

        // Debug
        // const gui = new GUI()
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

        // TODO: limit the camera movement based on the collider
        // raycast in direction of camera and move it if it's further than the closest point

        controls.update();

        renderer.render(scene, camera);
    }

    return <div>
        <div
            ref={joystickConRef}
            style={{
                position: "absolute",
                bottom: "50px",
                //   left: "5px",
                zIndex:99,
                color: "white",
                width: "100px",
                height: "100px",
            }}
        />
        <canvas ref={canvasRef} className="webgl"></canvas>;
    </div>
}


function reset() {

    playerVelocity.set(0, 0, 0);
    player.position.set(15.75, - 3, 30);
    camera.position.sub(controls.target);
    controls.target.copy(player.position);
    camera.position.add(player.position);
    controls.update();

}