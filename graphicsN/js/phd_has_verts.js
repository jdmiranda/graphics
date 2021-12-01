
 import * as THREE from '../build/three.module.js';
 import { OrbitControls } from './jsm/controls/OrbitControls.js';
 import { MyUtils } from '../lib/utilities.js';
 import * as dat from '../lib/dat.gui.module.js';

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

function createScene() {
    let geo = createCylinder(8, 2, 2);
    let color = new THREE.Color(1, 1, 0);
    let mat = new THREE.PointsMaterial({color: color, side: THREE.DoubleSide});
    mat.polygonOffset = true;
    mat.polygonOffsetUnits = 1;
    mat.polygonOffsetFactor = 1;
    let mesh = new THREE.Mesh(geo, mat);
    let basicMat = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, wireframeLinewidth: 2});
    let geoWireMesh = new THREE.Mesh(geo, basicMat);
    let light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 10);
    let light2 = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light2.position.set(0, -10, -10);
    let ambientLight = new THREE.AmbientLight(0x222222);

    let g = make_points(geo)
    //scene.add(g)
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(mesh);
    scene.add(geoWireMesh);
    let axes = new THREE.AxesHelper(10);
    scene.add(axes);
}

function lerp(a,b,t){
  return a + (b -a ) * t
}

function lerp_vector(a,b,t){
  let ret_x = lerp(a.x, b.x, t)
  let ret_y = lerp(a.y, b.y, t)
  let ret_z = lerp(a.z, b.z, t)
  return [ret_x, ret_y, ret_z]
}

function normalize ( x, min, max)
{
  return (x - min)/ (max - min)
}

function make_points(geometry){
    let vertices = [];
    for (let i = 0; i < geometry.vertices.length; i++){
      let v = geometry.vertices[i];
      vertices.push(v.x, v.y, v.z);
    }

    for (let i = 0; i < 1; i++){
      let vert_a = geometry.vertices[geometry.faces[i].a]
      let vert_b = geometry.vertices[geometry.faces[i].b]
      let vert_c = geometry.vertices[geometry.faces[i].c]
      console.log(vert_a)
      console.log(vert_b)
      console.log(vert_c)

      // let dist_ab_x = vert_a.x - vert_b.x;
      // let dist_ab_y = Math.sqrt((vert_a.y - vert_b.y)**2);
      // let dist_ab_z = Math.sqrt((vert_a.z - vert_b.z)**2);

      // console.log('dist for x is :' + dist_ab_x);
      // console.log('dist for y is :' + dist_ab_y);
      // console.log('dist for z is :' + dist_ab_z);

      
      for (let j = 0; j < 10; j++){
        let new_x = lerp(vert_b.x, vert_a.x, normalize(j, -1, 1));
       // console.log(new_p)
        vertices.push(new_x, vert_b.y, vert_b.z);
        
      }


      // for (let j = 0; j < 10; j++){
      //   let new_x = vert_a.x-(j * .5);
      //   console.log(new_x)
      //   vertices.push(new_x, vert_a.y, vert_a.z);
        
      // }
    }
    let geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    let color = new THREE.Color('red');
    let matArgs = {color: color, size: 0.3};
    let mat = new THREE.PointsMaterial(matArgs);
    let points = new THREE.Points(geom, mat);
    return points;
}

function createCylinder(n, rad, len) {
  let len2 = len / 2;
  let geom = new THREE.Geometry();
  let inc = 2 * Math.PI / n;
  for (let i = 0, a = 0; i < n; i++, a += inc) {
      let cos = Math.cos(a);
      let sin = Math.sin(a);
      geom.vertices.push(new THREE.Vector3(rad * cos, -len2, rad * sin));
      geom.vertices.push(new THREE.Vector3(rad * cos, len2, rad * sin));
  }

  let vertCount = (n *2) - 2 ;
  for (let i = 0; i < vertCount; i++) {
    if ((i %2) ==0){
      let face = new THREE.Face3(i, i+2, 0);
      let face1 = new THREE.Face3(i, i+1, i+3);
      let face2 = new THREE.Face3(i, i+2, i+3);
      geom.faces.push(face,face1,face2);
    } else {
      let face4 = new THREE.Face3(i,i+2,1)
      geom.faces.push(face4);
    }
  }

   let face2 = new THREE.Face3(0,1,vertCount);
   let face3 = new THREE.Face3(1,vertCount,vertCount+1);
   geom.faces.push(face2,face3);

  geom.computeFaceNormals();
  return geom;
}

let controls = new function() {
  this.majRad = 4.0;
  this.minRad = 1.0;
  this.nbrPoints = 10000;
  this.color = '#00C0C0';
  this.distance = 0;
}

function initGui() {
  let gui = new dat.GUI();
  gui.add(controls, 'majRad', 1, 5).step(0.1).name('Major radius').onChange(update);
  gui.add(controls, 'minRad', 0.5, 1.5).step(0.1).name('Minor radius').onChange(update);
  gui.add(controls, 'nbrPoints', 200, 10000).step(1).name('Nbr points').onChange(update);
  gui.addColor(controls, 'color').onChange(function (v) {updateColor(new THREE.Color(v))});
  gui.add(controls, 'distance', 0, 10).step(0.1).name('Distance').onChange(update);
}

function update() {
  let majRadius = controls.majRad;
  let minRadius = controls.minRad;
  let nbrPoints = controls.nbrPoints;
  let d = controls.distance;
  if (root)
      scene.remove(root);
 if (cutaways)
     scene.remove(cutaways);
  let retVal = pointsOnTorus(nbrPoints, majRadius, minRadius, d);
  root = retVal[0];
  cutaways = retVal[1];
  scene.add(root);
  scene.add(cutaways);
}

function updateColor(color) {
  let mat = root.material;
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

