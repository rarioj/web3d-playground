import Alert from "./element/Alert.js";
import DebugGUI from "./element/DebugGUI.js";
import DebugStats from "./element/DebugStats.js";

/**
 * @module System
 */

export default (config = {}) => {
  const registry = new Map();

  const query = Object.assign(
    {},
    config?.query,
    Object.fromEntries(new URL(location).searchParams)
  );
  registry.set("query", query);

  registry.set("system", config?.system || {});

  const alert = (() => {
    const {
      alertId: id = "alert-element",
      alertClassname: classname = "alert-element",
      alertContainer: container = document.body,
      alertLineCount: lineCount = 1,
      alertDefaultColor: defaultColor = "dimgray",
      alertDefaultDuration: defaultDuration = 5,
      alertStyles: styles = {},
    } = config?.system;

    return new Alert({
      id,
      classname,
      container,
      lineCount,
      defaultColor,
      defaultDuration,
      styles,
    });
  })();
  registry.set("alert", alert);

  const notification = (() => {
    const {
      notificationId: id = "notification-element",
      notificationClassname: classname = "notification-element",
      notificationContainer: container = document.body,
      notificationLineCount: lineCount = 10,
      notificationDefaultColor: defaultColor = "dimgray",
      notificationDefaultDuration: defaultDuration = 10,
      notificationStyles: styles = {
        bottom: "0",
        fontFamily: "sans-serif",
        fontSize: "0.8em",
        top: "unset",
      },
    } = config?.system;

    return new Alert({
      id,
      classname,
      container,
      lineCount,
      defaultColor,
      defaultDuration,
      styles,
    });
  })();
  registry.set("notification", notification);

  const { gui = 0, stats = 0 } = query;

  if (Boolean(gui) === true) {
    const debugGui = new DebugGUI(
      config?.system?.debugGuiOptions || { title: "GUI Tweak", width: 250 }
    );
    registry.set("debug.gui", debugGui.getInstance());
  }

  if (Boolean(stats) === true) {
    const debugStats = new DebugStats(
      config?.system?.debugStatsContainer || document.body
    );
    registry.set("debug.stats", debugStats.getInstance());
  }

  return registry;
};
