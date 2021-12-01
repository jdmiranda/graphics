/***********
 * threeTorusReplBN.js
 * based on threeTorusAN.js
 * M. Laszlo
 * June 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';
import { TeapotBufferGeometry } from './jsm/geometries/TeapotBufferGeometry.js';



// https://en.wikipedia.org/wiki/Torus#n-dimensional_torus
// https://en.wikipedia.org/wiki/3-manifold#3-torus

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let spaceSize = new THREE.Vector3(40, 40, 40);
let theObject;
let theObjectDiameter = 3.47;  // sqrt(12) diagonal of 2x2x2 cube
let cube, sphere, teapot;
let nbrRepls = 11;
let walls;
let fog;


function createScene() {
    cube = makeCube(theObjectDiameter, theObjectDiameter, theObjectDiameter);
    sphere = makeSphere(theObjectDiameter/2, 28, 28);
    teapot = makeTeapot(theObjectDiameter/2);

    theObject = makeReplObjects(cube, spaceSize, nbrRepls);
    scene.add(theObject);

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 0.2, 1000 );
    light2.position.set(10, 20, -20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);

    fog = new THREE.Fog(0x000000, 100, 700);

    // let axes = new THREE.AxesHelper(10);
    // scene.add(axes);
}


let xLimit = (spaceSize.x + theObjectDiameter) / 2;
let yLimit = (spaceSize.y + theObjectDiameter) / 2;
let zLimit = (spaceSize.z + theObjectDiameter) / 2;



let lastWorldPos = new THREE.Vector3(0, 0, 0);

function centerObject() {
    let cameraWorldPos = camera.getWorldPosition(new THREE.Vector3());
    let v = cameraWorldPos.clone();
    v = v.sub(lastWorldPos);
    if (v.x < -xLimit) theObject.translateX(-spaceSize.x);
    else if (v.x > xLimit) theObject.translateX(spaceSize.x);
    if (v.y < -yLimit) theObject.translateY(-spaceSize.y);
    else if (v.y > yLimit) theObject.translateY(spaceSize.y);
    if (v.z < -zLimit) theObject.translateZ(-spaceSize.z);
    else if (v.z > zLimit) theObject.translateZ(spaceSize.z);
    let newWorldPos = theObject.getWorldPosition(new THREE.Vector3());
    if (!newWorldPos.equals(lastWorldPos))
        lastWorldPos = newWorldPos;
}

function makeCube(sizex, sizey, sizez) {
    let geom = new THREE.BoxGeometry(sizex, sizey, sizez);
    let mats = [];
    for (let i = 0; i < 6; i++) {
        let color = MyUtils.getRandomColor(0.5, 0.4, 0.6);
        mats.push(new THREE.MeshLambertMaterial({color: color}));
    }
    return new THREE.Mesh(geom, mats);
}

function makeSphere(rad, hsegs, vsegs) {
    // vsegs a multiple of 4
    let geom = new THREE.SphereGeometry(rad, hsegs, vsegs);
    let faces = geom.faces;
    let nbrFaces2 = faces.length / 2;
    for (let i = 0; i < 2; i++) {
        let colors = [0, 1].map(v => MyUtils.getRandomColor(0.5, 0.4, 0.6));
        for (let j = 0; j < nbrFaces2; j += 2) {
            let indx = j + i * nbrFaces2;
            faces[indx].color = faces[indx+1].color = colors[(j/2) % 2];
        }
        if (i === 0) { // south pole triangles
            for (let j = 0; j < hsegs; j++)
                faces[j].color = colors[j % 2];
        } else { // north pole triangles
            for (let j = faces.length - hsegs; j < faces.length; j++)
                faces[j].color = colors[j % 2];
        }
    }
    let mat = new THREE.MeshLambertMaterial({vertexColors: THREE.FaceColors})
    return new THREE.Mesh(geom, mat);
}


function makeTeapot(size) {
    let geom = new TeapotBufferGeometry(size);
    let matArgs = {color: 0xd4af37, shininess: 40};
    let mat = new THREE.MeshPhongMaterial(matArgs);
    return new THREE.Mesh(geom, mat);
}

// center replicates at origin
function makeReplObjects(object, spaceSize, n) {
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
    this.type = 'cube';
    this.nbrRepls = 11;
    this.fog = false;
}

function initGui() {
    var gui = new dat.GUI();
    let objectTypes =  ['cube', 'sphere', 'teapot'];
    gui.add(controls, 'type', objectTypes).onChange(updateObject);
    gui.add(controls, 'nbrRepls', 8, 30).name('n').onChange(updateObject);
    gui.add(controls, 'fog').onChange(updateFog);
}

function updateObject() {
    nbrRepls = controls.nbrRepls;
    if (nbrRepls % 2 === 0) nbrRepls += 1;
    let objectType = controls.type;
    let position = new THREE.Vector3();
    if (theObject) {
        position.copy(theObject.position);
        scene.remove(theObject);
    }
    switch (objectType) {
        case 'cube':  theObject = makeReplObjects(cube, spaceSize, nbrRepls);
                        break;
        case 'sphere':  theObject = makeReplObjects(sphere, spaceSize, nbrRepls);
                        break;
        case 'teapot':  theObject = makeReplObjects(teapot, spaceSize, nbrRepls);
                        break;
    }
    theObject.position.copy(position);
    scene.add(theObject);
}

function updateFog(flag) {
    if (flag) scene.fog = fog;
    else scene.fog = false;
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
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 14);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new FirstPersonControls(camera, renderer.domElement);
    cameraControls.lookSpeed = 0.04;
    cameraControls.movementSpeed = 20;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();


