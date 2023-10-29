import * as THREE from "three";
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// texture 
const textureLoader = new THREE.TextureLoader();

// grass texture
const grass_textureBaseColor = textureLoader.load('../texture/grass/Ground_Grass_001_COLOR.jpg');
const grass_textureNormalColor = textureLoader.load('../texture/grass/Ground_Grass_001_NORM.jpg');
const grass_textureRoughnessColor = textureLoader.load('../texture/grass/Ground_Grass_001_ROUGH.jpg');

// red_brick texture - 무한대 왼편 바닥
const red_brick_textureBaseColor = textureLoader.load('../texture/red_brick/Red_Brick_basecolor.jpg');
const red_brick_textureNormalColor = textureLoader.load('../texture/red_brick/Red_Brick_normal.jpg');
const red_brick_textureHeightColor = textureLoader.load('../texture/red_brick/Red_Brick_height.png');
const red_brick_textureRoughnessColor = textureLoader.load('../texture/red_brick/Red_Brick_roughness.jpg');

// gray_brick texture - 가천관쪽 바닥
const gray_brick_textureBaseColor = textureLoader.load('../texture/gray_brick/Gray_Brick_COLOR.jpg');
const gray_brick_textureNormalColor = textureLoader.load('../texture/gray_brick/Gray_Brick_NORM.jpg');
const gray_brick_textureRoughnessColor = textureLoader.load('../texture/gray_brick/Gray_Brick_ROUGH.jpg');

// ground_dirt texture - 바나대(예대)쪽 바닥
const dirt_textureBaseColor = textureLoader.load('../texture/ground_dirt/Ground_Dirt_BaseColor.jpg');
const dirt_textureNormalColor = textureLoader.load('../texture/ground_dirt/Ground_Dirt_Normal.jpg');
const dirt_textureHeightColor = textureLoader.load('../texture/ground_dirt/Ground_Dirt_Height.png');
const dirt_textureRoughnessColor = textureLoader.load('../texture/ground_dirt/Ground_Dirt_Roughness.jpg');


//rock - 무한 판대기
const stone1 = textureLoader.load('../texture/rock/StoneFloor_baseColor.jpg');
const stone2 = textureLoader.load('../texture/rock/RockStreet_baseColor.jpg');


init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    blocker.style.display = "none";
    instructions.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  scene.add(controls.getObject());

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // floor
  // 풀바닥 - 무한대가 들어갈 위치
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const floor = createGrassFloor(i * 40, j * -40);
      scene.add(floor);
    }
  }

  // 빨간 벽돌 - 무한대 왼편 바닥
  for (let i = 0; i < 5; i++) {
    const floor = createRedBrickFloor(-40, i * -40);
    scene.add(floor);
  }
  for (let i = 0; i < 2; i++) {
    const floor = createRedBrickFloor(-120 + i * 40, -160);
    scene.add(floor);
  }
  // 회색 벽돌 - 가천관 쪽 바닥
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 4; j++) {
      const floor = createGrayBrickFloor(-80 + i * 40, -200 + j * -40);
      scene.add(floor);
    }
  }
  // 흙 바닥 - 예대쪽 바닥
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 9; j++) {
      if (i == 4 && j >= 4)
        continue;
      else if (i == 3 && j == 4)
        continue;
      const floor = createDirtFloor(-240 + i * 40, j * -40);
      scene.add(floor);
    }
  }
  //
  // 나무
  const tree1 = createTree();
  tree1.position.x = 0;
  tree1.position.z = 0;
  scene.add(tree1);

  const tree2 = createTree();
  tree2.position.x = 100;
  tree2.position.z = 0;
  scene.add(tree2);

  // 빨간벽돌 왼쪽 나무
  for (let i = 0; i < 4; i++) {
    const tree = createTree();
    tree.position.x = -80;
    tree.position.z = i * -40;
    scene.add(tree);
  }
  //


  // 가천관 로드하기

  const loader = new GLTFLoader();

  loader.load(
    '../building/gachongwan.gltf',
    function (gltf) {
      const model = gltf.scene;
      model.position.set(40, 1, -280);
      model.scale.set(8, 8, 8);
      model.rotation.y = (Math.PI / 2) * 3;
      scene.add(gltf.scene);

    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );
  // 랜더링
  renderer = new THREE.WebGLRenderer({ antialias: true, depth: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}




function createGrassFloor(posX, posZ) {
  let floorGeometry = new THREE.PlaneGeometry(40, 40, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: grass_textureBaseColor,
    // normalMap: grass_textureNormalColor,
    // roughness: grass_textureRoughnessColor
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.x = posX;
  floor.position.z = posZ;



  if (posX === 0 && posZ === 0) {
    const cylinder1 = createGrayCylinder1();
    cylinder1.position.y = 0.5;
    cylinder1.position.x = 80;
    cylinder1.position.z = -80;  // 바닥에서 원기둥 중앙까지의 높이 설정
    floor.add(cylinder1);


    const cylinder2 = createGrayCylinder2();
    cylinder2.position.y = 0.5;
    cylinder2.position.x = 80;
    cylinder2.position.z = -100;
    floor.add(cylinder2);

    const cylinder3 = createGrayCylinder3();
    cylinder3.position.y = 1.5;
    cylinder3.position.x = 80;
    cylinder3.position.z = -100;
    floor.add(cylinder3);

    const cylinder4 = createGrayCylinder4();
    cylinder4.position.y = 1.5;
    cylinder4.position.x = 80;
    cylinder4.position.z = -80;
    floor.add(cylinder4);

    const cylinder5 = createGrayCylinder5();
    cylinder5.position.y = 2.5;
    cylinder5.position.x = 80;
    cylinder5.position.z = -80;
    floor.add(cylinder5);

    // scene에 추가하기 위해 createScene() 또는 createGrassFloor 내에서 아래와 같이 호출
    const chair = createWoodenChair();
    chair.position.y = cylinder3.position.y + (20 / 10) / 2 + (2 / 10) / 2; // 좌석의 높이/2 + cylinder3 높이/2
    cylinder3.add(chair);





  }

  return floor;
}


function createWoodenChair() {
  const group = new THREE.Group();

  // 좌석 생성
  const seatGeometry = new THREE.BoxGeometry(20 / 10, 2 / 10, 20 / 10); // 폭, 높이, 깊이
  const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // 갈색 나무
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  group.add(seat);

  // 등받이 생성
  const backGeometry = new THREE.BoxGeometry(20 / 10, 20 / 10, 2 / 10);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.set(0, 0.9, 0.9); // 위치 조절
  group.add(back);

  // 다리 4개 생성
  const legGeometry = new THREE.CylinderGeometry(1 / 10, 1 / 10, 20 / 10);
  const legMaterial = seatMaterial;

  const legPositions = [
    { x: -8 / 10, z: -8 / 10 },
    { x: 8 / 10, z: -8 / 10 },
    { x: -8 / 10, z: 8 / 10 },
    { x: 8 / 10, z: 8 / 10 }
  ];

  for (let pos of legPositions) {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos.x, -10 / 10, pos.z);
    group.add(leg);
  }

  return group;
}

function createGrayCylinder1() {
  const geometry = new THREE.CylinderGeometry(20, 20, 1, 32);  // 지름 20, 높이 1의 원기둥 생성
  const material = new THREE.MeshStandardMaterial({
    map: red_brick_textureHeightColor,

  });  // 연한 회색으로 설정
  const cylinder = new THREE.Mesh(geometry, material);


  return cylinder;
}
function createGrayCylinder2() {
  const geometry = new THREE.CylinderGeometry(15, 15, 1, 32);  // 지름 15, 높이 1의 원기둥 생성
  const material = new THREE.MeshStandardMaterial({
    map: stone1,
  });  // 연한 회색으로 설정
  const cylinder = new THREE.Mesh(geometry, material);


  return cylinder;
}

function createGrayCylinder3() {
  const geometry = new THREE.CylinderGeometry(10, 10, 2, 32);  // 지름 10, 높이 2의 원기둥 생성
  const material = new THREE.MeshStandardMaterial({
    map: red_brick_textureHeightColor,
  });  // 연한 회색으로 설정
  const cylinder = new THREE.Mesh(geometry, material);


  return cylinder;
}
function createGrayCylinder4() {
  const geometry = new THREE.CylinderGeometry(15, 15, 2, 32);  // 지름 15, 높이 2의 원기둥 생성
  const material = new THREE.MeshStandardMaterial({
    map: stone1,
  });  // 연한 회색으로 설정
  const cylinder = new THREE.Mesh(geometry, material);


  return cylinder;
}
function createGrayCylinder5() {
  const geometry = new THREE.CylinderGeometry(10, 10, 3, 32);  // 지름 10, 높이 3의 원기둥 생성
  const material = new THREE.MeshStandardMaterial({
    map: stone2
  });  // 연한 회색으로 설정
  const cylinder = new THREE.Mesh(geometry, material);


  return cylinder;
}

function createRedBrickFloor(posX, posZ) {
  let floorGeometry = new THREE.PlaneGeometry(40, 40, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: red_brick_textureBaseColor,
    // normalMap: red_brick_textureNormalColor,
    // displacementMap: red_brick_textureHeightColor,
    // roughness: red_brick_textureRoughnessColor
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.x = posX;
  floor.position.z = posZ;

  return floor;
}

function createGrayBrickFloor(posX, posZ) {
  let floorGeometry = new THREE.PlaneGeometry(40, 40, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: gray_brick_textureBaseColor,
    // normalMap: gray_brick_textureNormalColor,
    // roughness: gray_brick_textureRoughnessColor
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.x = posX;
  floor.position.z = posZ;
  return floor;
}

function createDirtFloor(posX, posZ) {
  let floorGeometry = new THREE.PlaneGeometry(40, 40, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: dirt_textureBaseColor,
    // normalMap: dirt_textureNormalColor,
    // displacementMap: dirt_textureHeightColor,
    // roughness: dirt_textureRoughnessColor
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.x = posX;
  floor.position.z = posZ;
  return floor;
}

function createTree() {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 5, 16),
    new THREE.MeshBasicMaterial({ color: 0x8B4513 })
  );
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(4, 8, 16),
    new THREE.MeshBasicMaterial({ color: 0x00FF00 })
  );
  leaves.position.y = 6.5;
  const tree = new THREE.Group();
  tree.add(trunk);
  tree.add(leaves);
  return tree;
}