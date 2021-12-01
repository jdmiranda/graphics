import * as THREE from '../build/three.module.js';

let MyUtils = {

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, 

  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }, 

  getRandomPointOnSphere(rad) {
    rad = rad || 1.0;
    var theta = Math.random() * 2 * Math.PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var x = rad * Math.cos(theta) * Math.sin(phi);
    var y = rad * Math.sin(theta) * Math.sin(phi);
    var z = rad * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, 

  getRandomColor(minSaturation, minLightness, maxLightness) {
    minSaturation = minSaturation || 0.3;
    minLightness = minLightness || 0.0;
    maxLightness = maxLightness || 1.0;
    var hue = Math.random();
    var sat = this.getRandomFloat(minSaturation, 1.0);
    var lit = this.getRandomFloat(minLightness, maxLightness);
    return new THREE.Color().setHSL(hue, sat, lit);
  },

  rpsToRadians(rps, t) {
    return 2.0 * Math.PI * rps * t;
  }, 

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }, 

  makeSpin(indx, rps="rps") {
    return function (delta) {
        let vec = this.rotation.toVector3();
        let val = vec.getComponent(indx);
        val += MyUtils.rpsToRadians(this[rps], delta);
        val %= 2 * Math.PI;
        vec.setComponent(indx, val);
        this.rotation.setFromVector3(vec);
    }
  },

  mod(x, n) {
    return (x % n + n) % n;
  }, 

  linspace(a, b, n) {
      if (b <= a) throw "b must be greater than a";
      if (n < 2) throw "n must be greater than 1"
      let res = [];
      let inc = (b - a) / (n - 1);
      for (let i = 0; i < n; i++)
          res.push(a + i * inc);
      return res;
  },

  Subject : class {
    constructor() {
        this.observers = new Set();
    }

    register(obs) {
        if (!this.observers.has(obs))
            this.observers.add(obs);
    }

    unregister(obs) {
        if (this.observers.has(obs))
            this.observers.delete(obs); 
    }

    notify(data) {
        this.observers.forEach(function (obs) {obs.update(data);});
    }

    // notify(data) {
    //     this.observers.forEach(obs => obs.update(data));
    // }


    has(obj) {
        return this.observers.has(obj);
    }
  },

  makeAxes(params) {
    var theAxes = new THREE.Object3D();

    params = params || {};
    var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
    var axisLength = params.axisLength !== undefined ? params.axisLength:11;
    var axisTess = params.axisTess !== undefined ? params.axisTess:48;

    var axisXMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    var axisYMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    var axisZMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
    axisXMaterial.side = THREE.DoubleSide;
    axisYMaterial.side = THREE.DoubleSide;
    axisZMaterial.side = THREE.DoubleSide;
    var axisX = new THREE.Mesh(
      new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
      axisXMaterial
      );
    var axisY = new THREE.Mesh(
      new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
      axisYMaterial
      );
    var axisZ = new THREE.Mesh(
      new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
      axisZMaterial
      );
    axisX.rotation.z = - Math.PI / 2;
    axisX.position.x = axisLength/2-0;  // was 2-1

    axisY.position.y = axisLength/2-0;  // was 2-1

    axisZ.rotation.y = - Math.PI / 2;
    axisZ.rotation.z = - Math.PI / 2;
    axisZ.position.z = axisLength/2-0;  // was 2-1

    theAxes.add(axisX);
    theAxes.add(axisY);
    theAxes.add(axisZ);

    var arrowX = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
      axisXMaterial
      );
    var arrowY = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
      axisYMaterial
      );
    var arrowZ = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
      axisZMaterial
      );
    arrowX.rotation.z = - Math.PI / 2;
    arrowX.position.x = axisLength - 0 + axisRadius*4/2;  // was - 1

    arrowY.position.y = axisLength - 0 + axisRadius*4/2;  // was - 1

    arrowZ.rotation.z = - Math.PI / 2;
    arrowZ.rotation.y = - Math.PI / 2;
    arrowZ.position.z = axisLength - 0 + axisRadius*4/2;  // was - 1

    theAxes.add(arrowX);
    theAxes.add(arrowY);
    theAxes.add(arrowZ);
    return theAxes;
  },

  makeAxis(params) {
    var theAxis = new THREE.Object3D();

    params = params || {};
    // xyz: 0 (X); 1 (Y); 2 (Z)
    var xyz = params.xyz !== undefined ? params.xyz : 1;
    var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
    var axisLength = params.axisLength !== undefined ? params.axisLength:11;
    var axisTess = params.axisTess !== undefined ? params.axisTess:48;
    var color = params.color !== undefined ? params.color : 0xff0000;
    var material = params.material !== undefined ? params.material : new THREE.MeshLambertMaterial({color:color});
    material.side = THREE.DoubleSide;
   
    var axis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
      material
      );
    if (xyz == 0) { // X
      axis.rotation.z = - Math.PI / 2;
      axis.position.x = axisLength / 2;
    } else if (xyz == 1) { // Y
      axis.position.y = axisLength / 2;
    }
    else { // Z
      axis.rotation.y = - Math.PI / 2;
      axis.rotation.z = - Math.PI / 2;
      axis.position.z = axisLength / 2-0; 
    }
    theAxis.add(axis);

    var arrow = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
      material
      );
    if (xyz == 0) {
      arrow.rotation.z = - Math.PI / 2;
      arrow.position.x = axisLength - 0 + axisRadius*4/2;
    } else if (xyz == 1) {
      arrow.position.y = axisLength + axisRadius*4/2; 
    } else {
      arrow.rotation.z = - Math.PI / 2;
      arrow.rotation.y = - Math.PI / 2;
      arrow.position.z = axisLength + axisRadius*4/2; 
    }
    theAxis.add(arrow
      );
    return theAxis;
  }

};

export { MyUtils };


