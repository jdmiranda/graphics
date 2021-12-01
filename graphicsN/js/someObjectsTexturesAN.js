/***********
 * someObjectsTexturesAN.js
 * based on someGeometriesTexturesAN.js
 * M. Laszlo
 * June 2020
 ***********/

 // https://graphics.stanford.edu/courses/cs348b-competition/cs348b-05/donut/index.html
 // http://math.hws.edu/graphicsbook/c4/s3.html


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as dat from '../lib/dat.gui.module.js';


let camera, scene, renderer;
let cameraControls;
let gui;
let currentMesh;
let currentObjectName;
let texturesDir = './assets/';
let textureFiles = ['donut.jpg', 'crate.png', 'orange.jpg', 'earth.jpg', 'paperclip.png'];
let textures, meshes;


function createScene() {
    initObjects();
    updateObject('donut');
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 10, -20);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
}

function initObjects() {
    textures = new Map();
    meshes = new Map();
    for (let file of textureFiles) {
        let texture = new THREE.TextureLoader().load(texturesDir + file);
        let textureName = file.slice(0, -4);
        textures.set(textureName, texture);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        let geom, mat, wrapS = 1, wrapT = 1;
        switch (textureName) {
            case 'donut':
                geom = new THREE.TorusGeometry(5, 2, 30, 30);
                mat = new THREE.MeshLambertMaterial({color: 0xd0b59b});
                wrapS = 4;
                wrapT = 4;
                break;
            case 'crate':
                geom = new THREE.BoxGeometry(10, 10, 10);
                mat = new THREE.MeshLambertMaterial({color: 0x4c3023});
                break;
            case 'orange':
                geom = new THREE.SphereGeometry(8, 30, 30);
                mat = new THREE.MeshLambertMaterial({color: 0xff8500});
                wrapS = 4;
                wrapT = 4;
                break;
            case 'earth':
                geom = new THREE.SphereGeometry(8, 30, 30);
                mat = new THREE.MeshLambertMaterial({color: 0x00334d});
                break;
            case 'paperclip':
                geom = new THREE.PlaneGeometry(5, 10);
                mat = new THREE.MeshLambertMaterial({transparent: true, opacity: 1, color: 0xe19526, side: THREE.DoubleSide});
                break;
        }
        texture.repeat = new THREE.Vector2(wrapS, wrapT);
        mat.userData.color = mat.color;
        let mesh = new THREE.Mesh(geom, mat);
        meshes.set(textureName, mesh);
    }
}

function updateObject() {
    let objectName = controls.name;
    let textured = controls.textured;
    if (currentMesh)
        scene.remove(currentMesh);
    currentMesh = meshes.get(objectName);
    let texture = textures.get(objectName);
    let mat = currentMesh.material;
    if (textured) {
        mat.map = texture;
        mat.color = new THREE.Color(0xffffff);
    } else {
        mat.map = null;
        mat.color = mat.userData.color;
    }
    mat.needsUpdate = true;
    scene.add(currentMesh);
}


let controls = new function() {
    this.name = 'donut';
    this.textured = false;
}

function initGui() {
    gui = new dat.GUI();
    let objectNames = textureFiles.map(n => n.slice(0, -4));
    // let objectNames =  ['donut', 'crate']
    gui.add(controls, 'name', objectNames).onChange(updateObject);
    gui.add(controls, 'textured').onChange(updateObject);
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
