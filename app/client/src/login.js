import { mount, el } from "../node_modules/redom/dist/redom.es";

export class Login {
  constructor() {
    this.el = (
      <div className="card shadow my-3">
        <div className="card-body">
          <h3 className="card-title text-center mb-4 mt-4">Login</h3>
          <form className="needs-validation" novalidate>
            <div className="form-group">
              <label for="email">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
                required
              />
              <div className="invalid-feedback">
                Please provide a valid email.
              </div>
            </div>
            <div className="form-group mt-1">
              <label for="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                required
              />
              <div className="invalid-feedback">
                Please provide a valid password.
              </div>
            </div>
            <div className="d-grid mt-2 mb-2">
              <button type="submit" className="btn btn-primary">
                Sign in
              </button>
            </div>
          </form>
          <p className="text-center">
            <a className="link-underline" href="">
              First time? Create an account.
            </a>
          </p>
        </div>
      </div>
    );
  }
}

mount(document.getElementById("main"), <Login />);
