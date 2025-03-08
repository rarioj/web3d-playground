import {
  AmbientLight,
  AudioListener,
  Box3,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  FrontSide,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  PositionalAudio,
  RingGeometry,
  SRGBColorSpace,
  Vector3,
  VideoTexture,
  VSMShadowMap,
} from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import RAPIER from "@dimforge/rapier3d";
import WebGLPerspectiveOrbit from "../../screen/webgl/WebGLPerspectiveOrbit.js";
import Loader from "../../system/utility/Loader.js";
import ModelHelper from "../../system/utility/ModelHelper.js";

/**
 * A tour of a simple apartment room. Demonstrates switching between Orbit and
 *    PointerLock controls. Uses the Rapier 3D physics engine for wall collision
 *    detection. PositionalAudio for spatial sound experience. Reflection on
 *    bathroom mirrors. [Desktop only]
 * @memberof module:App
 * @extends module:Screen.WebGLPerspectiveOrbit
 */
class ApartmentRoom extends WebGLPerspectiveOrbit {
  /**
   * App options override.
   * @type {Object}
   * @static
   */
  static options = {
    cameraPerspectiveFov: 45,
    cameraPosition: [0, 10, 0],
    controlsOrbitParameters: {
      enableDamping: true,
      enablePan: true,
      maxDistance: 15,
      maxPolarAngle: Math.PI * 0.5 - 0.1,
      minDistance: 7.5,
    },
  };

  /**
   * Physics handler.
   * @type {RAPIER.World}
   */
  #physics;

  /**
   * Prepares the app.
   * @async
   */
  async prepare() {
    const renderer = this.getRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;

    const path = "./public/apartment-room";
    const scene = this.getScene();
    const camera = this.getCamera();
    const registry = this.getRegistry();
    const loader = new Loader(registry);
    const defaultControls = this.getControls();
    defaultControls.target.y = 0.1;

    const platformGeometry = new RingGeometry(0, 128, 64, 100);
    const platformMaterial = new MeshStandardMaterial({ color: "black" });
    const platform = new Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = Math.PI * -0.5;
    platform.position.y = -1.5;
    platform.receiveShadow = true;
    scene.add(platform);

    const ambientLight = new AmbientLight(0xcccccc, 1);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 16;
    directionalLight.shadow.mapSize.height = 16;
    directionalLight.shadow.camera.top = 16;
    directionalLight.shadow.camera.right = 16;
    directionalLight.shadow.camera.bottom = -16;
    directionalLight.shadow.camera.left = -16;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 32;
    scene.add(directionalLight);

    const pointLight = new PointLight(0xccffff, 15);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 16;
    pointLight.shadow.mapSize.height = 16;
    pointLight.shadow.camera.far = 16;
    pointLight.position.set(0.1, 1, -1.3);
    scene.add(pointLight);

    await RAPIER.init();
    this.#physics = new RAPIER.World(new Vector3(0, 0, 0));

    const models = await loader.loadGLTFModels({
      drone: `${path}/gltf/happy_drone.glb`,
      plan: `${path}/gltf/apartment_plan.glb`,
    });

    const drone = models.drone.scene;
    drone.castShadow = true;
    drone.scale.set(0.8, 0.8, 0.8);
    const droneColliderDesc = RAPIER.ColliderDesc.ball(0.05);
    const droneBodyDesc = new RAPIER.RigidBodyDesc(
      RAPIER.RigidBodyType.KinematicPositionBased
    );
    droneBodyDesc.setTranslation(...drone.position, true);
    droneBodyDesc.setCcdEnabled(true);
    const droneBody = this.#physics.createRigidBody(droneBodyDesc);
    const droneCollider = this.#physics.createCollider(
      droneColliderDesc,
      droneBody
    );
    const droneController = this.#physics.createCharacterController(0.25);
    scene.add(drone);

    const plan = models.plan.scene;
    const planBox3 = new Box3().setFromObject(plan);
    const planCenter = planBox3.getCenter(new Vector3());
    plan.position.set(-planCenter.x, -planCenter.y, -planCenter.z);
    ModelHelper.setShadow(models.plan);
    plan.updateMatrixWorld(true);
    scene.add(plan);

    const wall = plan.getObjectByName("Object_5");
    this.applyCollider(wall, {
      scale: { x: 1.064, y: 1.064, z: 1.064 },
      translate: { x: 0, y: -1.4, z: -0.41 },
    });

    const mirrorGeometry = new PlaneGeometry(1.32, 0.93, 32, 32);

    const reflector1 = new Reflector(mirrorGeometry, {
      clipBias: 0.003,
      textureWidth: this.getWidth() * window.devicePixelRatio,
      textureHeight: this.getHeight() * window.devicePixelRatio,
      color: 0xcccccc,
    });
    reflector1.rotation.y = Math.PI;
    reflector1.position.set(-3.31, 0.09, 1.567);
    scene.add(reflector1);

    const reflector2 = new Reflector(mirrorGeometry, {
      clipBias: 0.003,
      textureWidth: this.getWidth() * window.devicePixelRatio,
      textureHeight: this.getHeight() * window.devicePixelRatio,
      color: 0xcccccc,
    });
    reflector2.position.set(2.67, 0.09, 2);
    scene.add(reflector2);

    const qrcode = await loader.loadTexture(
      "qrcode",
      `${path}/image/qrcode.webp`
    );
    qrcode.flipY = false;
    const painting = plan.getObjectByName("Object_81");
    painting.material.map = qrcode;

    const television = plan.getObjectByName("Object_66");
    television.material.color = null;
    television.material.side = FrontSide;
    television.material.toneMapped = false;
    television.material.roughness = 0.8;
    television.material.emissive = null;
    television.material.emissiveMap = null;

    const pointerControls = new PointerLockControls(camera, this.getCanvas());
    pointerControls.addEventListener("lock", () => {
      this.disableOrbitControls();
      gsap.to(camera.position, {
        duration: 1,
        x: drone.position.x,
        y: drone.position.y,
        z: drone.position.z,
      });
    });
    pointerControls.addEventListener("unlock", () => {
      this.enableOrbitControls();
      gsap.to(camera.position, { duration: 1, x: 0, y: 10, z: 0 });
      gsap.to(defaultControls.target, { duration: 1, x: 0, y: 0, z: 0 });
    });

    const direction = new Vector3();
    const moveSpeed = 2.5;

    let videoIsPlaying = false;

    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "Enter":
          if (!videoIsPlaying) {
            videoIsPlaying = true;
            this.playVideo(television);
          }
          if (!pointerControls.isLocked) {
            pointerControls.lock();
          }
          break;
        case "KeyW":
          direction.z = 1;
          break;
        case "KeyS":
          direction.z = -1;
          break;
        case "KeyA":
          direction.x = 1;
          break;
        case "KeyD":
          direction.x = -1;
          break;
      }
    });
    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyW":
        case "KeyS":
          direction.z = 0;
          break;
        case "KeyA":
        case "KeyD":
          direction.x = 0;
          break;
      }
    });

    // scene.add(this.getCollisionDetectionLines());

    this.addScreenUpdateEvent((delta) => {
      if (pointerControls.enabled && pointerControls.isLocked) {
        const cameraDirection = new Vector3();
        const droneDirection = new Vector3();
        pointerControls.getDirection(cameraDirection);
        pointerControls.getDirection(droneDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        droneDirection.normalize();

        const movement = new Vector3();
        movement.x =
          (cameraDirection.x * direction.z + cameraDirection.z * direction.x) *
          moveSpeed *
          delta;
        movement.z =
          (cameraDirection.z * direction.z - cameraDirection.x * direction.x) *
          moveSpeed *
          delta;

        this.#physics.timestep = delta;
        this.#physics.step();

        droneController.computeColliderMovement(droneCollider, movement);
        const displacement = droneController.computedMovement();
        const newPosition = droneBody.translation();
        newPosition.x += displacement.x;
        newPosition.z += displacement.z;
        droneBody.setNextKinematicTranslation(newPosition);
        droneBody.setNextKinematicRotation(camera.quaternion);

        camera.position.x = drone.position.x = newPosition.x;
        camera.position.z = drone.position.z = newPosition.z;
        drone.lookAt(drone.position.clone().add(droneDirection));
      }
    });

    this.showAppInfo();
  }

  /**
   * Applies collision detection to a mesh object.
   * @param {Mesh} mesh Mesh object.
   * @param {Object} [transform={}] Transformation data.
   */
  applyCollider(mesh, transform = {}) {
    const { scale = { x: 1, y: 1, z: 1 }, translate = { x: 0, y: 0, z: 0 } } =
      transform;
    const copy = mesh.geometry.clone();
    copy.scale(scale.x, scale.y, scale.z);
    const meshVertices = new Float32Array(copy.attributes.position.array);
    const meshIndices = new Uint32Array(copy.index.array);

    const meshColliderDesc = RAPIER.ColliderDesc.trimesh(
      meshVertices,
      meshIndices
    ).setTranslation(translate.x, translate.y, translate.z);
    const meshBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed);
    const meshBody = this.#physics.createRigidBody(meshBodyDesc);

    this.#physics.createCollider(meshColliderDesc, meshBody);
  }

  /**
   * Returns collision detection lines (for debugging purposes).
   * @returns {LineSegments} Collision detection line segments.
   */
  getCollisionDetectionLines() {
    const { vertices, colors } = this.#physics.debugRender();

    const lines = new LineSegments(
      new BufferGeometry(),
      new LineBasicMaterial({ color: 0xffffff, vertexColors: true })
    );

    lines.frustumCulled = false;
    lines.geometry.setAttribute("position", new BufferAttribute(vertices, 3));
    lines.geometry.setAttribute("color", new BufferAttribute(colors, 4));

    return lines;
  }

  /**
   * Plays a video on a television.
   * @param {Mesh} television Television screen.
   */
  playVideo(television) {
    const video = document.createElement("video");
    video.width = "320";
    video.loop = true;
    video.playsInline = true;
    video.style.display = "none";

    const sourceMp4 = document.createElement("source");
    sourceMp4.type = "video/mp4";
    sourceMp4.src = "./public/apartment-room/video/walle-intro.mp4";
    video.appendChild(sourceMp4);

    document.body.appendChild(video);

    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;
    television.material.map = texture;

    video.play();

    const listener = new AudioListener();
    this.getCamera().add(listener);
    const positionalAudio = new PositionalAudio(listener);
    positionalAudio.setMediaElementSource(video);
    positionalAudio.setRefDistance(1);
    positionalAudio.setDirectionalCone(180, 230, 0.1);
    television.add(positionalAudio);
  }

  /**
   * Shows the app information.
   */
  showAppInfo() {
    const notification = this.getRegistry().get("notification");
    notification.notice("<strong>Apartment Room</strong>");
    notification.notice(
      "A tour of a simple apartment room. Demonstrates switching between Orbit and PointerLock controls. Uses the Rapier 3D physics engine for wall collision detection. PositionalAudio for spatial sound experience. Reflection on bathroom mirrors. [Desktop only]"
    );
    notification.notice(
      "3D Model — [Apartment plan](https://skfb.ly/oPnHH) | [Happy Drone](https://skfb.ly/ozI6J)"
    );
    notification.notice(
      "Video — [WALL-E Intro](https://www.youtube.com/watch?v=nLx_7wEmwms)"
    );
  }
}

export default ApartmentRoom;
