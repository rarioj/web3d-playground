(() => {
  const version = {
    threejs: "0.174.0",
    emulators: "8.3.3",
    emulatorsUi: "0.73.9",
    gsap: "3.12.7",
    rapier3d: "0.14.0",
  };

  const query = Object.fromEntries(new URL(location).searchParams);

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

  const importmap = document.createElement("script");
  importmap.type = "importmap";
  importmap.textContent = JSON.stringify({ imports: { ...map } });
  document.currentScript.after(importmap);

  if (query?.emulators) {
    const emulatorsScript = document.createElement("script");
    emulatorsScript.src = `https://cdn.jsdelivr.net/npm/emulators@${version.emulators}/dist/emulators.min.js`;
    document.head.appendChild(emulatorsScript);

    const emulatorsUiScript = document.createElement("script");
    emulatorsUiScript.src = `https://cdn.jsdelivr.net/npm/emulators-ui@${version.emulatorsUi}/dist/emulators-ui.min.js`;
    document.head.appendChild(emulatorsUiScript);
  }

  if (query?.gsap) {
    const gsapScript = document.createElement("script");
    gsapScript.src = `https://cdn.jsdelivr.net/npm/gsap@${version.gsap}/dist/gsap.min.js`;
    document.head.appendChild(gsapScript);
  }
})();
