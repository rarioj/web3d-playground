/**
 * Model utility methods.
 * @memberof module:System
 */
class ModelHelper {
  /**
   * Sets (or unsets) shadows from and to the model.
   * @param {Object} model 3D object model.
   * @param {boolean} [cast=true] Whether the material casts shadows.
   * @param {boolean} [receive=true] Whether the material receives shadows.
   */
  static setShadow(model, cast = true, receive = true) {
    model.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = cast;
        child.receiveShadow = receive;
      }
    });
  }
}

export default ModelHelper;
