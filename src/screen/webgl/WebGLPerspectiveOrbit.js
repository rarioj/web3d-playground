import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGL from "./WebGL.js";

/**
 * Implementation of WebGL renderer with Perspective camera and Orbit controls.
 * @memberof module:Screen
 * @extends module:Screen.WebGL
 */
class WebGLPerspectiveOrbit extends WebGL {
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
   * Controls object instance.
   * @type {OrbitControls}
   */
  #controls;

  /**
   * Instantiates a new WebGL renderer object with a Perspective camera and
   *    Orbit controls.
   * @param {Object} [options] Screen options.
   * @param {number} [options.cameraPerspectiveFov=45] Camera frustum vertical
   *    field of view.
   * @param {number} [options.cameraPerspectiveNear=0.1] Camera frustum "near
   *    plane."
   * @param {number} [options.cameraPerspectiveFar=100] Camera frustum "far
   *    plane."
   * @param {number[]} [options.cameraPosition=[0, 0, -5]] Vector position of
   *    camera.
   * @param {Object} [options.controlsOrbitParameters={ enableDamping: true }]
   *    Orbit controls parameters.
   * @see {@link module:Screen.WebGL}
   */
  constructor(options = {}) {
    super(options);

    const {
      cameraPerspectiveFov: fov = 45,
      cameraPerspectiveNear: near = 0.1,
      cameraPerspectiveFar: far = 100,
      cameraPosition: position = [0, 0, -5],
      controlsOrbitParameters: parameters = { enableDamping: true },
    } = options;

    this.#scene = new Scene();
    this.#camera = new PerspectiveCamera(fov, this.getAspect(), near, far);
    this.#controls = new OrbitControls(this.#camera, this.getCanvas());

    this.#scene.add(this.#camera);

    if (position) {
      this.#camera.position.set(...position);
    }

    if (parameters) {
      Object.assign(this.#controls, parameters);
    }

    this.addScreenResizeEvent((width, height) => {
      this.#camera.aspect = width / height;
      this.#camera.updateProjectionMatrix();
    });

    this.addScreenUpdateEvent((delta) => this.#controls.update(delta));
  }

  /**
   * Returns the scene object instance.
   * @returns {Scene}
   * @see {@link https://threejs.org/docs/#api/en/scenes/Scene|Scene}
   */
  getScene() {
    return this.#scene;
  }

  /**
   * Returns the camera object instance.
   * @returns {PerspectiveCamera}
   * @see {@link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera|PerspectiveCamera}
   */
  getCamera() {
    return this.#camera;
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
