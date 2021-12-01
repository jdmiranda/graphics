/***********
 * lightBoxBN.js
 * based on bandsB.js
 * M. Laszlo
 * June 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new MyUtils.Subject();

let mat;
let maxNbrPoles = 120;
let nbrPoles = 0;
let initNbrPoles = 8;
let roomSides = 120, roomHeight = 8;
let poles = new THREE.Object3D();
let lights;


function createScene() {
    let matArgs = {side: THREE.DoubleSide, shininess: 80};
    mat = new THREE.MeshPhongMaterial(matArgs);

    scene.add(createRoom(roomSides+10, roomHeight));
    for (let i = 0; i < initNbrPoles; i++) {
        let pole = createRandomCurvedPole(roomHeight/2);
        addPole(pole);
    }
    lights = makeSpinningLights(3);
    scene.add(lights);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
    scene.add(poles);
}

function makeSpinningLights(n) {
    let root = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
        let child = new THREE.Object3D();
        child.rps = MyUtils.getRandomFloat(0.002, 0.05);
        child.update = MyUtils.makeSpin(1);
        subject.register(child);
        root.add(child);
        let color = MyUtils.getRandomColor(0.5, 0.4, 0.6);
        let light = new THREE.PointLight(color, 0.4, 1000);
        let geom = new THREE.SphereGeometry(0.2);
        light.add(new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: color})));
        light.translateX(roomSides);
        child.add(light);
    }
    return root;
}

function createRoom(sides, height) {
    let room = new THREE.Object3D();
    room.translateZ(height / 2);
    room.rotateX(Math.PI / 2);
    let planeGeom = new THREE.PlaneGeometry(sides, sides);
    let plane1 = new THREE.Mesh(planeGeom, mat);
    plane1.translateZ(height / 2);
    let plane2 = new THREE.Mesh(planeGeom, mat);
    plane2.translateZ(-height / 2);
    room.add(plane1, plane2);
    return room;
}


function addPole(obj) {
    if (poles.children.length < maxNbrPoles) {
        poles.add(obj);
        ++nbrPoles;
    }
}


function removePole(obj) {
    if (nbrPoles > 0) {
        let indx = MyUtils.getRandomInt(0, nbrPoles-1);
        let pole = poles.children[indx];
        poles.remove(pole);
        pole.geometry.dispose();
        --nbrPoles;
    }
}

function createPole() {
    let cylGeom = new THREE.CylinderGeometry(1, 1, roomHeight);
    let pole = new THREE.Mesh(cylGeom, mat);
    let x = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    let z = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    pole.position.set(x, 0, z);
    return pole;
}



// Three points on quadratic curve f:Y->X in xy-plane are 
// (0,0), (x1,y1), (x1,-y1) where x1 > 0.
// Construct a lathe on n samples on [-y1,y1] around the
// axis x = X if X < 0 for a concave band.
// or X = X + x1 if X > 0 for a convex band
// Function has form
// x = ay^2, solved by a = x1 / (y1)^2
function createQuadBandGeometry(x1, y1, X, density=100, segments=12) {
    let a = x1 / (y1 * y1);
    let f;
    if (X < 0)
        f = (y) => a * y * y - X;
    else
        f = (y) => -(a * y * y - (X + x1));
    let ys = MyUtils.linspace(-y1, y1, density);
    let xs = ys.map(f);
    let vecs = [];
    for (let i = 0; i < ys.length; i++)
        vecs.push(new THREE.Vector2(xs[i], ys[i]));
    return new THREE.LatheGeometry(vecs, segments);
}

function createCurvedPole(x1, y1, X, density=100, segments=12) {
    let geom = createQuadBandGeometry(x1, y1, X, density, segments);
    let pole = new THREE.Mesh(geom, mat);
    let x = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    let z = MyUtils.getRandomInt(-roomSides/2, roomSides/2);
    pole.position.set(x, 0, z);
    return pole;
}

function createRandomCurvedPole(y1) {
    // let x0 = MyUtils.getRandomFloat(0.1, 0.48);
    // let x1 = MyUtils.getRandomFloat(0.52, 0.9);
    // let X = MyUtils.getRandomInt(0, 1);
    let x1 = MyUtils.getRandomFloat(0.1, 4);
    let X = MyUtils.getRandomFloat(-2.0, 2.0);
    return createCurvedPole(x1, y1, X, 30, 12);
}


function linspace(a, b, n) {
    if (b <= a) throw "b must be greater than a";
    if (n < 2) throw "n must be greater than 1"
    let res = [];
    let inc = (b - a) / (n - 1);
    for (let i = 0; i < n+1; i++)
        res.push(a + i * inc);
    return res;
}



var controls = new function() {
    this.nbrPoles = initNbrPoles;
    this.nbrLights = 3;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrPoles', 1, maxNbrPoles).name('nbr pillars').step(1).onChange(updatePoles);
    gui.add(controls, 'nbrLights', 1, 8).name('nbr lights').step(1).onChange(updateLights);
}

function updateLights() {
    scene.remove(lights);
    lights = makeSpinningLights(controls.nbrLights);
    scene.add(lights);
}

function updatePoles() {
    let n = controls.nbrPoles;
    let delta = Math.abs(nbrPoles - n);
    if (n < nbrPoles) { 
        for (let i = 0; i < delta; i++) {
            removePole();
        }
    } else if (n > nbrPoles) {
        for (let i = 0; i < delta; i++) {
            let pole = createRandomCurvedPole(roomHeight/2);
            addPole(pole);
        }
    }
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
        subject.notify(delta);
        cameraControls.update(delta);
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, roomSides/2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new FirstPersonControls(camera, renderer.domElement);
    cameraControls.lookSpeed = 0.02;
    cameraControls.movementSpeed = 3;
    // cameraControls.noFly = true;
    cameraControls.lookVertical = false;
    cameraControls.constrainVertical = false;
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


