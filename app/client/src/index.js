import { router, mount, el } from "../node_modules/redom/dist/redom.es";
import { Header } from "./header.js";
import { Login, LoginPath } from "./login.js";
import { About, AboutPath } from "./about.js";
import { Contact, ContactPath } from "./contact.js";

let context = {
  router: null,
  number: 123,
};

const app_router = router(".app", {
  [LoginPath]: new Login(context),
  [AboutPath]: About,
  [ContactPath]: Contact,
});

context.router = app_router;

mount(
  document.getElementById("main"),
  <div
    className="d-flex justify-content-center align-items-center"
    style="height: 100vh;"
  >
    {app_router}
  </div>,
);

app_router.update(LoginPath, context);
