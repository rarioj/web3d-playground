import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";

/**
 * A simple 3D cube with basic color material on each side.
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class RotatingBox extends WebGLPerspectiveOrbit {
  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    const scene = this.getScene();

    const box = new Mesh(new BoxGeometry(), [
      new MeshBasicMaterial({ color: 0xff0000 }),
      new MeshBasicMaterial({ color: 0x00ff00 }),
      new MeshBasicMaterial({ color: 0x0000ff }),
      new MeshBasicMaterial({ color: 0xffff00 }),
      new MeshBasicMaterial({ color: 0xff00ff }),
      new MeshBasicMaterial({ color: 0x00ffff }),
    ]);

    scene.add(box);

    this.addScreenUpdateEvent((delta) => {
      box.rotation.x += delta;
      box.rotation.y += delta;
      box.rotation.z += delta;
    });

    const registry = this.getRegistry();
    const notification = registry.get("notification");
    notification.notice("<strong>Rotating Box</strong>");
    notification.notice(
      "A simple 3D cube with basic color material on each side."
    );
  }
}

export default RotatingBox;
