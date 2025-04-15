// import "./vis-timeline-graph2d.min.js";
import * as vis from "./vis-timeline-graph2d.esm.js"

const template = document.createElement("template");
template.innerHTML = `

<link href="./vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
<style type="text/css">
    :host {
      // display: block;
    }

    #visualization{
      // width: 300px;
    }

    .vis-timeline {
      border-radius: 3px;
    }

    .playback-time-marker {
      background-color: blue !important
    }

    .vis-current-time {
      background-color: red !important
    }


    /* style timeline grid border colors */
    .vis-minor,
    .vis-major,
    .vis-center {
      border-color: rgba(0, 0, 0, 0.7) !important;
    }


    .vis-item.vis-background.video-coverage {
      background-color: rgba(17, 167, 17, 0.2);
    }



    /* fill the timeline */
    .vis-item.video-data {
      background: none;
      border-width: 1px;
      border-radius: 5px !important;
    }

    .single {
      .vis-content,
      .vis-itemset,
      .vis-group,
      .vis-background {
        height:  100% !important;
      }

      /* fill the bar*/
      .vis-item.video-data {
        height: calc(100% - 2px) !important;
        top: 0px !important;
      }

      /* style time labels to overlay timeline */
      .vis-panel.vis-top {
        height: 0px;
      }

    }

    .vis-panel.vis-top {
      height: 3rem;
    }

    .vis-item.video-coverage {
      background-color: rgba(17, 167, 17, 0.1);
      border-color: rgba(17, 167, 17, 1);
      border-radius: 0px !important;

    }

    .vis-item.buffering {
      background-color: rgba(255, 215, 0, 0.1);
      border-color: orange;
      border-style: dashed !important;
    }

    .vis-item.buffered {
      background-color: rgba(17, 167, 17, 0.1);
      border-color: rgba(17, 167, 17, 1);
      z-index: 2;
    }

    .timeline-control-buttons {
      position: absolute;
      display: flex;
      gap: 6px;
      top: 2px;
      right: 2px;
      z-index: 2;
      padding: 2px;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    
    .timeline-control-buttons.hidden{
      display: none;
    }

    .control-button-group {
      display: flex;
      gap: 2px;
    }

    .timeline-control-buttons button {
      padding: 2px;
      border-radius: 50%;
      border: 1px solid rgb(50, 50, 50);
      background: lightgray;
      height: 1rem;
      width: 1rem;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
</style>

<div id="visualization" class="visualization single">
  <div class="timeline-control-buttons">
    <div class="control-button-group">
      <button id="zoom-in">
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
          <path
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
        </svg>
      </button>
      <button id="zoom-out">
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
          <path
            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
        </svg>
      </button>
    </div>
    <div class="control-button-group">
      <button id="slide-left">
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
          <path
            d="M177.5 414c-8.8 3.8-19 2-26-4.6l-144-136C2.7 268.9 0 262.6 0 256s2.7-12.9 7.5-17.4l144-136c7-6.6 17.2-8.4 26-4.6s14.5 12.5 14.5 22l0 72 288 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-288 0 0 72c0 9.6-5.7 18.2-14.5 22z" />
        </svg>
      </button>
      <button id="slide-right">
        <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
          <path
            d="M334.5 414c8.8 3.8 19 2 26-4.6l144-136c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22l0 72L32 192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l288 0 0 72c0 9.6 5.7 18.2 14.5 22z" />
        </svg>
      </button>
    </div>
  </div>
</div>
`;

class ScrollingTimeline extends HTMLElement {
  static observedAttributes = ["multiple","show-controls"];
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    this.container = this.shadowRoot.querySelector("#visualization");
    // this.style.width = "100px"; 
  }

  /****************************************************
   * Lifecycle callbacks
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
   ****************************************************/
  connectedCallback() {
    setTimeout(() =>{
      // wait 1ms for the root to mount before initing, otherwise we get redraw error warning
      // seems like it doesn't quite get the shadow dom width right
      this.initTimeline()
    }
    , 0);

  }
  disconnectedCallback() {
    // console.log("disconnectedCallback");
  }
  adoptedCallback() {
    // console.log("adoptedCallback");
  }
  attributeChangedCallback(name, oldVal, newVal) {
    console.log("attributeChangedCallback", name, oldVal, newVal);
    if (name === "multiple") {
      if (newVal === null || newVal === undefined) {
        this.container.classList.add("single");
      } else {
        this.container.classList.remove("single");
      }
    } else if (name ==="show-controls"){
      const controlsDiv = this.shadowRoot.querySelector(".timeline-control-buttons");
      if(newVal ==="false"){
        controlsDiv.classList.add("hidden")
      } else{
        controlsDiv.classList.remove("hidden")
      }
    }
    // if (name === "single") {
    //   if (newVal === null || newVal === undefined) {
    //     this.container.classList.remove("single");
    //   } else {
    //     this.container.classList.add("single");
    //   }
    // }
  }

  initTimeline() {
    console.log("init timeline");
    this.items = new vis.DataSet();
    this.groups = new vis.DataSet();
    this.rollingFollow = false;

    const start = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

    this.options = {
      minHeight: "3rem",
      // width:"200px",
      autoResize:false,
      orientation: "top", // top, bottom, both, none - where the timeline appears
      stack: false,
      stackSubgroups: false,
      // loadingScreenTemplate:()=>"<h1>loading</h1>",

      // limit oldest and newest https://github.com/visjs/vis-timeline/blob/master/examples/timeline/interaction/limitMoveAndZoom.html
      // min: start, // lower limit of visible range. use oldest item
      // start: start, // inital lower value
      // end: new Date(), // initial upper value
      // end: new Date(new Date().getTime() + 1000000),
      // limit zoom in and zoom out
      preferZoom: true, // true disables vertical zoom
      zoomFriction: 7, // zoom speed. higher is slower
      // zoomMin: 1000 * 60, // one minute in milliseconds
      // zoomMax: 1000 * 60 * 60 * 24 * 31 * 3, // about three months in milliseconds
      // rolling mode follows live. on user interaction, rolling mode is stopped.nice // https://github.com/visjs/vis-timeline/blob/master/examples/timeline/interaction/rollingMode.html
      showCurrentTime: true,
      rollingMode: {
        follow: this.rollingFollow,
        offset: 0.95,
      },
    };

    this.timeline = new vis.Timeline(
      this.container,
      this.items,
      this.groups,
      this.options
    );

    
    // // don't let it zoom out or scroll past current time.
    // // this.autoRange = this.autoRange.bind(this)
    // this.restrictRange = this.restrictRange.bind(this);
    // this.timeline.on("rangechange", this.restrictRange);
  }

  /************************************************************************
   * Limit so it can't go into the future
   * on init, shift right away
   ***********************************************************************/
  shiftRangeForMax(start, end, animate = false) {
    // if (e?.byUser) {
    // console.log("shiftrangeformax", parseInt(start / 1000), parseInt(end / 1000), parseInt((start - end) / 1000))
    const windowRange = this.timeline.getWindow();
    if (!start) {
      start = windowRange.start;
    }
    if (!end) {
      end = windowRange.end;
    }

    const wasRolling = this.timeline.range.rolling;
    // if (wasRolling) {
    //   animate = false
    // }

    const interval = end - start;
    const t = Date.now();
    const rollingModeOffset = this.timeline.options.rollingMode?.offset ?? 0.5;
    const startUpdate = t - interval * rollingModeOffset;
    const endUpdate = t + interval * (1 - rollingModeOffset);
    const options = {
      animation: animate,
    };
    // console.log("beforesetwindow", parseInt(startUpdate / 1000), parseInt(endUpdate / 1000), parseInt(interval / 1000))
    if (wasRolling) {
      // timeline.toggleRollingMode()
    }
    this.timeline.setWindow(startUpdate, endUpdate, options, () => {
      if (wasRolling) {
        // timeline.toggleRollingMode()
      }
    });
    // timeline.range.setRange(startUpdate, endUpdate, options)
    // }
  }

  autoRange(start, end, animate = false) {
    const now = Date.now();
    const windowRange = this.timeline.getWindow();
    if (!start) {
      start = windowRange.start;
    }
    if (!end) {
      end = windowRange.end;
    }

    if (end > now) {
      console.log("end outside range", end);
    }

    if (start > now || end > now) {
      // console.log("autorange", parseInt(start / 1000), parseInt(end / 1000), parseInt((start - end) / 1000))
      this.shiftRangeForMax(start, end, animate);
    } else {
      this.timeline.setWindow(start, end, { animation: animate });
    }
  }

  restrictRange(event) {
    // const now = Date.now();
    if (event.byUser) {
      this.autoRange(event.start, event.end);
    }
  }

  handleRangeChange(e) {
    // console.log("rangechange", e);
    // let end = e.end;
    // console.log(timeline.options.rollingMode.follow)
    // console.log(timeline.range.rolling)
    let correctStart = e.start;
    let correctEnd = e.end;
    let correct = false;
    if (e.byUser) {
      const now = Date.now();
      if (e.start > now - 1000 * 60) {
        correct = true;
        correctStart = start;
      }
      if (e.end > now + 1000 * 60) {
        correct = true;
        // correctEnd = now + 1000 * 60
        correctEnd = end;
      }
    }
    if (correct) {
      console.log("correct");
      this.timeline.setWindow(correctStart, correctEnd, { animate: true });
      // console.log("was following", rollingFollow)
      // console.log("now rolling", timeline.range.rolling)
      if (rollingFollow && !this.timeline.range.rolling) {
        // timeline.toggleRollingMode()
      }
    } else {
      rollingFollow = this.timeline.range.rolling;
    }
    start = correctStart;
    end = correctEnd;
  }

  /************************************************************************
   * groups
   ***********************************************************************/
  removeGroup(groupId) {
    // Find all items in the group
    const itemsToRemove = items
      .get({
        filter: (item) => item.group === groupId,
      })
      .map((item) => item.id);

    // Remove items and group
    this.items.remove(itemsToRemove);
    this.groups.remove(groupId);
  }

  addGroup(groupId) {
    this.groups.add({
      id: groupId,
      content: groupId,
    });
    // have to dele
    const items2 = makeData(
      groupId,
      "2025-02-01",
      new Date(Date.now() - 60 * 1000 * 20),
      2
    );
    this.items.add(items2); // check for dupes
  }
}

window.customElements.define("scrolling-timeline", ScrollingTimeline);

export default ScrollingTimeline;







function makeSubgroup(subgroup, group, start, end, type = "buffered") {
  return {
    // id:0,
    start: start,
    end: end,
    className: `video-data ${type}`,
    group: group,
    subgroup: "subgroup",
    selectable: false,
  };
}

function makeSubgroups(group, start, end, count) {
  let subgroups = [];
  start = new Date(start);
  end = new Date(end);
  const diff = end.getTime() - start.getTime();
  const segments = count * 2 - 1;
  const duration = diff / segments;
  for (let i = 0; i < count; i++) {
    const sgStart = start.getTime() + duration * (i * 2);
    const sgEnd = sgStart + duration;

    const buffered = makeSubgroup(i, group, sgStart, sgEnd, "buffered");
    subgroups.push(buffered);
    const buffering = makeSubgroup(
      i,
      group,
      sgStart - duration * 0.25,
      sgEnd + duration * 0.25,
      "buffering"
    );
    subgroups.push(buffering);
  }

  return subgroups;
}

function makeData(
  group = "Cam01",
  start = "2025-01-01",
  end = new Date(),
  subgroups = 3
) {
  const data = [];
  const background = {
    start: start,
    end: end,
    // type: 'background',
    className: "video-coverage video-data",
    group: group,
    // subgroup: "video-coverage",
    subgroup: "subgroup",
    selectable: false,
    // stack: false
  };
  data.push(background);
  if (subgroups) {
    data.push(
      ...makeSubgroups(
        group,
        Date.now() - 60 * 1000 * 15,
        Date.now() - 60 * 1000,
        subgroups
      )
    );
  }
  // return new vis.DataSet(data)
  return data;
}
