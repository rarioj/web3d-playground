/**
 * Implementation of a simple toast, a brief, non-interactive message that
 *    appears in a user interface to provide information or feedback.
 * @memberof module:System
 */
class Alert {
  /**
   * Alert element.
   * @type {HTMLElement}
   */
  #element;

  /**
   * List of shown messages.
   * @type {string[]}
   */
  #messages;

  /**
   * Number of message(s) to show at once.
   * @type {number}
   */
  #lineCount;

  /**
   * Default background color.
   * @type {string}
   */
  #defaultColor;

  /**
   * Default message appearance duration.
   * @type {number}
   */
  #defaultDuration;

  /**
   * Most recent timeout ID.
   * @type {number}
   */
  #timeoutId;

  /**
   * Instantiates a new Alert object.
   * @param {Object} [options] Alert options.
   * @param {string} [options.id=alert-element] Alert element ID.
   * @param {string} [options.classname=alert-element] Alert element class name.
   * @param {HTMLElement} [options.container=document.body] Alert element parent
   *    container.
   * @param {number} [options.lineCount=5] Number of message(s) to show at once.
   * @param {string} [options.defaultColor=dimgray] Default background color.
   * @param {number} [options.defaultDuration=5] Default message appearance
   *    duration.
   * @param {Object} [options.styles={}] Customized element styles.
   */
  constructor(options = {}) {
    const {
      id = "alert-element",
      classname = "alert-element",
      container = document.body,
      lineCount = 5,
      defaultColor = "dimgray",
      defaultDuration = 5,
      styles = {},
    } = options;

    this.#element = document.createElement("div");
    this.#element.id = id;
    this.#element.classList.add(classname);

    if (container instanceof HTMLElement) {
      container.appendChild(this.#element);
    }

    this.#messages = [];
    this.#lineCount = parseInt(lineCount) || 5;
    this.#defaultColor = defaultColor;
    this.#defaultDuration = parseInt(defaultDuration) || 10;
    this.#timeoutId = 0;

    this.applyStyles(styles);
  }

  /**
   * Applies customized styles to the alert element.
   * @param {Object} [styles={}] Customized element styles.
   */
  applyStyles(styles = {}) {
    this.#element.style.backgroundImage = "linear-gradient(dimgray, black)";
    this.#element.style.borderRadius = "0.4em";
    this.#element.style.boxShadow = "0.4em 0.4em 0.8em black";
    this.#element.style.color = "white";
    this.#element.style.display = "none";
    this.#element.style.fontFamily = "monospace";
    this.#element.style.fontSize = "0.4em";
    this.#element.style.left = "0";
    this.#element.style.lineHeight = "1.6em";
    this.#element.style.margin = "1.6em";
    this.#element.style.opacity = "0.8";
    this.#element.style.overflow = "hidden";
    this.#element.style.padding = "1.6em";
    this.#element.style.position = "fixed";
    this.#element.style.textShadow = "0.1em 0.1em black";
    this.#element.style.top = "0";
    this.#element.style.width = "calc(100% - 6.4em)";
    this.#element.style.zIndex = "100";

    Object.assign(this.#element.style, styles);
  }

  /**
   * Returns the alert HTML element.
   * @returns {HTMLElement}
   */
  getElement() {
    return this.#element;
  }

  /**
   * Sets the number of message(s) to show at once.
   * @param {number} lineCount Number of message(s).
   */
  setLineCount(lineCount) {
    this.#lineCount = parseInt(lineCount) || 5;
  }

  /**
   * Returns the number of message(s) to show at once.
   * @returns {number}
   */
  getLineCount() {
    return this.#lineCount;
  }

  /**
   * Hides the alert.
   */
  hide() {
    this.#element.style.display = "none";
    this.#messages = [];

    clearTimeout(this.#timeoutId);
  }

  /**
   * Shows the alert.
   * @param {string} text Text message.
   * @param {Object} [options] Alert options.
   * @param {string} [options.color] Background color.
   * @param {number} [options.duration] Alert appearance duration.
   * @param {number} [options.percent=100] Background color gradient width.
   */
  show(text, options = {}) {
    const {
      color = this.#defaultColor,
      duration = this.#defaultDuration,
      percent = 100,
    } = options;

    const width = Math.min(Math.max(parseInt(percent) || 0, 0), 100);
    const timeout = (parseInt(duration) || 0) * 1000;

    if (this.#messages.length >= this.#lineCount) {
      this.#messages.shift();
    }
    this.#messages.push(
      text.replace(
        /\[([^\[]+)\](\(([^)]*))\)/gim,
        `<a href="$3" target="_blank" style="color: inherit;">$1</a>`
      )
    );

    this.#element.innerHTML = this.#messages.join("<br />");
    this.#element.style.backgroundImage = `linear-gradient(90deg, ${color}, ${width}%, black)`;
    this.#element.style.display = "block";
    this.#element.style.opacity = "0.8";

    clearTimeout(this.#timeoutId);
    if (timeout > 0) {
      this.#timeoutId = setTimeout(() => this.hide(), timeout);
    }
  }

  /**
   * Shows an informational alert.
   * @param {string} text Text message.
   */
  info(text) {
    this.show(text, { color: "navy" });
  }

  /**
   * Shows a notification alert.
   * @param {string} text Text message.
   */
  notice(text) {
    this.show(text, { color: "darkgreen", percent: 75 });
  }

  /**
   * Shows an error alert.
   * @param {string} text Text message.
   */
  error(text) {
    this.show(`<strong>Error: ${text}</strong>`, {
      color: "crimson",
      duration: 0,
    });
  }

  /**
   * Shows a progress alert indicated by the background color width.
   * @param {string} text Text message.
   * @param {number} [percent=100] Background color gradient width.
   */
  progress(text, percent = 100) {
    this.show(text, { color: "indigo", percent });
  }
}

export default Alert;
