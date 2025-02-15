import { el, setAttr } from "../node_modules/redom/dist/redom.es";
import { LoginPath } from "./constants.js";

export class Register {
  constructor(context) {
    this.context = context;
    this.el = (
      <div>
        <form
          id="form"
          className="d-flex flex-column justify-content-center"
          onsubmit={this.handleSubmit}
        >
          <div className="form-group">
            <label for="email">Email address</label>
            <input
              type="email"
              className="form-control mb-2"
              id="email"
              placeholder="Enter email"
            />
          </div>
          <div className="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              className="form-control mb-2"
              id="password"
              placeholder="Enter password"
            />
            <input
              type="password"
              className="form-control mb-2"
              id="password2"
              placeholder="Repeat pasword"
            />
          </div>
          <div id="error" className="alert alert-danger p-2 mb-2" role="alert">
            Error
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        <p className="text-center mt-2">
          <a className="link-underline" href="">
            Login
          </a>
        </p>
      </div>
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    console.log(formData);
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    const data = Object.fromEntries(formData.entries());

    console.log("Form Data:", data);
  };

  handleRegister = (event) => {
    event.preventDefault();
    this.context.router.update();
  };

  update() {
    console.log(this.context);
  }
}
