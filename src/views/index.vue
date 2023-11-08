<template>
  <div class="canvasContainer">
    <canvas id="canvas"></canvas>
  </div>
  <div class="btnWrap">
    <button @click="addCube">增加</button>
    <button @click="remove">移除</button>
  </div>
</template>
<script setup>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
const THREEScene = ref(null);

//创建线条
const addLine = () => {
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  // 创建一个空的点数组
  const points = [];
  // 将第一个点添加到数组中
  points.push(new THREE.Vector3(-1, 0, 0));
  // 将第二个点添加到数组中
  points.push(new THREE.Vector3(0, 1, 0));
  // 将第三个点添加到数组中
  points.push(new THREE.Vector3(1, 0, 0));
  // 使用点数组创建一个缓冲几何体
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  // 使用缓冲几何体和材质创建一个线段
  const line = new THREE.Line(geometry, material);
  line.name = "line";
  // 将线段添加到场景中
  THREEScene.value.add(line);
};
//  增加立方体
const addCube = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 5);
  cube.name = "cube";
  THREEScene.value.add(cube);
};
//移除
const remove = () => {
  const cube = THREEScene.value.children.find((n) => n.name === "cube");
  if (cube) {
    THREEScene.value.remove(cube);
  }
};
const initThree = () => {
  // 创建场景
  const scene = new THREE.Scene();
  THREEScene.value = scene;
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
  // 创建合成器
  // const composer = new EffectComposer(renderer);

  //   创建控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  //   增加阻尼感
  controls.enableDamping = true;
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
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    model.name = "klee";
    scene.add(model);
  });
  //   创建地板
  let floorGeometry = new THREE.PlaneGeometry(3000, 3000);
  let floorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI;
  floor.receiveShadow = true;
  floor.position.y = -0.001;
  scene.add(floor);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  //光源等位置
  dirLight.position.set(-10, 8, -5);
  //可以产生阴影
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  scene.add(dirLight);
  const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemLight.position.set(0, 48, 0);
  scene.add(hemLight);
  // 渲染 passes 添加渲染 passes  RenderPass通常位于过程链的开始，以便将渲染好的场景作为输入来提供给下一个后期处理步骤。
  // const renderPass = new RenderPass(scene, camera);
  // composer.addPass(renderPass);
  // // 添加一个 glitch passes
  // const glitchPass = new GlitchPass();
  // // 渲染 passes 添加 glitch passes
  // composer.addPass(glitchPass);
  // 刷新屏幕
  function animate() {
    renderer.render(scene, camera);

    // composer.render();
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    let klee = THREEScene.value.children.find((n) => n.name == "klee");
    if (klee) {
      klee.rotation.y += 0.01;
    }
    requestAnimationFrame(animate);
    controls.update();
    // 移动光源
    dirLight.position.x = Math.sin(Date.now() * 0.001) * 1000;
    dirLight.position.z = Math.cos(Date.now() * 0.001) * 1000;
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

.btnWrap {
  position: fixed;
  top: 20px;
  left: 20px;
  button {
    width: 50px;
    margin-right: 10px;
  }
}
</style>
