((query) => {
  const version = {
    threejs: "0.174.0",
    emulators: "8.3.3",
    emulatorsUi: "0.73.9",
    gsap: "3.12.7",
    rapier3d: "0.14.0",
  };

  const addImportMap = (map) => {
    const script = document.createElement("script");
    script.type = "importmap";
    script.textContent = JSON.stringify({ imports: { ...map } });
    document.currentScript.after(script);
  };

  const addScript = (src) => {
    const script = document.createElement("script");
    script.src = src;
    document.head.appendChild(script);
  };

  const map = {};
  map[
    "three"
  ] = `https://cdn.jsdelivr.net/npm/three@${version.threejs}/build/three.module.js`;
  map[
    "three/addons/"
  ] = `https://cdn.jsdelivr.net/npm/three@${version.threejs}/examples/jsm/`;

  if (query?.rapier3d) {
    map[
      "@dimforge/rapier3d"
    ] = `https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@${version.rapier3d}/rapier.es.min.js`;
  }

  addImportMap(map);

  if (query?.emulators) {
    addScript(
      `https://cdn.jsdelivr.net/npm/emulators@${version.emulators}/dist/emulators.min.js`
    );
    addScript(
      `https://cdn.jsdelivr.net/npm/emulators-ui@${version.emulatorsUi}/dist/emulators-ui.min.js`
    );
  }

  if (query?.gsap) {
    addScript(
      `https://cdn.jsdelivr.net/npm/gsap@${version.gsap}/dist/gsap.min.js`
    );
  }
})(Object.fromEntries(new URL(location).searchParams));
