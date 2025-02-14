import { el, setAttr } from "../node_modules/redom/dist/redom.es";

export const HomePath = "home";

export class Home {
  constructor(context) {
    this.context = context;
    this.el = (
      <div>
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page content.</p>
        <p id="number">context.number {this.context.number}</p>
        <button
          type="button"
          class="btn"
          onclick={() => {
            this.context.number += 1;
            this.update();
          }}
        >
          Home
        </button>
      </div>
    );
  }

  update() {
    console.log(this.context);
    setAttr(this.el.querySelector("#number"), {
      textContent: `context.number ${this.context.number}`,
    });
  }
}
