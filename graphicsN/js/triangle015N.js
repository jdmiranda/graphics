/***********
 * triangle015N.js
 * A simple triangle with orbit control
 * M. Laszlo
 * September 2019
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';


let camera, scene, renderer;
let cameraControls;


function createScene() {
    let triangle = makeTriangle();
    let axes = new THREE.AxesHelper(10);
    scene.add(triangle);
    scene.add(axes);
}


function makeTriangle() {
    let geom = new THREE.Geometry();
    let a = new THREE.Vector3(0, 0, 0);
    let b = new THREE.Vector3(4, 0, 0);
    let c = new THREE.Vector3(0, 8, 0);
    geom.vertices.push(a, b, c);
    let face = new THREE.Face3(0, 1, 2);
    geom.faces.push(face);
    let mat = new THREE.MeshBasicMaterial({color: 0xFF00FF, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(geom, mat);
    return mesh;
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


