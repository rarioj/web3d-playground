import { Mesh } from "three";

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

  /**
   * Gets all child meshes from a given model.
   * @param {Object} model 3D object model.
   * @returns {Mesh[]} Array of mesh objects.
   */
  static getMeshes(model) {
    const meshes = [];
    model.scene.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });
    return meshes;
  }
}

export default ModelHelper;
