/***********
 * texturePlayAN.js
 * Textures on a square
 * M. Laszlo
 * September 2019
 ***********/

 /**
 We have UV space defined in terms of geometry surface space.
 Then we have the texture's local space defined in terms of UV
 space via translation (offset), scale (repeat), and rotation.
 Does this follow the TRS order of transformations of Object3Ds?
 **/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as dat from '../lib/dat.gui.module.js';


let camera, scene, renderer;
let cameraControls;
let gui;
let currentMat, replMat;
let texturesDir = './assets/';
let textureFiles = ['earth.jpg', 'jellyfish.jpg', 'manatee.png', 'Boca.png', 'grid.jpg'];
let textures, replTextures;
let squareOutline, replicatePlane;
let side = 10;

let controls = new function() {
    this.texture = 'earth';
    this.wrapS = 1;
    this.wrapT = 1;
    this.offsetU = 0;
    this.offsetV = 0;
    this.rotation = 0;
    this.clamp = false;
}

function createScene() {
    initTextures();
    let matArgs = {map: textures.get('earth'), side: THREE.DoubleSide};
    currentMat = new THREE.MeshStandardMaterial(matArgs);
    let geom = new THREE.PlaneGeometry(side, side);
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
    squareOutline = createSquareOutline(3);
    squareOutline.position.set(-10, 0, 0);
    scene.add(squareOutline);
    replicatePlane = createReplicatePlane(9);
    replicatePlane.position.set(-5.5, 4.5, 0)
    scene.add(replicatePlane);

    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function createSquareOutline(len) {
    let root = new THREE.Object3D();
    let geom = new THREE.Geometry();
    geom.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(len, 0, 0),
        new THREE.Vector3(len, len, 0),
        new THREE.Vector3(0, len, 0),
        new THREE.Vector3(0, 0, 0));
    let red = new THREE.Color(1, 0, 0);
    let green = new THREE.Color(0, 1, 0);
    let blue = new THREE.Color(0, 0, 1);
    geom.colors.push(red, blue, blue, blue, green);
    let matArgs = {linewidth: 3, vertexColors: true};
    let mat = new THREE.LineBasicMaterial(matArgs);
    let line = new THREE.Line(geom, mat);
    root.add(line);
    return root;
}

function createReplicatePlane(side) {
    let geom = new THREE.PlaneGeometry(side, side);
    let matArgs = {map: replTextures.get('earth'), side: THREE.DoubleSide, color: 0x999999};
    replMat = new THREE.MeshStandardMaterial(matArgs);
    let square = new THREE.Mesh(geom, replMat);
    return square;
}

function initTextures() {
    textures = new Map();
    replTextures = new Map();
    for (let file of textureFiles) {
        let texture = new THREE.TextureLoader().load(texturesDir + file);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        let textureName = file.slice(0, -4);
        textures.set(textureName, texture);
        // let replTexture = texture.clone(); // should work
        let replTexture = new THREE.TextureLoader().load(texturesDir + file);
        replTexture.wrapS = THREE.RepeatWrapping;
        replTexture.wrapT = THREE.RepeatWrapping;
        replTexture.repeat = new THREE.Vector2(3, 3);
        replTextures.set(textureName, replTexture);
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
    gui.add(controls, 'wrapS', 0.1, 3).name('wrapU').step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'wrapT', 0.1, 3).name('wrapV').step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'offsetU', 0, 1).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'offsetV', 0, 1).step(0.1).onChange(updateTextureTransform);
    gui.add(controls, 'rotation', -3.14, 3.14).step(0.01).onChange(updateTextureTransform);
    gui.add(controls, 'clamp').onChange(updateTextureTransform);
}

// can we reverse order of transforms to SRT?????
// or do we need to create nested scene graph
// or can we take inverse matrix?
function updateTextureTransform() {
    for (let val of textures.values()) {
        let wrapS = controls.wrapS, wrapT = controls.wrapT;
        let offsetU = controls.offsetU, offsetV = controls.offsetV;
        let rotation = controls.rotation;
        let clamp = controls.clamp;
        // update main textures
        val.repeat = new THREE.Vector2(wrapS, wrapT);
        val.offset = new THREE.Vector2(controls.offsetU, controls.offsetV);
        val.rotation = rotation;
        // update square over replicate textures
        let square = squareOutline.children[0];
        square.scale.set(wrapS, wrapT, 1);
        square.position.set(3 * offsetU, 3 * offsetV, 0);
        square.rotation.z = -rotation;

        if (clamp) {
            val.wrapS = val.wrapT = THREE.ClampToEdgeWrapping;
        } else {
            val.wrapS = val.wrapT = THREE.RepeatWrapping;
        }
        val.needsUpdate = true;   // needed if we change wrapS or wrapT
    }
}


function updateTexture(textureName) {
    let texture = textures.get(textureName);
    currentMat.map = texture;
    let replTexture = replTextures.get(textureName);
    replMat.map = replTexture;
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
    camera.position.set(0, 5, 20);
    camera.lookAt(new THREE.Vector3(0, 5, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target = new THREE.Vector3(0, 5, 0);
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
