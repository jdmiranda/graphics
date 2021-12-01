/***********
 * threeTorusPlayCN.js
 * based on threeTorusReplFN.js
 * also see lightBoxBN.js
 * M. Laszlo
 * July 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';
import { TeapotBufferGeometry } from './jsm/geometries/TeapotBufferGeometry.js';




let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let spaceSide = 90;
let spaceSize = new THREE.Vector3(spaceSide, spaceSide, spaceSide);
let theObject;
let nbrRepls = 19;
let fog;

let maxNbrBeams = 6, initialNbrBeams = 1;
let minBeamRadius = 2, maxBeamRadius = 12;
let beams = new THREE.Object3D();
let nbrBeams = 0;



function createScene() {
    for (let i = 0; i < initialNbrBeams; i++) {
        let beam = makeRandomStripMesh(1, maxBeamRadius);
        addBeam(beam);
    }
    theObject = makeReplObjects(beams, spaceSize, nbrRepls, false);
    scene.add(theObject); 
       
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000000);
    light.position.set(100, 200, 200);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000000);
    light2.position.set(-100, -200, -200);
    let ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);

    fog = new THREE.Fog(0x000000, 10, 850);
    scene.fog = fog;

    // let axes = new THREE.AxesHelper(10);
    // scene.add(axes);
}


let limit = spaceSize.clone();
limit.addScalar(spaceSide);
limit.multiplyScalar(0.5);


let lastWorldPos = new THREE.Vector3(0, 0, 0);

function centerObject() {
    let cameraWorldPos = camera.getWorldPosition(new THREE.Vector3());
    let v = cameraWorldPos.clone();
    v = v.sub(lastWorldPos);
    for (let i = 0; i < 3; i++) {
        let vec = new THREE.Vector3();
        vec.setComponent(i, 1);
        if (v.getComponent(i) < -limit.getComponent(i)) {
            theObject.translateOnAxis(vec, -spaceSize.getComponent(i));
        } else if (v.getComponent(i) > limit.getComponent(i)) {
            theObject.translateOnAxis(vec, spaceSize.getComponent(i));
        }
    }
    let newWorldPos = theObject.getWorldPosition(new THREE.Vector3());
    if (!newWorldPos.equals(lastWorldPos))
        lastWorldPos = newWorldPos;
}

function makeRandomBeam() {
    let beam = makeRandomStripMesh();
    // choose orientation
    let r = Math.random();
    let u = spaceSide * Math.random();
    let v = spaceSide * Math.random();
    if (r < 0.33) {
        beam.rotation.x = Math.PI / 2;
        beam.position.y = u;
        beam.position.z = v;
    } else if (r < 0.66) {
        beam.rotation.z = Math.PI / 2;
        beam.position.x = u;
        beam.position.y = v;
    } else {
        beam.position.x = u;
        beam.position.z = v;
    }
    return beam;
}

function makeRandomStripMesh(nbrTwists, Width) {
    let width = Width ? Width : MyUtils.getRandomFloat(minBeamRadius, maxBeamRadius);
    let ntwists = nbrTwists? nbrTwists : MyUtils.getRandomInt(0, 5);
    let geom = makeStripGeometry(width, ntwists, spaceSide, 30, 2);
    let matArgs1 = {side: THREE.FrontSide, shininess:50, color: MyUtils.getRandomColor(0.5, 0.4, 0.6)};
    let mat1 = new THREE.MeshPhongMaterial(matArgs1);
    let mesh1 = new THREE.Mesh(geom, mat1);
    let matArgs2 = {side: THREE.BackSide, shininess: 50, color: MyUtils.getRandomColor(0.5, 0.4, 0.6)};
    let mat2 = new THREE.MeshPhongMaterial(matArgs2);
    let mesh2 = new THREE.Mesh(geom, mat2);
    let strip = new THREE.Object3D();
    strip.add(mesh1, mesh2);
    return strip;
}


function makeStripParametricSurface(width, ntwists, height) {
    // parametric equation of strip with ntwists
    // cylinder: ntwists==0;  mobius: ntwists==1
    // we perform pi*ntwists in total
    const halfHeight = height / 2;
    const halfWidth = width / 2;
    const totalTwists = Math.PI * ntwists;
    function f(u, v, res) {
        let yTheta = u * totalTwists;
        let y = -halfHeight + u * height;
        let p = -halfWidth + v * width;
        let sinTheta = Math.sin(yTheta);
        let cosTheta = Math.cos(yTheta);
        res.set(p * cosTheta, y, p * sinTheta);
    }
    return f;
}

function makeStripGeometry(width, ntwists, height, radialSegs, heightSegs) {
    let f = makeStripParametricSurface(width, ntwists, height);
    return new THREE.ParametricGeometry(f, radialSegs, heightSegs);
}


function addBeam(obj) {
    if (beams.children.length < maxNbrBeams) {
        beams.add(obj);
        ++nbrBeams;
    }
}


function removeBeam(obj) {
    if (nbrBeams > 0) {
        let indx = MyUtils.getRandomInt(0, nbrBeams-1);
        let beam = beams.children[indx];
        beams.remove(beam);
        // beam.geometry.dispose();
        --nbrBeams;
    }
}


// center replicates at origin
function makeReplObjects(object, spaceSize, n, spinme) {
    let root = new THREE.Object3D();
    let maxXYXs = ((n-1) / 2);
    for (let x of MyUtils.linspace(-maxXYXs * spaceSize.x, maxXYXs * spaceSize.x, n)) {
        for (let y of MyUtils.linspace(-maxXYXs * spaceSize.y, maxXYXs * spaceSize.y, n)) {
            for (let z of MyUtils.linspace(-maxXYXs * spaceSize.z, maxXYXs * spaceSize.z, n)) {
                let obj = object.clone();
                obj.position.set(x, y, z);
                root.add(obj); 
            }
        }
    }
    return root;
}


var controls = new function() {
    this.nbrBeams = 1;
    this.speed = false;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrBeams', 1, maxNbrBeams).name('nbr beams').step(1).onChange(updateBeams);
    gui.add(controls, 'speed').name('warp speed').onChange(updateSpeed);
}

let movementSpeed = 20;

function updateSpeed() {
    let fast = controls.speed;
    if (fast) cameraControls.movementSpeed = 8 * movementSpeed;
    else cameraControls.movementSpeed = movementSpeed;
}

function updateBeams() {
    let position = new THREE.Vector3();
    position.copy(theObject.position);
    scene.remove(theObject);
    let n = controls.nbrBeams;
    let delta = Math.abs(nbrBeams - n);
    if (n < nbrBeams) { 
        for (let i = 0; i < delta; i++) {
            removeBeam();
        }
    } else if (n > nbrBeams) {
        for (let i = 0; i < delta; i++) {
            let beam = makeRandomBeam();
            addBeam(beam);
        }
    }
    theObject = makeReplObjects(beams, spaceSize, nbrRepls, false);
    theObject.position.copy(position);
    scene.add(theObject);
}


function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.setAnimationLoop(function () {
        let delta = clock.getDelta();
        cameraControls.update(delta);
        centerObject();
        // animation
        // rotationThisDelta = MyUtils.rpsToRadians(controls.rps, delta);
        // subject.notify();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new FirstPersonControls(camera, renderer.domElement);
    cameraControls.lookSpeed = 0.04;
    cameraControls.movementSpeed = 2;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


