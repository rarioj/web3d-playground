import { AnimationAction, AnimationMixer } from "three";

/**
 * Model animation wrapper.
 * @memberof module:System
 */
class ModelAnimation {
  /**
   * Animation mixer instance.
   * @type {AnimationMixer}
   */
  #mixer;

  /**
   * Map of animation actions.
   * @type {Map.<string, AnimationAction>}
   */
  #actions;

  /**
   * Animation speed.
   * @type {number}
   */
  #speed;

  /**
   * Current animation name.
   * @type {string}
   */
  #currentName;

  /**
   * Current animation action.
   * @type {AnimationAction}
   */
  #currentAction;

  /**
   * Instantiates a new ModelAnimation object.
   * @param {Object} model 3D object model.
   * @param {number} [speed=1] Animation speed.
   * @see {@link https://threejs.org/docs/#api/en/animation/AnimationMixer|AnimationMixer}
   */
  constructor(model, speed = 1) {
    this.#mixer = new AnimationMixer(model.scene);
    this.#actions = new Map();
    this.#speed = speed;

    if (!model?.animations.length) {
      throw "This model does not provide any animation";
    }

    for (let i = 0; i < model.animations.length; i++) {
      const name = model.animations[i].name;
      const action = this.#mixer.clipAction(model.animations[i]);
      if (!this.#currentAction) {
        this.#currentName = name;
        this.#currentAction = action;
      }
      this.#actions.set(name, action);
    }
  }

  /**
   * Returns the animation speed.
   * @returns {number} Animation speed.
   */
  getSpeed() {
    return this.#speed;
  }

  /**
   * Sets the animation speed.
   * @param {number} speed Animation speed.
   */
  setSpeed(speed) {
    this.#speed = speed;
  }

  /**
   * Plays an animation.
   * @param {string} [name=""] Animation name.
   * @param {number} [crossFadeDuration=1] Cross-fading duration between the
   * 		current animation and the new one.
   * @see {@link https://threejs.org/docs/#api/en/animation/AnimationAction|AnimationAction}
   */
  play(name = "", crossFadeDuration = 1) {
    name = name || this.#currentName;

    if (name === this.#currentName) {
      if (!this.#currentAction.isRunning()) {
        this.#currentAction.reset();
        this.#currentAction.play();
      }
    } else {
      if (!this.#actions.has(name)) {
        throw `This model does not provide animation name ${name}`;
      }

      const action = this.#actions.get(name);
      action.reset();
      action.play();

      if (this.#currentAction) {
        action.crossFadeFrom(this.#currentAction, crossFadeDuration);
      }

      this.#currentAction = action;
    }
  }

  /**
   * Stops animation.
   */
  stop() {
    if (this.#currentAction) {
      this.#currentAction.reset();
      this.#currentAction.stop();
    }
  }

  /**
   * Returns a screen-update callback that animates the model.
   * @returns {module:Screen.WebGL.ScreenUpdateCallback} Screen-update callback.
   */
  getScreenUpdateCallback() {
    return (delta) => {
      this.#mixer.update(delta * this.#speed);
    };
  }
}

export default ModelAnimation;
