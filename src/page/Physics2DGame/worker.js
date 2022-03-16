import p2 from 'p2-es'

let world = null;
let array = [];

//material
const boxMaterial = new p2.Material()
const platform1Material = new p2.Material();
const platform2Material = new p2.Material();

export function removeBody(body){
    world.removeBody(body)
}

export function initWorld() {
    // Create a physics world, where bodies and constraints live
    world = new p2.World({
        gravity: [0, -9.82]
    });

    

    // Create an infinite ground plane body
    var groundBody = new p2.Body({
        mass: 0 // Setting mass to 0 makes it static
    });
    var groundShape = new p2.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);


    var contactMaterial1 = new p2.ContactMaterial(boxMaterial, platform1Material, {
        surfaceVelocity: -0.5,
    });
    world.addContactMaterial(contactMaterial1);

    var contactMaterial2 = new p2.ContactMaterial(boxMaterial, platform2Material, {
        surfaceVelocity: 0.5,
    });
    world.addContactMaterial(contactMaterial2);
}

// block for `time` ms, then return the number of loops we could run in that time:
export function expensive(time) {
    let start = Date.now(),
        count = 0
    while (Date.now() - start < time) count++
    return count
}

export function tick(deltaTime) {
    world.step(1 / 60, deltaTime, 10)

    // for (const object of objectsToUpdate) {
    //     object.mesh.position.copy(object.body.position)
    //     object.mesh.quaternion.copy(object.body.quaternion)
    // }
    // for (const object of objectsToUpdate) {
    //     // object.mesh.position.copy(object.body.position)
    //     // console.log(object)
    //     object.mesh.position.set(object.body.interpolatedPosition[0], object.body.interpolatedPosition[1], 0)
    //     object.mesh.rotation.z = object.body.interpolatedAngle
    //     // console.log(object.body.interpolatedAngle)
    //     // object.mesh.quaternion.copy(object.body.quaternion)
    //     // object.mesh.quaternion.copy(object.body.quaternion)
    // }
    // console.log(world.bodies)
    for(var i=0; i!==world.bodies.length; i++){
        
        var b = world.bodies[i];
        array[3*i + 0] = b.position[0];
        array[3*i + 1] = b.position[1];
        array[3*i + 2] = b.angle;
    }

    return array
}


export function createBox({ width, height, depth }, { x, y }) {
    // Create moving box
    let boxBody = new p2.Body({
        mass: 1,
        position: [x, y]
    }),
        boxShape = new p2.Box({
            width: width,
            height: height,
            material: boxMaterial
        });
    boxBody.addShape(boxShape);
    world.addBody(boxBody);

    // let box = new THREE.Mesh(
    //     new THREE.BoxGeometry(width, height, depth),
    //     new THREE.MeshNormalMaterial()
    // )
    // box.position.set(x, y, 0);
    // scene.add(box)
    // objectsToUpdate.push({
    //     mesh: box,
    //     body: boxBody
    // })
}

// createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 7 })
// createBox({ width: 0.5, height: 0.5, depth: 0.5 }, { x: 1, y: 12 })

// function createMovingPlatform({ width, height, depth }, { x, y }, shapeMaterial) {
//     // Create moving box
//     let boxBody = new p2.Body({
//         mass: 0,
//         position: [x, y]
//     }),
//         boxShape = new p2.Box({
//             width: width,
//             height: height,
//             material: shapeMaterial
//         });
//     boxBody.addShape(boxShape);
//     world.addBody(boxBody);

//     let box = new THREE.Mesh(
//         new THREE.BoxGeometry(width, height, depth),
//         new THREE.MeshNormalMaterial()
//     )
//     box.position.set(x, y, 0);
//     scene.add(box)
//     objectsToUpdate.push({
//         mesh: box,
//         body: boxBody
//     })
// }
// x, y , angle ?? 이런 시스템으로 갈까 ???
// world
// array 하나를 싱크로 하네 ...
 