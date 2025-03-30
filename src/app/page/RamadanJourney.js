import {
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
} from "three";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";
import ModelHelper from "../../system/utility/ModelHelper.js";
import TextureHelper from "../../system/utility/TextureHelper.js";
import SkyCube from "../../system/component/SkyCube.js";

/**
 * Eid al-Fitr marks the end of the month-long dawn-to-dusk fasting of Ramadan.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class RamadanJourney extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPerspectiveNear: 0.1,
    cameraPerspectiveFar: 32,
    cameraPosition: [10, 12, 12],
    controlsOrbitParameters: {
      enableDamping: true,
      autoRotate: true,
      maxDistance: 32,
      maxPolarAngle: Math.PI * 0.5 - 0.1,
      minDistance: 1,
    },
  };

  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    const nightLightIntensity = 3;
    const startDateTime = "February 28, 2025 08:00:00";
    const aDayInMilliSeconds = 60 * 60 * 24 * 1000;
    const totalRamadanDays = 30;
    const dayNightSpeed = 60;

    const appTitle = document.getElementById("app-title");
    const appDatetime = document.getElementById("app-datetime");
    const appMessage = document.getElementById("app-message");

    appTitle.innerText = "Ramadan is Starting";
    appDatetime.innerText = new Date(startDateTime).toDateString();

    const renderer = this.getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    const scene = this.getScene();
    const camera = this.getCamera();
    const registry = this.getRegistry();
    const loader = new Loader(registry);
    const path = "./public/ramadan-journey";

    const models = await loader.loadGLTFModels({
      mosque: `${path}/gltf/shah_alam_blue_mosque.glb`,
    });

    ModelHelper.setShadow(models.mosque);
    models.mosque.scene.position.y = 1.25;
    models.mosque.scene.scale.setScalar(1);
    scene.add(models.mosque.scene);

    const textures = await loader.loadTextures({
      groundAlpha: `${path}/ground/alpha.webp`,
      groundColor: `${path}/ground/rocky_terrain_02_1k/rocky_terrain_02_diff_1k.webp`,
      groundARM: `${path}/ground/rocky_terrain_02_1k/rocky_terrain_02_arm_1k.webp`,
      groundNormal: `${path}/ground/rocky_terrain_02_1k/rocky_terrain_02_nor_gl_1k.webp`,
      groundDisplacement: `${path}/ground/rocky_terrain_02_1k/rocky_terrain_02_disp_1k.webp`,
    });

    const ground = new Mesh(
      new PlaneGeometry(25, 25),
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

    textures.groundColor.colorSpace = SRGBColorSpace;
    TextureHelper.setRepeatWrap(textures.groundColor, 4, 4, true, true);
    TextureHelper.setRepeatWrap(textures.groundARM, 4, 4, true, true);
    TextureHelper.setRepeatWrap(textures.groundNormal, 4, 4, true, true);
    TextureHelper.setRepeatWrap(textures.groundDisplacement, 4, 4, true, true);

    const skyCube = new SkyCube({
      scale: 100,
      turbidity: 15,
      rayleigh: 0.055,
      mieCoefficient: 0.1,
      mieDirectionalG: 0.99,
      elevation: -180,
      azimuth: -180,
      color: 0xeeeeee,
      intensity: 8,
      gui: registry.has("debug.gui") ? registry.get("debug.gui") : null,
    });
    scene.add(skyCube.getSky());

    const directionalLight = skyCube.getSunLight();
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 128;
    directionalLight.shadow.mapSize.height = 128;
    directionalLight.shadow.camera.top = 32;
    directionalLight.shadow.camera.right = 32;
    directionalLight.shadow.camera.bottom = -32;
    directionalLight.shadow.camera.left = -32;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 64;
    scene.add(directionalLight);

    let updateIndex = this.addScreenUpdateEvent(
      skyCube.getScreenUpdateSunElevation(dayNightSpeed)
    );

    const point1 = new PointLight(0xff9999, nightLightIntensity, 8, 0.01);
    point1.castShadow = true;
    point1.shadow.mapSize.width = 32;
    point1.shadow.mapSize.height = 32;
    point1.shadow.camera.far = 16;
    point1.position.set(1.2, 3.5, 1.6);
    scene.add(point1);

    const point2 = new PointLight(0x99ff99, nightLightIntensity, 8, 0.01);
    point2.castShadow = true;
    point2.shadow.mapSize.width = 32;
    point2.shadow.mapSize.height = 32;
    point2.shadow.camera.far = 16;
    point2.position.set(1.2, 3.5, -1.6);
    scene.add(point2);

    const point3 = new PointLight(0x9999ff, nightLightIntensity, 8, 0.01);
    point3.castShadow = true;
    point3.shadow.mapSize.width = 32;
    point3.shadow.mapSize.height = 32;
    point3.shadow.camera.far = 16;
    point3.position.set(-1.2, 3.5, 1.6);
    scene.add(point3);

    const point4 = new PointLight(0xff99ff, nightLightIntensity, 8, 0.01);
    point4.castShadow = true;
    point4.shadow.mapSize.width = 32;
    point4.shadow.mapSize.height = 32;
    point4.shadow.camera.far = 16;
    point4.position.set(-1.2, 3.5, -1.6);
    scene.add(point4);

    let currentDay = 0;
    let currentDate = new Date(startDateTime);
    this.addScreenUpdateEvent((delta, elapsed) => {
      const skyCubeState = skyCube.getState();
      const factor = Math.sin(MathUtils.degToRad(skyCubeState?.elevation)) * -1;
      if (currentDay <= totalRamadanDays) {
        point1.intensity = Math.max(0, factor * nightLightIntensity);
        point2.intensity = Math.max(0, factor * nightLightIntensity);
        point3.intensity = Math.max(0, factor * nightLightIntensity);
        point4.intensity = Math.max(0, factor * nightLightIntensity);
      }

      if (skyCubeState.dayCount > currentDay) {
        currentDay = skyCubeState.dayCount;
        currentDate = new Date(currentDate.getTime() + aDayInMilliSeconds);
        appDatetime.innerText = currentDate.toDateString();
        if (currentDay === 1) {
          appTitle.innerText = "First day of Ramadan";
        } else if (currentDay === totalRamadanDays) {
          appTitle.innerText = "Last day of Ramadan";
          this.removeScreenUpdateEvent(updateIndex);
          updateIndex = this.addScreenUpdateEvent(
            skyCube.getScreenUpdateSunElevation(dayNightSpeed)
          );
        } else if (currentDay === totalRamadanDays + 1) {
          appTitle.innerText = "Eid al-Fitr";
          appMessage.innerText =
            "Eid Mubarak to you and your family! May this Eid bring endless blessings and strengthen your faith.";
          this.removeScreenUpdateEvent(updateIndex);
          gsap.to(camera.position, { duration: 1, y: 2, z: 2 });
          gsap.to(models.mosque.scene.position, { duration: 1, y: 2 });
          point1.intensity = nightLightIntensity;
          point2.intensity = nightLightIntensity;
          point3.intensity = nightLightIntensity;
          point4.intensity = nightLightIntensity;
        } else {
          if (currentDay === 5) {
            this.removeScreenUpdateEvent(updateIndex);
            updateIndex = this.addScreenUpdateEvent(
              skyCube.getScreenUpdateSunElevation(dayNightSpeed * 2)
            );
            gsap.to(camera.position, { duration: 1, y: 10, z: 10 });
          } else if (currentDay === 10) {
            this.removeScreenUpdateEvent(updateIndex);
            updateIndex = this.addScreenUpdateEvent(
              skyCube.getScreenUpdateSunElevation(dayNightSpeed * 4)
            );
            gsap.to(camera.position, { duration: 1, y: 8, z: 8 });
          } else if (currentDay === 15) {
            this.removeScreenUpdateEvent(updateIndex);
            updateIndex = this.addScreenUpdateEvent(
              skyCube.getScreenUpdateSunElevation(dayNightSpeed * 8)
            );
            gsap.to(camera.position, { duration: 1, y: 6, z: 6 });
          } else if (currentDay === totalRamadanDays - 2) {
            this.removeScreenUpdateEvent(updateIndex);
            updateIndex = this.addScreenUpdateEvent(
              skyCube.getScreenUpdateSunElevation(dayNightSpeed * 4)
            );
          } else if (currentDay === totalRamadanDays - 1) {
            this.removeScreenUpdateEvent(updateIndex);
            updateIndex = this.addScreenUpdateEvent(
              skyCube.getScreenUpdateSunElevation(dayNightSpeed * 2)
            );
          }
          appTitle.innerText = `Ramadan day #${currentDay}`;
        }
      }
    });

    this.showAppInfo();
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Ramadan Journey</strong>");
    notification.notice(
      "Eid al-Fitr marks the end of the month-long dawn-to-dusk fasting of Ramadan."
    );
    notification.notice(
      "3D Model — [Shah Alam, Blue Mosque](https://skfb.ly/Yw6E)"
    );
    notification.notice(
      "Textures — [Rocky Terrain 02](https://polyhaven.com/a/rocky_terrain_02)"
    );
  }
}

export default RamadanJourney;
