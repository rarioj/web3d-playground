import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  FrontSide,
  Material,
  SRGBColorSpace,
  VideoTexture,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";

/**
 * A glTF model of an old computer. It's a functioning computer, too. What can
 *    be rendered on the monitor screen?
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class OldComputer extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPerspectiveFar: 100,
    cameraPosition: [25, 10, 75],
    controlsOrbitParameters: {
      enableDamping: true,
      maxDistance: 75,
      maxPolarAngle: Math.PI * 0.5 - 0.1,
      minDistance: 25,
    },
  };

  /**
   * Computer monitor screen.
   * @type {Material}
   */
  #screen;

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
    const scene = this.getScene();
    const registry = this.getRegistry();
    const loader = new Loader(registry);
    const path = "./public/old-computer";

    const background = await loader.loadRGBETexture(
      "background",
      `${path}/hdr/aerodynamics_workshop_2k.hdr`
    );
    background.mapping = EquirectangularReflectionMapping;
    scene.background = background;
    scene.environment = background;
    scene.backgroundBlurriness = 0.075;
    scene.backgroundIntensity = 0.3;

    const computer = await loader.loadGLTFModel(
      "computer",
      `${path}/gltf/ibm_3178.glb`
    );
    computer.scene.position.y = -13;
    scene.add(computer.scene);

    const monitorScreen = computer.scene.getObjectByName("ibm_3178_2");
    monitorScreen.material.color = null;
    monitorScreen.material.side = FrontSide;
    monitorScreen.material.toneMapped = false;
    monitorScreen.material.roughness = 0.25;
    monitorScreen.material.emissive = null;
    monitorScreen.material.emissiveMap = null;
    this.#screen = monitorScreen.material;

    emulators.pathPrefix = "https://cdn.jsdelivr.net/npm/emulators@8.3.3/dist/";
    const gameCanvas = document.createElement("canvas");
    gameCanvas.width = 320;
    gameCanvas.height = 200;
    const gameContext = gameCanvas.getContext("2d");
    const gameTexture = new CanvasTexture(gameCanvas);

    const videoElement = this.createVideo();
    const videoTexture = new VideoTexture(videoElement);
    videoTexture.colorSpace = SRGBColorSpace;

    this.#state = {
      loader,
      imageTexture: null,
      gameInterface: null,
      gameContext,
      gameTexture,
      videoElement,
      videoTexture,
    };

    monitorScreen.material.map.dispose();

    if (registry.has("debug.gui")) {
      this.#setupGuiControllers(
        registry.get("debug.gui").addFolder("Old Computer").close()
      );
    }

    this.showAppInfo();
  }

  /**
   * Resets the screen state.
   */
  resetScreen() {
    if (this.#state.imageTexture) {
      this.#state.imageTexture.dispose();
    }
    if (this.#state.gameInterface) {
      this.#state.gameInterface.pause();
    }
    this.#state.videoElement.pause();
    this.#state.videoElement.load();
  }

  /**
   * Shows a random image on the computer.
   */
  async showRandomImage() {
    this.resetScreen();

    const index = Math.floor(Math.random() * 20 + 10);
    const texture = await this.#state.loader.loadTexture(
      `random:${index}`,
      `https://picsum.photos/id/${index}/320/200`
    );

    texture.colorSpace = SRGBColorSpace;
    this.#state.imageTexture = texture;
    this.#screen.map = texture;
  }

  /**
   * Initializes the game.
   */
  initGame() {}

  /**
   * Plays a game on the computer.
   * @async
   */
  async playGame() {
    this.resetScreen();

    this.#screen.map = this.#state.gameTexture;

    if (!this.#state.gameInterface) {
      const bundle = await emulatorsUi.network.resolveBundle(
        "./public/old-computer/jsdos/prince_of_persia_1989.jsdos"
      );

      const game = emulators.dosWorker(bundle);
      game.then((ci) => {
        emulatorsUi.sound.audioNode(ci);

        this.#state.gameInterface = ci;

        const rgba = new Uint8ClampedArray(320 * 200 * 4);

        ci.events().onFrame((rgb) => {
          for (let next = 0; next < 320 * 200; ++next) {
            rgba[next * 4 + 0] = rgb[next * 3 + 0];
            rgba[next * 4 + 1] = rgb[next * 3 + 1];
            rgba[next * 4 + 2] = rgb[next * 3 + 2];
            rgba[next * 4 + 3] = 255;
          }

          this.#state.gameContext.putImageData(
            new ImageData(rgba, 320, 200),
            0,
            0
          );
          this.#state.gameTexture.needsUpdate = true;
        });

        window.addEventListener("keydown", (e) => {
          const keyCode = emulatorsUi.controls.domToKeyCode(e.keyCode);
          ci.sendKeyEvent(keyCode, true);
        });

        window.addEventListener("keyup", (e) => {
          const keyCode = emulatorsUi.controls.domToKeyCode(e.keyCode);
          ci.sendKeyEvent(keyCode, false);
        });
      });
    } else {
      this.#state.gameInterface.resume();
    }
  }

  /**
   * Creates a video player element.
   * @returns {HTMLVideoElement} Video player HTML element.
   */
  createVideo() {
    const video = document.createElement("video");
    video.width = "320";
    video.loop = true;
    video.playsInline = true;
    video.style.display = "none";

    const sourceWebM = document.createElement("source");
    sourceWebM.type = "video/webm";
    sourceWebM.src =
      "./public/old-computer/video/rick-rolled-short-version.webm";
    video.appendChild(sourceWebM);

    const sourceMp4 = document.createElement("source");
    sourceMp4.type = "video/mp4";
    sourceMp4.src = "./public/old-computer/video/rick-rolled-short-version.mp4";
    video.appendChild(sourceMp4);

    document.body.appendChild(video);

    return video;
  }

  /**
   * Plays a video on the computer.
   */
  async playVideo() {
    this.resetScreen();

    this.#screen.map = this.#state.videoTexture;
    this.#state.videoElement.play();
  }

  /**
   * Sets up the GUI controllers.
   * @param {GUI} gui GUI object instance.
   * @private
   */
  #setupGuiControllers(gui) {
    const operations = {
      image: async () => this.showRandomImage(),
      game: async () => this.playGame(),
      video: async () => this.playVideo(),
    };

    gui.add(operations, "image").name("Show Random Image");
    gui.add(operations, "game").name("Play Game");
    gui.add(operations, "video").name("Play Video");
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const query = this.getRegistry().get("query");
    if (Boolean(query?.noinfo)) return;
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Old Computer</strong>");
    notification.notice(
      "A glTF model of an old computer. It's a functioning computer, too. What can be rendered on the monitor screen?"
    );
    notification.notice(
      "Textures — [Aerodynamics Workshop](https://polyhaven.com/a/aerodynamics_workshop)"
    );
    notification.notice("3D Model — [IBM 3178](https://skfb.ly/6XWzr)");
    notification.notice(
      "Random Images — [Lorem Picsum](https://picsum.photos/)"
    );
    notification.notice(
      "Game — [Prince of Persia (1989)](https://dos.zone/prince-of-persia-1990/)"
    );
    notification.notice(
      "Video — [Rick Rolled (Short Version)](https://www.youtube.com/watch?v=BBJa32lCaaY)"
    );
  }
}

export default OldComputer;
