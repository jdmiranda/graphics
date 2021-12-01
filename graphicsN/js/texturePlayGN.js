/***********
 * someGeometriesAN.js
 * Some three.js geometries
 * M. Laszlo
 * September 2019
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';


let camera, scene, renderer;
let cameraControls;
let gui
let currentMat, currentMesh;
let currentObjectName;
let texturesDir = './assets/';
let textureFiles = ['earth.jpg', 'jellyfish.jpg', 'manatee.png', 'Boca.png', 'grid.jpg'];
let textures;

let controls = new function() {
    this.type = 'Sphere';
    this.texture = 'earth';
    this.wrapS = 1;
    this.wrapT = 1;
    this.offsetU = 0;
    this.offsetV = 0;
    this.rotation = 0;
    this.centerX = 0;
    this.centerY = 0;
}

function createScene() {
    textures = new Map();
    for (let file of textureFiles) {
        let texture = new THREE.TextureLoader().load(texturesDir + file);
        let textureName = file.slice(0, -4);
        textures.set(textureName, texture);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    }
    currentMat = new THREE.MeshLambertMaterial({map: textures.get('earth')});
    updateObject('Sphere');
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(20, 10, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(-20, 10, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
}


function updateObject(objectType) {
    let geom;     
    if (currentMesh)
        scene.remove(currentMesh);
    switch (objectType) {
        case 'Sphere':  geom = new THREE.SphereGeometry(10, 30, 30);
                        break;
        case 'Torus':   geom = new THREE.TorusGeometry(10, 3, 24, 36);
                        break;
        case 'Octahedron': geom = new THREE.OctahedronGeometry(8);
                        break;
        case 'Knot':    geom = new THREE.TorusKnotGeometry(5, 2, 100, 16);
                        break;
        case 'Icosahedron': geom = new THREE.IcosahedronGeometry(10);
                        break;
        case 'Cube': geom = new THREE.BoxGeometry(10, 10, 10);
                        break;
        case 'Dodecahedron': geom = new THREE.DodecahedronGeometry(10);
                        break;
        case 'Cylinder': geom = new THREE.CylinderGeometry(5, 5, 20, 16);
                        break;
    }
    if (geom) {
        currentMesh = new THREE.Object3D;
        currentMesh.add(new THREE.Mesh(geom, currentMat));
        scene.add(currentMesh);
        currentObjectName = objectType;
    }
}

function initGui() {
    gui = new dat.GUI();
    let objectTypes =  ['Sphere', 'Torus', 'Cylinder', 'Cube', 'Octahedron', 'Icosahedron', 'Dodecahedron', 'Knot']
    gui.add(controls, 'type', objectTypes).onChange(updateObject);
    let textureNames = textureFiles.map(file => file.slice(0, -4));
    gui.add(controls, 'texture', textureNames).onChange(updateTexture);
    currentObjectName = 'Sphere';
    gui.add(controls, 'wrapS', 0.1, 4).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'wrapT', 0.1, 4).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'offsetU', 0, 1).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'offsetV', 0, 1).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'rotation', -180, 180).step(1).onChange(updateTextureTransform);
    gui.add(controls, 'centerX', 0, 1).step(0.01).onChange(updateTextureTransform);
    gui.add(controls, 'centerY', 0, 1).step(0.01).onChange(updateTextureTransform);
}

function updateTexture(textureName) {
    let texture = textures.get(textureName);
    currentMat.map = texture;
}

function updateTextureTransform() {
    for (let val of textures.values()) {
        let wrapS = controls.wrapS, wrapT = controls.wrapT;
        let offsetU = controls.offsetU, offsetV = controls.offsetV;
        let rotation = MyUtils.degreesToRadians(controls.rotation);
        let centerX = controls.centerX, centerY = controls.centerY;
        // update main textures
        val.repeat = new THREE.Vector2(wrapS, wrapT);
        val.offset = new THREE.Vector2(controls.offsetU, controls.offsetV);
        val.rotation = rotation;
        val.center = new THREE.Vector2(centerX, centerY);
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
        cameraControls.update();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enableDamping = true; 
    cameraControls.dampingFactor = 0.04;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();
