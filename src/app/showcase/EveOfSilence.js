import { PCFSoftShadowMap, PointLight, SpotLight, Vector3 } from "three";
import WebGLPerspectiveFirstPerson from "../../screen/webgl/WebGLPerspectiveFirstPerson.js";
import Loader from "../../system/utility/Loader.js";
import ModelHelper from "../../system/utility/ModelHelper.js";

/**
 * Nyepi is a Balinese holiday held every Isakawarsa, or new year, according to
 * 		the Balinese calendar. The observance includes maintaining silence,
 * 		fasting, and meditation. In the afternoon and evening before Nyepi, many
 * 		'ogoh-ogoh' are paraded around the villages.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveFirstPerson
 */
class EveOfSilence extends WebGLPerspectiveFirstPerson {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPerspectiveNear: 0.1,
    cameraPerspectiveFar: 15000,
    cameraPosition: [870, 1120, 6240],
    controlsFirstPersonParameters: {
      lookSpeed: 0.05,
      movementSpeed: 500,
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
    const camera = this.getCamera();
    const registry = this.getRegistry();
    const loader = new Loader(registry);
    const path = "./public/eve-of-silence/gltf";

    const light = new PointLight(0xfbfdf9, 5, 4096, 0.0005);
    light.castShadow = true;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 4096;
    camera.add(light);
    scene.add(camera);

    const models = await loader.loadGLTFModels({
      cave: `${path}/cave.glb`,
      abimanyu_pralaya: `${path}/abimanyu_pralaya.glb`,
      kuwera_punia: `${path}/kuwera_punia.glb`,
      narashima_avatara: `${path}/narashima_avatara.glb`,
      ogoh_ogoh_anungkap: `${path}/ogoh_ogoh_anungkap.glb`,
      kalau_rau_besar: `${path}/kalau_rau_besar.glb`,
    });

    ModelHelper.setShadow(models.cave, false);
    scene.add(models.cave.scene);

    models.abimanyu_pralaya.scene.position.set(320, 310, 2860);
    models.abimanyu_pralaya.scene.scale.set(400, 400, 400);
    ModelHelper.setShadow(models.abimanyu_pralaya);
    scene.add(models.abimanyu_pralaya.scene);

    models.kuwera_punia.scene.position.set(560, 330, -1120);
    models.kuwera_punia.scene.scale.set(200, 200, 200);
    ModelHelper.setShadow(models.kuwera_punia);
    scene.add(models.kuwera_punia.scene);

    models.narashima_avatara.scene.position.set(1550, 400, -3500);
    models.narashima_avatara.scene.scale.set(100, 100, 100);
    ModelHelper.setShadow(models.narashima_avatara);
    scene.add(models.narashima_avatara.scene);

    models.ogoh_ogoh_anungkap.scene.position.set(1640, 330, -5900);
    models.ogoh_ogoh_anungkap.scene.rotateY(Math.PI);
    models.ogoh_ogoh_anungkap.scene.scale.set(160, 160, 160);
    ModelHelper.setShadow(models.ogoh_ogoh_anungkap);
    scene.add(models.ogoh_ogoh_anungkap.scene);

    models.kalau_rau_besar.scene.position.set(3680, 330, -12100);
    models.kalau_rau_besar.scene.scale.set(160, 160, 160);
    ModelHelper.setShadow(models.kalau_rau_besar);
    scene.add(models.kalau_rau_besar.scene);

    this.showAppInfo();
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Eve of Silence</strong>");
    notification.notice(
      "Nyepi is a Balinese holiday held every Isakawarsa, or new year, according to the Balinese calendar. The observance includes maintaining silence, fasting, and meditation. In the afternoon and evening before Nyepi, many 'ogoh-ogoh' are paraded around the villages."
    );
    notification.notice(
      "3D Model — [Cave](https://skfb.ly/onVnO) | [Abimanyu Pralaya](https://skfb.ly/oYoKA) | [Kuwera Punia](https://skfb.ly/oWOqF) | [Rahwana](https://skfb.ly/oYvVN) | [Ogoh Ogoh Anungkap](https://skfb.ly/oYowI) | [Narashima Avatara](https://skfb.ly/oYvXC) | [Kalau Rau Besar](https://skfb.ly/oWOqu)"
    );
  }
}

export default EveOfSilence;
