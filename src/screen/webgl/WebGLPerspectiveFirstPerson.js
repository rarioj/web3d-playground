import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import WebGLPerspective from "./WebGLPerspective.js";

/**
 * Implementation of WebGL renderer with Perspective camera and First Person
 *    controls.
 * @memberof module:Screen
 * @extends module:Screen.WebGL
 */
class WebGLPerspectiveFirstPerson extends WebGLPerspective {
  /**
   * Controls object instance.
   * @type {FirstPersonControls}
   */
  #controls;

  /**
   * First person controls screen-update callback ID.
   * @type {number}
   */
  #firstPersonControlsUpdateIndex;

  /**
   * Instantiates a new WebGL renderer object with a Perspective camera and
   *    First Person controls.
   * @param {Object} [options] Screen options.
   * @param {Object} [options.controlsFirstPersonParameters={ lookSpeed: 0.1, movementSpeed: 10 }]
   *    First Person controls parameters.
   * @see {@link module:Screen.WebGLPerspective}
   */
  constructor(options = {}) {
    super(options);

    const {
      controlsFirstPersonParameters: parameters = {
        lookSpeed: 0.1,
        movementSpeed: 10,
      },
    } = options;

    this.#controls = new FirstPersonControls(
      this.getCamera(),
      this.getCanvas()
    );

    if (parameters) {
      Object.assign(this.#controls, parameters);
    }

    this.enableFirstPersonControls();
  }

  /**
   * Returns the controls object instance.
   * @returns {FirstPersonControls} Controls object instance.
   * @see {@link https://threejs.org/docs/#examples/en/controls/FirstPersonControls|FirstPersonControls}
   */
  getControls() {
    return this.#controls;
  }

  /**
   * Enables first person controls.
   */
  enableFirstPersonControls() {
    this.#controls.enabled = true;
    this.#firstPersonControlsUpdateIndex = this.addScreenUpdateEvent((delta) =>
      this.#controls.update(delta)
    );
  }

  /**
   * Disables first person controls.
   */
  disableFirstPersonControls() {
    this.#controls.enabled = false;
    this.removeScreenUpdateEvent(this.#firstPersonControlsUpdateIndex);
  }
}

export default WebGLPerspectiveFirstPerson;
