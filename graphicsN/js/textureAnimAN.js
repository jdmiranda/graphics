/***********
 * textureAnimAN.js
 * M. Laszlo
 * June 2020
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
let textureFiles = ['stripes.png', 'dots.jpg', 'manatee.png'];
let textures;

let clock = new THREE.Clock();
let subject = new MyUtils.Subject();

let controls = new function() {
    this.type = 'Sphere';
    this.texture = 'stripes';
    this.rotationRPS = 0;
    this.horizontalOPS = 0;
    this.verticalOPS = 0;
}

function createScene() {
    initTextures();
    currentMat = new THREE.MeshPhongMaterial({shininess: 80, map: textures.get('stripes')});
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

function initTextures() {
    textures = new Map();
    for (let file of textureFiles) {
        let texture = new THREE.TextureLoader().load(texturesDir + file);
        let textureName = file.slice(0, -4);
        textures.set(textureName, texture);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.rotation = 0;
        texture.offset = new THREE.Vector2(0, 0); 
        texture.rps = 0;  // rate of rotation
        texture.offsetRates = [0, 0];  // rates of offset  
        texture.update = updateTextureMotion;
        subject.register(texture);
    }
}

function updateTextureMotion(delta) {
    let val = this.rotation;
    val += MyUtils.rpsToRadians(this.rps, delta);
    val %= 2 * Math.PI;
    this.rotation = val;
    for (let i = 0; i < 2; i++) {
        val = this.offset.getComponent(i);
        val += this.offsetRates[i] * delta;
        val %= 1;
        this.offset.setComponent(i, val);
    }
}

function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
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
    gui.add(controls, 'rotationRPS', -0.1, 0.1).name('rotation RPS').step(0.01).onChange(updateTextureRates);
    gui.add(controls, 'horizontalOPS', -0.5, 0.5).name('offsetU PPS').step(0.01).onChange(updateTextureRates);
    gui.add(controls, 'verticalOPS', -0.5, 0.5).name('offsetV PPS').step(0.01).onChange(updateTextureRates);
}


function updateTexture(textureName) {
    let texture = textures.get(textureName);
    currentMat.map = texture;
}

function updateTextureRates() {
    for (let val of textures.values()) {
        val.rps = controls.rotationRPS;
        val.offsetRates[0] = controls.horizontalOPS;
        val.offsetRates[1] = controls.verticalOPS;
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
        update();  // update animation
        cameraControls.update();
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enableDamping = true; 
    cameraControls.dampingFactor = 0.02;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



init();
createScene();
initGui();
