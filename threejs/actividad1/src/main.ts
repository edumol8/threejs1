// import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from "three/examples/jsm/Addons.js";



// ---------- Escena, cámara y renderizador ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ---------- Controles ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;   // para suavizar el movimiento
controls.dampingFactor = 0.05;
controls.update();

// ---------- Luces ----------
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambLight);

// ---------- Objetos básicos (3 figuras) ----------
// Guardaremos los objetos en un array para el raycasting
const basicObjects = [];

// 1. Cono
const cono = new THREE.Mesh(
  new THREE.ConeGeometry(0.8, 1.5, 32),
  new THREE.MeshStandardMaterial({ color: 0x00660f })
);
cono.position.set(-4, 0, 0);
scene.add(cono);
basicObjects.push(cono);

// 2. Cubo
const cubo = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x0077ff })
);
cubo.position.set(-1, 0, 0);
scene.add(cubo);
basicObjects.push(cubo);

// 3. Esfera (con textura)
const loader = new THREE.TextureLoader();
const texture = loader.load('/textures/textura1.jpeg'); 
const esfera = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 32, 32),
  new THREE.MeshStandardMaterial({ map: texture })
);
esfera.position.set(2, 0, 0);
scene.add(esfera);
basicObjects.push(esfera);

// ---------- Modelo externo (cat.glb) ----------
const gltfLoader = new GLTFLoader();
let model = null;
gltfLoader.load(
  '/models/cat.glb',  // Ruta del modelo 
  (gltf) => {
    model = gltf.scene;
    model.position.set(5, 0, 0);
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Error al cargar el modelo:', error);
  }
);

// ---------- Raycaster para clics ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Evento de clic
renderer.domElement.addEventListener('click', (event) => {
  // Calcular coordenadas del puntero en espacio normalizado (-1 a 1)
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // Intersectar solo con los objetos básicos (no con el modelo)
  const intersects = raycaster.intersectObjects(basicObjects);

  if (intersects.length > 0) {
    // Tomamos el primer objeto intersectado
    const hit = intersects[0].object;
    // Cambiar a un color aleatorio
    const randomColor = new THREE.Color(Math.random() * 0xffffff);
    hit.material.color.set(randomColor);
  }
});

// ---------- Eventos de teclado ----------
const keys = {
  w: false,
  s: false,
  a: false,
  d: false,
  arrowleft: false,
  arrowright: false,
  f: false,
};

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  // Mapeo de teclas
  if (key === 'w') keys.w = true;
  if (key === 's') keys.s = true;
  if (key === 'a') keys.a = true;
  if (key === 'd') keys.d = true;
  if (key === 'arrowleft') keys.arrowleft = true;
  if (key === 'arrowright') keys.arrowright = true;
  if (key === 'f') keys.f = true;
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w') keys.w = false;
  if (key === 's') keys.s = false;
  if (key === 'a') keys.a = false;
  if (key === 'd') keys.d = false;
  if (key === 'arrowleft') keys.arrowleft = false;
  if (key === 'arrowright') keys.arrowright = false;
  if (key === 'f') keys.f = false;
});

// ---------- Funciones de control de cámara ----------
function updateCamera() {
  const speed = 0.1;        // velocidad de zoom
  const rotSpeed = 0.03;    // velocidad de rotación

  // Obtener dirección hacia adelante de la cámara (ignorando componente Y para movimientos laterales)
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  // Vector lateral (derecha)
  const right = new THREE.Vector3();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  // Movimiento zoom (W/S)
  if (keys.w) {
    camera.position.add(forward.clone().multiplyScalar(speed));
  }
  if (keys.s) {
    camera.position.add(forward.clone().multiplyScalar(-speed));
  }

  // Rotación alrededor del target (A/D o flechas)
  if (keys.a || keys.arrowleft) {
    const offset = camera.position.clone().sub(controls.target);
    const radius = offset.length();
    const theta = Math.atan2(offset.x, offset.z);
    const newTheta = theta + rotSpeed;
    const newX = radius * Math.sin(newTheta);
    const newZ = radius * Math.cos(newTheta);
    camera.position.x = controls.target.x + newX;
    camera.position.z = controls.target.z + newZ;
    camera.lookAt(controls.target);
  }
  if (keys.d || keys.arrowright) {
    const offset = camera.position.clone().sub(controls.target);
    const radius = offset.length();
    const theta = Math.atan2(offset.x, offset.z);
    const newTheta = theta - rotSpeed;
    const newX = radius * Math.sin(newTheta);
    const newZ = radius * Math.cos(newTheta);
    camera.position.x = controls.target.x + newX;
    camera.position.z = controls.target.z + newZ;
    camera.lookAt(controls.target);
  }

  // Enfoque en el modelo (tecla F)
  if (keys.f && model) {
    const targetPos = model.position.clone();
    // Colocar la cámara a una distancia fija del modelo
    const distance = 3;
    const direction = new THREE.Vector3(1, 0.5, 0.5).normalize();
    camera.position.copy(targetPos.clone().add(direction.multiplyScalar(distance)));
    controls.target.copy(targetPos);
    // Reseteamos las teclas para evitar que se repita
    keys.f = false;
  }

  controls.update();
}

// ---------- Animación ----------
function animate() {
  requestAnimationFrame(animate);

  // Rotación continua de los objetos básicos
  cono.rotation.z += 0.02;
  cubo.rotation.x += 0.01;
  esfera.rotation.y += 0.03;

  // Rotación del modelo si ya está cargado
  if (model) {
    model.rotation.y += 0.005;
  }

  // Actualizar cámara según teclas
  updateCamera();

  renderer.render(scene, camera);
}

animate();

// ---------- Redimensionamiento de ventana ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});