import {
  BoxGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  FogExp2,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  Path,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";
import TextureHelper from "../../system/utility/TextureHelper.js";
import WaterPlanar from "../../system/component/WaterPlanar.js";
import SkyCube from "../../system/component/SkyCube.js";

/**
 * Another implementation of basic geometries with standard textured materials.
 *    The flag is simple vertex/fragment shaders written in GLSL. The
 *    ocean/water effect is more advanced shaders.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class DesertedBoat extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPerspectiveFar: 2000,
    cameraPosition: [0, 5, 20],
    controlsOrbitParameters: {
      enableDamping: true,
      maxDistance: 50,
      maxPolarAngle: Math.PI * 0.5 - 0.1,
      minDistance: 5,
    },
  };

  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    const renderer = this.getRenderer();
    renderer.toneMapping = NoToneMapping;

    const scene = this.getScene();
    scene.fog = new FogExp2(0x333333, 0.0075);

    const registry = this.getRegistry();
    const loader = new Loader(registry);

    const texturePath = "./public/deserted-boat";
    const textures = await loader.loadTextures({
      /* Body */
      bodyColor: `${texturePath}/body/bark_willow_1k/bark_willow_diff_1k.webp`,
      bodyARM: `${texturePath}/body/bark_willow_1k/bark_willow_arm_1k.webp`,
      bodyNormal: `${texturePath}/body/bark_willow_1k/bark_willow_nor_gl_1k.webp`,
      bodyDisplacement: `${texturePath}/body/bark_willow_1k/bark_willow_disp_1k.webp`,
      /* Plank */
      plankColor: `${texturePath}/plank/pine_bark_1k/pine_bark_diff_1k.webp`,
      plankARM: `${texturePath}/plank/pine_bark_1k/pine_bark_arm_1k.webp`,
      plankNormal: `${texturePath}/plank/pine_bark_1k/pine_bark_nor_gl_1k.webp`,
      /* Pole */
      poleColor: `${texturePath}/pole/japanese_sycamore_1k/japanese_sycamore_diff_1k.webp`,
      poleARM: `${texturePath}/pole/japanese_sycamore_1k/japanese_sycamore_arm_1k.webp`,
      poleNormal: `${texturePath}/pole/japanese_sycamore_1k/japanese_sycamore_nor_gl_1k.webp`,
      /* Flag */
      flag: `${texturePath}/flag/jolly-roger.webp`,
      /* Water */
      water0Normal: "./public/common/texture/water/Water_1_M_Normal.webp",
      water1Normal: "./public/common/texture/water/Water_2_M_Normal.webp",
    });

    const shaders = await loader.loadGLSLFiles({
      flagWaveVertex: "flagWave/vertex",
      flagWaveFragment: "flagWave/fragment",
    });

    const ocean = new WaterPlanar({
      color: 0xcccccc,
      flowSpeed: 0.02,
      normalMap0: textures.water0Normal,
      normalMap1: textures.water1Normal,
    });
    scene.add(ocean.getWater());

    textures.bodyColor.colorSpace = SRGBColorSpace;
    TextureHelper.setRepeatWrap(textures.bodyColor, 2, 2, true, true);
    TextureHelper.setRepeatWrap(textures.bodyARM, 2, 2, true, true);
    TextureHelper.setRepeatWrap(textures.bodyNormal, 2, 2, true, true);
    TextureHelper.setRepeatWrap(textures.bodyDisplacement, 2, 2, true, true);

    const boat = new Group();
    scene.add(boat);

    const bodyRadius = 3;
    const bodyLength = 8;
    const bodyPath = new Path();
    bodyPath.absarc(0, bodyLength * -0.5, bodyRadius, Math.PI * 1.5, 0);
    bodyPath.absarc(0, bodyLength * 0.5, bodyRadius, 0, Math.PI * 0.5);
    const bodyPoints = bodyPath.getPoints(8);

    const bodyGeometry = new LatheGeometry(bodyPoints, 32, 0, Math.PI);
    const bodyPosition = bodyGeometry.getAttribute("position");
    const bodyUv = bodyGeometry.getAttribute("uv");
    for (let i = 0; i < bodyPosition.count; i++) {
      bodyUv.setY(i, bodyPosition.getY(i) / 2 + 0.5);
    }
    const bodyMaterial = new MeshStandardMaterial({
      map: textures.bodyColor,
      aoMap: textures.bodyARM,
      roughnessMap: textures.bodyARM,
      metalnessMap: textures.bodyARM,
      normalMap: textures.bodyNormal,
      displacementMap: textures.bodyDisplacement,
      displacementScale: 0.5,
      displacementBias: 0.1,
      side: DoubleSide,
    });
    const body = new Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = -Math.PI * 0.5;
    body.position.y = 2;
    boat.add(body);

    const coverGeometry = new CircleGeometry(3, 16, 0, Math.PI);

    const cover1 = new Mesh(coverGeometry, bodyMaterial);
    cover1.position.x = -4.1;
    cover1.position.y = 1.7;
    cover1.rotation.x = Math.PI * 0.5;
    cover1.rotation.z = Math.PI * 0.5;
    boat.add(cover1);

    const cover2 = new Mesh(coverGeometry, bodyMaterial);
    cover2.position.x = 4.1;
    cover2.position.y = 1.7;
    cover2.rotation.x = Math.PI * 0.5;
    cover2.rotation.z = -Math.PI * 0.5;
    boat.add(cover2);

    textures.plankColor.colorSpace = SRGBColorSpace;
    textures.plankColor.rotation = Math.PI * 0.5;

    const plankGeometry = new BoxGeometry(1, 5, 0.25, 12, 12, 12);
    const plankMaterial = new MeshStandardMaterial({
      map: textures.plankColor,
      aoMap: textures.plankARM,
      roughnessMap: textures.plankARM,
      metalnessMap: textures.plankARM,
      normalMap: textures.plankNormal,
    });

    const plank1 = new Mesh(plankGeometry, plankMaterial);
    plank1.position.x = -2;
    plank1.rotation.x = Math.PI * 0.5;
    boat.add(plank1);

    const plank2 = new Mesh(plankGeometry, plankMaterial);
    plank2.rotation.x = Math.PI * 0.5;
    boat.add(plank2);

    const plank3 = new Mesh(plankGeometry, plankMaterial);
    plank3.position.x = 2;
    plank3.rotation.x = Math.PI * 0.5;
    boat.add(plank3);

    const plank4 = new Mesh(plankGeometry, plankMaterial);
    plank4.scale.y = 1.38;
    plank4.position.x = -1;
    plank4.position.y = 1;
    plank4.rotation.x = Math.PI * 0.5;
    boat.add(plank4);

    const plank5 = new Mesh(plankGeometry, plankMaterial);
    plank5.scale.y = 1.38;
    plank5.position.x = 1;
    plank5.position.y = 1;
    plank5.rotation.x = Math.PI * 0.5;
    boat.add(plank5);

    textures.poleColor.colorSpace = SRGBColorSpace;

    const poleSize = {
      radiusTop: 0.01,
      radiusBottom: 0.1,
      height: 7.5,
      radialSegments: 12,
      heightSegments: 12,
    };
    const poleGeometry = new CylinderGeometry(...Object.values(poleSize));
    const poleMaterial = new MeshStandardMaterial({
      map: textures.poleColor,
      aoMap: textures.poleARM,
      roughnessMap: textures.poleARM,
      metalnessMap: textures.poleARM,
      normalMap: textures.poleNormal,
    });

    const pole = new Mesh(poleGeometry, poleMaterial);
    pole.position.x = -5;
    pole.position.y = 3;
    boat.add(pole);

    const flagGeometry = new PlaneGeometry(3, 2, 32, 32);
    const flagMaterial = new ShaderMaterial({
      vertexShader: shaders.flagWaveVertex,
      fragmentShader: shaders.flagWaveFragment,
      uniforms: {
        uFrequency: { value: new Vector2(5, 2) },
        uTime: { value: 0 },
        uColor: { value: new Color("green") },
        uTexture: { value: textures.flag },
      },
    });

    const flag = new Mesh(flagGeometry, flagMaterial);
    flag.position.x = -3.5;
    flag.position.y = 5;
    boat.add(flag);

    const flag2 = new Mesh(flagGeometry, flagMaterial);
    flag2.position.x = -3.5;
    flag2.position.y = 5;
    flag2.rotation.y = Math.PI;
    boat.add(flag2);

    boat.rotation.y = Math.PI * -0.25;

    this.addScreenUpdateEvent((delta, elapsed) => {
      flagMaterial.uniforms.uTime.value = elapsed * 3;
      boat.position.y = Math.sin(elapsed) * 0.25;
      boat.rotation.z = Math.sin(elapsed) * 0.1;
    });

    const skyCube = new SkyCube({
      scale: 100,
      turbidity: 18,
      rayleigh: 0.5,
      mieCoefficient: 0.1,
      mieDirectionalG: 0.99,
      elevation: 5,
      azimuth: -175,
      color: 0xeeeeee,
      intensity: 7,
      gui: registry.has("debug.gui") ? registry.get("debug.gui") : null,
    });
    scene.add(skyCube.getSky());

    const directionalLight = skyCube.getSunLight();
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 256;
    directionalLight.shadow.mapSize.height = 256;
    directionalLight.shadow.camera.top = 32;
    directionalLight.shadow.camera.right = 32;
    directionalLight.shadow.camera.bottom = -32;
    directionalLight.shadow.camera.left = -64;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 128;
    scene.add(directionalLight);

    this.showAppInfo();
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Deserted Boat</strong>");
    notification.notice(
      "Another implementation of basic geometries with standard textured materials. The flag is simple vertex/fragment shaders written in GLSL. The ocean/water effect is more advanced shaders."
    );
    notification.notice(
      "Textures — [Bark Willow](https://polyhaven.com/a/bark_willow) | [Pine Bark](https://polyhaven.com/a/pine_bark) | [Japanese Sycamore](https://polyhaven.com/a/japanese_sycamore)"
    );
    notification.notice(
      "Flag — [Flag of Jolly Roger (Pirate Flag)](https://vectorflags.com/pirates/his-pir-flag-01)"
    );
  }
}

export default DesertedBoat;
