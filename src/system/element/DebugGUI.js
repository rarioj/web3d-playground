import { GUI } from "three/addons/libs/lil-gui.module.min.js";

/**
 * Wrapper class for a "lil-gui," a floating panel for controllers on the web.
 * @memberof module:System
 * @see {@link https://lil-gui.georgealways.com/|lil-gui}
 */
class DebugGUI {
  /**
   * GUI object instance.
   * @type {GUI}
   */
  #instance;

  /**
   * Instantiates a new GUI object.
   * @param {Object} [options={}] GUI options.
   */
  constructor(options = {}) {
    this.#instance = new GUI(options);
    this.#instance.domElement.style.right = 0;
  }

  /**
   * Returns the GUI object instance.
   * @returns {GUI} GUI object instance.
   */
  getInstance() {
    return this.#instance;
  }
}

export default DebugGUI;
