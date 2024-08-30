const template = document.createElement("template");
template.innerHTML = `
    <style>
        .progress-container {
            position: relative;
            width: calc(100% - 10px);
            height: 20px;
            background-color: #3b3b3b;
            margin-left: 5px;
            // pointer-events: none;
        }

        .progress-fill {
            width: 0%;
            height: 100%;
            background-color: orchid;
        }

        .progress-thumb {
            width: 10px;
            height: 50%;
            background-color: green;
            position: absolute;
            left: 0%;
            bottom: 0;
            opacity: 0.7;
            transform: translateY(-50%) translateX(-50%);
        }
    </style>
    <div class="progress-container" >
        <div class="progress-fill"  ></div>
        <div class="progress-thumb" ></div>
    </div>
`;

class ProgressSlider extends HTMLElement {
  static observedAttributes = ["data-progress"];

  constructor() {
    super();
    this.state = { progress: 0 };
    this.handleProgress = undefined;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  /****************************************************
   * Lifecycle callbacks
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
   ****************************************************/
  connectedCallback() {
    this.setElements();
    this.updateProgress(this.getAttribute("data-progress"));
  }
  disconnectedCallback() {
    // console.log("disconnectedCallback");
  }
  adoptedCallback() {
    // console.log("adoptedCallback");
  }
  attributeChangedCallback(name, oldVal, newVal) {
    // console.log("attributeChangedCallback", name, oldVal, newVal);
    if (name === "data-progress" && oldVal !== newVal) {
      this.updateProgress(newVal);
    }
  }

  /****************************************************
   * Custom funtionality
   ****************************************************/

  setElements() {
    this.progressContainer = this.shadowRoot.querySelector(
      ".progress-container"
    );
    this.fillEl = this.shadowRoot.querySelector(".progress-fill");
    this.thumbEl = this.shadowRoot.querySelector(".progress-thumb");

    this.progressContainer.addEventListener("mousedown", (e) =>
      this.handleClick(e)
    );
    // drag can cause conflict with scrubbing
    this.progressContainer.addEventListener("dragstart", (e) => {
      e.preventDefault(e);
      return false;
    });
  }

  updateStyles(progressPercent) {
    // if (progressPercent > 1) {
    //   progressPercent = Math.min(progressPercent / 100, 1);
    // }
    progressPercent = Math.min(progressPercent, 1);

    this.fillEl.style.width = `${progressPercent * 100}%`;
    this.thumbEl.style.left = `${progressPercent * 100}%`;
  }

  getMousePercent(event) {
    const rect = this.progressContainer.getBoundingClientRect();
    return Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;
  }

  updateProgress(progressPercent) {
    if (typeof progressPercent === "string") {
      progressPercent = parseFloat(progressPercent);
    }
    if (typeof progressPercent === "number") {
      this.setState({ progress: progressPercent });
      this.updateStyles(progressPercent);
      if (this.handleProgress) {
        this.handleProgress(progressPercent);
      }
    }
  }

  handleClick(event) {
    const percent = this.getMousePercent(event);

    this.updateProgress(percent);

    const that = this;
    function handleMove(event) {
      if ((event.buttons & 1) === 1) {
        const percent = that.getMousePercent(event);
        that.updateProgress(percent);
      } else {
        removeListeners();
      }
    }

    function removeListeners() {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", removeListeners);
    }

    document.addEventListener("mouseup", removeListeners);
    document.addEventListener("mousemove", handleMove);
  }

  /****************************************************
   * State Management
   ****************************************************/
  setState(newState) {
    for (const [key, value] of Object.entries(newState)) {
      if (this.state[key] !== value) {
        this.dispatchEvent(
          new CustomEvent(key, {
            detail: { oldValue: this.state[key], newValue: value },
          })
        );
        this.state[key] = value;
        this.dataset[key] = value;
      }
    }
  }

  getState() {
    return this.state;
  }
}

window.customElements.define("progress-slider", ProgressSlider);
export default ProgressSlider;
