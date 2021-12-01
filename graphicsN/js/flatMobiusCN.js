/***********
 * flatMobiusCN.js
 * M. Laszlo
 * July 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';

import TWEEN from '../build/tween.es.js';


let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let spaceSize = new THREE.Vector2(16, 6);
let theObject;
let theObjectDiameter = 2.84;  // 2 * sqrt(2)
let square, circle, manatee, face;
let clippingPlanes;


function createScene() {
    face = makeFace(theObjectDiameter / 2);
    theObject = makeTwoObjects(face, spaceSize);
    scene.add(theObject);
    scene.add(makeFloor(spaceSize));

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(ambientLight);

    // let axes = new THREE.AxesHelper(10);
    // scene.add(axes);
}

function makeFloor(spaceSize) {
    let geom = new THREE.PlaneGeometry(spaceSize.x, spaceSize.y);
    let matArgs = {color: 0xc0c0c0, side: THREE.DoubleSide};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let floor = new THREE.Mesh(geom, mat);
    floor.translateZ(-0.01);
    return floor;
}


function makeFace(size) {
    let root = new THREE.Object3D();
    let n = 30;
    let geom = new THREE.CircleGeometry(size, n);
    let color = MyUtils.getRandomColor(0.5, 0.4, 0.6);
    let matArgs = {color: color};
    let circle = new THREE.Mesh(geom, new THREE.MeshLambertMaterial(matArgs));
    root.add(circle);
    geom = new THREE.CircleGeometry(size/4, n);
    matArgs.color = 0x000000;
    let leftEye = new THREE.Mesh(geom, new THREE.MeshLambertMaterial(matArgs));
    leftEye.position.set(-size/2, -size/2, 0.2);
    root.add(leftEye);
    matArgs.color = 0xff0000;
    let rightEye = new THREE.Mesh(geom, new THREE.MeshLambertMaterial(matArgs));
    rightEye.position.set(size/2, -size/2, 0.2);
    root.add(rightEye);
    return root;
}


function makeTwoObjects(object, spaceSize) {
    let root = new THREE.Object3D();
    let obj = object.clone();
    root.add(obj);
    obj = object.clone();
    obj.position.x = spaceSize.x;
    obj.scale.y = -1;
    root.add(obj);

    // we add a level to the scene graph so we can translate-rotate
    // the parent level, then translate-rotate the child level
    let root2 = new THREE.Object3D();
    root2.position.x = -spaceSize.x;
    root2.add(root); 
    return root2;
}


var controls = new function() {
    this.clip = true;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'clip').onChange(updateClipping);
}


function updateClipping(flag) {
    if (flag) renderer.clippingPlanes = clippingPlanes;
    else renderer.clippingPlanes = [];
}

function runTween() {
    theObject.position.x = -spaceSize.x;
    theObject.rotation.z = 0;
    theObject.children[0].position.x = 0;
    theObject.children[0].rotation.z = 0;
    let translate_tween_1 = new TWEEN.Tween(theObject.position)
        .to({x: 0}, 5000);
    let translate_tween_2 = new TWEEN.Tween(theObject.children[0].position)
        .to({x: -spaceSize.x}, 5000);
    let rotate_tween_1 = new TWEEN.Tween(theObject.rotation)
        .to({z: Math.PI}, 5000);
    let rotate_tween_2 = new TWEEN.Tween(theObject.rotation)
        .to({z: 2 * Math.PI}, 5000);

    translate_tween_1.chain(rotate_tween_1);
    rotate_tween_1.chain(translate_tween_2);
    translate_tween_2.chain(rotate_tween_2);
    rotate_tween_2.onComplete(function () {
        runTween();
    });
    translate_tween_1.start();
}


function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    // clipping
    clippingPlanes = getClippingPlanes();
    renderer.clippingPlanes = clippingPlanes;
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.setAnimationLoop(function () {
        let delta = clock.getDelta();
        TWEEN.update();
        cameraControls.update();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 24);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
                cameraControls.enableDamping = true; 
                cameraControls.dampingFactor = 0.08;
}

function getClippingPlanes() {
    let clippingPlanes = [];
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), spaceSize.x / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), spaceSize.x / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), spaceSize.y / 2));
    clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), spaceSize.y / 2));
    return clippingPlanes;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();
runTween();


