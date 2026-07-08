// import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100)
camera.position.set(1,1,5)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

new OrbitControls(camera,renderer.domElement)

const light = new THREE.DirectionalLight(
  0XFFFFFF,1
)
light.position.set(5,5,5)
scene.add(light)
scene.add(new THREE.AmbientLight (0XFFFFFF,4))

const cono = new THREE.Mesh(
  new THREE.ConeGeometry(),
  new THREE.MeshStandardMaterial(
    {color:0X00660F}
  )
)

const cubo = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial(
    {color:0X0077FF}
  )
)

const loader = new THREE.TextureLoader()
const texture = loader.load("/textures/textura1.jpeg")

const esfera = new THREE.Mesh(
  new THREE.SphereGeometry(),
  new THREE.MeshStandardMaterial(
    {map:texture}
  )
)

const glbloader = new GLTFLoader()
let modelo
glbloader.load("/models/guerrero.glb",(gltf)=>{
  modelo = gltf.scene
  scene.add(modelo)
  modelo.position.set(2,0,0)

})

scene.add(cono)
scene.add(cubo)
scene.add(esfera)

cono.position.set(-6,0,0)
cubo.position.set(-2,0,0)
esfera.position.set(0,0,0)

function animate(){
  requestAnimationFrame(animate)
  cubo.rotation.x +=0.01
  cono.rotation.z +=0.2
  esfera.rotation.y +=0.5

  renderer.render(scene,camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  
})