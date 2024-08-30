import ProgressSlider from "./progress-slider.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        .container {
            font-family: sans-serif
        }
        .controls {
            display: flex;
            align-items: center;
        }
        .controls button {
            background: none;
            border: none;
            color: inherit;
            padding: 0;
            height: 30px;
            width: 30px;
            font-size: 1.1rem;
            cursor: pointer;
            opacity: .85;
        }
        
        .container.playing .pause-icon {
            display: none;
        }
        .container:not(.playing) .play-icon {
            display: none;
        }
  

    </style>
    <div class="container playing" >
        <progress-slider></progress-slider>
        <div class="controls">
            <button class="play-btn" onclick="handleOther()">
                <svg class="play-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
                <svg class="pause-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                </svg>
            </button>
            <button>
                <svg class="skip-end"  viewBox="0 0 24 24">
                    <path fill="currentColor" d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z" ></path>
                </svg>
                
            </button>
            <div class="duration">
                <span id="current-time">0:00</span>
                /
                <span id="total-time">10:00</span>
            </div>
        </div>
    </div>
`;

class VideoControls extends HTMLElement {
  static observedAttributes = ["data-playState"];

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
    // this.updateProgress(this.getAttribute("data-progress"));
  }
  disconnectedCallback() {
    // console.log("disconnectedCallback");
  }
  adoptedCallback() {
    // console.log("adoptedCallback");
  }
  attributeChangedCallback(name, oldVal, newVal) {
    // console.log("attributeChangedCallback", name, oldVal, newVal);

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

window.customElements.define("video-controls", VideoControls);


export default VideoControls
