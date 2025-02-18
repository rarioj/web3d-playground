import {
  Cache,
  DefaultLoadingManager,
  Object3D,
  Texture,
  TextureLoader,
} from "three";
import { Font, FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Helper class that loads textures, fonts, shaders, models, etc.
 * @memberof module:System
 */
class Loader {
  /**
   * Registry object instance.
   * @type {Map}
   */
  #registry;

  /**
   * Path to shader files.
   * @type {string}
   */
  #shaderPath;

  /**
   * Texture loader object instance.
   * @type {TextureLoader}
   */
  #textureLoader;

  /**
   * Font loader object instance.
   * @type {FontLoader}
   */
  #fontLoader;

  /**
   * glTF loader object instance.
   * @type {GLTFLoader}
   */
  #gltfLoader;

  /**
   * Instantiates a new Loader object.
   * @param {Map} [registry=new Map()] Registry object instance.
   * @param {string} [shaderPath=./src/system/shader] Path to shader files.
   */
  constructor(registry = new Map(), shaderPath = "./src/system/shader") {
    this.#registry = registry;
    this.#shaderPath = shaderPath;

    Cache.enabled = true;

    const alert = this.#registry.get("alert");
    const notification = this.#registry.get("notification");

    DefaultLoadingManager.onStart = (url, loaded, total) => {
      const basename = url.split("/").pop();
      const percent = Math.floor((loaded / total) * 100);
      alert.progress(`[${percent}%] Loading: ${basename}`, percent);
    };
    DefaultLoadingManager.onLoad = () =>
      alert.progress("[100%] Loading: Complete");
    DefaultLoadingManager.onProgress = (url, loaded, total) => {
      const basename = url.split("/").pop();
      const percent = Math.floor((loaded / total) * 100);
      alert.progress(`[${percent}%] Loading: ${basename}`, percent);
    };
    DefaultLoadingManager.onError = (url) => {
      const basename = url.split("/").pop();
      notification.error(`Loading ${basename} (${url})`);
    };
  }

  /**
   * Returns the current path to the shader files.
   * @returns {string} Current shader path.
   */
  getShaderPath() {
    return this.#shaderPath;
  }

  /**
   * Sets the path to the shader files.
   * @param {string} path New shader path.
   */
  setShaderPath(path) {
    this.#shaderPath = path;
  }

  /**
   * Loads a texture.
   * @param {string} name Texture name.
   * @param {string} url Texture location URL.
   * @returns {Promise<Texture>} Promised texture object.
   * @async
   * @see {@link https://threejs.org/docs/#api/en/loaders/TextureLoader|TextureLoader}
   */
  async loadTexture(name, url) {
    if (this.#textureLoader === undefined) {
      this.#textureLoader = new TextureLoader();
    }

    const key = `texture:${name}`;
    if (this.#registry.has(key)) {
      return this.#registry.get(key);
    }

    const texture = new Promise((resolve) => {
      this.#textureLoader.load(url, (loaded) => resolve(loaded));
    });
    this.#registry.set(key, texture);
    return texture;
  }

  /**
   * Loads multiple textures.
   * @param {Object<string, string>} urls Object with texture name (key) and
   *    texture location URL (value).
   * @returns {Promise<Object<string, Texture>>} Promised object with texture
   *    name (key) and texture object (value).
   * @async
   */
  async loadTextures(urls) {
    let textures = {};

    for (const key in urls) {
      textures[key] = await this.loadTexture(key, urls[key]);
    }

    return textures;
  }

  /**
   * Loads a font.
   * @param {string} name Font name.
   * @param {string} url Font location URL.
   * @returns {Promise<Font>} Promised font object.
   * @async
   * @see {@link https://threejs.org/docs/#examples/en/loaders/FontLoader|FontLoader}
   */
  async loadFont(name, url) {
    if (this.#fontLoader === undefined) {
      this.#fontLoader = new FontLoader();
    }

    const key = `font:${name}`;
    if (this.#registry.has(key)) {
      return this.#registry.get(key);
    }

    const font = new Promise((resolve) => {
      this.#fontLoader.load(url, (loaded) => resolve(loaded));
    });
    this.#registry.set(key, font);
    return font;
  }

  /**
   * Loads multiple fonts.
   * @param {Object<string, string>} urls Object with font name (key) and font
   *    location URL (value).
   * @returns {Promise<Object<string, Font>>} Promised object with font name
   *    (key) and font object (value).
   * @async
   */
  async loadFonts(urls) {
    let fonts = {};

    for (const key in urls) {
      fonts[key] = await this.loadFont(key, urls[key]);
    }

    return fonts;
  }

  /**
   * Loads a shader file.
   * @param {string} name Shader name.
   * @param {string} filename Shader filename.
   * @returns {Promise<string>} Promised shader file content.
   * @async
   */
  async loadShader(name, filename) {
    const key = `shader:${name}`;
    if (this.#registry.has(key)) {
      return this.#registry.get(key);
    }

    const response = await fetch(`${this.#shaderPath}/${filename}`);
    if (!response.ok || response.status !== 200) {
      throw `Failed to load shader ${this.#shaderPath}/${filename}`;
    }
    const shader = await response.text();

    this.#registry.set(key, shader);
    return shader;
  }

  /**
   * Loads multiple shader files.
   * @param {Object<string, string>} names Object with shader name (key) and
   *    shader filename (value).
   * @returns {Promise<Object<string, string>>} Promised object with shader name
   *    (key) and shader file content (value).
   * @async
   */
  async loadShaders(names) {
    let shaders = {};

    for (const key in names) {
      shaders[key] = await this.loadShader(key, names[key]);
    }

    return shaders;
  }

  /**
   * Loads a glTF model.
   * @param {string} name Model name.
   * @param {string} url Model location URL.
   * @returns {Promise<Object3D>} Promised 3D object model.
   * @async
   * @see {@link https://threejs.org/docs/#examples/en/loaders/GLTFLoader|GLTFLoader}
   * @see {@link https://threejs.org/docs/#api/en/core/Object3D|Object3D}
   */
  async loadGLTFModel(name, url) {
    if (this.#gltfLoader === undefined) {
      this.#gltfLoader = new GLTFLoader();
    }

    const key = `gltfModel:${name}`;
    if (this.#registry.has(key)) {
      return this.#registry.get(key);
    }

    const model = new Promise((resolve) => {
      this.#gltfLoader.load(url, (loaded) => resolve(loaded));
    });
    this.#registry.set(key, model);
    return model;
  }

  /**
   * Loads multiple glTF models.
   * @param {Object<string, string>} urls Object with model name (key) and model
   *    location URL (value).
   * @returns {Promise<Object<string, Object3D>>} Promised object with model
   *    name (key) and the 3D object model (value).
   * @async
   */
  async loadGLTFModels(urls) {
    let models = {};

    for (const key in urls) {
      models[key] = await this.loadGLTFModel(key, urls[key]);
    }

    return models;
  }
}

export default Loader;
