/***********
 * quadBandNA.js
 * A quadratic lathed band
 * M. Laszlo
 * June 2020
 ***********/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let band, mat;
let y1 = 8;


function createScene() {
    let matArgs = {side: THREE.DoubleSide, color: 0x1562c9, specular: 0xFF9999, shininess: 80};
    mat = new THREE.MeshPhongMaterial(matArgs);
    band = createBand();
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(10, -20, -20);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(band);
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





function createBand() {
    let x1 = controls.x1;
    let X = controls.X;
    let segments = controls.segments;
    let density = controls.density;
    let geom = createQuadBandGeometry(x1, y1, X, density, segments);
    return new THREE.Mesh(geom, mat);
}



let controls = new function() {
    this.x1 = 1;
    this.X = -1;
    this.segments = 12;
    this.density = 30;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'x1', 0.001, 64).onChange(update);
    gui.add(controls, 'X', -10, 10).onChange(update);
    gui.add(controls, 'segments', 3, 40).step(1).onChange(update);
    gui.add(controls, 'density', 2, 400).step(1).onChange(update);
}

function update() {
    scene.remove(band);
    band = createBand();
    scene.add(band);
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
        renderer.render(scene, camera);
    });
    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, -40);
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

