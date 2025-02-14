import { el } from "../node_modules/redom/dist/redom.es";

export const AboutPath = "about";

export class About {
  constructor() {
    this.el = (
      <div>
        <h1>About Us</h1>
        <p>This is the about page content.</p>
      </div>
    );
  }
  update(context) {
    console.log(context);
  }
}
