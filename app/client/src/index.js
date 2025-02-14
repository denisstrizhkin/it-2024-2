import { router, mount, el } from "../node_modules/redom/dist/redom.es";
import { Header } from "./header.js";
import { Home, HomePath } from "./home.js";
import { About, AboutPath } from "./about.js";
import { Contact, ContactPath } from "./contact.js";

let context = {
  router: null,
  number: 123,
};

const app_router = router(".app", {
  [HomePath]: new Home(context),
  [AboutPath]: About,
  [ContactPath]: Contact,
});

context.router = app_router;

mount(document.getElementById("main"), new Header(context));
mount(document.getElementById("main"), app_router);

app_router.update(HomePath, context);
