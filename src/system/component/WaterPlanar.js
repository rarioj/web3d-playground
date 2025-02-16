import { PlaneGeometry, Texture, Vector2 } from "three";
import { Water } from "three/addons/objects/Water2.js";

/**
 * Creates a planar field with water texture applied.
 * @memberof module:System
 * @see {@link https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Water2.js|Water2.js}
 */
class WaterPlanar {
  /**
   * Plane geometry instance.
   * @type {PlaneGeometry}
   */
  #geometry;

  /**
   * Water object instance.
   * @type {Water}
   */
  #water;

  /**
   * Instantiates a new WaterPlanar object.
   * @param {Object} options WaterPlanar options.
   * @param {number} [options.width=2000] Plane width.
   * @param {number} [options.height=2000] Plane height.
   * @param {(number|string)} [options.color=0xffffff] Color of water.
   * @param {number} [options.textureWidth=1024] Water texture width.
   * @param {number} [options.textureHeight=1024] Water texture height.
   * @param {number} [options.clipBias=0] Reflector and refractor clipping bias.
   * @param {number} [options.flowX=1] Water flow value in the X direction of
   *    the plane.
   * @param {number} [options.flowY=1] Water flow value in the Y direction of
   *    the plane.
   * @param {number} [options.flowSpeed=0.03] Water flow speed.
   * @param {number} [options.reflectivity=0.02] Water reflectivity value.
   * @param {number} [options.scale=5] Water plane scale.
   * @param {number} [options.flowMap] Water flow texture map.
   * @param {number} options.normalMap0 First water normal texture map.
   * @param {number} options.normalMap1 Second water normal texture map.
   */
  constructor(options = {}) {
    const {
      width = 2000,
      height = 2000,
      color = 0xffffff,
      textureWidth = 1024,
      textureHeight = 1024,
      clipBias = 0,
      flowX = 1,
      flowY = 1,
      flowSpeed = 0.03,
      reflectivity = 0.02,
      scale = 5,
      flowMap = null,
      normalMap0 = null,
      normalMap1 = null,
    } = options;

    if (!(normalMap0 instanceof Texture)) {
      throw "Argument 'normalMap0' is not an instance of Three.js Texture";
    }
    if (!(normalMap1 instanceof Texture)) {
      throw "Argument 'normalMap1' is not an instance of Three.js Texture";
    }

    this.#geometry = new PlaneGeometry(width, height);

    this.#water = new Water(this.#geometry, {
      color,
      textureWidth,
      textureHeight,
      clipBias,
      flowDirection: new Vector2(flowX, flowY),
      flowSpeed,
      reflectivity,
      scale,
      flowMap: flowMap instanceof Texture ? flowMap : null,
      normalMap0,
      normalMap1,
    });
    this.#water.rotation.x = Math.PI * -0.5;
  }

  /**
   * Returns the water object instance.
   * @returns {Water}
   */
  getWater() {
    return this.#water;
  }
}

export default WaterPlanar;
