import { el, setAttr } from "../node_modules/redom/dist/redom.es";

export const LoginPath = "login";

export class Login {
  constructor(context) {
    this.context = context;
    this.el = (
      <form className="d-flex flex-column justify-content-center">
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
            className="form-control mb-4"
            id="password"
            placeholder="Enter password"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    );
  }

  update() {
    console.log(this.context);
  }
}
