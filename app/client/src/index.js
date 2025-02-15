import { router, mount, el } from "../node_modules/redom/dist/redom.es";
import { Login } from "./login.js";
import { Register } from "./register.js";
import { Tasks } from "./tasks.js";
import { LoginPath, RegisterPath, TasksPath } from "./constants.js";

let context = {
  router: null,
  number: 123,
};

const app_router = router(".app", {
  [LoginPath]: new Login(context),
  [RegisterPath]: new Register(context),
  [TasksPath]: new Tasks(context),
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

app_router.update(LoginPath);
