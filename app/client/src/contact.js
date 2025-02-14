import { el } from "../node_modules/redom/dist/redom.es";

export const ContactPath = "contact";

export class Contact {
  constructor() {
    this.el = (
      <div>
        <h1>Contact Us</h1>
        <p>This is the contact page content.</p>
      </div>
    );
  }
  update(context) {
    console.log(context);
  }
}
