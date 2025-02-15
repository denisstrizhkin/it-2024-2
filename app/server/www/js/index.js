'use strict';

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function createElement(query, ns) {
  const {
    tag,
    id,
    className
  } = parse(query);
  const element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
  if (id) {
    element.id = id;
  }
  if (className) {
    {
      element.className = className;
    }
  }
  return element;
}
function parse(query) {
  const chunks = query.split(/([.#])/);
  let className = "";
  let id = "";
  for (let i = 1; i < chunks.length; i += 2) {
    switch (chunks[i]) {
      case ".":
        className += ` ${chunks[i + 1]}`;
        break;
      case "#":
        id = chunks[i + 1];
    }
  }
  return {
    className: className.trim(),
    tag: chunks[0] || "div",
    id
  };
}
function html(query, ...args) {
  let element;
  const type = typeof query;
  if (type === "string") {
    element = createElement(query);
  } else if (type === "function") {
    const Query = query;
    element = new Query(...args);
  } else {
    throw new Error("At least one argument required");
  }
  parseArgumentsInternal(getEl(element), args);
  return element;
}
const el = html;
html.extend = function extendHtml(...args) {
  return html.bind(this, ...args);
};
function unmount(parent, _child) {
  let child = _child;
  const parentEl = getEl(parent);
  const childEl = getEl(child);
  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }
  if (childEl.parentNode) {
    doUnmount(child, childEl, parentEl);
    parentEl.removeChild(childEl);
  }
  return child;
}
function doUnmount(child, childEl, parentEl) {
  const hooks = childEl.__redom_lifecycle;
  if (hooksAreEmpty(hooks)) {
    childEl.__redom_lifecycle = {};
    return;
  }
  let traverse = parentEl;
  if (childEl.__redom_mounted) {
    trigger(childEl, "onunmount");
  }
  while (traverse) {
    const parentHooks = traverse.__redom_lifecycle || {};
    for (const hook in hooks) {
      if (parentHooks[hook]) {
        parentHooks[hook] -= hooks[hook];
      }
    }
    if (hooksAreEmpty(parentHooks)) {
      traverse.__redom_lifecycle = null;
    }
    traverse = traverse.parentNode;
  }
}
function hooksAreEmpty(hooks) {
  if (hooks == null) {
    return true;
  }
  for (const key in hooks) {
    if (hooks[key]) {
      return false;
    }
  }
  return true;
}

/* global Node, ShadowRoot */

const hookNames = ["onmount", "onremount", "onunmount"];
const shadowRootAvailable = typeof window !== "undefined" && "ShadowRoot" in window;
function mount(parent, _child, before, replace) {
  let child = _child;
  const parentEl = getEl(parent);
  const childEl = getEl(child);
  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }
  if (child !== childEl) {
    childEl.__redom_view = child;
  }
  const wasMounted = childEl.__redom_mounted;
  const oldParent = childEl.parentNode;
  if (wasMounted && oldParent !== parentEl) {
    doUnmount(child, childEl, oldParent);
  }
  if (before != null) {
    if (replace) {
      const beforeEl = getEl(before);
      if (beforeEl.__redom_mounted) {
        trigger(beforeEl, "onunmount");
      }
      parentEl.replaceChild(childEl, beforeEl);
    } else {
      parentEl.insertBefore(childEl, getEl(before));
    }
  } else {
    parentEl.appendChild(childEl);
  }
  doMount(child, childEl, parentEl, oldParent);
  return child;
}
function trigger(el, eventName) {
  if (eventName === "onmount" || eventName === "onremount") {
    el.__redom_mounted = true;
  } else if (eventName === "onunmount") {
    el.__redom_mounted = false;
  }
  const hooks = el.__redom_lifecycle;
  if (!hooks) {
    return;
  }
  const view = el.__redom_view;
  let hookCount = 0;
  view?.[eventName]?.();
  for (const hook in hooks) {
    if (hook) {
      hookCount++;
    }
  }
  if (hookCount) {
    let traverse = el.firstChild;
    while (traverse) {
      const next = traverse.nextSibling;
      trigger(traverse, eventName);
      traverse = next;
    }
  }
}
function doMount(child, childEl, parentEl, oldParent) {
  if (!childEl.__redom_lifecycle) {
    childEl.__redom_lifecycle = {};
  }
  const hooks = childEl.__redom_lifecycle;
  const remount = parentEl === oldParent;
  let hooksFound = false;
  for (const hookName of hookNames) {
    if (!remount) {
      // if already mounted, skip this phase
      if (child !== childEl) {
        // only Views can have lifecycle events
        if (hookName in child) {
          hooks[hookName] = (hooks[hookName] || 0) + 1;
        }
      }
    }
    if (hooks[hookName]) {
      hooksFound = true;
    }
  }
  if (!hooksFound) {
    childEl.__redom_lifecycle = {};
    return;
  }
  let traverse = parentEl;
  let triggered = false;
  if (remount || traverse?.__redom_mounted) {
    trigger(childEl, remount ? "onremount" : "onmount");
    triggered = true;
  }
  while (traverse) {
    const parent = traverse.parentNode;
    if (!traverse.__redom_lifecycle) {
      traverse.__redom_lifecycle = {};
    }
    const parentHooks = traverse.__redom_lifecycle;
    for (const hook in hooks) {
      parentHooks[hook] = (parentHooks[hook] || 0) + hooks[hook];
    }
    if (triggered) {
      break;
    }
    if (traverse.nodeType === Node.DOCUMENT_NODE || shadowRootAvailable && traverse instanceof ShadowRoot || parent?.__redom_mounted) {
      trigger(traverse, remount ? "onremount" : "onmount");
      triggered = true;
    }
    traverse = parent;
  }
}
function setStyle(view, arg1, arg2) {
  const el = getEl(view);
  if (typeof arg1 === "object") {
    for (const key in arg1) {
      setStyleValue(el, key, arg1[key]);
    }
  } else {
    setStyleValue(el, arg1, arg2);
  }
}
function setStyleValue(el, key, value) {
  el.style[key] = value == null ? "" : value;
}

/* global SVGElement */

const xlinkns = "http://www.w3.org/1999/xlink";
function setAttrInternal(view, arg1, arg2, initial) {
  const el = getEl(view);
  const isObj = typeof arg1 === "object";
  if (isObj) {
    for (const key in arg1) {
      setAttrInternal(el, key, arg1[key]);
    }
  } else {
    const isSVG = el instanceof SVGElement;
    const isFunc = typeof arg2 === "function";
    if (arg1 === "style" && typeof arg2 === "object") {
      setStyle(el, arg2);
    } else if (isSVG && isFunc) {
      el[arg1] = arg2;
    } else if (arg1 === "dataset") {
      setData(el, arg2);
    } else if (!isSVG && (arg1 in el || isFunc) && arg1 !== "list") {
      el[arg1] = arg2;
    } else {
      if (isSVG && arg1 === "xlink") {
        setXlink(el, arg2);
        return;
      }
      if (arg1 === "class") {
        setClassName(el, arg2);
        return;
      }
      if (arg2 == null) {
        el.removeAttribute(arg1);
      } else {
        el.setAttribute(arg1, arg2);
      }
    }
  }
}
function setClassName(el, additionToClassName) {
  if (additionToClassName == null) {
    el.removeAttribute("class");
  } else if (el.classList) {
    el.classList.add(additionToClassName);
  } else if (typeof el.className === "object" && el.className && el.className.baseVal) {
    el.className.baseVal = `${el.className.baseVal} ${additionToClassName}`.trim();
  } else {
    el.className = `${el.className} ${additionToClassName}`.trim();
  }
}
function setXlink(el, arg1, arg2) {
  if (typeof arg1 === "object") {
    for (const key in arg1) {
      setXlink(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.setAttributeNS(xlinkns, arg1, arg2);
    } else {
      el.removeAttributeNS(xlinkns, arg1, arg2);
    }
  }
}
function setData(el, arg1, arg2) {
  if (typeof arg1 === "object") {
    for (const key in arg1) {
      setData(el, key, arg1[key]);
    }
  } else {
    if (arg2 != null) {
      el.dataset[arg1] = arg2;
    } else {
      delete el.dataset[arg1];
    }
  }
}
function text(str) {
  return document.createTextNode(str != null ? str : "");
}
function parseArgumentsInternal(element, args, initial) {
  for (const arg of args) {
    if (arg !== 0 && !arg) {
      continue;
    }
    const type = typeof arg;
    if (type === "function") {
      arg(element);
    } else if (type === "string" || type === "number") {
      element.appendChild(text(arg));
    } else if (isNode(getEl(arg))) {
      mount(element, arg);
    } else if (arg.length) {
      parseArgumentsInternal(element, arg);
    } else if (type === "object") {
      setAttrInternal(element, arg, null);
    }
  }
}
function ensureEl(parent) {
  return typeof parent === "string" ? html(parent) : getEl(parent);
}
function getEl(parent) {
  return parent.nodeType && parent || !parent.el && parent || getEl(parent.el);
}
function isNode(arg) {
  return arg?.nodeType;
}
function setChildren(parent, ...children) {
  const parentEl = getEl(parent);
  let current = traverse(parent, children, parentEl.firstChild);
  while (current) {
    const next = current.nextSibling;
    unmount(parent, current);
    current = next;
  }
}
function traverse(parent, children, _current) {
  let current = _current;
  const childEls = Array(children.length);
  for (let i = 0; i < children.length; i++) {
    childEls[i] = children[i] && getEl(children[i]);
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child) {
      continue;
    }
    const childEl = childEls[i];
    if (childEl === current) {
      current = current.nextSibling;
      continue;
    }
    if (isNode(childEl)) {
      const next = current?.nextSibling;
      const exists = child.__redom_index != null;
      const replace = exists && next === childEls[i + 1];
      mount(parent, child, current, replace);
      if (replace) {
        current = next;
      }
      continue;
    }
    if (child.length != null) {
      current = traverse(parent, child, current);
    }
  }
  return current;
}

/* global Node */

function router(parent, views, initData) {
  return new Router(parent, views, initData);
}
class Router {
  constructor(parent, views, initData) {
    this.el = ensureEl(parent);
    this.views = views;
    this.Views = views; // backwards compatibility
    this.initData = initData;
  }
  update(route, data) {
    if (route !== this.route) {
      const views = this.views;
      const View = views[route];
      this.route = route;
      if (View && (View instanceof Node || View.el instanceof Node)) {
        this.view = View;
      } else {
        this.view = View && new View(this.initData, data);
      }
      setChildren(this.el, [this.view]);
    }
    this.view?.update?.(data, route);
  }
}

var LoginPath = "login";
var RegisterPath = "register";

var Login = /*#__PURE__*/function () {
  function Login(context) {
    var _this = this;
    _classCallCheck(this, Login);
    _defineProperty(this, "handleSubmit", function (event) {
      event.preventDefault();
      var formData = new FormData(event.target);
      console.log(formData);
      var _iterator = _createForOfIteratorHelper(formData.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pair = _step.value;
          console.log(pair[0], pair[1]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var data = Object.fromEntries(formData.entries());
      console.log("Form Data:", data);
    });
    _defineProperty(this, "handleRegister", function (event) {
      event.preventDefault();
      _this.context.router.update(RegisterPath);
    });
    this.context = context;
    this.el = el("div", null, el("form", {
      id: "form",
      className: "d-flex flex-column justify-content-center",
      onsubmit: this.handleSubmit
    }, el("div", {
      className: "form-group"
    }, el("label", {
      "for": "email"
    }, "Email address"), el("input", {
      type: "email",
      className: "form-control mb-2",
      id: "email",
      placeholder: "Enter email"
    })), el("div", {
      className: "form-group"
    }, el("label", {
      "for": "password"
    }, "Password"), el("input", {
      type: "password",
      className: "form-control mb-2",
      id: "password",
      placeholder: "Enter password"
    })), el("div", {
      id: "error",
      className: "alert alert-danger p-2 mb-2",
      role: "alert"
    }, "Error"), el("button", {
      type: "submit",
      className: "btn btn-primary"
    }, "Login")), el("p", {
      className: "text-center mt-2"
    }, el("a", {
      className: "link-underline",
      href: "",
      onclick: this.handleRegister
    }, "Register")));
  }
  return _createClass(Login, [{
    key: "update",
    value: function update() {
      console.log(this.context);
    }
  }]);
}();

var Register = /*#__PURE__*/function () {
  function Register(context) {
    var _this = this;
    _classCallCheck(this, Register);
    _defineProperty(this, "handleSubmit", function (event) {
      event.preventDefault();
      var formData = new FormData(event.target);
      console.log(formData);
      var _iterator = _createForOfIteratorHelper(formData.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pair = _step.value;
          console.log(pair[0], pair[1]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var data = Object.fromEntries(formData.entries());
      console.log("Form Data:", data);
    });
    _defineProperty(this, "handleRegister", function (event) {
      event.preventDefault();
      _this.context.router.update();
    });
    this.context = context;
    this.el = el("div", null, el("form", {
      id: "form",
      className: "d-flex flex-column justify-content-center",
      onsubmit: this.handleSubmit
    }, el("div", {
      className: "form-group"
    }, el("label", {
      "for": "email"
    }, "Email address"), el("input", {
      type: "email",
      className: "form-control mb-2",
      id: "email",
      placeholder: "Enter email"
    })), el("div", {
      className: "form-group"
    }, el("label", {
      "for": "password"
    }, "Password"), el("input", {
      type: "password",
      className: "form-control mb-2",
      id: "password",
      placeholder: "Enter password"
    }), el("input", {
      type: "password",
      className: "form-control mb-2",
      id: "password2",
      placeholder: "Repeat pasword"
    })), el("div", {
      id: "error",
      className: "alert alert-danger p-2 mb-2",
      role: "alert"
    }, "Error"), el("button", {
      type: "submit",
      className: "btn btn-primary"
    }, "Login")), el("p", {
      className: "text-center mt-2"
    }, el("a", {
      className: "link-underline",
      href: ""
    }, "Login")));
  }
  return _createClass(Register, [{
    key: "update",
    value: function update() {
      console.log(this.context);
    }
  }]);
}();

var TasksPath = "tasks";
var Tasks = /*#__PURE__*/function () {
  function Tasks(context) {
    _classCallCheck(this, Tasks);
    this.context = context;
    this.el = el("div", null, el("h1", null, "About Us"), el("p", null, "This is the about page content."));
  }
  return _createClass(Tasks, [{
    key: "update",
    value: function update() {
      console.log(this.context);
    }
  }]);
}();

var context = {
  router: null,
  number: 123
};
var app_router = router(".app", _defineProperty(_defineProperty(_defineProperty({}, LoginPath, new Login(context)), RegisterPath, new Register(context)), TasksPath, new Tasks(context)));
context.router = app_router;
mount(document.getElementById("main"), el("div", {
  className: "d-flex justify-content-center align-items-center",
  style: "height: 100vh;"
}, app_router));
app_router.update(LoginPath);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NsaWVudC9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lcy5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvY29uc3RhbnRzLmpzIiwiLi4vLi4vLi4vY2xpZW50L3NyYy9sb2dpbi5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvcmVnaXN0ZXIuanMiLCIuLi8uLi8uLi9jbGllbnQvc3JjL3Rhc2tzLmpzIiwiLi4vLi4vLi4vY2xpZW50L3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHF1ZXJ5LCBucykge1xuICBjb25zdCB7IHRhZywgaWQsIGNsYXNzTmFtZSB9ID0gcGFyc2UocXVlcnkpO1xuICBjb25zdCBlbGVtZW50ID0gbnNcbiAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdGFnKVxuICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG4gIGlmIChpZCkge1xuICAgIGVsZW1lbnQuaWQgPSBpZDtcbiAgfVxuXG4gIGlmIChjbGFzc05hbWUpIHtcbiAgICBpZiAobnMpIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHF1ZXJ5KSB7XG4gIGNvbnN0IGNodW5rcyA9IHF1ZXJ5LnNwbGl0KC8oWy4jXSkvKTtcbiAgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XG4gIGxldCBpZCA9IFwiXCI7XG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaHVua3MubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBzd2l0Y2ggKGNodW5rc1tpXSkge1xuICAgICAgY2FzZSBcIi5cIjpcbiAgICAgICAgY2xhc3NOYW1lICs9IGAgJHtjaHVua3NbaSArIDFdfWA7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiI1wiOlxuICAgICAgICBpZCA9IGNodW5rc1tpICsgMV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGFzc05hbWU6IGNsYXNzTmFtZS50cmltKCksXG4gICAgdGFnOiBjaHVua3NbMF0gfHwgXCJkaXZcIixcbiAgICBpZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gaHRtbChxdWVyeSwgLi4uYXJncykge1xuICBsZXQgZWxlbWVudDtcblxuICBjb25zdCB0eXBlID0gdHlwZW9mIHF1ZXJ5O1xuXG4gIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQocXVlcnkpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGNvbnN0IFF1ZXJ5ID0gcXVlcnk7XG4gICAgZWxlbWVudCA9IG5ldyBRdWVyeSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgYXJndW1lbnQgcmVxdWlyZWRcIik7XG4gIH1cblxuICBwYXJzZUFyZ3VtZW50c0ludGVybmFsKGdldEVsKGVsZW1lbnQpLCBhcmdzLCB0cnVlKTtcblxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuY29uc3QgZWwgPSBodG1sO1xuY29uc3QgaCA9IGh0bWw7XG5cbmh0bWwuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kSHRtbCguLi5hcmdzKSB7XG4gIHJldHVybiBodG1sLmJpbmQodGhpcywgLi4uYXJncyk7XG59O1xuXG5mdW5jdGlvbiB1bm1vdW50KHBhcmVudCwgX2NoaWxkKSB7XG4gIGxldCBjaGlsZCA9IF9jaGlsZDtcbiAgY29uc3QgcGFyZW50RWwgPSBnZXRFbChwYXJlbnQpO1xuICBjb25zdCBjaGlsZEVsID0gZ2V0RWwoY2hpbGQpO1xuXG4gIGlmIChjaGlsZCA9PT0gY2hpbGRFbCAmJiBjaGlsZEVsLl9fcmVkb21fdmlldykge1xuICAgIC8vIHRyeSB0byBsb29rIHVwIHRoZSB2aWV3IGlmIG5vdCBwcm92aWRlZFxuICAgIGNoaWxkID0gY2hpbGRFbC5fX3JlZG9tX3ZpZXc7XG4gIH1cblxuICBpZiAoY2hpbGRFbC5wYXJlbnROb2RlKSB7XG4gICAgZG9Vbm1vdW50KGNoaWxkLCBjaGlsZEVsLCBwYXJlbnRFbCk7XG5cbiAgICBwYXJlbnRFbC5yZW1vdmVDaGlsZChjaGlsZEVsKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuZnVuY3Rpb24gZG9Vbm1vdW50KGNoaWxkLCBjaGlsZEVsLCBwYXJlbnRFbCkge1xuICBjb25zdCBob29rcyA9IGNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGU7XG5cbiAgaWYgKGhvb2tzQXJlRW1wdHkoaG9va3MpKSB7XG4gICAgY2hpbGRFbC5fX3JlZG9tX2xpZmVjeWNsZSA9IHt9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB0cmF2ZXJzZSA9IHBhcmVudEVsO1xuXG4gIGlmIChjaGlsZEVsLl9fcmVkb21fbW91bnRlZCkge1xuICAgIHRyaWdnZXIoY2hpbGRFbCwgXCJvbnVubW91bnRcIik7XG4gIH1cblxuICB3aGlsZSAodHJhdmVyc2UpIHtcbiAgICBjb25zdCBwYXJlbnRIb29rcyA9IHRyYXZlcnNlLl9fcmVkb21fbGlmZWN5Y2xlIHx8IHt9O1xuXG4gICAgZm9yIChjb25zdCBob29rIGluIGhvb2tzKSB7XG4gICAgICBpZiAocGFyZW50SG9va3NbaG9va10pIHtcbiAgICAgICAgcGFyZW50SG9va3NbaG9va10gLT0gaG9va3NbaG9va107XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhvb2tzQXJlRW1wdHkocGFyZW50SG9va3MpKSB7XG4gICAgICB0cmF2ZXJzZS5fX3JlZG9tX2xpZmVjeWNsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdHJhdmVyc2UgPSB0cmF2ZXJzZS5wYXJlbnROb2RlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhvb2tzQXJlRW1wdHkoaG9va3MpIHtcbiAgaWYgKGhvb2tzID09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBob29rcykge1xuICAgIGlmIChob29rc1trZXldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiBnbG9iYWwgTm9kZSwgU2hhZG93Um9vdCAqL1xuXG5cbmNvbnN0IGhvb2tOYW1lcyA9IFtcIm9ubW91bnRcIiwgXCJvbnJlbW91bnRcIiwgXCJvbnVubW91bnRcIl07XG5jb25zdCBzaGFkb3dSb290QXZhaWxhYmxlID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBcIlNoYWRvd1Jvb3RcIiBpbiB3aW5kb3c7XG5cbmZ1bmN0aW9uIG1vdW50KHBhcmVudCwgX2NoaWxkLCBiZWZvcmUsIHJlcGxhY2UpIHtcbiAgbGV0IGNoaWxkID0gX2NoaWxkO1xuICBjb25zdCBwYXJlbnRFbCA9IGdldEVsKHBhcmVudCk7XG4gIGNvbnN0IGNoaWxkRWwgPSBnZXRFbChjaGlsZCk7XG5cbiAgaWYgKGNoaWxkID09PSBjaGlsZEVsICYmIGNoaWxkRWwuX19yZWRvbV92aWV3KSB7XG4gICAgLy8gdHJ5IHRvIGxvb2sgdXAgdGhlIHZpZXcgaWYgbm90IHByb3ZpZGVkXG4gICAgY2hpbGQgPSBjaGlsZEVsLl9fcmVkb21fdmlldztcbiAgfVxuXG4gIGlmIChjaGlsZCAhPT0gY2hpbGRFbCkge1xuICAgIGNoaWxkRWwuX19yZWRvbV92aWV3ID0gY2hpbGQ7XG4gIH1cblxuICBjb25zdCB3YXNNb3VudGVkID0gY2hpbGRFbC5fX3JlZG9tX21vdW50ZWQ7XG4gIGNvbnN0IG9sZFBhcmVudCA9IGNoaWxkRWwucGFyZW50Tm9kZTtcblxuICBpZiAod2FzTW91bnRlZCAmJiBvbGRQYXJlbnQgIT09IHBhcmVudEVsKSB7XG4gICAgZG9Vbm1vdW50KGNoaWxkLCBjaGlsZEVsLCBvbGRQYXJlbnQpO1xuICB9XG5cbiAgaWYgKGJlZm9yZSAhPSBudWxsKSB7XG4gICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgIGNvbnN0IGJlZm9yZUVsID0gZ2V0RWwoYmVmb3JlKTtcblxuICAgICAgaWYgKGJlZm9yZUVsLl9fcmVkb21fbW91bnRlZCkge1xuICAgICAgICB0cmlnZ2VyKGJlZm9yZUVsLCBcIm9udW5tb3VudFwiKTtcbiAgICAgIH1cblxuICAgICAgcGFyZW50RWwucmVwbGFjZUNoaWxkKGNoaWxkRWwsIGJlZm9yZUVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50RWwuaW5zZXJ0QmVmb3JlKGNoaWxkRWwsIGdldEVsKGJlZm9yZSkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwYXJlbnRFbC5hcHBlbmRDaGlsZChjaGlsZEVsKTtcbiAgfVxuXG4gIGRvTW91bnQoY2hpbGQsIGNoaWxkRWwsIHBhcmVudEVsLCBvbGRQYXJlbnQpO1xuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuZnVuY3Rpb24gdHJpZ2dlcihlbCwgZXZlbnROYW1lKSB7XG4gIGlmIChldmVudE5hbWUgPT09IFwib25tb3VudFwiIHx8IGV2ZW50TmFtZSA9PT0gXCJvbnJlbW91bnRcIikge1xuICAgIGVsLl9fcmVkb21fbW91bnRlZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoZXZlbnROYW1lID09PSBcIm9udW5tb3VudFwiKSB7XG4gICAgZWwuX19yZWRvbV9tb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICBjb25zdCBob29rcyA9IGVsLl9fcmVkb21fbGlmZWN5Y2xlO1xuXG4gIGlmICghaG9va3MpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB2aWV3ID0gZWwuX19yZWRvbV92aWV3O1xuICBsZXQgaG9va0NvdW50ID0gMDtcblxuICB2aWV3Py5bZXZlbnROYW1lXT8uKCk7XG5cbiAgZm9yIChjb25zdCBob29rIGluIGhvb2tzKSB7XG4gICAgaWYgKGhvb2spIHtcbiAgICAgIGhvb2tDb3VudCsrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChob29rQ291bnQpIHtcbiAgICBsZXQgdHJhdmVyc2UgPSBlbC5maXJzdENoaWxkO1xuXG4gICAgd2hpbGUgKHRyYXZlcnNlKSB7XG4gICAgICBjb25zdCBuZXh0ID0gdHJhdmVyc2UubmV4dFNpYmxpbmc7XG5cbiAgICAgIHRyaWdnZXIodHJhdmVyc2UsIGV2ZW50TmFtZSk7XG5cbiAgICAgIHRyYXZlcnNlID0gbmV4dDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZG9Nb3VudChjaGlsZCwgY2hpbGRFbCwgcGFyZW50RWwsIG9sZFBhcmVudCkge1xuICBpZiAoIWNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGUpIHtcbiAgICBjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlID0ge307XG4gIH1cblxuICBjb25zdCBob29rcyA9IGNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGU7XG4gIGNvbnN0IHJlbW91bnQgPSBwYXJlbnRFbCA9PT0gb2xkUGFyZW50O1xuICBsZXQgaG9va3NGb3VuZCA9IGZhbHNlO1xuXG4gIGZvciAoY29uc3QgaG9va05hbWUgb2YgaG9va05hbWVzKSB7XG4gICAgaWYgKCFyZW1vdW50KSB7XG4gICAgICAvLyBpZiBhbHJlYWR5IG1vdW50ZWQsIHNraXAgdGhpcyBwaGFzZVxuICAgICAgaWYgKGNoaWxkICE9PSBjaGlsZEVsKSB7XG4gICAgICAgIC8vIG9ubHkgVmlld3MgY2FuIGhhdmUgbGlmZWN5Y2xlIGV2ZW50c1xuICAgICAgICBpZiAoaG9va05hbWUgaW4gY2hpbGQpIHtcbiAgICAgICAgICBob29rc1tob29rTmFtZV0gPSAoaG9va3NbaG9va05hbWVdIHx8IDApICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaG9va3NbaG9va05hbWVdKSB7XG4gICAgICBob29rc0ZvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvb2tzRm91bmQpIHtcbiAgICBjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlID0ge307XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IHRyYXZlcnNlID0gcGFyZW50RWw7XG4gIGxldCB0cmlnZ2VyZWQgPSBmYWxzZTtcblxuICBpZiAocmVtb3VudCB8fCB0cmF2ZXJzZT8uX19yZWRvbV9tb3VudGVkKSB7XG4gICAgdHJpZ2dlcihjaGlsZEVsLCByZW1vdW50ID8gXCJvbnJlbW91bnRcIiA6IFwib25tb3VudFwiKTtcbiAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICB9XG5cbiAgd2hpbGUgKHRyYXZlcnNlKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdHJhdmVyc2UucGFyZW50Tm9kZTtcblxuICAgIGlmICghdHJhdmVyc2UuX19yZWRvbV9saWZlY3ljbGUpIHtcbiAgICAgIHRyYXZlcnNlLl9fcmVkb21fbGlmZWN5Y2xlID0ge307XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50SG9va3MgPSB0cmF2ZXJzZS5fX3JlZG9tX2xpZmVjeWNsZTtcblxuICAgIGZvciAoY29uc3QgaG9vayBpbiBob29rcykge1xuICAgICAgcGFyZW50SG9va3NbaG9va10gPSAocGFyZW50SG9va3NbaG9va10gfHwgMCkgKyBob29rc1tob29rXTtcbiAgICB9XG5cbiAgICBpZiAodHJpZ2dlcmVkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdHJhdmVyc2Uubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfTk9ERSB8fFxuICAgICAgKHNoYWRvd1Jvb3RBdmFpbGFibGUgJiYgdHJhdmVyc2UgaW5zdGFuY2VvZiBTaGFkb3dSb290KSB8fFxuICAgICAgcGFyZW50Py5fX3JlZG9tX21vdW50ZWRcbiAgICApIHtcbiAgICAgIHRyaWdnZXIodHJhdmVyc2UsIHJlbW91bnQgPyBcIm9ucmVtb3VudFwiIDogXCJvbm1vdW50XCIpO1xuICAgICAgdHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdHJhdmVyc2UgPSBwYXJlbnQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0U3R5bGUodmlldywgYXJnMSwgYXJnMikge1xuICBjb25zdCBlbCA9IGdldEVsKHZpZXcpO1xuXG4gIGlmICh0eXBlb2YgYXJnMSA9PT0gXCJvYmplY3RcIikge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGFyZzEpIHtcbiAgICAgIHNldFN0eWxlVmFsdWUoZWwsIGtleSwgYXJnMVtrZXldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2V0U3R5bGVWYWx1ZShlbCwgYXJnMSwgYXJnMik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0U3R5bGVWYWx1ZShlbCwga2V5LCB2YWx1ZSkge1xuICBlbC5zdHlsZVtrZXldID0gdmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTtcbn1cblxuLyogZ2xvYmFsIFNWR0VsZW1lbnQgKi9cblxuXG5jb25zdCB4bGlua25zID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCI7XG5cbmZ1bmN0aW9uIHNldEF0dHIodmlldywgYXJnMSwgYXJnMikge1xuICBzZXRBdHRySW50ZXJuYWwodmlldywgYXJnMSwgYXJnMik7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJJbnRlcm5hbCh2aWV3LCBhcmcxLCBhcmcyLCBpbml0aWFsKSB7XG4gIGNvbnN0IGVsID0gZ2V0RWwodmlldyk7XG5cbiAgY29uc3QgaXNPYmogPSB0eXBlb2YgYXJnMSA9PT0gXCJvYmplY3RcIjtcblxuICBpZiAoaXNPYmopIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhcmcxKSB7XG4gICAgICBzZXRBdHRySW50ZXJuYWwoZWwsIGtleSwgYXJnMVtrZXldLCBpbml0aWFsKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaXNTVkcgPSBlbCBpbnN0YW5jZW9mIFNWR0VsZW1lbnQ7XG4gICAgY29uc3QgaXNGdW5jID0gdHlwZW9mIGFyZzIgPT09IFwiZnVuY3Rpb25cIjtcblxuICAgIGlmIChhcmcxID09PSBcInN0eWxlXCIgJiYgdHlwZW9mIGFyZzIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHNldFN0eWxlKGVsLCBhcmcyKTtcbiAgICB9IGVsc2UgaWYgKGlzU1ZHICYmIGlzRnVuYykge1xuICAgICAgZWxbYXJnMV0gPSBhcmcyO1xuICAgIH0gZWxzZSBpZiAoYXJnMSA9PT0gXCJkYXRhc2V0XCIpIHtcbiAgICAgIHNldERhdGEoZWwsIGFyZzIpO1xuICAgIH0gZWxzZSBpZiAoIWlzU1ZHICYmIChhcmcxIGluIGVsIHx8IGlzRnVuYykgJiYgYXJnMSAhPT0gXCJsaXN0XCIpIHtcbiAgICAgIGVsW2FyZzFdID0gYXJnMjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzU1ZHICYmIGFyZzEgPT09IFwieGxpbmtcIikge1xuICAgICAgICBzZXRYbGluayhlbCwgYXJnMik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChpbml0aWFsICYmIGFyZzEgPT09IFwiY2xhc3NcIikge1xuICAgICAgICBzZXRDbGFzc05hbWUoZWwsIGFyZzIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYXJnMiA9PSBudWxsKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhcmcxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShhcmcxLCBhcmcyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0Q2xhc3NOYW1lKGVsLCBhZGRpdGlvblRvQ2xhc3NOYW1lKSB7XG4gIGlmIChhZGRpdGlvblRvQ2xhc3NOYW1lID09IG51bGwpIHtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoXCJjbGFzc1wiKTtcbiAgfSBlbHNlIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKGFkZGl0aW9uVG9DbGFzc05hbWUpO1xuICB9IGVsc2UgaWYgKFxuICAgIHR5cGVvZiBlbC5jbGFzc05hbWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICBlbC5jbGFzc05hbWUgJiZcbiAgICBlbC5jbGFzc05hbWUuYmFzZVZhbFxuICApIHtcbiAgICBlbC5jbGFzc05hbWUuYmFzZVZhbCA9XG4gICAgICBgJHtlbC5jbGFzc05hbWUuYmFzZVZhbH0gJHthZGRpdGlvblRvQ2xhc3NOYW1lfWAudHJpbSgpO1xuICB9IGVsc2Uge1xuICAgIGVsLmNsYXNzTmFtZSA9IGAke2VsLmNsYXNzTmFtZX0gJHthZGRpdGlvblRvQ2xhc3NOYW1lfWAudHJpbSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFhsaW5rKGVsLCBhcmcxLCBhcmcyKSB7XG4gIGlmICh0eXBlb2YgYXJnMSA9PT0gXCJvYmplY3RcIikge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGFyZzEpIHtcbiAgICAgIHNldFhsaW5rKGVsLCBrZXksIGFyZzFba2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChhcmcyICE9IG51bGwpIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rbnMsIGFyZzEsIGFyZzIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGVOUyh4bGlua25zLCBhcmcxLCBhcmcyKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0RGF0YShlbCwgYXJnMSwgYXJnMikge1xuICBpZiAodHlwZW9mIGFyZzEgPT09IFwib2JqZWN0XCIpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhcmcxKSB7XG4gICAgICBzZXREYXRhKGVsLCBrZXksIGFyZzFba2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChhcmcyICE9IG51bGwpIHtcbiAgICAgIGVsLmRhdGFzZXRbYXJnMV0gPSBhcmcyO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgZWwuZGF0YXNldFthcmcxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdGV4dChzdHIpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0ciAhPSBudWxsID8gc3RyIDogXCJcIik7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzSW50ZXJuYWwoZWxlbWVudCwgYXJncywgaW5pdGlhbCkge1xuICBmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG4gICAgaWYgKGFyZyAhPT0gMCAmJiAhYXJnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIGFyZztcblxuICAgIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGFyZyhlbGVtZW50KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIgfHwgdHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0KGFyZykpO1xuICAgIH0gZWxzZSBpZiAoaXNOb2RlKGdldEVsKGFyZykpKSB7XG4gICAgICBtb3VudChlbGVtZW50LCBhcmcpO1xuICAgIH0gZWxzZSBpZiAoYXJnLmxlbmd0aCkge1xuICAgICAgcGFyc2VBcmd1bWVudHNJbnRlcm5hbChlbGVtZW50LCBhcmcsIGluaXRpYWwpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgc2V0QXR0ckludGVybmFsKGVsZW1lbnQsIGFyZywgbnVsbCwgaW5pdGlhbCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGVuc3VyZUVsKHBhcmVudCkge1xuICByZXR1cm4gdHlwZW9mIHBhcmVudCA9PT0gXCJzdHJpbmdcIiA/IGh0bWwocGFyZW50KSA6IGdldEVsKHBhcmVudCk7XG59XG5cbmZ1bmN0aW9uIGdldEVsKHBhcmVudCkge1xuICByZXR1cm4gKFxuICAgIChwYXJlbnQubm9kZVR5cGUgJiYgcGFyZW50KSB8fCAoIXBhcmVudC5lbCAmJiBwYXJlbnQpIHx8IGdldEVsKHBhcmVudC5lbClcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlKGFyZykge1xuICByZXR1cm4gYXJnPy5ub2RlVHlwZTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2goY2hpbGQsIGRhdGEsIGV2ZW50TmFtZSA9IFwicmVkb21cIikge1xuICBjb25zdCBjaGlsZEVsID0gZ2V0RWwoY2hpbGQpO1xuICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHsgYnViYmxlczogdHJ1ZSwgZGV0YWlsOiBkYXRhIH0pO1xuICBjaGlsZEVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBzZXRDaGlsZHJlbihwYXJlbnQsIC4uLmNoaWxkcmVuKSB7XG4gIGNvbnN0IHBhcmVudEVsID0gZ2V0RWwocGFyZW50KTtcbiAgbGV0IGN1cnJlbnQgPSB0cmF2ZXJzZShwYXJlbnQsIGNoaWxkcmVuLCBwYXJlbnRFbC5maXJzdENoaWxkKTtcblxuICB3aGlsZSAoY3VycmVudCkge1xuICAgIGNvbnN0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgdW5tb3VudChwYXJlbnQsIGN1cnJlbnQpO1xuXG4gICAgY3VycmVudCA9IG5leHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJhdmVyc2UocGFyZW50LCBjaGlsZHJlbiwgX2N1cnJlbnQpIHtcbiAgbGV0IGN1cnJlbnQgPSBfY3VycmVudDtcblxuICBjb25zdCBjaGlsZEVscyA9IEFycmF5KGNoaWxkcmVuLmxlbmd0aCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGNoaWxkRWxzW2ldID0gY2hpbGRyZW5baV0gJiYgZ2V0RWwoY2hpbGRyZW5baV0pO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZEVsID0gY2hpbGRFbHNbaV07XG5cbiAgICBpZiAoY2hpbGRFbCA9PT0gY3VycmVudCkge1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNOb2RlKGNoaWxkRWwpKSB7XG4gICAgICBjb25zdCBuZXh0ID0gY3VycmVudD8ubmV4dFNpYmxpbmc7XG4gICAgICBjb25zdCBleGlzdHMgPSBjaGlsZC5fX3JlZG9tX2luZGV4ICE9IG51bGw7XG4gICAgICBjb25zdCByZXBsYWNlID0gZXhpc3RzICYmIG5leHQgPT09IGNoaWxkRWxzW2kgKyAxXTtcblxuICAgICAgbW91bnQocGFyZW50LCBjaGlsZCwgY3VycmVudCwgcmVwbGFjZSk7XG5cbiAgICAgIGlmIChyZXBsYWNlKSB7XG4gICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGQubGVuZ3RoICE9IG51bGwpIHtcbiAgICAgIGN1cnJlbnQgPSB0cmF2ZXJzZShwYXJlbnQsIGNoaWxkLCBjdXJyZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gbGlzdFBvb2woVmlldywga2V5LCBpbml0RGF0YSkge1xuICByZXR1cm4gbmV3IExpc3RQb29sKFZpZXcsIGtleSwgaW5pdERhdGEpO1xufVxuXG5jbGFzcyBMaXN0UG9vbCB7XG4gIGNvbnN0cnVjdG9yKFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgICB0aGlzLlZpZXcgPSBWaWV3O1xuICAgIHRoaXMuaW5pdERhdGEgPSBpbml0RGF0YTtcbiAgICB0aGlzLm9sZExvb2t1cCA9IHt9O1xuICAgIHRoaXMubG9va3VwID0ge307XG4gICAgdGhpcy5vbGRWaWV3cyA9IFtdO1xuICAgIHRoaXMudmlld3MgPSBbXTtcblxuICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5rZXkgPSB0eXBlb2Yga2V5ID09PSBcImZ1bmN0aW9uXCIgPyBrZXkgOiBwcm9wS2V5KGtleSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKGRhdGEsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IFZpZXcsIGtleSwgaW5pdERhdGEgfSA9IHRoaXM7XG4gICAgY29uc3Qga2V5U2V0ID0ga2V5ICE9IG51bGw7XG5cbiAgICBjb25zdCBvbGRMb29rdXAgPSB0aGlzLmxvb2t1cDtcbiAgICBjb25zdCBuZXdMb29rdXAgPSB7fTtcblxuICAgIGNvbnN0IG5ld1ZpZXdzID0gQXJyYXkoZGF0YS5sZW5ndGgpO1xuICAgIGNvbnN0IG9sZFZpZXdzID0gdGhpcy52aWV3cztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaXRlbSA9IGRhdGFbaV07XG4gICAgICBsZXQgdmlldztcblxuICAgICAgaWYgKGtleVNldCkge1xuICAgICAgICBjb25zdCBpZCA9IGtleShpdGVtKTtcblxuICAgICAgICB2aWV3ID0gb2xkTG9va3VwW2lkXSB8fCBuZXcgVmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSk7XG4gICAgICAgIG5ld0xvb2t1cFtpZF0gPSB2aWV3O1xuICAgICAgICB2aWV3Ll9fcmVkb21faWQgPSBpZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpZXcgPSBvbGRWaWV3c1tpXSB8fCBuZXcgVmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSk7XG4gICAgICB9XG4gICAgICB2aWV3LnVwZGF0ZT8uKGl0ZW0sIGksIGRhdGEsIGNvbnRleHQpO1xuXG4gICAgICBjb25zdCBlbCA9IGdldEVsKHZpZXcuZWwpO1xuXG4gICAgICBlbC5fX3JlZG9tX3ZpZXcgPSB2aWV3O1xuICAgICAgbmV3Vmlld3NbaV0gPSB2aWV3O1xuICAgIH1cblxuICAgIHRoaXMub2xkVmlld3MgPSBvbGRWaWV3cztcbiAgICB0aGlzLnZpZXdzID0gbmV3Vmlld3M7XG5cbiAgICB0aGlzLm9sZExvb2t1cCA9IG9sZExvb2t1cDtcbiAgICB0aGlzLmxvb2t1cCA9IG5ld0xvb2t1cDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9wS2V5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24gcHJvcHBlZEtleShpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW1ba2V5XTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbGlzdChwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgcmV0dXJuIG5ldyBMaXN0KHBhcmVudCwgVmlldywga2V5LCBpbml0RGF0YSk7XG59XG5cbmNsYXNzIExpc3Qge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgICB0aGlzLlZpZXcgPSBWaWV3O1xuICAgIHRoaXMuaW5pdERhdGEgPSBpbml0RGF0YTtcbiAgICB0aGlzLnZpZXdzID0gW107XG4gICAgdGhpcy5wb29sID0gbmV3IExpc3RQb29sKFZpZXcsIGtleSwgaW5pdERhdGEpO1xuICAgIHRoaXMuZWwgPSBlbnN1cmVFbChwYXJlbnQpO1xuICAgIHRoaXMua2V5U2V0ID0ga2V5ICE9IG51bGw7XG4gIH1cblxuICB1cGRhdGUoZGF0YSwgY29udGV4dCkge1xuICAgIGNvbnN0IHsga2V5U2V0IH0gPSB0aGlzO1xuICAgIGNvbnN0IG9sZFZpZXdzID0gdGhpcy52aWV3cztcblxuICAgIHRoaXMucG9vbC51cGRhdGUoZGF0YSB8fCBbXSwgY29udGV4dCk7XG5cbiAgICBjb25zdCB7IHZpZXdzLCBsb29rdXAgfSA9IHRoaXMucG9vbDtcblxuICAgIGlmIChrZXlTZXQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkVmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgb2xkVmlldyA9IG9sZFZpZXdzW2ldO1xuICAgICAgICBjb25zdCBpZCA9IG9sZFZpZXcuX19yZWRvbV9pZDtcblxuICAgICAgICBpZiAobG9va3VwW2lkXSA9PSBudWxsKSB7XG4gICAgICAgICAgb2xkVmlldy5fX3JlZG9tX2luZGV4ID0gbnVsbDtcbiAgICAgICAgICB1bm1vdW50KHRoaXMsIG9sZFZpZXcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdmlldyA9IHZpZXdzW2ldO1xuXG4gICAgICB2aWV3Ll9fcmVkb21faW5kZXggPSBpO1xuICAgIH1cblxuICAgIHNldENoaWxkcmVuKHRoaXMsIHZpZXdzKTtcblxuICAgIGlmIChrZXlTZXQpIHtcbiAgICAgIHRoaXMubG9va3VwID0gbG9va3VwO1xuICAgIH1cbiAgICB0aGlzLnZpZXdzID0gdmlld3M7XG4gIH1cbn1cblxuTGlzdC5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmRMaXN0KHBhcmVudCwgVmlldywga2V5LCBpbml0RGF0YSkge1xuICByZXR1cm4gTGlzdC5iaW5kKExpc3QsIHBhcmVudCwgVmlldywga2V5LCBpbml0RGF0YSk7XG59O1xuXG5saXN0LmV4dGVuZCA9IExpc3QuZXh0ZW5kO1xuXG4vKiBnbG9iYWwgTm9kZSAqL1xuXG5cbmZ1bmN0aW9uIHBsYWNlKFZpZXcsIGluaXREYXRhKSB7XG4gIHJldHVybiBuZXcgUGxhY2UoVmlldywgaW5pdERhdGEpO1xufVxuXG5jbGFzcyBQbGFjZSB7XG4gIGNvbnN0cnVjdG9yKFZpZXcsIGluaXREYXRhKSB7XG4gICAgdGhpcy5lbCA9IHRleHQoXCJcIik7XG4gICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHRoaXMuZWw7XG5cbiAgICBpZiAoVmlldyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgIHRoaXMuX2VsID0gVmlldztcbiAgICB9IGVsc2UgaWYgKFZpZXcuZWwgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICB0aGlzLl9lbCA9IFZpZXc7XG4gICAgICB0aGlzLnZpZXcgPSBWaWV3O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9WaWV3ID0gVmlldztcbiAgICB9XG5cbiAgICB0aGlzLl9pbml0RGF0YSA9IGluaXREYXRhO1xuICB9XG5cbiAgdXBkYXRlKHZpc2libGUsIGRhdGEpIHtcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuX3BsYWNlaG9sZGVyO1xuICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLmVsLnBhcmVudE5vZGU7XG5cbiAgICBpZiAodmlzaWJsZSkge1xuICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VsKSB7XG4gICAgICAgICAgbW91bnQocGFyZW50Tm9kZSwgdGhpcy5fZWwsIHBsYWNlaG9sZGVyKTtcbiAgICAgICAgICB1bm1vdW50KHBhcmVudE5vZGUsIHBsYWNlaG9sZGVyKTtcblxuICAgICAgICAgIHRoaXMuZWwgPSBnZXRFbCh0aGlzLl9lbCk7XG4gICAgICAgICAgdGhpcy52aXNpYmxlID0gdmlzaWJsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBWaWV3ID0gdGhpcy5fVmlldztcbiAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IFZpZXcodGhpcy5faW5pdERhdGEpO1xuXG4gICAgICAgICAgdGhpcy5lbCA9IGdldEVsKHZpZXcpO1xuICAgICAgICAgIHRoaXMudmlldyA9IHZpZXc7XG5cbiAgICAgICAgICBtb3VudChwYXJlbnROb2RlLCB2aWV3LCBwbGFjZWhvbGRlcik7XG4gICAgICAgICAgdW5tb3VudChwYXJlbnROb2RlLCBwbGFjZWhvbGRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMudmlldz8udXBkYXRlPy4oZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VsKSB7XG4gICAgICAgICAgbW91bnQocGFyZW50Tm9kZSwgcGxhY2Vob2xkZXIsIHRoaXMuX2VsKTtcbiAgICAgICAgICB1bm1vdW50KHBhcmVudE5vZGUsIHRoaXMuX2VsKTtcblxuICAgICAgICAgIHRoaXMuZWwgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG1vdW50KHBhcmVudE5vZGUsIHBsYWNlaG9sZGVyLCB0aGlzLnZpZXcpO1xuICAgICAgICB1bm1vdW50KHBhcmVudE5vZGUsIHRoaXMudmlldyk7XG5cbiAgICAgICAgdGhpcy5lbCA9IHBsYWNlaG9sZGVyO1xuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlZihjdHgsIGtleSwgdmFsdWUpIHtcbiAgY3R4W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKiBnbG9iYWwgTm9kZSAqL1xuXG5cbmZ1bmN0aW9uIHJvdXRlcihwYXJlbnQsIHZpZXdzLCBpbml0RGF0YSkge1xuICByZXR1cm4gbmV3IFJvdXRlcihwYXJlbnQsIHZpZXdzLCBpbml0RGF0YSk7XG59XG5cbmNsYXNzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgdmlld3MsIGluaXREYXRhKSB7XG4gICAgdGhpcy5lbCA9IGVuc3VyZUVsKHBhcmVudCk7XG4gICAgdGhpcy52aWV3cyA9IHZpZXdzO1xuICAgIHRoaXMuVmlld3MgPSB2aWV3czsgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICB0aGlzLmluaXREYXRhID0gaW5pdERhdGE7XG4gIH1cblxuICB1cGRhdGUocm91dGUsIGRhdGEpIHtcbiAgICBpZiAocm91dGUgIT09IHRoaXMucm91dGUpIHtcbiAgICAgIGNvbnN0IHZpZXdzID0gdGhpcy52aWV3cztcbiAgICAgIGNvbnN0IFZpZXcgPSB2aWV3c1tyb3V0ZV07XG5cbiAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcblxuICAgICAgaWYgKFZpZXcgJiYgKFZpZXcgaW5zdGFuY2VvZiBOb2RlIHx8IFZpZXcuZWwgaW5zdGFuY2VvZiBOb2RlKSkge1xuICAgICAgICB0aGlzLnZpZXcgPSBWaWV3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52aWV3ID0gVmlldyAmJiBuZXcgVmlldyh0aGlzLmluaXREYXRhLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgc2V0Q2hpbGRyZW4odGhpcy5lbCwgW3RoaXMudmlld10pO1xuICAgIH1cbiAgICB0aGlzLnZpZXc/LnVwZGF0ZT8uKGRhdGEsIHJvdXRlKTtcbiAgfVxufVxuXG5jb25zdCBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxuZnVuY3Rpb24gc3ZnKHF1ZXJ5LCAuLi5hcmdzKSB7XG4gIGxldCBlbGVtZW50O1xuXG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgcXVlcnk7XG5cbiAgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBlbGVtZW50ID0gY3JlYXRlRWxlbWVudChxdWVyeSwgbnMpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGNvbnN0IFF1ZXJ5ID0gcXVlcnk7XG4gICAgZWxlbWVudCA9IG5ldyBRdWVyeSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgYXJndW1lbnQgcmVxdWlyZWRcIik7XG4gIH1cblxuICBwYXJzZUFyZ3VtZW50c0ludGVybmFsKGdldEVsKGVsZW1lbnQpLCBhcmdzLCB0cnVlKTtcblxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuY29uc3QgcyA9IHN2Zztcblxuc3ZnLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZFN2ZyguLi5hcmdzKSB7XG4gIHJldHVybiBzdmcuYmluZCh0aGlzLCAuLi5hcmdzKTtcbn07XG5cbnN2Zy5ucyA9IG5zO1xuXG5mdW5jdGlvbiB2aWV3RmFjdG9yeSh2aWV3cywga2V5KSB7XG4gIGlmICghdmlld3MgfHwgdHlwZW9mIHZpZXdzICE9PSBcIm9iamVjdFwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidmlld3MgbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gIH1cbiAgaWYgKCFrZXkgfHwgdHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImtleSBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiBmYWN0b3J5Vmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSkge1xuICAgIGNvbnN0IHZpZXdLZXkgPSBpdGVtW2tleV07XG4gICAgY29uc3QgVmlldyA9IHZpZXdzW3ZpZXdLZXldO1xuXG4gICAgaWYgKFZpZXcpIHtcbiAgICAgIHJldHVybiBuZXcgVmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGB2aWV3ICR7dmlld0tleX0gbm90IGZvdW5kYCk7XG4gIH07XG59XG5cbmV4cG9ydCB7IExpc3QsIExpc3RQb29sLCBQbGFjZSwgUm91dGVyLCBkaXNwYXRjaCwgZWwsIGgsIGh0bWwsIGxpc3QsIGxpc3RQb29sLCBtb3VudCwgcGxhY2UsIHJlZiwgcm91dGVyLCBzLCBzZXRBdHRyLCBzZXRDaGlsZHJlbiwgc2V0RGF0YSwgc2V0U3R5bGUsIHNldFhsaW5rLCBzdmcsIHRleHQsIHVubW91bnQsIHZpZXdGYWN0b3J5IH07XG4iLCJleHBvcnQgY29uc3QgTG9naW5QYXRoID0gXCJsb2dpblwiO1xuZXhwb3J0IGNvbnN0IFJlZ2lzdGVyUGF0aCA9IFwicmVnaXN0ZXJcIjtcbiIsImltcG9ydCB7IGVsLCBzZXRBdHRyIH0gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9yZWRvbS9kaXN0L3JlZG9tLmVzXCI7XG5pbXBvcnQgeyBSZWdpc3RlclBhdGggfSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcblxuZXhwb3J0IGNsYXNzIExvZ2luIHtcbiAgY29uc3RydWN0b3IoY29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5lbCA9IChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxmb3JtXG4gICAgICAgICAgaWQ9XCJmb3JtXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkLWZsZXggZmxleC1jb2x1bW4ganVzdGlmeS1jb250ZW50LWNlbnRlclwiXG4gICAgICAgICAgb25zdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fVxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiZW1haWxcIj5FbWFpbCBhZGRyZXNzPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2wgbWItMlwiXG4gICAgICAgICAgICAgIGlkPVwiZW1haWxcIlxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIGVtYWlsXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwicGFzc3dvcmRcIj5QYXNzd29yZDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sIG1iLTJcIlxuICAgICAgICAgICAgICBpZD1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBwYXNzd29yZFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJlcnJvclwiIGNsYXNzTmFtZT1cImFsZXJ0IGFsZXJ0LWRhbmdlciBwLTIgbWItMlwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgRXJyb3JcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5cbiAgICAgICAgICAgIExvZ2luXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbXQtMlwiPlxuICAgICAgICAgIDxhIGNsYXNzTmFtZT1cImxpbmstdW5kZXJsaW5lXCIgaHJlZj1cIlwiIG9uY2xpY2s9e3RoaXMuaGFuZGxlUmVnaXN0ZXJ9PlxuICAgICAgICAgICAgUmVnaXN0ZXJcbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KTtcbiAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XG4gICAgZm9yIChjb25zdCBwYWlyIG9mIGZvcm1EYXRhLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2cocGFpclswXSwgcGFpclsxXSk7XG4gICAgfVxuICAgIGNvbnN0IGRhdGEgPSBPYmplY3QuZnJvbUVudHJpZXMoZm9ybURhdGEuZW50cmllcygpKTtcblxuICAgIGNvbnNvbGUubG9nKFwiRm9ybSBEYXRhOlwiLCBkYXRhKTtcbiAgfTtcblxuICBoYW5kbGVSZWdpc3RlciA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5jb250ZXh0LnJvdXRlci51cGRhdGUoUmVnaXN0ZXJQYXRoKTtcbiAgfTtcblxuICB1cGRhdGUoKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5jb250ZXh0KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgZWwsIHNldEF0dHIgfSBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL3JlZG9tL2Rpc3QvcmVkb20uZXNcIjtcbmltcG9ydCB7IExvZ2luUGF0aCB9IGZyb20gXCIuL2NvbnN0YW50cy5qc1wiO1xuXG5leHBvcnQgY2xhc3MgUmVnaXN0ZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLmVsID0gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGZvcm1cbiAgICAgICAgICBpZD1cImZvcm1cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImQtZmxleCBmbGV4LWNvbHVtbiBqdXN0aWZ5LWNvbnRlbnQtY2VudGVyXCJcbiAgICAgICAgICBvbnN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9XG4gICAgICAgID5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJlbWFpbFwiPkVtYWlsIGFkZHJlc3M8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbCBtYi0yXCJcbiAgICAgICAgICAgICAgaWQ9XCJlbWFpbFwiXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgZW1haWxcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJwYXNzd29yZFwiPlBhc3N3b3JkPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2wgbWItMlwiXG4gICAgICAgICAgICAgIGlkPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIHBhc3N3b3JkXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sIG1iLTJcIlxuICAgICAgICAgICAgICBpZD1cInBhc3N3b3JkMlwiXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUmVwZWF0IHBhc3dvcmRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPVwiZXJyb3JcIiBjbGFzc05hbWU9XCJhbGVydCBhbGVydC1kYW5nZXIgcC0yIG1iLTJcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgIEVycm9yXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCI+XG4gICAgICAgICAgICBMb2dpblxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtY2VudGVyIG10LTJcIj5cbiAgICAgICAgICA8YSBjbGFzc05hbWU9XCJsaW5rLXVuZGVybGluZVwiIGhyZWY9XCJcIj5cbiAgICAgICAgICAgIExvZ2luXG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L3A+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaGFuZGxlU3VibWl0ID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGV2ZW50LnRhcmdldCk7XG4gICAgY29uc29sZS5sb2coZm9ybURhdGEpO1xuICAgIGZvciAoY29uc3QgcGFpciBvZiBmb3JtRGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKHBhaXJbMF0sIHBhaXJbMV0pO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gT2JqZWN0LmZyb21FbnRyaWVzKGZvcm1EYXRhLmVudHJpZXMoKSk7XG5cbiAgICBjb25zb2xlLmxvZyhcIkZvcm0gRGF0YTpcIiwgZGF0YSk7XG4gIH07XG5cbiAgaGFuZGxlUmVnaXN0ZXIgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudXBkYXRlKCk7XG4gIH07XG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuY29udGV4dCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IGVsIH0gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9yZWRvbS9kaXN0L3JlZG9tLmVzXCI7XG5cbmV4cG9ydCBjb25zdCBUYXNrc1BhdGggPSBcInRhc2tzXCI7XG5cbmV4cG9ydCBjbGFzcyBUYXNrcyB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuZWwgPSAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDE+QWJvdXQgVXM8L2gxPlxuICAgICAgICA8cD5UaGlzIGlzIHRoZSBhYm91dCBwYWdlIGNvbnRlbnQuPC9wPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuICB1cGRhdGUoKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5jb250ZXh0KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgcm91dGVyLCBtb3VudCwgZWwgfSBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL3JlZG9tL2Rpc3QvcmVkb20uZXNcIjtcbmltcG9ydCB7IExvZ2luIH0gZnJvbSBcIi4vbG9naW4uanNcIjtcbmltcG9ydCB7IFJlZ2lzdGVyIH0gZnJvbSBcIi4vcmVnaXN0ZXIuanNcIjtcbmltcG9ydCB7IFRhc2tzLCBUYXNrc1BhdGggfSBmcm9tIFwiLi90YXNrcy5qc1wiO1xuaW1wb3J0IHsgTG9naW5QYXRoLCBSZWdpc3RlclBhdGggfSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcblxubGV0IGNvbnRleHQgPSB7XG4gIHJvdXRlcjogbnVsbCxcbiAgbnVtYmVyOiAxMjMsXG59O1xuXG5jb25zdCBhcHBfcm91dGVyID0gcm91dGVyKFwiLmFwcFwiLCB7XG4gIFtMb2dpblBhdGhdOiBuZXcgTG9naW4oY29udGV4dCksXG4gIFtSZWdpc3RlclBhdGhdOiBuZXcgUmVnaXN0ZXIoY29udGV4dCksXG4gIFtUYXNrc1BhdGhdOiBuZXcgVGFza3MoY29udGV4dCksXG59KTtcblxuY29udGV4dC5yb3V0ZXIgPSBhcHBfcm91dGVyO1xuXG5tb3VudChcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLFxuICA8ZGl2XG4gICAgY2xhc3NOYW1lPVwiZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXIgYWxpZ24taXRlbXMtY2VudGVyXCJcbiAgICBzdHlsZT1cImhlaWdodDogMTAwdmg7XCJcbiAgPlxuICAgIHthcHBfcm91dGVyfVxuICA8L2Rpdj4sXG4pO1xuXG5hcHBfcm91dGVyLnVwZGF0ZShMb2dpblBhdGgpO1xuIl0sIm5hbWVzIjpbImNyZWF0ZUVsZW1lbnQiLCJxdWVyeSIsIm5zIiwidGFnIiwiaWQiLCJjbGFzc05hbWUiLCJwYXJzZSIsImVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImNodW5rcyIsInNwbGl0IiwiaSIsImxlbmd0aCIsInRyaW0iLCJodG1sIiwiYXJncyIsInR5cGUiLCJRdWVyeSIsIkVycm9yIiwicGFyc2VBcmd1bWVudHNJbnRlcm5hbCIsImdldEVsIiwiZWwiLCJleHRlbmQiLCJleHRlbmRIdG1sIiwiYmluZCIsInVubW91bnQiLCJwYXJlbnQiLCJfY2hpbGQiLCJjaGlsZCIsInBhcmVudEVsIiwiY2hpbGRFbCIsIl9fcmVkb21fdmlldyIsInBhcmVudE5vZGUiLCJkb1VubW91bnQiLCJyZW1vdmVDaGlsZCIsImhvb2tzIiwiX19yZWRvbV9saWZlY3ljbGUiLCJob29rc0FyZUVtcHR5IiwidHJhdmVyc2UiLCJfX3JlZG9tX21vdW50ZWQiLCJ0cmlnZ2VyIiwicGFyZW50SG9va3MiLCJob29rIiwia2V5IiwiaG9va05hbWVzIiwic2hhZG93Um9vdEF2YWlsYWJsZSIsIndpbmRvdyIsIm1vdW50IiwiYmVmb3JlIiwicmVwbGFjZSIsIndhc01vdW50ZWQiLCJvbGRQYXJlbnQiLCJiZWZvcmVFbCIsInJlcGxhY2VDaGlsZCIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwiZG9Nb3VudCIsImV2ZW50TmFtZSIsInZpZXciLCJob29rQ291bnQiLCJmaXJzdENoaWxkIiwibmV4dCIsIm5leHRTaWJsaW5nIiwicmVtb3VudCIsImhvb2tzRm91bmQiLCJob29rTmFtZSIsInRyaWdnZXJlZCIsIm5vZGVUeXBlIiwiTm9kZSIsIkRPQ1VNRU5UX05PREUiLCJTaGFkb3dSb290Iiwic2V0U3R5bGUiLCJhcmcxIiwiYXJnMiIsInNldFN0eWxlVmFsdWUiLCJ2YWx1ZSIsInN0eWxlIiwieGxpbmtucyIsInNldEF0dHJJbnRlcm5hbCIsImluaXRpYWwiLCJpc09iaiIsImlzU1ZHIiwiU1ZHRWxlbWVudCIsImlzRnVuYyIsInNldERhdGEiLCJzZXRYbGluayIsInNldENsYXNzTmFtZSIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsImFkZGl0aW9uVG9DbGFzc05hbWUiLCJjbGFzc0xpc3QiLCJhZGQiLCJiYXNlVmFsIiwic2V0QXR0cmlidXRlTlMiLCJyZW1vdmVBdHRyaWJ1dGVOUyIsImRhdGFzZXQiLCJ0ZXh0Iiwic3RyIiwiY3JlYXRlVGV4dE5vZGUiLCJhcmciLCJpc05vZGUiLCJlbnN1cmVFbCIsInNldENoaWxkcmVuIiwiY2hpbGRyZW4iLCJjdXJyZW50IiwiX2N1cnJlbnQiLCJjaGlsZEVscyIsIkFycmF5IiwiZXhpc3RzIiwiX19yZWRvbV9pbmRleCIsInJvdXRlciIsInZpZXdzIiwiaW5pdERhdGEiLCJSb3V0ZXIiLCJjb25zdHJ1Y3RvciIsIlZpZXdzIiwidXBkYXRlIiwicm91dGUiLCJkYXRhIiwiVmlldyIsIkxvZ2luUGF0aCIsIlJlZ2lzdGVyUGF0aCIsIkxvZ2luIiwiY29udGV4dCIsIl90aGlzIiwiX2NsYXNzQ2FsbENoZWNrIiwiX2RlZmluZVByb3BlcnR5IiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJ0YXJnZXQiLCJjb25zb2xlIiwibG9nIiwiX2l0ZXJhdG9yIiwiX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIiLCJlbnRyaWVzIiwiX3N0ZXAiLCJzIiwibiIsImRvbmUiLCJwYWlyIiwiZXJyIiwiZSIsImYiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsIm9uc3VibWl0IiwiaGFuZGxlU3VibWl0IiwicGxhY2Vob2xkZXIiLCJyb2xlIiwiaHJlZiIsIm9uY2xpY2siLCJoYW5kbGVSZWdpc3RlciIsIl9jcmVhdGVDbGFzcyIsIlJlZ2lzdGVyIiwiVGFza3NQYXRoIiwiVGFza3MiLCJudW1iZXIiLCJhcHBfcm91dGVyIiwiZ2V0RWxlbWVudEJ5SWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLGFBQWFBLENBQUNDLEtBQUssRUFBRUMsRUFBRSxFQUFFO0VBQ2hDLE1BQU07SUFBRUMsR0FBRztJQUFFQyxFQUFFO0FBQUVDLElBQUFBO0FBQVUsR0FBQyxHQUFHQyxLQUFLLENBQUNMLEtBQUssQ0FBQztBQUMzQyxFQUFBLE1BQU1NLE9BQU8sR0FBR0wsRUFBRSxHQUNkTSxRQUFRLENBQUNDLGVBQWUsQ0FBQ1AsRUFBRSxFQUFFQyxHQUFHLENBQUMsR0FDakNLLFFBQVEsQ0FBQ1IsYUFBYSxDQUFDRyxHQUFHLENBQUM7QUFFL0IsRUFBQSxJQUFJQyxFQUFFLEVBQUU7SUFDTkcsT0FBTyxDQUFDSCxFQUFFLEdBQUdBLEVBQUU7QUFDakI7QUFFQSxFQUFBLElBQUlDLFNBQVMsRUFBRTtBQUNiLElBRU87TUFDTEUsT0FBTyxDQUFDRixTQUFTLEdBQUdBLFNBQVM7QUFDL0I7QUFDRjtBQUVBLEVBQUEs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
