const template = document.createElement("template");
template.innerHTML = `
  <style>
    h3 {
      color: green
    }
  </style>
  <div>
    <h3><slot name="name"/></h3>
    <button>custom button</button>
  </div>

`;

class TodoItem extends HTMLElement {
  static observedAttributes = ["attr1"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    // console.log("constructor", this.attributes);
    this.myProperty = "propVal"
   this.myState = "stateVal constructed"
   this._internals= this.attachInternals();
  }
  
  myMethods(){
    return 'methcall'
  }
  get myMethod(){
    return 'this.myState'
  }
  set myMethod(val){
    this._internals.states.add("something");
  }
  
  
  connectedCallback() {
    // console.log("connectedCallback");
    // console.log(this.attributes);
    this.myState = "stateVal connected"
    this.button = this.shadowRoot.querySelector("button")
    this.button.onclick=()=>console.log('init click')
    
  }
  disconnectedCallback() {
    // console.log("disconnectedCallback");
  }
  adoptedCallback() {
    // console.log("adoptedCallback");
  }
  attributeChangedCallback(name, oldVal, newVal) {
    // console.log("attributeChangedCallback");
    // console.log(this.attributes);
    // console.log(`Attribute ${name} has changed from ${oldVal} to ${newVal}.`);
  }
  // Element functionality written in here
}

window.customElements.define("todo-item", TodoItem);
