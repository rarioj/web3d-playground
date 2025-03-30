import {
  BufferGeometry,
  Material,
  Mesh,
  MeshMatcapMaterial,
  SRGBColorSpace,
} from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";

/**
 * A text geometry rendered with MatCap (Material Capture) materials. A pangram
 *    is a sentence using every letter of a given alphabet at least once.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class PangramGenerator extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFar: 1000,
    cameraPosition: [0, 0, 250],
  };

  /**
   * Collection of loaded fonts.
   * @type {Font[]}
   */
  #fonts;

  /**
   * Collection of materials.
   * @type {Material[]}
   */
  #materials;

  /**
   * Collection of pangram texts.
   * @type {string[]}
   */
  #pangrams;

  /**
   * Collection of geometries.
   * @type {BufferGeometry}
   */
  #geometry;

  /**
   * Active mesh object.
   * @type {Mesh}
   */
  #mesh;

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
    const registry = this.getRegistry();
    const loader = new Loader(registry);

    const fontPath = "./public/common/font";
    const fonts = await loader.loadFonts({
      NotoSans: `${fontPath}/NotoSans-Regular.json`,
      NotoSansDisplay: `${fontPath}/NotoSansDisplay-Regular.json`,
      NotoSansMono: `${fontPath}/NotoSansMono-Regular.json`,
      NotoSerif: `${fontPath}/NotoSerif-Regular.json`,
      NotoSerifDisplay: `${fontPath}/NotoSerifDisplay-Regular.json`,
    });
    this.#fonts = Object.values(fonts);

    const texturePath = "./public/common/texture/matcap";
    const textures = await loader.loadTextures({
      matcap01: `${texturePath}/AB2C2C_EBB4B3_561212_DE8484-256px.webp`,
      matcap02: `${texturePath}/6C52AA_C9A6EA_A681D6_B494E2-256px.webp`,
      matcap03: `${texturePath}/545B4D_D8DDC8_A0A792_B2C1A3-256px.webp`,
      matcap04: `${texturePath}/7877EE_D87FC5_75D9C7_1C78C0-256px.webp`,
      matcap05: `${texturePath}/C2AB7D_4A412E_7A6B4E_F9EDBE-256px.webp`,
    });
    textures.matcap01.colorSpace = SRGBColorSpace;
    textures.matcap02.colorSpace = SRGBColorSpace;
    textures.matcap03.colorSpace = SRGBColorSpace;
    textures.matcap04.colorSpace = SRGBColorSpace;
    textures.matcap05.colorSpace = SRGBColorSpace;

    this.#materials = [];
    Object.values(textures).forEach((matcap) => {
      this.#materials.push(new MeshMatcapMaterial({ matcap }));
    });

    this.#pangrams = [
      "English:\nThe quick brown fox jumped over the lazy dogs",
      "Czech:\nPříliš žluťoučký kůň úpěl ďábelské ódy",
      "Danish:\nHøj bly gom vandt fræk sexquiz på wc",
      "Dutch:\nPa's wijze lynx bezag vroom het fikse aquaduct",
      "Esperanto:\nEble ĉiu kvazaŭ-deca fuŝĥoraĵo ĝojigos homtipon",
      "Finnish:\nTörkylempijävongahdus",
      "French:\nPortez ce vieux whisky au juge blond qui fume",
      "German:\nVictor jagt zwölf Boxkämpfer quer über den großen Sylter Deich",
      "Icelandic:\nKæmi ný öxi hér, ykist þjófum nú bæði víl og ádrepa",
      "Indonesian:\nMuharjo seorang xenofobia universal\nyang takut pada warga jazirah, contohnya Qatar",
      "Irish:\nD'ith cat mór dubh na héisc lofa go pras",
      "Italian:\nPranzo d'acqua fa volti sghembi",
      "Norwegian:\nSær golfer med kølle vant sexquiz på wc i hjemby",
      "Romanian:\nÎncă vând gem, whisky bej și tequila roz, preț fix",
      "Serbian:\nЉубазни фењерџија чађавог лица хоће да ми покаже штос",
      "Spanish:\nBenjamín pidió una bebida de kiwi y fresa.\nNoé, sin vergüenza, la más exquisita champaña del menú",
      "Slovak:\nKŕdeľ šťastných ďatľov učí pri ústí Váhu mĺkveho koňa obhrýzať\nkôru a žrať čerstvé mäso",
      "Swedish:\nYxskaftbud, ge vår WC-zonmö IQ-hjälp",
      "Turkish:\nPijamalı hasta yağız şoföre çabucak güvendi",
      "Welsh:\nNi pharciais fy nghas gar ffabrig pinc a'm jac codi baw hud\nllawn dŵr chwerw ger tŷ Mabon ar ddydd Mawrth, ond parciais fe mewn lagŵn rhydlyd",
    ];

    this.#state = {
      size: 5,
      regenerate: () => this.generatePangram(this.#state.size),
    };
    this.generatePangram(this.#state.size);

    if (registry.has("debug.gui")) {
      this.#setupGuiControllers(
        registry.get("debug.gui").addFolder("Pangram Generator").close()
      );
    }

    this.showAppInfo();
  }

  /**
   * Regenerates the pangram.
   * @param {number} [size=5] Font size.
   */
  generatePangram(size = 5) {
    const scene = this.getScene();
    const renderer = this.getRenderer();

    if (this.#mesh) {
      scene.remove(this.#mesh);
    }

    if (this.#geometry) {
      this.#geometry.dispose();
      renderer.renderLists.dispose();
    }

    const font = this.#fonts[Math.floor(Math.random() * this.#fonts.length)];
    const pangram =
      this.#pangrams[Math.floor(Math.random() * this.#pangrams.length)];
    const material =
      this.#materials[Math.floor(Math.random() * this.#materials.length)];

    this.#geometry = new TextGeometry(pangram, {
      font,
      size,
      depth: 0.5 * size,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: Math.random() * 0.5,
      bevelSize: Math.random() * 0.5,
      bevelOffset: 0,
      bevelSegments: 6,
    });
    this.#geometry.center();

    this.#mesh = new Mesh(this.#geometry, material);
    this.#mesh.position.x = Math.random() - 0.5;
    this.#mesh.position.y = Math.random() - 0.5;
    this.#mesh.position.z = Math.random() - 0.5;
    scene.add(this.#mesh);
  }

  /**
   * Sets up the GUI controllers.
   * @param {GUI} gui GUI object instance.
   * @private
   */
  #setupGuiControllers(gui) {
    gui.add(this.#state, "size").min(5).max(20).step(1);
    gui.add(this.#state, "regenerate");
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const query = this.getRegistry().get("query");
    if (Boolean(query?.noinfo)) return;
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Pangram Generator</strong>");
    notification.notice(
      "A text geometry rendered with MatCap (Material Capture) materials. A pangram is a sentence using every letter of a given alphabet at least once."
    );
    notification.notice(
      "Fonts — [Noto: A typeface for the world](https://fonts.google.com/noto)"
    );
    notification.notice(
      "MatCaps — [nidorx/matcaps](https://github.com/nidorx/matcaps)"
    );
  }
}

export default PangramGenerator;
