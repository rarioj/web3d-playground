import { PerspectiveCamera, Scene, Vector3 } from "three";
import WebGL from "./WebGL.js";

/**
 * Implementation of WebGL renderer with Perspective camera.
 * @memberof module:Screen
 * @extends module:Screen.WebGL
 */
class WebGLPerspective extends WebGL {
  /**
   * Scene object instance.
   * @type {Scene}
   */
  #scene;

  /**
   * Camera object instance.
   * @type {PerspectiveCamera}
   */
  #camera;

  /**
   * Instantiates a new WebGL renderer object with a Perspective camera.
   * @param {Object} [options] Screen options.
   * @param {number} [options.cameraPerspectiveFov=45] Camera frustum vertical
   *    field of view.
   * @param {number} [options.cameraPerspectiveNear=0.1] Camera frustum "near
   *    plane."
   * @param {number} [options.cameraPerspectiveFar=100] Camera frustum "far
   *    plane."
   * @param {number[]} [options.cameraPosition=[0, 0, -5]] Vector position of
   *    camera.
   * @see {@link module:Screen.WebGL}
   */
  constructor(options = {}) {
    super(options);

    const {
      cameraPerspectiveFov: fov = 45,
      cameraPerspectiveNear: near = 0.1,
      cameraPerspectiveFar: far = 100,
      cameraPosition: position = [0, 0, -5],
    } = options;

    this.#scene = new Scene();
    this.#camera = new PerspectiveCamera(fov, this.getAspect(), near, far);

    this.#scene.add(this.#camera);

    if (position) {
      this.#camera.position.set(...position);
      this.#camera.lookAt(new Vector3(0, 0, 0));
    }

    this.addScreenResizeEvent((width, height) => {
      this.#camera.aspect = width / height;
      this.#camera.updateProjectionMatrix();
    });
  }

  /**
   * Returns the scene object instance.
   * @returns {Scene} Scene object instance.
   * @see {@link https://threejs.org/docs/#api/en/scenes/Scene|Scene}
   */
  getScene() {
    return this.#scene;
  }

  /**
   * Returns the camera object instance.
   * @returns {PerspectiveCamera} Camera object instance.
   * @see {@link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera|PerspectiveCamera}
   */
  getCamera() {
    return this.#camera;
  }
}

export default WebGLPerspective;
