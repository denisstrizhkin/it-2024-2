import { el } from "../node_modules/redom/dist/redom.es";

export const TasksPath = "tasks";

export class Tasks {
  constructor(context) {
    this.context = context;
    this.el = (
      <div>
        <h1>About Us</h1>
        <p>This is the about page content.</p>
      </div>
    );
  }
  update() {
    console.log(this.context);
  }
}
