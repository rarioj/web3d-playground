import {
  AmbientLight,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PlaneGeometry,
  SpotLight,
} from "three";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";
import ModelHelper from "../../system/utility/ModelHelper.js";
import ModelAnimation from "../../system/utility/ModelAnimation.js";

/**
 * A prototype of a web page on top of a WebGL canvas scene rendering three glTF
 *    car models.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class CarShowroom extends WebGLPerspectiveOrbit {
  /**
   * Light shining on the car models.
   * @type {SpotLight}
   */
  #light;

  /**
   * Current screen-update callback ID.
   * @type {number}
   */
  #updateIndex;

  /**
   * Object instance current state.
   * @type {Object}
   */
  #state;

  /**
   * All available actions.
   * @type {Object}
   */
  #actions;

  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPosition: [0, 10, 10],
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
    const registry = this.getRegistry();
    const loader = new Loader(registry);

    const path = "./public/car-showroom/gltf";
    const models = await loader.loadGLTFModels({
      car1: `${path}/low-poly_cartoon_style_car_01.glb`,
      car2: `${path}/low-poly_cartoon_style_car_02.glb`,
      car3: `${path}/low-poly_cartoon_style_car_03.glb`,
    });

    const car1mesh = models.car1.scene.getObjectByName("Object_4");
    const redTexture = car1mesh.material.map.clone();
    const car2mesh = models.car2.scene.getObjectByName("Object_4");
    const orangeTexture = car2mesh.material.map.clone();
    const car3mesh = models.car3.scene.getObjectByName("Object_4");
    const blueTexture = car3mesh.material.map.clone();

    models.car1.scene.position.x = -3;
    models.car2.scene.position.x = 0;
    models.car3.scene.position.x = 3;

    ModelHelper.setShadow(models.car1);
    ModelHelper.setShadow(models.car2);
    ModelHelper.setShadow(models.car3);

    scene.add(models.car1.scene);
    scene.add(models.car2.scene);
    scene.add(models.car3.scene);

    const car1animation = new ModelAnimation(models.car1, 2);
    const car2animation = new ModelAnimation(models.car2, 2);
    const car3animation = new ModelAnimation(models.car3, 2);

    this.addScreenUpdateEvent(car1animation.getScreenUpdateCallback());
    this.addScreenUpdateEvent(car2animation.getScreenUpdateCallback());
    this.addScreenUpdateEvent(car3animation.getScreenUpdateCallback());

    this.#state = {
      car1mesh,
      car2mesh,
      car3mesh,
      redTexture,
      orangeTexture,
      blueTexture,
      car1animation,
      car2animation,
      car3animation,
    };

    const ambientLight = new AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    this.#light = new SpotLight(0xffffff, 24, 12, Math.PI * 0.065, 0.1, 0.015);
    this.#light.position.y = 10;
    this.#light.castShadow = true;
    this.#light.shadow.mapSize.width = 16;
    this.#light.shadow.mapSize.height = 16;
    this.#light.shadow.camera.top = 16;
    this.#light.shadow.camera.right = 16;
    this.#light.shadow.camera.bottom = -16;
    this.#light.shadow.camera.left = -16;
    this.#light.shadow.camera.near = 0.1;
    this.#light.shadow.camera.far = 8;
    scene.add(this.#light);

    const platformGeometry = new PlaneGeometry(12, 6, 32, 32);
    const platformMaterial = new MeshStandardMaterial({ color: "black" });
    const platform = new Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = Math.PI * -0.5;
    platform.receiveShadow = true;
    scene.add(platform);

    this.#updateIndex = this.addScreenUpdateEvent((delta, elapsed) => {
      this.#light.target.position.x = Math.sin(elapsed * 1.5) * 3;
      scene.add(this.#light.target);
    });

    const alert = registry.get("alert");
    const camera = this.getCamera();
    const controls = this.getControls();
    controls.target.y = 0.5;

    this.#actions = {
      cameraPosition: () => {
        alert.show(
          `Camera Position ~ X: ${camera.position.x} | Y: ${camera.position.y} | Z: ${camera.position.z}`
        );
      },
      resetPosition: () => {
        if (!this.#updateIndex) {
          this.#updateIndex = this.addScreenUpdateEvent((delta, elapsed) => {
            this.#light.target.position.x = Math.sin(elapsed * 1.5) * 3;
            scene.add(this.#light.target);
          });
        }
        this.#actions.resetAnimation();
        controls.autoRotate = false;
        gsap.to(controls.target, { duration: 1, x: 0 });
        gsap.to(camera.position, { duration: 1, x: 0, y: 10, z: 10 });
        scene.add(this.#light.target);
      },
      car1focus: () => {
        controls.autoRotate = true;
        if (this.#updateIndex) {
          this.removeScreenUpdateEvent(this.#updateIndex);
          this.#updateIndex = "";
        }
        this.#actions.resetAnimation();
        gsap.to(controls.target, { duration: 1, x: -3 });
        gsap.to(camera.position, { duration: 1, x: -3, y: 3, z: 4 });
        gsap.to(this.#light.target.position, { duration: 1, x: -3 });
        scene.add(this.#light.target);
      },
      car2focus: () => {
        controls.autoRotate = true;
        if (this.#updateIndex) {
          this.removeScreenUpdateEvent(this.#updateIndex);
          this.#updateIndex = "";
        }
        this.#actions.resetAnimation();
        gsap.to(controls.target, { duration: 1, x: 0 });
        gsap.to(camera.position, { duration: 1, x: 0, y: 3, z: 4 });
        gsap.to(this.#light.target.position, { duration: 1, x: 0 });
        scene.add(this.#light.target);
      },
      car3focus: () => {
        controls.autoRotate = true;
        if (this.#updateIndex) {
          this.removeScreenUpdateEvent(this.#updateIndex);
          this.#updateIndex = "";
        }
        this.#actions.resetAnimation();
        gsap.to(controls.target, { duration: 1, x: 3 });
        gsap.to(camera.position, { duration: 1, x: 3, y: 3, z: 4 });
        gsap.to(this.#light.target.position, { duration: 1, x: 3 });
        scene.add(this.#light.target);
      },
      car1interior: () => {
        this.#actions.car1focus();
        controls.autoRotate = false;
        gsap.to(camera.position, { duration: 1, x: -3, y: 0.8, z: -0.6 });
      },
      car2interior: () => {
        this.#actions.car2focus();
        controls.autoRotate = false;
        gsap.to(camera.position, { duration: 1, x: 0, y: 0.8, z: -0.6 });
      },
      car3interior: () => {
        this.#actions.car3focus();
        controls.autoRotate = false;
        gsap.to(camera.position, { duration: 1, x: 3, y: 0.8, z: -0.6 });
      },
      car1parts: () => {
        this.#actions.car1focus();
        this.#actions.resetAnimation();
        this.#state.car1animation.play();
      },
      car2parts: () => {
        this.#actions.car2focus();
        this.#actions.resetAnimation();
        this.#state.car2animation.play();
      },
      car3parts: () => {
        this.#actions.car3focus();
        this.#actions.resetAnimation();
        this.#state.car3animation.play();
      },
      car1colorRed: () => {
        this.#state.car1mesh.material.map = this.#state.redTexture;
      },
      car1colorOrange: () => {
        this.#state.car1mesh.material.map = this.#state.orangeTexture;
      },
      car1colorBlue: () => {
        this.#state.car1mesh.material.map = this.#state.blueTexture;
      },
      car2colorRed: () => {
        this.#state.car2mesh.material.map = this.#state.redTexture;
      },
      car2colorOrange: () => {
        this.#state.car2mesh.material.map = this.#state.orangeTexture;
      },
      car2colorBlue: () => {
        this.#state.car2mesh.material.map = this.#state.blueTexture;
      },
      car3colorRed: () => {
        this.#state.car3mesh.material.map = this.#state.redTexture;
      },
      car3colorOrange: () => {
        this.#state.car3mesh.material.map = this.#state.orangeTexture;
      },
      car3colorBlue: () => {
        this.#state.car3mesh.material.map = this.#state.blueTexture;
      },
      resetAnimation: () => {
        this.#state.car1animation.stop();
        this.#state.car2animation.stop();
        this.#state.car3animation.stop();
      },
    };

    const observer = new IntersectionObserver(
      (elements) => {
        elements.forEach((element) => {
          if (element.isIntersecting) {
            const page = 10 * parseInt(element.target.dataset.index);
            gsap.to("header", { duration: 1, width: `${page}%` });
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
    document
      .querySelectorAll("section")
      .forEach((element) => observer.observe(element));

    const buttons = document.querySelectorAll("button");
    [...buttons].forEach((button) => {
      button.onclick = () => {
        this.triggerAction(button.dataset.action);
      };
    });

    if (registry.has("debug.gui")) {
      this.#setupGuiControllers(
        registry.get("debug.gui").addFolder("Car Showroom").close()
      );
    }

    const notification = registry.get("notification");
    notification.notice("<strong>Car Showroom</strong>");
    notification.notice(
      "A prototype of a web page on top of a WebGL canvas scene rendering three glTF car models."
    );
    notification.notice(
      "3D Model — [Low-poly cartoon style car 01](https://skfb.ly/oxu87) | [Low-poly cartoon style car 02](https://skfb.ly/ovLQT) | [Low-poly cartoon style car 03](https://skfb.ly/owUr9)"
    );
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
    gui.add(this.#actions, "cameraPosition");
    gui.add(this.#actions, "resetPosition");
    gui.add(this.#actions, "car1focus");
    gui.add(this.#actions, "car2focus");
    gui.add(this.#actions, "car3focus");
    gui.add(this.#actions, "car1interior");
    gui.add(this.#actions, "car2interior");
    gui.add(this.#actions, "car3interior");
    gui.add(this.#actions, "car1parts");
    gui.add(this.#actions, "car2parts");
    gui.add(this.#actions, "car3parts");
    gui.add(this.#actions, "car1colorRed");
    gui.add(this.#actions, "car1colorOrange");
    gui.add(this.#actions, "car1colorBlue");
    gui.add(this.#actions, "car2colorRed");
    gui.add(this.#actions, "car2colorOrange");
    gui.add(this.#actions, "car2colorBlue");
    gui.add(this.#actions, "car3colorRed");
    gui.add(this.#actions, "car3colorOrange");
    gui.add(this.#actions, "car3colorBlue");
  }
}

export default CarShowroom;
