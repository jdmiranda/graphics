 import * as THREE from '../build/three.module.js';
 import { OrbitControls } from './jsm/controls/OrbitControls.js';
 import { MyUtils } from '../lib/utilities.js';
 import * as dat from '../lib/dat.gui.module.js';
 
 let root, cutaways;
 let sphere;
 let camera, scene, renderer;
 let cameraControls;

 
 
 function createScene() {
     update();
     updateColor(new THREE.Color(controls.color));
 }

 function getRandomPointOnTorus(majorRad, minorRad) {
     // majorRad = center to torus tube
     // minorRad = radius of tube
     majorRad = majorRad || 2.0
     minorRad = minorRad || 0.5
     let u = Math.random() * 2 * Math.PI;
     let v = Math.random() * 2 * Math.PI;
     let x = (majorRad + minorRad * Math.cos(v)) * Math.cos(u);
     let y = (majorRad + minorRad * Math.cos(v)) * Math.sin(u);
     let z = minorRad * Math.sin(v);
     return new THREE.Vector3(x, y, z);
 }

 function distance(p1, p2){
    let distance_x = (p2.x - p1.x) ** 2
    let distance_y = (p2.y - p1.y) ** 2
    let distance_z = (p2.z - p1.z) ** 2
    return Math.sqrt(distance_x + distance_y + distance_z)
}

function getPointsOnTorus(nbrPoints, majorRad, minorRad){
    let vertices = [];
    for (let i = 0; i < nbrPoints; i++) {
        let p = getRandomPointOnTorus(majorRad, minorRad);
        vertices.push(p);
    }
    return vertices;
}

function seperatePoints(vertices, origin, dist){
    let remaining = [];
    let cutaways = [];
    for (let i = 0; i < nbrPoints; i++) {
        let p = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]);
        if (distance(p, origin) < dist) {
           cutaways.push(p.x, p.y, p.z)
        } else{
           remaining.push(p.x, p.y, p.z);
        }
    }
    return [remaining, cutaways];
}

function showPoints(vertices, cutaways){
    //vertices
    let geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    let color = new THREE.Color(controls.color);
    let matArgs = {color: color, size: 0.1};
    let mat = new THREE.PointsMaterial(matArgs);
    let points = new THREE.Points(geom, mat);
    //cutaways
    let geom2 = new THREE.BufferGeometry();
    geom2.setAttribute('position', new THREE.Float32BufferAttribute(cutaways, 3));
    let color2 = new THREE.Color('red');
    let matArgs2 = {color: color2, size: 0.1};
    let mat2 = new THREE.PointsMaterial(matArgs2);
    let points2 = new THREE.Points(geom2, mat2);
    return [points, points2];
}

const fibonacci = (n) => {
    const phi = (Math.sqrt(5) + 1)/2;
    return Math.round((Math.pow(phi, n+1)-(Math.pow(-1, n+1)/Math.pow(phi, n+1)))/Math.sqrt(5));
}


const v = new THREE.Vector3();

function getRandomPointInSphere( radius ) {

  const x = THREE.Math.randFloat( -1, 1 );
  const y = THREE.Math.randFloat( -1, 1 );
  const z = THREE.Math.randFloat( -1, 1 );
  const normalizationFactor = 1 / Math.sqrt( x * x + y * y + z * z );

  v.x = x * normalizationFactor * radius;
  v.y = y * normalizationFactor * radius;
  v.z = z * normalizationFactor * radius;

  return v;
}

function initPoints(dist_sphere) {
  
    
    let vertices = [];
    let removed = [];
    
    let origin_cutaway = camera.position;
    for (var i = 0; i < controls.nbr_points_sphere; i ++ ) {
      
      var p = getRandomPointInSphere( controls.radius_sphere );
      if (distance(p, origin_cutaway) < dist_sphere) {
        removed.push(p.x, p.y, p.z)
     } else{
        vertices.push(p.x, p.y, p.z);
     }
      
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  
    let material = new THREE.PointsMaterial( { color: controls.color_sphere, size: 0.1 } );
    let particles = new THREE.Points(geometry, material);
    return particles;
  
  
  }


function pointsOnSphere(nbrPoints){
    let vertices = [];
    let phi = fibonacci(nbrPoints);
    for (i = 0; i < nbrPoints; i++){
        let y = 1 - (i/(nbrPoints-1)) * 2; // y goes from 1 to -1 
        let radius = Math.sqrt(1-y*y); //radius at y
        let theta = phi * i;
        let x = Math.cos(theta) * radius;
        let z = Math.sin(theta) * radius;
        vertices.push(new THREE.Vector3(x, y , z));
    }
    return vertices;
}

 function pointsOnTorus(nbrPoints, majorRad, minorRad, d) {
     let vertices = [];
     let cutaways = [];
     let origin_cutaway = camera.position;
     for (let i = 0; i < nbrPoints; i++) {
         let p = getRandomPointOnTorus(majorRad, minorRad);
         if (distance(p, origin_cutaway) < d) {
            cutaways.push(p.x, p.y, p.z)
         } else{
            vertices.push(p.x, p.y, p.z);
         }
     }
     //vertices
     let geom = new THREE.BufferGeometry();
     geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
     let color = new THREE.Color(controls.color);
     let matArgs = {color: color, size: 0.1};
     let mat = new THREE.PointsMaterial(matArgs);
     let points = new THREE.Points(geom, mat);
     //cutaways
     let geom2 = new THREE.BufferGeometry();
     geom2.setAttribute('position', new THREE.Float32BufferAttribute(cutaways, 3));
     let color2 = new THREE.Color('red');
     let matArgs2 = {color: color2, size: 0.1};
     let mat2 = new THREE.PointsMaterial(matArgs2);
     let points2 = new THREE.Points(geom2, mat2);
     return [points, points2];
 }
 
 let controls = new function() {
     this.majRad = 4.0;
     this.minRad = 1.0;
     this.nbrPoints = 100000;
     this.color = '#00C0C0';
     this.distance_torus = 10;
     this.distance_sphere = 15;
     this.radius_sphere = 5.5;
     this.color_sphere = '#c09e00';
     this.nbr_points_sphere = 500000;
 }
 
 function initGui() {
     let gui = new dat.GUI();
     gui.add(controls, 'majRad', 1, 5).step(0.1).name('Torus Maj radius').onChange(update);
     gui.add(controls, 'minRad', 0.5, 1.5).step(0.1).name('Torus Min radius').onChange(update);
     gui.add(controls, 'nbrPoints', 200, 200000).step(1).name('Torus nbr points').onChange(update);
     gui.add(controls, 'distance_torus', 0, 100).step(0.1).name('Distance Torus').onChange(update);
     gui.addColor(controls, 'color').name('Torus Color').onChange(function (v) {updateColor(new THREE.Color(v))});
     
     
     gui.add(controls, 'radius_sphere', 0, 15).step(0.1).name('Sphere Radius').onChange(update);
     gui.add(controls, 'nbr_points_sphere', 1000, 1000000).step(1).name('Sphere nbr points').onChange(update);
     gui.add(controls, 'distance_sphere', 0, 100).step(0.1).name('Distance Sphere').onChange(update);
     gui.addColor(controls, 'color_sphere').name('Sphere Color').onChange(function(v){updateSphereColor(new THREE.Color(v))});

 }
 
 function update() {
     let majRadius = controls.majRad;
     let minRadius = controls.minRad;
     let nbrPoints = controls.nbrPoints;
     let dist_torus = controls.distance_torus;
     let dist_sphere = controls.distance_sphere;
     if (root)
         scene.remove(root);
    if (cutaways)
        scene.remove(cutaways);
     let retVal = pointsOnTorus(nbrPoints, majRadius, minRadius, dist_torus);
     root = retVal[0];
     cutaways = retVal[1];
     scene.add(root);
     //scene.add(cutaways);

     if (sphere)
        scene.remove(sphere);
    sphere = initPoints(dist_sphere);
    scene.add(sphere);
 }

 
 function updateColor(color) {
     let mat = root.material;
     mat.color = color;
 }

 function updateSphereColor(color) {
     let mat = sphere.material;
     mat.color = color;
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
     camera.position.set(0, 0, 20);
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
 initGui();
 createScene();
 
 
 