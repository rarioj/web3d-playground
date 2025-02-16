import {
  BufferGeometry,
  CapsuleGeometry,
  Mesh,
  MeshMatcapMaterial,
  OctahedronGeometry,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TorusKnotGeometry,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";

/**
 * Thousands of random geometries are rendered with random MatCap materials
 *    animated using the simple trigonometric formula.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class MeshParticles extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFar: 5000,
    cameraPosition: [300, 400, 500],
  };

  /**
   * Collection of geometries.
   * @type {BufferGeometry[]}
   */
  #geometries;

  /**
   * Collection of materials.
   * @type {MeshMatcapMaterial[]}
   */
  #materials;

  /**
   * Collection of mesh particles.
   * @type {Mesh[]}
   */
  #meshes;

  /**
   * Current screen-update callback ID.
   * @type {number}
   */
  #updateIndex;

  /**
   * Object instance current state.
   * @type {Object}
   */
  #state;

  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    this.#geometries = [];
    this.#materials = [];
    this.#meshes = [];
    this.#updateIndex = 0;

    this.#geometries.push(new CapsuleGeometry(1, 2, 8, 32));
    this.#geometries.push(new OctahedronGeometry(1, 1));
    this.#geometries.push(new SphereGeometry(1, 24, 16));
    this.#geometries.push(new TorusGeometry(2, 0.5, 16, 16));
    this.#geometries.push(new TorusKnotGeometry(1, 0.1, 64, 6, 1, 4));

    const loader = new Loader(this.getRegistry());

    const path = "./public/common/texture/matcap";
    const textures = await loader.loadTextures({
      matcap01: `${path}/AB2C2C_EBB4B3_561212_DE8484-256px.webp`,
      matcap02: `${path}/6C52AA_C9A6EA_A681D6_B494E2-256px.webp`,
      matcap03: `${path}/545B4D_D8DDC8_A0A792_B2C1A3-256px.webp`,
      matcap04: `${path}/7877EE_D87FC5_75D9C7_1C78C0-256px.webp`,
      matcap05: `${path}/C2AB7D_4A412E_7A6B4E_F9EDBE-256px.webp`,
    });

    textures.matcap01.colorSpace = SRGBColorSpace;
    textures.matcap02.colorSpace = SRGBColorSpace;
    textures.matcap03.colorSpace = SRGBColorSpace;
    textures.matcap04.colorSpace = SRGBColorSpace;
    textures.matcap05.colorSpace = SRGBColorSpace;

    Object.values(textures).forEach((matcap) => {
      const material = new MeshMatcapMaterial({ matcap });
      this.#materials.push(material);
    });

    this.#state = {
      count: 5000,
      distance: 5,
      speed: 0.1,
      minReach: 0,
      maxReach: 25,
      doubleSide: false,
      regenerate: () =>
        this.generateMeshParticles(this.#state, this.getElapsedTime()),
    };
    this.generateMeshParticles(this.#state);

    const registry = this.getRegistry();
    if (registry.has("debug.gui")) {
      this.#setupGuiControllers(
        registry.get("debug.gui").addFolder("Mesh Particles").close()
      );
    }

    const notification = registry.get("notification");
    notification.notice("<strong>Mesh Particles</strong>");
    notification.notice(
      "Thousands of random geometries are rendered with random MatCap materials animated using the simple trigonometric formula."
    );
    notification.notice(
      "MatCaps — [nidorx/matcaps](https://github.com/nidorx/matcaps)"
    );
  }

  /**
   * Regenerates the mesh particles.
   * @param {Object} [options] Mesh particle options.
   * @param {number} [options.count=5000] Number of particles.
   * @param {number} [options.distance=5] Maximum distance between individual
   *    particles.
   * @param {number} [options.speed=0.1] Particle movement speed.
   * @param {number} [options.minReach=0] Particles minimum reach.
   * @param {number} [options.maxReach=25] Particles maximum reach.
   * @param {boolean} [options.doubleSide=false] Whether to spread particles on
   *    two opposite sides.
   * @param {number} [restartTime=0] Previous elapsed time the particles were
   *    generated.
   */
  generateMeshParticles(options = {}, restartTime = 0) {
    const {
      count = 5000,
      distance = 5,
      speed = 0.1,
      minReach = 0,
      maxReach = 25,
      doubleSide = false,
    } = options;

    const scene = this.getScene();

    if (this.#meshes.length > 0) {
      this.#meshes.forEach(({ mesh }) => scene.remove(mesh));
      this.removeScreenUpdateEvent(this.#updateIndex);
      this.#meshes = [];
    }

    const start = doubleSide ? count * -0.5 : 0;
    const end = doubleSide ? count * 0.5 : count;

    for (let i = start; i < end; i++) {
      const angle = Math.random() * Math.PI * 2;
      const multiplier =
        (i > 0 ? distance : -distance) * (minReach + Math.random() * maxReach);
      const positionX = Math.sin(angle) * multiplier;
      const positionY = Math.cos(angle) * multiplier;
      const positionZ = Math.atan(angle) * multiplier;

      const mesh = new Mesh(
        this.#geometries[Math.floor(Math.random() * this.#geometries.length)],
        this.#materials[Math.floor(Math.random() * this.#materials.length)]
      );
      mesh.position.set(positionX, positionY, positionZ);
      mesh.scale.setScalar(Math.random() * 2);
      scene.add(mesh);

      this.#meshes.push({ mesh, angle, multiplier });
    }

    this.#updateIndex = this.addScreenUpdateEvent((delta, elapsed) => {
      this.#meshes.forEach(({ mesh, angle, multiplier }) => {
        const coefficient = (elapsed - restartTime) * angle * speed;
        mesh.position.x = Math.cos(coefficient) * multiplier;
        mesh.position.y = Math.sin(coefficient) * multiplier;
        mesh.position.z = Math.atan(coefficient) * multiplier;
        mesh.rotation.x += delta;
        mesh.rotation.y += delta;
        mesh.rotation.z += delta;
      });
    });
  }

  /**
   * Sets up the GUI controllers.
   * @param {GUI} gui GUI object instance.
   * @private
   */
  #setupGuiControllers(gui) {
    gui.add(this.#state, "count").min(1000).max(15000).step(1000);
    gui.add(this.#state, "distance").min(5).max(20).step(1);
    gui.add(this.#state, "speed").min(0.01).max(0.5).step(0.01);
    gui.add(this.#state, "minReach").min(0).max(25).step(1);
    gui.add(this.#state, "maxReach").min(10).max(50).step(1);
    gui.add(this.#state, "doubleSide");
    gui.add(this.#state, "regenerate");
  }
}

export default MeshParticles;
