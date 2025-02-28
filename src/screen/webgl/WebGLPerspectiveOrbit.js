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

    this.addScreenUpdateEvent((delta) => this.#controls.update(delta));
  }

  /**
   * Returns the controls object instance.
   * @returns {OrbitControls}
   * @see {@link https://threejs.org/docs/#examples/en/controls/OrbitControls|OrbitControls}
   */
  getControls() {
    return this.#controls;
  }
}

export default WebGLPerspectiveOrbit;
