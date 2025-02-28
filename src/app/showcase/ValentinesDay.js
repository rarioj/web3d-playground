import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshMatcapMaterial,
  Shape,
  SRGBColorSpace,
} from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";

/**
 * A text geometry, a heart-shaped extruded geometry, for a Valentine's Day
 *    special.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class ValentinesDay extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPosition: [0, 0, 50],
  };

  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    const text = "Happy Valentine's Day!";

    const registry = this.getRegistry();
    const scene = this.getScene();
    const group = new Group();
    scene.add(group);

    const loader = new Loader(registry);

    const matcapPath = "./public/valentines-day/matcap";
    const matcap = await loader.loadTexture(
      "pink",
      `${matcapPath}/BA5DBA_F2BEF2_E69BE6_DC8CDC-256px.webp`
    );
    matcap.colorSpace = SRGBColorSpace;
    const material = new MeshMatcapMaterial({ matcap });

    const fontPath = "./public/valentines-day/font";
    const fontSize = 2;
    const font = await loader.loadFont(
      "Courgette",
      `${fontPath}/Courgette-Regular.json`
    );

    const textGeometry = new TextGeometry(text, {
      font,
      size: fontSize,
      depth: 0.5 * fontSize,
      curveSegments: 16,
      bevelEnabled: true,
      bevelThickness: fontSize * 0.1,
      bevelSize: fontSize * 0.1,
      bevelOffset: 0,
      bevelSegments: 6,
    });
    textGeometry.center();

    const textMesh = new Mesh(textGeometry, material);
    textMesh.position.z = 2.2;
    group.add(textMesh);

    const heartShape = new Shape();
    const x = 0,
      y = 0;
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    const heartGeometry = new ExtrudeGeometry(heartShape, {
      steps: 6,
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 16,
    });
    heartGeometry.center();

    const heartMesh = new Mesh(heartGeometry, material);
    heartMesh.rotation.x = Math.PI;
    heartMesh.scale.setScalar(1.5);
    group.add(heartMesh);

    this.addScreenUpdateEvent((delta) => {
      group.rotation.y += delta;
    });

    const notification = registry.get("notification");
    notification.notice("<strong>Valentine's Day</strong>");
    notification.notice(
      "A text geometry, a heart-shaped extruded geometry, for a Valentine's Day special."
    );
    notification.notice(
      "Font — [Courgette](https://fonts.google.com/specimen/Courgette) by Karolina Lach"
    );
    notification.notice(
      "MatCap — [nidorx/matcaps](https://github.com/nidorx/matcaps)"
    );
  }
}

export default ValentinesDay;
