import Stats from "three/addons/libs/stats.module.js";

/**
 * Wrapper class for Stats.js, a JavaScript performance monitor.
 * @memberof module:System
 * @see {@link https://github.com/mrdoob/stats.js|stats.js}
 */
class DebugStats {
  /**
   * Stats object instance.
   * @type {Stats}
   */
  #instance;

  /**
   * Instantiates a new Stats object.
   * @param {HTMLElement} [container=document.body] Stats element parent
   *    container.
   */
  constructor(container = document.body) {
    this.#instance = new Stats();

    if (container instanceof HTMLElement) {
      container.appendChild(this.#instance.dom);
    }
  }

  /**
   * Returns the Stats object instance.
   * @returns {Stats} Stats object instance.
   */
  getInstance() {
    return this.#instance;
  }
}

export default DebugStats;
