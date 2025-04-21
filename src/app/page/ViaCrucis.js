import { EquirectangularReflectionMapping, PCFSoftShadowMap } from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";

/**
 * The Stations of the Cross, also known as the Way of Sorrows or the Via
 * 		Crucis, is a processional route symbolizing the path Jesus Christ walked
 * 		to his crucifixion on Mount Calvary.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class ViaCrucis extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPosition: [15, 10, 10],
    controlsOrbitParameters: {
      autoRotate: false,
      autoRotateSpeed: 4,
      enableDamping: true,
      enableZoom: false,
      maxDistance: 10,
      maxPolarAngle: Math.PI * 0.5 - 0.1,
      minDistance: 0.25,
    },
  };

  /**
   * All available actions.
   * @type {Object}
   */
  #actions;

  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };

    const renderer = this.getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    const scene = this.getScene();
    const camera = this.getCamera();
    const registry = this.getRegistry();
    const controls = this.getControls();
    const loader = new Loader(registry);

    const path = "./public/via-crucis";
    const model = await loader.loadGLTFModel(
      "via_crucis",
      `${path}/gltf/way_of_the_cross_fatima_pt_scaniverse.glb`
    );
    scene.add(model.scene);

    const background = await loader.loadRGBETexture(
      "background",
      `${path}/hdr/small_cathedral_2k.hdr`
    );
    background.mapping = EquirectangularReflectionMapping;
    scene.background = background;
    scene.environment = background;
    scene.backgroundBlurriness = 0.075;
    scene.backgroundIntensity = 0.3;

    // const light = new PointLight(0xffffff, 1, 1, 0.5);
    // camera.add(light);

    controls.target.y = 1;

    this.#actions = {
      start: () => {
        gsap.to(camera.position, { duration: 1, x: -25, y: 5, z: 10 });
        gsap.to(controls.target, { duration: 1, x: 0 });
      },
      station1: () => {
        gsap.to(camera.position, { duration: 1, x: 0, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 0, y: 1.7 });
      },
      station2: () => {
        gsap.to(camera.position, { duration: 1, x: 1.6, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 1.6, y: 1.7 });
      },
      station3: () => {
        gsap.to(camera.position, { duration: 1, x: 3.2, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 3.2, y: 1.7 });
      },
      station4: () => {
        gsap.to(camera.position, { duration: 1, x: 4.8, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 4.8, y: 1.7 });
      },
      station5: () => {
        gsap.to(camera.position, { duration: 1, x: 6.4, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 6.4, y: 1.7 });
      },
      station6: () => {
        gsap.to(camera.position, { duration: 1, x: 8, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 8, y: 1.7 });
      },
      station7: () => {
        gsap.to(camera.position, { duration: 1, x: 9.6, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 9.6, y: 1.7 });
      },
      station8: () => {
        gsap.to(camera.position, { duration: 1, x: 11.2, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 11.2, y: 1.7 });
      },
      station9: () => {
        gsap.to(camera.position, { duration: 1, x: 12.8, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 12.8, y: 1.7 });
      },
      station10: () => {
        gsap.to(camera.position, { duration: 1, x: 14.4, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 14.4, y: 1.7 });
      },
      station11: () => {
        gsap.to(camera.position, { duration: 1, x: 16, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 16, y: 1.7 });
      },
      station12: () => {
        gsap.to(camera.position, { duration: 1, x: 17.6, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 17.6, y: 1.7 });
      },
      station13: () => {
        gsap.to(camera.position, { duration: 1, x: 19.2, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 19.2, y: 1.7 });
      },
      station14: () => {
        gsap.to(camera.position, { duration: 1, x: 20.8, y: 2, z: 1.5 });
        gsap.to(controls.target, { duration: 1, x: 20.8, y: 1.7 });
      },
      end: () => {
        gsap.to(camera.position, { duration: 1, x: 24, y: -2, z: 1 });
        gsap.to(controls.target, { duration: 1, x: 22.4 });
      },
    };

    const observer = new IntersectionObserver(
      (elements) => {
        elements.forEach((element) => {
          if (element.isIntersecting) {
            const page = 6.667 * parseInt(element.target.dataset.page);
            gsap.to("div.header", { duration: 1, width: `${page}%` });
            this.triggerAction(element.target.dataset.action);
          }
        });
      },
      {
        root: document.querySelector("main"),
        rootMargin: "-1% 0% -99% 0%",
        threshold: 0,
      }
    );
    document.querySelectorAll("section").forEach((element, index) => {
      element.dataset.page = index;
      observer.observe(element);
    });

    if (registry.has("debug.gui")) {
      this.#setupGuiControllers(
        registry.get("debug.gui").addFolder("Via Crucis").close()
      );
    }

    this.showAppInfo();
  }

  /**
   * Triggers an action.
   * @param {string} name Action name.
   */
  triggerAction(name) {
    this.#actions[name]();
  }

  /**
   * Sets up the GUI controllers.
   * @param {GUI} gui GUI object instance.
   * @private
   */
  #setupGuiControllers(gui) {
    gui.add(this.#actions, "start");
    gui.add(this.#actions, "station1");
    gui.add(this.#actions, "station2");
    gui.add(this.#actions, "station3");
    gui.add(this.#actions, "station4");
    gui.add(this.#actions, "station5");
    gui.add(this.#actions, "station6");
    gui.add(this.#actions, "station7");
    gui.add(this.#actions, "station8");
    gui.add(this.#actions, "station9");
    gui.add(this.#actions, "station10");
    gui.add(this.#actions, "station11");
    gui.add(this.#actions, "station12");
    gui.add(this.#actions, "station13");
    gui.add(this.#actions, "station14");
    gui.add(this.#actions, "end");
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const query = this.getRegistry().get("query");
    if (Boolean(query?.noinfo)) return;
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Via Crucis</strong>");
    notification.notice(
      "The Stations of the Cross, also known as the Way of Sorrows or the Via Crucis, is a processional route symbolizing the path Jesus Christ walked to his crucifixion on Mount Calvary."
    );
    notification.notice(
      "3D Model — [Way of the Cross, Fatima, PT (Scaniverse)](https://skfb.ly/oOnAR)"
    );
    notification.notice(
      "Textures — [Small Cathedral](https://polyhaven.com/a/small_cathedral)"
    );
  }
}

export default ViaCrucis;
