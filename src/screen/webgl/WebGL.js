import { Camera, MathUtils, Scene, WebGLRenderer } from "three";
import { Timer } from "three/addons/misc/Timer.js";

/**
 * Base WebGL renderer and its canvas.
 * @memberof module:Screen
 */
class WebGL {
  /**
   * Registry object instance.
   * @type {Map}
   */
  #registry;

  /**
   * WebGL renderer object instance.
   * @type {WebGLRenderer}
   */
  #renderer;

  /**
   * Timer object instance.
   * @type {Timer}
   */
  #timer;

  /**
   * Canvas width.
   * @type {(number|function)}
   */
  #width;

  /**
   * Canvas height.
   * @type {(number|function)}
   */
  #height;

  /**
   * Collection of screen-resizing callbacks.
   * @type {Map.<string, ScreenResizeCallback>}
   */
  #screenResizeCallbacks;

  /**
   * Collection of screen-updating callbacks.
   * @type {Map.<string, ScreenUpdateCallback>}
   */
  #screenUpdateCallbacks;

  /**
   * Whether the app is prepared (the prepare method is already called).
   * @type {boolean}
   */
  #isPrepared;

  /**
   * Delta time. The time difference between now and the last render update.
   * @type {number}
   */
  #deltaTime;

  /**
   * Elapsed time. The time since the first render update.
   * @type {number}
   */
  #elapsedTime;

  /**
   * WebGL screen abstract class.
   * @param {Object} [options] Screen options.
   * @param {Map} [options.registry=new Map()] Registry object instance.
   * @param {Object} [options.rendererParameters={ antialias: true }] WebGL
   *    renderer parameters.
   * @param {(number|function)} [options.canvasWidth=() => window.innerWidth]
   *    Canvas width.
   * @param {(number|function)} [options.canvasHeight=() => window.innerHeight]
   *    Canvas height.
   * @param {string} [options.canvasId=webgl-canvas-element] Canvas element ID.
   * @param {string} [options.canvasClassname=webgl-canvas-element] Canvas
   *    element class name.
   * @param {HTMLElement} [options.canvasContainer=document.body] Canvas element
   *    parent container.
   */
  constructor(options = {}) {
    const {
      registry = new Map(),
      rendererParameters: parameters = { antialias: true },
      canvasWidth: width = () => window.innerWidth,
      canvasHeight: height = () => window.innerHeight,
      canvasId: id = "webgl-canvas-element",
      canvasClassname: classname = "webgl-canvas-element",
      canvasContainer: container = document.body,
    } = options;

    this.#registry = registry;
    this.#renderer = new WebGLRenderer(parameters);
    this.#timer = new Timer();
    this.#width = width;
    this.#height = height;
    this.#screenResizeCallbacks = new Map();
    this.#screenUpdateCallbacks = new Map();
    this.#isPrepared = false;
    this.#deltaTime = 0;
    this.#elapsedTime = 0;

    const canvas = this.#renderer.domElement;
    canvas.id = id;
    canvas.classList.add(classname);

    if (container instanceof HTMLElement) {
      container.appendChild(canvas);
    }

    this.resizeScreen(this.getWidth(), this.getHeight());

    if (this.isResponsive()) {
      this.addScreenResizeEvent((width, height) =>
        this.resizeScreen(width, height)
      );

      window.addEventListener("resize", () => this.#triggerScreenResize());
    }

    if (this.#registry.has("debug.stats")) {
      this.addScreenUpdateEvent(() =>
        this.#registry.get("debug.stats").update()
      );
    }
  }

  /**
   * Returns the registry object instance.
   * @returns {Map} Registry object instance.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map|Map}
   */
  getRegistry() {
    return this.#registry;
  }

  /**
   * Returns the WebGL renderer object instance.
   * @returns {WebGLRenderer} WebGL renderer object instance.
   * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer|WebGLRenderer}
   */
  getRenderer() {
    return this.#renderer;
  }

  /**
   * Returns the canvas element.
   * @returns {HTMLCanvasElement} Canvas HTML element.
   */
  getCanvas() {
    return this.#renderer.domElement;
  }

  /**
   * Returns the timer object instance.
   * @returns {Timer} Timer object instance.
   */
  getTimer() {
    return this.#timer;
  }

  /**
   * Returns the scene object instance.
   * @returns {Scene} Scene object instance.
   * @abstract
   */
  getScene() {
    throw "Method 'getScene' is not returning an instance of Three.js Scene";
  }

  /**
   * Returns the camera object instance.
   * @returns {Camera} Camera object instance.
   * @abstract
   */
  getCamera() {
    throw "Method 'getCamera' is not returning an instance of Three.js Camera";
  }

  /**
   * Returns the calculated canvas width.
   * @returns {number} Canvas width.
   */
  getWidth() {
    const width = this.#width;
    return parseInt(typeof width === "function" ? width() : width) || 0;
  }

  /**
   * Returns the calculated canvas height.
   * @returns {number} Canvas height.
   */
  getHeight() {
    const height = this.#height;
    return parseInt(typeof height === "function" ? height() : height) || 0;
  }

  /**
   * Returns the canvas aspect ratio.
   * @returns {number} Canvas aspect ratio.
   */
  getAspect() {
    return this.getWidth() / this.getHeight();
  }

  /**
   * Returns the time difference between now and the last render update.
   * @returns {number} Delta time.
   */
  getDeltaTime() {
    return this.#deltaTime;
  }

  /**
   * Returns the time elapsed since the first render update.
   * @returns {number} Elapsed time.
   */
  getElapsedTime() {
    return this.#elapsedTime;
  }

  /**
   * Returns whether the screen is responsive.
   * @returns {boolean} Whether the screen is responsive.
   */
  isResponsive() {
    const width = this.#width;
    const height = this.#height;

    return typeof width === "function" || typeof height === "function";
  }

  /**
   * Resizes the screen.
   * @param {number} width New width.
   * @param {number} height New height.
   */
  resizeScreen(width, height) {
    this.#renderer.domElement.style.width = `${width}px`;
    this.#renderer.domElement.style.height = `${height}px`;
    this.#renderer.domElement.style.aspectRatio = width / height;

    this.#renderer.setSize(width, height);
    this.#renderer.setPixelRatio(window.devicePixelRatio);
  }

  /**
   * Registers a new screen-resize event.
   * @param {ScreenResizeCallback} callback Screen-resize event callback.
   * @returns {string} Screen-resize callback ID.
   */
  addScreenResizeEvent(callback) {
    const index = MathUtils.generateUUID();
    this.#screenResizeCallbacks.set(index, callback);
    return index;
  }

  /**
   * Removes a screen-resize event.
   * @param {string} index Screen-resize callback ID.
   */
  removeScreenResizeEvent(index) {
    if (this.#screenResizeCallbacks.has(index)) {
      this.#screenResizeCallbacks.delete(index);
    }
  }

  /**
   * Fires the screen-resize events.
   * @private
   */
  #triggerScreenResize() {
    const width = this.getWidth();
    const height = this.getHeight();

    this.#screenResizeCallbacks.forEach((callback) => callback(width, height));
  }

  /**
   * Registers a new screen-update event.
   * @param {ScreenUpdateCallback} callback Screen-update event callback.
   * @returns {string} Screen-update callback ID.
   */
  addScreenUpdateEvent(callback) {
    const index = MathUtils.generateUUID();
    this.#screenUpdateCallbacks.set(index, callback);
    return index;
  }

  /**
   * Removes a screen-update event.
   * @param {string} index Screen-update callback ID.
   */
  removeScreenUpdateEvent(index) {
    if (this.#screenUpdateCallbacks.has(index)) {
      this.#screenUpdateCallbacks.delete(index);
    }
  }

  /**
   * Fires the screen-update events.
   * @param {Scene} scene Scene object instance.
   * @param {Camera} camera Camera object instance.
   * @private
   */
  #triggerScreenUpdate(scene, camera) {
    this.#timer.update();

    this.#deltaTime = this.#timer.getDelta();
    this.#elapsedTime = this.#timer.getElapsed();

    this.#screenUpdateCallbacks.forEach((callback) =>
      callback(this.#deltaTime, this.#elapsedTime)
    );
    this.#renderer.render(scene, camera);
  }

  /**
   * Prepares the app.
   * @abstract
   * @async
   */
  async prepare() {
    throw "Method 'prepare' is not implemented.";
  }

  /**
   * Starts the app.
   * @param {Scene} [scene] Scene object instance.
   * @param {Camera} [camera] Camera object instance.
   * @async
   */
  async start(scene = undefined, camera = undefined) {
    scene = scene || this.getScene();
    camera = camera || this.getCamera();

    if (!(scene instanceof Scene)) {
      throw "Argument 'scene' is not an instance of Three.js Scene";
    }
    if (!(camera instanceof Camera)) {
      throw "Argument 'camera' is not an instance of Three.js Camera";
    }

    if (!this.#isPrepared) {
      await this.prepare();
      this.#isPrepared = true;
    }

    this.#renderer.setAnimationLoop(() =>
      this.#triggerScreenUpdate(scene, camera)
    );
  }

  /**
   * Stops the app.
   */
  stop() {
    this.#renderer.setAnimationLoop(null);
  }
}

/**
 * Screen-resize event callback.
 * @callback ScreenResizeCallback
 * @memberof module:Screen.WebGL
 * @param {number} width New width.
 * @param {number} height New height.
 */

/**
 * Screen-update event callback.
 * @callback ScreenUpdateCallback
 * @memberof module:Screen.WebGL
 * @param {number} [delta] Delta time. The time difference between now and the
 *    last render update.
 * @param {number} [elapsed] Elapsed time. The time since the first render
 *    update.
 */

export default WebGL;
