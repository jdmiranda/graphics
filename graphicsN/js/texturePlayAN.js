/***********
 * texturePlayAN.js
 * Textures on a square
 * M. Laszlo
 * September 2019
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as dat from '../lib/dat.gui.module.js';


let camera, scene, renderer;
let cameraControls;
let gui;
let currentMat;
let texturesDir = './assets/';
let textureFiles = ['earth.jpg', 'jellyfish.jpg', 'manatee.gif', 'Boca.png', 'grid.jpg'];
let textures;

let controls = new function() {
    this.texture = 'earth';
    this.wrapS = 1;
    this.wrapT = 1;
    this.offsetU = 0;
    this.offsetV = 0;
    this.uvSquare = false;
}

function createScene() {
    initTextures();
    let matArgs = {map: textures.get('earth'), side: THREE.DoubleSide};
    currentMat = new THREE.MeshStandardMaterial(matArgs);
    let geom = new THREE.PlaneGeometry(10, 10);
    let square = new THREE.Mesh(geom, currentMat);
    square.position.set(5, 5, 0);
    scene.add(square);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(20, 10, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(-20, 10, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function initTextures() {
    textures = new Map();
    for (let file of textureFiles) {
        let texture = new THREE.TextureLoader().load(texturesDir + file);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        let textureName = file.slice(0, -4);
        textures.set(textureName, texture);
    }
}


function animate() {
    window.requestAnimationFrame(animate);
    render();
}


function render() {
    cameraControls.update();
    renderer.render(scene, camera);
}



function initGui() {
    gui = new dat.GUI();
    let textureNames = textureFiles.map(file => file.slice(0, -4));
    gui.add(controls, 'texture', textureNames).onChange(updateTexture);
    gui.add(controls, 'wrapS', 0.1, 10).name('wrapU').step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'wrapT', 0.1, 10).name('wrapV').step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'offsetU', 0, 1).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'offsetV', 0, 1).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'uvSquare').onChange(updateUvSquare);
}

function updateTextureTransform() {
    for (let val of textures.values()) {
        val.repeat = new THREE.Vector2(controls.wrapS, controls.wrapT);
        val.offset = new THREE.Vector2(controls.offsetU, controls.offsetV);
        // val.needsUpdate = true;   // needed if we change wrapS or wrapT
    }
}

function updateUvSquare(flag) {
}

function updateTexture(textureName) {
    let texture = textures.get(textureName);
    currentMat.map = texture;
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
    camera.position.set(5, 5, 20);
    camera.lookAt(new THREE.Vector3(5, 5, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target = new THREE.Vector3(5, 5, 0);
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
