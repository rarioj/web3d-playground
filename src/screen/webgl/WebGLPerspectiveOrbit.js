import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGLPerspective from "./WebGLPerspective.js";

/**
 * Implementation of WebGL renderer with Perspective camera and Orbit controls.
 * @memberof module:Screen
 * @extends module:Screen.WebGL
 */
class WebGLPerspectiveOrbit extends WebGLPerspective {
  /**
   * Controls object instance.
   * @type {OrbitControls}
   */
  #controls;

  /**
   * Orbit controls screen-update callback ID.
   * @type {number}
   */
  #orbitControlsUpdateIndex;

  /**
   * Instantiates a new WebGL renderer object with a Perspective camera and
   *    Orbit controls.
   * @param {Object} [options] Screen options.
   * @param {Object} [options.controlsOrbitParameters={ enableDamping: true }]
   *    Orbit controls parameters.
   * @see {@link module:Screen.WebGLPerspective}
   */
  constructor(options = {}) {
    super(options);

    const { controlsOrbitParameters: parameters = { enableDamping: true } } =
      options;

    this.#controls = new OrbitControls(this.getCamera(), this.getCanvas());

    if (parameters) {
      Object.assign(this.#controls, parameters);
    }

    this.enableOrbitControls();
  }

  /**
   * Returns the controls object instance.
   * @returns {OrbitControls} Controls object instance.
   * @see {@link https://threejs.org/docs/#examples/en/controls/OrbitControls|OrbitControls}
   */
  getControls() {
    return this.#controls;
  }

  /**
   * Enables orbit controls.
   */
  enableOrbitControls() {
    this.#controls.enabled = true;
    this.#orbitControlsUpdateIndex = this.addScreenUpdateEvent((delta) =>
      this.#controls.update(delta)
    );
  }

  /**
   * Disables orbit controls.
   */
  disableOrbitControls() {
    this.#controls.enabled = false;
    this.removeScreenUpdateEvent(this.#orbitControlsUpdateIndex);
  }
}

export default WebGLPerspectiveOrbit;
