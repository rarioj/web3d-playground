import {
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Texture,
} from "three";

/**
 * Texture utility methods.
 * @memberof module:System
 */
class TextureHelper {
  /**
   * Sets texture repeat pattern and wrapping mode.
   * @param {Texture} texture Texture object instance.
   * @param {number} repeatX Repeating patterns value in the X direction.
   * @param {number} repeatY Repeating patterns value in the Y direction.
   * @param {(boolean|"repeat"|"mirror")} [wrapS=false] Horizontal wrapping
   *    mode. For RepeatWrapping mode, use "repeat" or boolean true. For
   *    MirroredRepeatWrapping mode, use "mirror." ClampToEdgeWrapping is the
   *    default mode.
   * @param {(boolean|"repeat"|"mirror")} [wrapT=false] Vertical wrapping mode.
   *    For RepeatWrapping mode, use "repeat" or boolean true. For
   *    MirroredRepeatWrapping mode, use "mirror." ClampToEdgeWrapping is the
   *    default mode.
   */
  static setRepeatWrap(
    texture,
    repeatX,
    repeatY,
    wrapS = false,
    wrapT = false
  ) {
    texture.repeat.set(repeatX, repeatY);

    if (wrapS === true || wrapS === "repeat") {
      texture.wrapS = RepeatWrapping;
    } else if (wrapS === "mirror") {
      texture.wrapS = MirroredRepeatWrapping;
    } else {
      texture.wrapS = ClampToEdgeWrapping;
    }

    if (wrapT === true || wrapT === "repeat") {
      texture.wrapT = RepeatWrapping;
    } else if (wrapT === "mirror") {
      texture.wrapT = MirroredRepeatWrapping;
    } else {
      texture.wrapT = ClampToEdgeWrapping;
    }
  }
}

export default TextureHelper;
