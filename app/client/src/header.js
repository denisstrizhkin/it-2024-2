import { el } from "../node_modules/redom/dist/redom.es";
import { HomePath } from "./home.js";
import { ContactPath } from "./contact.js";
import { AboutPath } from "./about.js";

export class Header {
  constructor(context) {
    this.el = (
      <header>
        <nav>
          <button
            type="button"
            class="btn"
            onclick={() => {
              context.router.update(HomePath, context);
            }}
          >
            Home
          </button>
          <button
            type="button"
            class="btn"
            onclick={() => {
              context.router.update(AboutPath, context);
            }}
          >
            About
          </button>
          <button
            type="button"
            class="btn"
            onclick={() => {
              context.router.update(ContactPath, context);
            }}
          >
            Contact
          </button>
        </nav>
      </header>
    );
  }
}
