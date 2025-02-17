import { DirectionalLight, MathUtils, Vector3 } from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { GUI, Controller } from "three/addons/libs/lil-gui.module.min.js";

/**
 * Wrapper class for the Sky addon. The Sky class creates a ready-to-go sky
 *    environment for your scenes.
 * @memberof module:System
 * @see {@link https://threejs.org/docs/#examples/en/objects/Sky|Sky}
 */
class SkyCube {
  /**
   * Sky object instance.
   * @type {Sky}
   */
  #sky;

  /**
   * Sun vector position.
   * @type {Vector3}
   */
  #sun;

  /**
   * Light object instance (a Directional Light object).
   * @type {DirectionalLight}
   */
  #light;

  /**
   * Object instance current state.
   * @type {Object}
   */
  #state;

  /**
   * Collection of GUI controllers.
   * @type {Object.<string, Controller>}
   */
  #controllers;

  /**
   * Instantiates a new SkyCube object.
   * @param {Object} [options] SkyCube options.
   * @param {number} [options.scale=50] Cube scale.
   * @param {number} [options.turbidity=2] Turbidity value (sky haziness).
   * @param {number} [options.rayleigh=1] Rayleigh scattering value.
   * @param {number} [options.mieCoefficient=0.005] Mie scattering value.
   * @param {number} [options.mieDirectionalG=0.8] Mie scattering direction.
   * @param {number} [options.elevation=0] Vertical Sun position above/below the
   *    horizon.
   * @param {number} [options.azimuth=0] Horizontal Sun position.
   * @param {boolean} [options.light=true] Whether to create a Directional Light
   *    instance.
   * @param {(number|string)} [options.color=0xffffff] Directional Light color.
   * @param {number} [options.intensity=10] Directional Light intensity.
   * @param {number} [options.distance=25] Light source distance from the
   *    origin.
   * @param {GUI} [options.gui] GUI object instance.
   */
  constructor(options = {}) {
    const {
      scale = 50,
      turbidity = 2,
      rayleigh = 1,
      mieCoefficient = 0.005,
      mieDirectionalG = 0.8,
      elevation = 0,
      azimuth = 0,
      light = true,
      color = 0xffffff,
      intensity = 10,
      distance = 25,
      gui = null,
    } = options;

    this.#sky = new Sky();
    this.#sky.scale.setScalar(scale);
    this.#sky.material.uniforms.turbidity.value = turbidity;
    this.#sky.material.uniforms.rayleigh.value = rayleigh;
    this.#sky.material.uniforms.mieCoefficient.value = mieCoefficient;
    this.#sky.material.uniforms.mieDirectionalG.value = mieDirectionalG;

    this.#sun = new Vector3();
    this.#light = light ? new DirectionalLight(color, intensity) : null;
    this.#state = {
      scale,
      turbidity,
      rayleigh,
      mieCoefficient,
      mieDirectionalG,
      elevation,
      azimuth,
      intensity,
      distance,
    };

    this.setSunPosition(elevation, azimuth);

    if (gui instanceof GUI) {
      this.#setupGuiControllers(gui.addFolder("Sky Cube").close());
    }
  }

  /**
   * Returns the Sky object instance.
   * @returns {Sky}
   */
  getSky() {
    return this.#sky;
  }

  /**
   * Returns the object instance's current state.
   * @returns {Object}
   */
  getState() {
    return this.#state;
  }

  /**
   * Returns the Sun vector position.
   * @returns {Vector3}
   */
  getSunPosition() {
    return this.#sun;
  }

  /**
   * Sets Sun position derived from the elevation and azimuth.
   * @param {number} elevation Vertical Sun position above/below the horizon.
   * @param {number} azimuth Horizontal Sun position.
   */
  setSunPosition(elevation, azimuth) {
    const phi = MathUtils.degToRad(90 - elevation);
    const theta = MathUtils.degToRad(azimuth);
    const factor = Math.sin(MathUtils.degToRad(elevation));
    this.#sun.setFromSphericalCoords(1, phi, theta);
    this.#sky.material.uniforms.sunPosition.value.copy(this.#sun);
    if (this.#light) {
      this.#light.position.copy(this.#sun);
      this.#light.position.multiplyScalar(this.#state.distance);
      this.#light.intensity = Math.max(0, factor * this.#state.intensity);
    }
  }

  /**
   * Returns the light object instance (a Directional Light object).
   * @returns {DirectionalLight}
   */
  getSunLight() {
    return this.#light;
  }

  /**
   * Returns a screen-update callback that moves the Sun position.
   * @param {number} [speed=3] Elevation-change speed.
   * @returns {module:Screen.WebGL.ScreenUpdateCallback}
   */
  getScreenUpdateCallback(speed = 3) {
    return (delta) => {
      this.#state.elevation += delta * speed;
      if (this.#state.elevation > 180) {
        this.#state.elevation = -180;
      }
      this.setSunPosition(this.#state.elevation, this.#state.azimuth);
      if (this.#controllers?.elevation) {
        this.#controllers.elevation.updateDisplay();
      }
    };
  }

  /**
   * Sets up the GUI controllers.
   * @param {GUI} gui GUI object instance.
   * @private
   */
  #setupGuiControllers(gui) {
    const uniforms = this.#sky.material.uniforms;

    this.#controllers = {};
    this.#controllers.scale = gui
      .add(this.#state, "scale")
      .min(1)
      .max(100)
      .step(0.01)
      .onChange((value) => this.#sky.scale.setScalar(value))
      .name("scale");
    this.#controllers.turbidity = gui
      .add(this.#state, "turbidity")
      .min(0)
      .max(20)
      .step(0.1)
      .onChange((value) => (uniforms.turbidity.value = value))
      .name("turbidity");
    this.#controllers.rayleigh = gui
      .add(this.#state, "rayleigh")
      .min(0)
      .max(4)
      .step(0.001)
      .onChange((value) => (uniforms.rayleigh.value = value))
      .name("rayleigh");
    this.#controllers.mieCoefficient = gui
      .add(this.#state, "mieCoefficient")
      .min(0)
      .max(0.1)
      .step(0.001)
      .onChange((value) => (uniforms.mieCoefficient.value = value))
      .name("mieCoefficient");
    this.#controllers.mieDirectionalG = gui
      .add(this.#state, "mieDirectionalG")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange((value) => (uniforms.mieDirectionalG.value = value))
      .name("mieDirectionalG");
    this.#controllers.elevation = gui
      .add(this.#state, "elevation")
      .min(-180)
      .max(180)
      .step(0.1)
      .onChange((value) => this.setSunPosition(value, this.#state.azimuth))
      .name("elevation");
    this.#controllers.azimuth = gui
      .add(this.#state, "azimuth")
      .min(-180)
      .max(180)
      .step(0.1)
      .onChange((value) => this.setSunPosition(this.#state.elevation, value))
      .name("azimuth");
  }
}

export default SkyCube;
