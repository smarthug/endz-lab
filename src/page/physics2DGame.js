import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import p2 from 'p2-es'

let renderer, camera, controls;

/**
 * Base
 */
// Debug
const gui = new GUI()

// Scene
const scene = new THREE.Scene()

const clock = new THREE.Clock()
let oldElapsedTime = 0;

const objectsToUpdate = [];

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity: [0, -9.82]
});

// Create an empty dynamic body
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 10]
});

// Add a circle shape to the body
var circleShape = new p2.Circle({ radius: 1 });
circleBody.addShape(circleShape);

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1,20,20),
    new THREE.MeshNormalMaterial()
)
sphere.position.set(0,10,0)
scene.add(sphere)
objectsToUpdate.push({
    mesh:sphere,
    body:circleBody
})

// Create an infinite ground plane body
var groundBody = new p2.Body({
    mass: 0 // Setting mass to 0 makes it static
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshNormalMaterial({
        side:THREE.DoubleSide
    })
)
ground.rotation.x = -Math.PI*0.5
scene.add(ground)

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
        camera.position.y = 10
        camera.position.z = 20
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

    function sceneInit() { }

    function tick() {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime
        oldElapsedTime = elapsedTime

        // Update physics world
        // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

        // world.step(1 / 60, deltaTime, 3)
        world.step(1 / 60, deltaTime, 10)

        // for (const object of objectsToUpdate) {
        //     object.mesh.position.copy(object.body.position)
        //     object.mesh.quaternion.copy(object.body.quaternion)
        // }
        for (const object of objectsToUpdate) {
            // object.mesh.position.copy(object.body.position)
            // console.log(object)
            object.mesh.position.set(object.body.position[0],object.body.position[1],0)
            // object.mesh.quaternion.copy(object.body.quaternion)
            // object.mesh.quaternion.copy(object.body.quaternion)
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
