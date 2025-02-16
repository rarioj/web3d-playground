import defaults from "./defaults.js";
import systemInit from "./system/module.js";
import appList from "./app/module.js";

(async () => {
  const registry = systemInit(defaults);
  const notification = registry.get("notification");

  try {
    const { app = 0, expose = 0 } = registry.get("query");

    if (!appList[app]) {
      throw `App index '${app}' is not implemented`;
    }
    registry.set("app.index", app);

    const options = Object.assign(
      {},
      defaults?.options || {},
      appList[app]?.options || {}
    );
    registry.set("app.options", options);

    const classname = appList[app];
    registry.set("app.classname", classname);

    const instance = new classname({ registry, ...options });
    document.title = `Web3D Playground ▶ Apps ▶ ${instance.constructor.name}`;
    registry.set("app.instance", instance);

    if (Boolean(expose) === true) {
      window._registry = registry;
    }

    await instance.start();
  } catch (thrown) {
    console.error(thrown);
    notification.error(thrown);
  }
})();
