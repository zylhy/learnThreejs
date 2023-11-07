<template>
  <div class="canvasContainer">
    <canvas id="canvas"></canvas>
  </div>
</template>
<script setup>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
   
const dirLightPosition = reactive({
    x:0,
    y:0,
    z:0,
})

const initThree = () => {
  // 创建场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#eee");

  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 10;
  // 创建渲染器
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
//   创建控制器
  const controls = new OrbitControls(camera, renderer.domElement)
//   增加阻尼感
  controls.enableDamping = true
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("/klee_genshin_impact/scene.gltf", (gltf) => {
    console.log(gltf);
    let model = gltf.scene;
    model.traverse((o) => {
      //将图片作为纹理加载
      let explosionTexture = new THREE.TextureLoader().load(
        "/klee_genshin_impact/textures/Toon_baseColor.jpeg"
      );
      //调整纹理图的方向
      explosionTexture.flipY = false;
      //将纹理图生成基础网格材质(MeshBasicMaterial)
      const material = new THREE.MeshBasicMaterial({
        map: explosionTexture,
      });
      //给模型每部分上材质
      o.material = material;
      if (o.isMesh) {
            o.castShadow = true
            o.receiveShadow = true
          }
    });
    scene.add(model);
  });
//   创建地板
  let floorGeometry = new THREE.PlaneGeometry(3000, 3000)
let floorMaterial = new THREE.MeshPhongMaterial({color: 0xff0000})
let floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -0.5 * Math.PI
floor.receiveShadow = true
floor.position.y = -0.001
scene.add(floor)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
      //光源等位置
      dirLight.position.set(-10, 8, -5)
      //可以产生阴影
      dirLight.castShadow = true
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
      scene.add(dirLight)
      const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
      hemLight.position.set(0, 48, 0)
      scene.add(hemLight)
  function animate() {
    renderer.render(scene, camera);
    if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }
    requestAnimationFrame(animate);
    controls.update()
  }
  animate();
  
};
const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};
onMounted(() => {
  initThree();
});
</script>
<style lang="scss" scoped>
.canvasContainer {
  width: 100%;
  height: 100%;
}
</style>
