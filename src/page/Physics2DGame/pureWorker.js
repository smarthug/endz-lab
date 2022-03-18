import p2 from 'p2-es'

let world = null

let array = null;
let flyingArray = [];

let count = 0;

let N = 5

const objectsToUpdate = []
const platforms = []

//material
const boxMaterial = new p2.Material()
const platform1Material = new p2.Material();
const platform2Material = new p2.Material();
const groundMaterial = new p2.Material();



let elapsedtime = 0

onmessage = ({ data }) => {
    // console.log(data)
    switch (data.operation) {
        case 'initWorld':
            init()
            break;
        case 'step':
            array = data.array
            step(...data.props);
            break;
        case 'createBox':
            createBox(...data.props);
            break;
        case 'createMovingPlatform':
            createMovingPlatform(...data.props);
            break;
        case 'createFlying':
            createFlying(...data.props);
            break;
        case 'reset':
            reset();
            break;
        default:
            break;
    }
}

function init() {
    world = new p2.World({
        gravity: [0, -9.82]
    });

    // Allow sleeping
    world.sleepMode = p2.World.BODY_SLEEPING;

    // Create an infinite ground plane body
    var groundBody = new p2.Body({
        mass: 0, // Setting mass to 0 makes it static
        position: [0, 1]
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

const step = (deltaTime) => {
    // console.log('works')
    world.step(1 / 60, deltaTime, 10)
    elapsedtime += deltaTime

    for (let i = 0; i !== objectsToUpdate.length; i++) {

        // test interpolated ...
        let b = objectsToUpdate[i];
        array[3 * i + 0] = b.position[0];
        array[3 * i + 1] = b.position[1];
        array[3 * i + 2] = b.angle;
    }

    for (let i = 0; i < platforms.length; i++) {
        // platform 마다 이동속도에 대한거 있어야할듯 ...
        // console.log(platforms)
        platforms[i].velocity[0] = platforms[i].customSpeed * Math.sin(elapsedtime);
        let b = platforms[i];
        flyingArray[3 * i + 0] = b.position[0];
        flyingArray[3 * i + 1] = b.position[1];
        flyingArray[3 * i + 2] = b.angle;
    }


    postMessage([array,flyingArray], [array.buffer])
    array = null;
    // postMessage("test")
}

function createBox({ width, height, depth }, { x, y }) {
    // Create moving box
    let boxBody = new p2.Body({
        mass: 1,
        position: [x, y]
    }),
        boxShape = new p2.Box({
            // width: width + 0.02,
            // height: height + 0.02,
            width: width,
            height: height,
            material: boxMaterial
        });

    boxBody.allowSleep = true;
    boxBody.sleepSpeedLimit = 0.5; // Body will feel sleepy if speed<1 (speed is the norm of velocity)
    boxBody.sleepTimeLimit = 5; // Body falls asleep after 1s of sleepiness
    boxBody.addShape(boxShape);
    world.addBody(boxBody);
    // 0,99 , 100 개는 째는 다시 0으로
    pushMax(boxBody)

}

function createMovingPlatform({ width, height, depth }, { x, y }, right) {
    // Create moving box
    let boxBody = new p2.Body({
        mass: 0,
        position: [x, y]
    }),
        boxShape = new p2.Box({
            width: width,
            height: height,
            material: right ? platform1Material : platform2Material
        });
    boxBody.addShape(boxShape);
    world.addBody(boxBody);
}

function createFlying({ width, height, depth }, { x, y },speed) {
    let platformBody = new p2.Body({
        mass: 0, // Static
        position: [x, y],
        type: p2.Body.KINEMATIC
    });
    platformBody.customSpeed = speed
    let platformShape = new p2.Box({
        width: width,
        height: height,
        material: groundMaterial
    });
    platformBody.addShape(platformShape);
    world.addBody(platformBody);
    platforms.push(platformBody);
}

function pushMax(body) {
    let oldBody = objectsToUpdate[count % N];
    if (oldBody) {

        world.removeBody(oldBody);
    }
    objectsToUpdate[count % N] = body;

    count++
}

function reset() {
    for (const body of objectsToUpdate) {
        world.removeBody(body);
    }
    objectsToUpdate.splice(0, objectsToUpdate.length)

    count = 0;
}


// world.on('postStep', function () {
//     for (let i = 0; i < platforms.length; i++) {
//         platforms[i].velocity[0] = 2 * Math.sin(world.time);
//     }

//     // Apply button response
//     // characterBody.velocity[0] = walkSpeed * (buttons.right - buttons.left);
// });