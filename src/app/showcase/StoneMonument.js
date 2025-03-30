import {
  BoxGeometry,
  CylinderGeometry,
  FogExp2,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PointLight,
  RingGeometry,
  SphereGeometry,
  SRGBColorSpace,
} from "three";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";
import TextureHelper from "../../system/utility/TextureHelper.js";
import SkyCube from "../../system/component/SkyCube.js";

/**
 * An implementation of basic geometries with standard textured materials
 *    casting shadows from the rising and setting sunlight.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class StoneMonument extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPosition: [2, 8, 25],
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    const scene = this.getScene();
    scene.fog = new FogExp2(0xcccccc, 0.0075);

    const registry = this.getRegistry();
    const loader = new Loader(registry);

    const path = "./public/stone-monument";
    const textures = await loader.loadTextures({
      /* Ground */
      groundAlpha: `${path}/ground/alpha.webp`,
      groundColor: `${path}/ground/aerial_grass_rock_1k/aerial_grass_rock_diff_1k.webp`,
      groundARM: `${path}/ground/aerial_grass_rock_1k/aerial_grass_rock_arm_1k.webp`,
      groundNormal: `${path}/ground/aerial_grass_rock_1k/aerial_grass_rock_nor_gl_1k.webp`,
      groundDisplacement: `${path}/ground/aerial_grass_rock_1k/aerial_grass_rock_disp_1k.webp`,
      /* Pillar */
      pillarColor: `${path}/pillar/cracked_concrete_wall_1k/cracked_concrete_wall_diff_1k.webp`,
      pillarARM: `${path}/pillar/cracked_concrete_wall_1k/cracked_concrete_wall_arm_1k.webp`,
      pillarNormal: `${path}/pillar/cracked_concrete_wall_1k/cracked_concrete_wall_nor_gl_1k.webp`,
      /* Stone */
      stoneColor: `${path}/stone/rough_plaster_brick_1k/rough_plaster_brick_diff_1k.webp`,
      stoneARM: `${path}/stone/rough_plaster_brick_1k/rough_plaster_brick_arm_1k.webp`,
      stoneNormal: `${path}/stone/rough_plaster_brick_1k/rough_plaster_brick_nor_gl_1k.webp`,
      /* Bush */
      bushColor: `${path}/bush/brown_mud_leaves_01_1k/brown_mud_leaves_01_diff_1k.webp`,
      bushARM: `${path}/bush/brown_mud_leaves_01_1k/brown_mud_leaves_01_arm_1k.webp`,
      bushNormal: `${path}/bush/brown_mud_leaves_01_1k/brown_mud_leaves_01_nor_gl_1k.webp`,
    });

    textures.groundColor.colorSpace = SRGBColorSpace;
    TextureHelper.setRepeatWrap(textures.groundColor, 4, 4, true, true);
    TextureHelper.setRepeatWrap(textures.groundARM, 4, 4, true, true);
    TextureHelper.setRepeatWrap(textures.groundNormal, 4, 4, true, true);
    TextureHelper.setRepeatWrap(textures.groundDisplacement, 4, 4, true, true);

    const ground = new Mesh(
      new RingGeometry(0, 30, 64, 100),
      new MeshStandardMaterial({
        transparent: true,
        alphaMap: textures.groundAlpha,
        map: textures.groundColor,
        aoMap: textures.groundARM,
        roughnessMap: textures.groundARM,
        metalnessMap: textures.groundARM,
        normalMap: textures.groundNormal,
        displacementMap: textures.groundDisplacement,
        displacementScale: 0.9,
        displacementBias: -0.3,
      })
    );
    ground.rotation.x = Math.PI * -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    textures.pillarColor.colorSpace = SRGBColorSpace;

    const pillarSize = {
      radiusTop: 0.8,
      radiusBottom: 1,
      height: 5,
      radialSegments: 12,
      heightSegments: 12,
    };
    const pillarGeometry = new CylinderGeometry(...Object.values(pillarSize));
    const pillarMaterial = new MeshStandardMaterial({
      map: textures.pillarColor,
      aoMap: textures.pillarARM,
      roughnessMap: textures.pillarARM,
      metalnessMap: textures.pillarARM,
      normalMap: textures.pillarNormal,
    });
    const pillarRadius = 10;
    const pillars = [];

    for (let i = 0; i < 12; i++) {
      const angle = MathUtils.degToRad(30 * i);
      const positionX = Math.sin(angle) * pillarRadius;
      const positionY = pillarSize.height * 0.5;
      const positionZ = Math.cos(angle) * pillarRadius;

      const pillar = new Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(positionX, positionY, positionZ);
      pillar.receiveShadow = true;
      pillar.castShadow = true;
      scene.add(pillar);

      pillars.push(pillar);
    }

    textures.stoneColor.colorSpace = SRGBColorSpace;
    TextureHelper.setRepeatWrap(textures.stoneColor, 2, 1, true, true);

    const stoneSize = {
      width: 7,
      height: 1,
      depth: 2,
      widthSegments: 12,
      heightSegments: 12,
      depthSegments: 12,
    };
    const stoneGeometry = new BoxGeometry(...Object.values(stoneSize));
    const stoneMaterial = new MeshStandardMaterial({
      map: textures.stoneColor,
      aoMap: textures.stoneARM,
      roughnessMap: textures.stoneARM,
      metalnessMap: textures.stoneARM,
      normalMap: textures.stoneNormal,
    });
    const stonePositionY = pillarSize.height + stoneSize.height * 0.5;

    const stone1 = new Mesh(stoneGeometry, stoneMaterial);
    stone1.position.set(6.9, stonePositionY, 6.85);
    stone1.rotation.y = 10.25;
    stone1.receiveShadow = true;
    stone1.castShadow = true;
    scene.add(stone1);

    const stone2 = new Mesh(stoneGeometry, stoneMaterial);
    stone2.position.set(-6.9, stonePositionY, -6.85);
    stone2.rotation.y = 10.25;
    stone2.receiveShadow = true;
    stone2.castShadow = true;
    scene.add(stone2);

    const stone3 = new Mesh(stoneGeometry, stoneMaterial);
    stone3.position.set(-6.9, stonePositionY, 6.85);
    stone3.rotation.y = -10.25;
    stone3.receiveShadow = true;
    stone3.castShadow = true;
    scene.add(stone3);

    const stone4 = new Mesh(stoneGeometry, stoneMaterial);
    stone4.position.set(6.9, stonePositionY, -6.85);
    stone4.rotation.y = -10.25;
    stone4.receiveShadow = true;
    stone4.castShadow = true;
    scene.add(stone4);

    textures.bushColor.colorSpace = SRGBColorSpace;

    const bushSize = {
      radius: 1,
      widthSegments: 12,
      heightSegments: 12,
    };

    const bushGeometry = new SphereGeometry(...Object.values(bushSize));
    const bushMaterial = new MeshStandardMaterial({
      color: "lightgreen",
      map: textures.bushColor,
      aoMap: textures.bushARM,
      roughnessMap: textures.bushARM,
      metalnessMap: textures.bushARM,
      normalMap: textures.bushNormal,
    });

    const bush1 = new Mesh(bushGeometry, bushMaterial);
    bush1.position.set(5, 0, 12);
    bush1.receiveShadow = true;
    bush1.castShadow = true;
    scene.add(bush1);

    const bush2 = new Mesh(bushGeometry, bushMaterial);
    bush2.position.set(2, 0, 0);
    bush2.scale.setScalar(3);
    bush2.receiveShadow = true;
    bush2.castShadow = true;
    scene.add(bush2);

    const bush3 = new Mesh(bushGeometry, bushMaterial);
    bush3.position.set(-1, 0, 6);
    bush3.scale.setScalar(2.5);
    bush3.receiveShadow = true;
    bush3.castShadow = true;
    scene.add(bush3);

    const bush4 = new Mesh(bushGeometry, bushMaterial);
    bush4.position.set(0, 0, 3);
    bush4.scale.setScalar(1.5);
    bush4.receiveShadow = true;
    bush4.castShadow = true;
    scene.add(bush4);

    const skyCube = new SkyCube({
      scale: 100,
      turbidity: 15,
      rayleigh: 0.055,
      mieCoefficient: 0.1,
      mieDirectionalG: 0.99,
      elevation: -90,
      azimuth: -180,
      color: 0xeeeeee,
      intensity: 8,
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
    directionalLight.shadow.camera.left = -32;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 128;
    scene.add(directionalLight);

    this.addScreenUpdateEvent(skyCube.getScreenUpdateSunElevation(5));

    const firefly1 = new PointLight(0xff8888, 15);
    firefly1.castShadow = true;
    firefly1.shadow.mapSize.width = 256;
    firefly1.shadow.mapSize.height = 256;
    firefly1.shadow.camera.far = 128;

    const firefly2 = new PointLight(0x88ff88, 15);
    firefly2.castShadow = true;
    firefly2.shadow.mapSize.width = 256;
    firefly2.shadow.mapSize.height = 256;
    firefly2.shadow.camera.far = 128;

    const firefly3 = new PointLight(0x8888ff, 15);
    firefly3.castShadow = true;
    firefly3.shadow.mapSize.width = 256;
    firefly3.shadow.mapSize.height = 256;
    firefly3.shadow.camera.far = 128;

    scene.add(firefly1, firefly2, firefly3);

    this.addScreenUpdateEvent((delta, elapsed) => {
      const skyCubeState = skyCube.getState();
      const factor = Math.sin(MathUtils.degToRad(skyCubeState?.elevation)) * -1;
      const angle1 = elapsed * 0.3;
      const angle2 = elapsed * -0.6;
      const angle3 = elapsed * 0.9;

      firefly1.position.x = Math.cos(angle1) * 3;
      firefly1.position.z = Math.sin(angle1) * 3;
      firefly1.position.y =
        Math.sin(angle1) * Math.sin(angle1 * 2.34) * Math.sin(angle1 * 3.45) +
        2;
      firefly1.intensity = Math.max(0, factor * 15);

      firefly2.position.x = Math.cos(angle2) * 6;
      firefly2.position.z = Math.sin(angle2) * 6;
      firefly2.position.y =
        Math.sin(angle2) * Math.sin(angle2 * 2.34) * Math.sin(angle2 * 3.45) +
        2;
      firefly2.intensity = Math.max(0, factor * 15);

      firefly3.position.x = Math.cos(angle3) * 9;
      firefly3.position.z = Math.sin(angle3) * 9;
      firefly3.position.y =
        Math.sin(angle3) * Math.sin(angle3 * 2.34) * Math.sin(angle3 * 3.45) +
        2;
      firefly3.intensity = Math.max(0, factor * 15);
    });

    this.showAppInfo();
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const query = this.getRegistry().get("query");
    if (Boolean(query?.noinfo)) return;
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Stone Monument</strong>");
    notification.notice(
      "An implementation of basic geometries with standard textured materials casting shadows from the rising and setting sunlight."
    );
    notification.notice(
      "Textures — [Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock) | [Cracked Concrete Wall](https://polyhaven.com/a/cracked_concrete_wall) | [Rough Plaster Brick](https://polyhaven.com/a/rough_plaster_brick) | [Brown Mud Leaves 01](https://polyhaven.com/a/brown_mud_leaves_01)"
    );
  }
}

export default StoneMonument;
