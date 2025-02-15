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
var TasksPath = "tasks";

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
      _this.context.router.update(TasksPath);
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
      _this.context.router.update(LoginPath);
    });
    _defineProperty(this, "handleRegister", function (event) {
      event.preventDefault();
      _this.context.router.update(LoginPath);
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
    }, "Register")), el("p", {
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

var Task = /*#__PURE__*/_createClass(function Task(name, end_date, urgency) {
  _classCallCheck(this, Task);
  this.uuid = crypto.randomUUID();
  this.name = name;
  this.end_date = end_date;
  this.urgency = urgency;
}); // TODO
var data = [new Task("Fix login bug", "2023-10-01", "High"), new Task("Update documentation", "2023-10-02", "Low"), new Task("Optimize database queries", "2023-10-03", "Medium"), new Task("Design new dashboard", "2023-10-04", "High"), new Task("Test API endpoints", "2023-10-05", "Medium")];
var Tasks = /*#__PURE__*/function () {
  function Tasks(context) {
    _classCallCheck(this, Tasks);
    this.context = context;
    this.render();
  }
  return _createClass(Tasks, [{
    key: "update",
    value: function update() {
      console.log(this.context);
      this.render();
    }
  }, {
    key: "generateRows",
    value: function generateRows() {
      return data.map(function (task) {
        return el("tr", null, el("td", null, task.name), el("td", null, task.end_date), el("td", null, task.urgency), el("td", null, el("i", {
          className: "bi bi-pencil"
        })), el("td", null, el("i", {
          className: "bi bi-trash"
        })));
      });
    }
  }, {
    key: "render",
    value: function render() {
      this.el = el("div", {
        className: "table-responsive"
      }, el("table", {
        className: "table table-bordered table-striped"
      }, el("thead", null, el("tr", null, el("th", null, "Task"), el("th", null, "Date"), el("th", null, "Severity"), el("th", null), el("th", null))), el("tbody", null, this.generateRows())));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NsaWVudC9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lcy5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvY29uc3RhbnRzLmpzIiwiLi4vLi4vLi4vY2xpZW50L3NyYy9sb2dpbi5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvcmVnaXN0ZXIuanMiLCIuLi8uLi8uLi9jbGllbnQvc3JjL3Rhc2tzLmpzIiwiLi4vLi4vLi4vY2xpZW50L3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHF1ZXJ5LCBucykge1xuICBjb25zdCB7IHRhZywgaWQsIGNsYXNzTmFtZSB9ID0gcGFyc2UocXVlcnkpO1xuICBjb25zdCBlbGVtZW50ID0gbnNcbiAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdGFnKVxuICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuXG4gIGlmIChpZCkge1xuICAgIGVsZW1lbnQuaWQgPSBpZDtcbiAgfVxuXG4gIGlmIChjbGFzc05hbWUpIHtcbiAgICBpZiAobnMpIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHF1ZXJ5KSB7XG4gIGNvbnN0IGNodW5rcyA9IHF1ZXJ5LnNwbGl0KC8oWy4jXSkvKTtcbiAgbGV0IGNsYXNzTmFtZSA9IFwiXCI7XG4gIGxldCBpZCA9IFwiXCI7XG5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaHVua3MubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBzd2l0Y2ggKGNodW5rc1tpXSkge1xuICAgICAgY2FzZSBcIi5cIjpcbiAgICAgICAgY2xhc3NOYW1lICs9IGAgJHtjaHVua3NbaSArIDFdfWA7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiI1wiOlxuICAgICAgICBpZCA9IGNodW5rc1tpICsgMV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGFzc05hbWU6IGNsYXNzTmFtZS50cmltKCksXG4gICAgdGFnOiBjaHVua3NbMF0gfHwgXCJkaXZcIixcbiAgICBpZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gaHRtbChxdWVyeSwgLi4uYXJncykge1xuICBsZXQgZWxlbWVudDtcblxuICBjb25zdCB0eXBlID0gdHlwZW9mIHF1ZXJ5O1xuXG4gIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQocXVlcnkpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGNvbnN0IFF1ZXJ5ID0gcXVlcnk7XG4gICAgZWxlbWVudCA9IG5ldyBRdWVyeSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgYXJndW1lbnQgcmVxdWlyZWRcIik7XG4gIH1cblxuICBwYXJzZUFyZ3VtZW50c0ludGVybmFsKGdldEVsKGVsZW1lbnQpLCBhcmdzLCB0cnVlKTtcblxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuY29uc3QgZWwgPSBodG1sO1xuY29uc3QgaCA9IGh0bWw7XG5cbmh0bWwuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kSHRtbCguLi5hcmdzKSB7XG4gIHJldHVybiBodG1sLmJpbmQodGhpcywgLi4uYXJncyk7XG59O1xuXG5mdW5jdGlvbiB1bm1vdW50KHBhcmVudCwgX2NoaWxkKSB7XG4gIGxldCBjaGlsZCA9IF9jaGlsZDtcbiAgY29uc3QgcGFyZW50RWwgPSBnZXRFbChwYXJlbnQpO1xuICBjb25zdCBjaGlsZEVsID0gZ2V0RWwoY2hpbGQpO1xuXG4gIGlmIChjaGlsZCA9PT0gY2hpbGRFbCAmJiBjaGlsZEVsLl9fcmVkb21fdmlldykge1xuICAgIC8vIHRyeSB0byBsb29rIHVwIHRoZSB2aWV3IGlmIG5vdCBwcm92aWRlZFxuICAgIGNoaWxkID0gY2hpbGRFbC5fX3JlZG9tX3ZpZXc7XG4gIH1cblxuICBpZiAoY2hpbGRFbC5wYXJlbnROb2RlKSB7XG4gICAgZG9Vbm1vdW50KGNoaWxkLCBjaGlsZEVsLCBwYXJlbnRFbCk7XG5cbiAgICBwYXJlbnRFbC5yZW1vdmVDaGlsZChjaGlsZEVsKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuZnVuY3Rpb24gZG9Vbm1vdW50KGNoaWxkLCBjaGlsZEVsLCBwYXJlbnRFbCkge1xuICBjb25zdCBob29rcyA9IGNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGU7XG5cbiAgaWYgKGhvb2tzQXJlRW1wdHkoaG9va3MpKSB7XG4gICAgY2hpbGRFbC5fX3JlZG9tX2xpZmVjeWNsZSA9IHt9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB0cmF2ZXJzZSA9IHBhcmVudEVsO1xuXG4gIGlmIChjaGlsZEVsLl9fcmVkb21fbW91bnRlZCkge1xuICAgIHRyaWdnZXIoY2hpbGRFbCwgXCJvbnVubW91bnRcIik7XG4gIH1cblxuICB3aGlsZSAodHJhdmVyc2UpIHtcbiAgICBjb25zdCBwYXJlbnRIb29rcyA9IHRyYXZlcnNlLl9fcmVkb21fbGlmZWN5Y2xlIHx8IHt9O1xuXG4gICAgZm9yIChjb25zdCBob29rIGluIGhvb2tzKSB7XG4gICAgICBpZiAocGFyZW50SG9va3NbaG9va10pIHtcbiAgICAgICAgcGFyZW50SG9va3NbaG9va10gLT0gaG9va3NbaG9va107XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhvb2tzQXJlRW1wdHkocGFyZW50SG9va3MpKSB7XG4gICAgICB0cmF2ZXJzZS5fX3JlZG9tX2xpZmVjeWNsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdHJhdmVyc2UgPSB0cmF2ZXJzZS5wYXJlbnROb2RlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhvb2tzQXJlRW1wdHkoaG9va3MpIHtcbiAgaWYgKGhvb2tzID09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBob29rcykge1xuICAgIGlmIChob29rc1trZXldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiBnbG9iYWwgTm9kZSwgU2hhZG93Um9vdCAqL1xuXG5cbmNvbnN0IGhvb2tOYW1lcyA9IFtcIm9ubW91bnRcIiwgXCJvbnJlbW91bnRcIiwgXCJvbnVubW91bnRcIl07XG5jb25zdCBzaGFkb3dSb290QXZhaWxhYmxlID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBcIlNoYWRvd1Jvb3RcIiBpbiB3aW5kb3c7XG5cbmZ1bmN0aW9uIG1vdW50KHBhcmVudCwgX2NoaWxkLCBiZWZvcmUsIHJlcGxhY2UpIHtcbiAgbGV0IGNoaWxkID0gX2NoaWxkO1xuICBjb25zdCBwYXJlbnRFbCA9IGdldEVsKHBhcmVudCk7XG4gIGNvbnN0IGNoaWxkRWwgPSBnZXRFbChjaGlsZCk7XG5cbiAgaWYgKGNoaWxkID09PSBjaGlsZEVsICYmIGNoaWxkRWwuX19yZWRvbV92aWV3KSB7XG4gICAgLy8gdHJ5IHRvIGxvb2sgdXAgdGhlIHZpZXcgaWYgbm90IHByb3ZpZGVkXG4gICAgY2hpbGQgPSBjaGlsZEVsLl9fcmVkb21fdmlldztcbiAgfVxuXG4gIGlmIChjaGlsZCAhPT0gY2hpbGRFbCkge1xuICAgIGNoaWxkRWwuX19yZWRvbV92aWV3ID0gY2hpbGQ7XG4gIH1cblxuICBjb25zdCB3YXNNb3VudGVkID0gY2hpbGRFbC5fX3JlZG9tX21vdW50ZWQ7XG4gIGNvbnN0IG9sZFBhcmVudCA9IGNoaWxkRWwucGFyZW50Tm9kZTtcblxuICBpZiAod2FzTW91bnRlZCAmJiBvbGRQYXJlbnQgIT09IHBhcmVudEVsKSB7XG4gICAgZG9Vbm1vdW50KGNoaWxkLCBjaGlsZEVsLCBvbGRQYXJlbnQpO1xuICB9XG5cbiAgaWYgKGJlZm9yZSAhPSBudWxsKSB7XG4gICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgIGNvbnN0IGJlZm9yZUVsID0gZ2V0RWwoYmVmb3JlKTtcblxuICAgICAgaWYgKGJlZm9yZUVsLl9fcmVkb21fbW91bnRlZCkge1xuICAgICAgICB0cmlnZ2VyKGJlZm9yZUVsLCBcIm9udW5tb3VudFwiKTtcbiAgICAgIH1cblxuICAgICAgcGFyZW50RWwucmVwbGFjZUNoaWxkKGNoaWxkRWwsIGJlZm9yZUVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50RWwuaW5zZXJ0QmVmb3JlKGNoaWxkRWwsIGdldEVsKGJlZm9yZSkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwYXJlbnRFbC5hcHBlbmRDaGlsZChjaGlsZEVsKTtcbiAgfVxuXG4gIGRvTW91bnQoY2hpbGQsIGNoaWxkRWwsIHBhcmVudEVsLCBvbGRQYXJlbnQpO1xuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuZnVuY3Rpb24gdHJpZ2dlcihlbCwgZXZlbnROYW1lKSB7XG4gIGlmIChldmVudE5hbWUgPT09IFwib25tb3VudFwiIHx8IGV2ZW50TmFtZSA9PT0gXCJvbnJlbW91bnRcIikge1xuICAgIGVsLl9fcmVkb21fbW91bnRlZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoZXZlbnROYW1lID09PSBcIm9udW5tb3VudFwiKSB7XG4gICAgZWwuX19yZWRvbV9tb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICBjb25zdCBob29rcyA9IGVsLl9fcmVkb21fbGlmZWN5Y2xlO1xuXG4gIGlmICghaG9va3MpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB2aWV3ID0gZWwuX19yZWRvbV92aWV3O1xuICBsZXQgaG9va0NvdW50ID0gMDtcblxuICB2aWV3Py5bZXZlbnROYW1lXT8uKCk7XG5cbiAgZm9yIChjb25zdCBob29rIGluIGhvb2tzKSB7XG4gICAgaWYgKGhvb2spIHtcbiAgICAgIGhvb2tDb3VudCsrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChob29rQ291bnQpIHtcbiAgICBsZXQgdHJhdmVyc2UgPSBlbC5maXJzdENoaWxkO1xuXG4gICAgd2hpbGUgKHRyYXZlcnNlKSB7XG4gICAgICBjb25zdCBuZXh0ID0gdHJhdmVyc2UubmV4dFNpYmxpbmc7XG5cbiAgICAgIHRyaWdnZXIodHJhdmVyc2UsIGV2ZW50TmFtZSk7XG5cbiAgICAgIHRyYXZlcnNlID0gbmV4dDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZG9Nb3VudChjaGlsZCwgY2hpbGRFbCwgcGFyZW50RWwsIG9sZFBhcmVudCkge1xuICBpZiAoIWNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGUpIHtcbiAgICBjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlID0ge307XG4gIH1cblxuICBjb25zdCBob29rcyA9IGNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGU7XG4gIGNvbnN0IHJlbW91bnQgPSBwYXJlbnRFbCA9PT0gb2xkUGFyZW50O1xuICBsZXQgaG9va3NGb3VuZCA9IGZhbHNlO1xuXG4gIGZvciAoY29uc3QgaG9va05hbWUgb2YgaG9va05hbWVzKSB7XG4gICAgaWYgKCFyZW1vdW50KSB7XG4gICAgICAvLyBpZiBhbHJlYWR5IG1vdW50ZWQsIHNraXAgdGhpcyBwaGFzZVxuICAgICAgaWYgKGNoaWxkICE9PSBjaGlsZEVsKSB7XG4gICAgICAgIC8vIG9ubHkgVmlld3MgY2FuIGhhdmUgbGlmZWN5Y2xlIGV2ZW50c1xuICAgICAgICBpZiAoaG9va05hbWUgaW4gY2hpbGQpIHtcbiAgICAgICAgICBob29rc1tob29rTmFtZV0gPSAoaG9va3NbaG9va05hbWVdIHx8IDApICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaG9va3NbaG9va05hbWVdKSB7XG4gICAgICBob29rc0ZvdW5kID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvb2tzRm91bmQpIHtcbiAgICBjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlID0ge307XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IHRyYXZlcnNlID0gcGFyZW50RWw7XG4gIGxldCB0cmlnZ2VyZWQgPSBmYWxzZTtcblxuICBpZiAocmVtb3VudCB8fCB0cmF2ZXJzZT8uX19yZWRvbV9tb3VudGVkKSB7XG4gICAgdHJpZ2dlcihjaGlsZEVsLCByZW1vdW50ID8gXCJvbnJlbW91bnRcIiA6IFwib25tb3VudFwiKTtcbiAgICB0cmlnZ2VyZWQgPSB0cnVlO1xuICB9XG5cbiAgd2hpbGUgKHRyYXZlcnNlKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdHJhdmVyc2UucGFyZW50Tm9kZTtcblxuICAgIGlmICghdHJhdmVyc2UuX19yZWRvbV9saWZlY3ljbGUpIHtcbiAgICAgIHRyYXZlcnNlLl9fcmVkb21fbGlmZWN5Y2xlID0ge307XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50SG9va3MgPSB0cmF2ZXJzZS5fX3JlZG9tX2xpZmVjeWNsZTtcblxuICAgIGZvciAoY29uc3QgaG9vayBpbiBob29rcykge1xuICAgICAgcGFyZW50SG9va3NbaG9va10gPSAocGFyZW50SG9va3NbaG9va10gfHwgMCkgKyBob29rc1tob29rXTtcbiAgICB9XG5cbiAgICBpZiAodHJpZ2dlcmVkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKFxuICAgICAgdHJhdmVyc2Uubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfTk9ERSB8fFxuICAgICAgKHNoYWRvd1Jvb3RBdmFpbGFibGUgJiYgdHJhdmVyc2UgaW5zdGFuY2VvZiBTaGFkb3dSb290KSB8fFxuICAgICAgcGFyZW50Py5fX3JlZG9tX21vdW50ZWRcbiAgICApIHtcbiAgICAgIHRyaWdnZXIodHJhdmVyc2UsIHJlbW91bnQgPyBcIm9ucmVtb3VudFwiIDogXCJvbm1vdW50XCIpO1xuICAgICAgdHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdHJhdmVyc2UgPSBwYXJlbnQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0U3R5bGUodmlldywgYXJnMSwgYXJnMikge1xuICBjb25zdCBlbCA9IGdldEVsKHZpZXcpO1xuXG4gIGlmICh0eXBlb2YgYXJnMSA9PT0gXCJvYmplY3RcIikge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGFyZzEpIHtcbiAgICAgIHNldFN0eWxlVmFsdWUoZWwsIGtleSwgYXJnMVtrZXldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2V0U3R5bGVWYWx1ZShlbCwgYXJnMSwgYXJnMik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0U3R5bGVWYWx1ZShlbCwga2V5LCB2YWx1ZSkge1xuICBlbC5zdHlsZVtrZXldID0gdmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTtcbn1cblxuLyogZ2xvYmFsIFNWR0VsZW1lbnQgKi9cblxuXG5jb25zdCB4bGlua25zID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCI7XG5cbmZ1bmN0aW9uIHNldEF0dHIodmlldywgYXJnMSwgYXJnMikge1xuICBzZXRBdHRySW50ZXJuYWwodmlldywgYXJnMSwgYXJnMik7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJJbnRlcm5hbCh2aWV3LCBhcmcxLCBhcmcyLCBpbml0aWFsKSB7XG4gIGNvbnN0IGVsID0gZ2V0RWwodmlldyk7XG5cbiAgY29uc3QgaXNPYmogPSB0eXBlb2YgYXJnMSA9PT0gXCJvYmplY3RcIjtcblxuICBpZiAoaXNPYmopIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhcmcxKSB7XG4gICAgICBzZXRBdHRySW50ZXJuYWwoZWwsIGtleSwgYXJnMVtrZXldLCBpbml0aWFsKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaXNTVkcgPSBlbCBpbnN0YW5jZW9mIFNWR0VsZW1lbnQ7XG4gICAgY29uc3QgaXNGdW5jID0gdHlwZW9mIGFyZzIgPT09IFwiZnVuY3Rpb25cIjtcblxuICAgIGlmIChhcmcxID09PSBcInN0eWxlXCIgJiYgdHlwZW9mIGFyZzIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHNldFN0eWxlKGVsLCBhcmcyKTtcbiAgICB9IGVsc2UgaWYgKGlzU1ZHICYmIGlzRnVuYykge1xuICAgICAgZWxbYXJnMV0gPSBhcmcyO1xuICAgIH0gZWxzZSBpZiAoYXJnMSA9PT0gXCJkYXRhc2V0XCIpIHtcbiAgICAgIHNldERhdGEoZWwsIGFyZzIpO1xuICAgIH0gZWxzZSBpZiAoIWlzU1ZHICYmIChhcmcxIGluIGVsIHx8IGlzRnVuYykgJiYgYXJnMSAhPT0gXCJsaXN0XCIpIHtcbiAgICAgIGVsW2FyZzFdID0gYXJnMjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzU1ZHICYmIGFyZzEgPT09IFwieGxpbmtcIikge1xuICAgICAgICBzZXRYbGluayhlbCwgYXJnMik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChpbml0aWFsICYmIGFyZzEgPT09IFwiY2xhc3NcIikge1xuICAgICAgICBzZXRDbGFzc05hbWUoZWwsIGFyZzIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYXJnMiA9PSBudWxsKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhcmcxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShhcmcxLCBhcmcyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0Q2xhc3NOYW1lKGVsLCBhZGRpdGlvblRvQ2xhc3NOYW1lKSB7XG4gIGlmIChhZGRpdGlvblRvQ2xhc3NOYW1lID09IG51bGwpIHtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoXCJjbGFzc1wiKTtcbiAgfSBlbHNlIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKGFkZGl0aW9uVG9DbGFzc05hbWUpO1xuICB9IGVsc2UgaWYgKFxuICAgIHR5cGVvZiBlbC5jbGFzc05hbWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICBlbC5jbGFzc05hbWUgJiZcbiAgICBlbC5jbGFzc05hbWUuYmFzZVZhbFxuICApIHtcbiAgICBlbC5jbGFzc05hbWUuYmFzZVZhbCA9XG4gICAgICBgJHtlbC5jbGFzc05hbWUuYmFzZVZhbH0gJHthZGRpdGlvblRvQ2xhc3NOYW1lfWAudHJpbSgpO1xuICB9IGVsc2Uge1xuICAgIGVsLmNsYXNzTmFtZSA9IGAke2VsLmNsYXNzTmFtZX0gJHthZGRpdGlvblRvQ2xhc3NOYW1lfWAudHJpbSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFhsaW5rKGVsLCBhcmcxLCBhcmcyKSB7XG4gIGlmICh0eXBlb2YgYXJnMSA9PT0gXCJvYmplY3RcIikge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGFyZzEpIHtcbiAgICAgIHNldFhsaW5rKGVsLCBrZXksIGFyZzFba2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChhcmcyICE9IG51bGwpIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rbnMsIGFyZzEsIGFyZzIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGVOUyh4bGlua25zLCBhcmcxLCBhcmcyKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0RGF0YShlbCwgYXJnMSwgYXJnMikge1xuICBpZiAodHlwZW9mIGFyZzEgPT09IFwib2JqZWN0XCIpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhcmcxKSB7XG4gICAgICBzZXREYXRhKGVsLCBrZXksIGFyZzFba2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChhcmcyICE9IG51bGwpIHtcbiAgICAgIGVsLmRhdGFzZXRbYXJnMV0gPSBhcmcyO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgZWwuZGF0YXNldFthcmcxXTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdGV4dChzdHIpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0ciAhPSBudWxsID8gc3RyIDogXCJcIik7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzSW50ZXJuYWwoZWxlbWVudCwgYXJncywgaW5pdGlhbCkge1xuICBmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG4gICAgaWYgKGFyZyAhPT0gMCAmJiAhYXJnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlID0gdHlwZW9mIGFyZztcblxuICAgIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGFyZyhlbGVtZW50KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIgfHwgdHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0KGFyZykpO1xuICAgIH0gZWxzZSBpZiAoaXNOb2RlKGdldEVsKGFyZykpKSB7XG4gICAgICBtb3VudChlbGVtZW50LCBhcmcpO1xuICAgIH0gZWxzZSBpZiAoYXJnLmxlbmd0aCkge1xuICAgICAgcGFyc2VBcmd1bWVudHNJbnRlcm5hbChlbGVtZW50LCBhcmcsIGluaXRpYWwpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgc2V0QXR0ckludGVybmFsKGVsZW1lbnQsIGFyZywgbnVsbCwgaW5pdGlhbCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGVuc3VyZUVsKHBhcmVudCkge1xuICByZXR1cm4gdHlwZW9mIHBhcmVudCA9PT0gXCJzdHJpbmdcIiA/IGh0bWwocGFyZW50KSA6IGdldEVsKHBhcmVudCk7XG59XG5cbmZ1bmN0aW9uIGdldEVsKHBhcmVudCkge1xuICByZXR1cm4gKFxuICAgIChwYXJlbnQubm9kZVR5cGUgJiYgcGFyZW50KSB8fCAoIXBhcmVudC5lbCAmJiBwYXJlbnQpIHx8IGdldEVsKHBhcmVudC5lbClcbiAgKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlKGFyZykge1xuICByZXR1cm4gYXJnPy5ub2RlVHlwZTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2goY2hpbGQsIGRhdGEsIGV2ZW50TmFtZSA9IFwicmVkb21cIikge1xuICBjb25zdCBjaGlsZEVsID0gZ2V0RWwoY2hpbGQpO1xuICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHsgYnViYmxlczogdHJ1ZSwgZGV0YWlsOiBkYXRhIH0pO1xuICBjaGlsZEVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBzZXRDaGlsZHJlbihwYXJlbnQsIC4uLmNoaWxkcmVuKSB7XG4gIGNvbnN0IHBhcmVudEVsID0gZ2V0RWwocGFyZW50KTtcbiAgbGV0IGN1cnJlbnQgPSB0cmF2ZXJzZShwYXJlbnQsIGNoaWxkcmVuLCBwYXJlbnRFbC5maXJzdENoaWxkKTtcblxuICB3aGlsZSAoY3VycmVudCkge1xuICAgIGNvbnN0IG5leHQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuXG4gICAgdW5tb3VudChwYXJlbnQsIGN1cnJlbnQpO1xuXG4gICAgY3VycmVudCA9IG5leHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHJhdmVyc2UocGFyZW50LCBjaGlsZHJlbiwgX2N1cnJlbnQpIHtcbiAgbGV0IGN1cnJlbnQgPSBfY3VycmVudDtcblxuICBjb25zdCBjaGlsZEVscyA9IEFycmF5KGNoaWxkcmVuLmxlbmd0aCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGNoaWxkRWxzW2ldID0gY2hpbGRyZW5baV0gJiYgZ2V0RWwoY2hpbGRyZW5baV0pO1xuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV07XG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZEVsID0gY2hpbGRFbHNbaV07XG5cbiAgICBpZiAoY2hpbGRFbCA9PT0gY3VycmVudCkge1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNOb2RlKGNoaWxkRWwpKSB7XG4gICAgICBjb25zdCBuZXh0ID0gY3VycmVudD8ubmV4dFNpYmxpbmc7XG4gICAgICBjb25zdCBleGlzdHMgPSBjaGlsZC5fX3JlZG9tX2luZGV4ICE9IG51bGw7XG4gICAgICBjb25zdCByZXBsYWNlID0gZXhpc3RzICYmIG5leHQgPT09IGNoaWxkRWxzW2kgKyAxXTtcblxuICAgICAgbW91bnQocGFyZW50LCBjaGlsZCwgY3VycmVudCwgcmVwbGFjZSk7XG5cbiAgICAgIGlmIChyZXBsYWNlKSB7XG4gICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGQubGVuZ3RoICE9IG51bGwpIHtcbiAgICAgIGN1cnJlbnQgPSB0cmF2ZXJzZShwYXJlbnQsIGNoaWxkLCBjdXJyZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3VycmVudDtcbn1cblxuZnVuY3Rpb24gbGlzdFBvb2woVmlldywga2V5LCBpbml0RGF0YSkge1xuICByZXR1cm4gbmV3IExpc3RQb29sKFZpZXcsIGtleSwgaW5pdERhdGEpO1xufVxuXG5jbGFzcyBMaXN0UG9vbCB7XG4gIGNvbnN0cnVjdG9yKFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgICB0aGlzLlZpZXcgPSBWaWV3O1xuICAgIHRoaXMuaW5pdERhdGEgPSBpbml0RGF0YTtcbiAgICB0aGlzLm9sZExvb2t1cCA9IHt9O1xuICAgIHRoaXMubG9va3VwID0ge307XG4gICAgdGhpcy5vbGRWaWV3cyA9IFtdO1xuICAgIHRoaXMudmlld3MgPSBbXTtcblxuICAgIGlmIChrZXkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5rZXkgPSB0eXBlb2Yga2V5ID09PSBcImZ1bmN0aW9uXCIgPyBrZXkgOiBwcm9wS2V5KGtleSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKGRhdGEsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IFZpZXcsIGtleSwgaW5pdERhdGEgfSA9IHRoaXM7XG4gICAgY29uc3Qga2V5U2V0ID0ga2V5ICE9IG51bGw7XG5cbiAgICBjb25zdCBvbGRMb29rdXAgPSB0aGlzLmxvb2t1cDtcbiAgICBjb25zdCBuZXdMb29rdXAgPSB7fTtcblxuICAgIGNvbnN0IG5ld1ZpZXdzID0gQXJyYXkoZGF0YS5sZW5ndGgpO1xuICAgIGNvbnN0IG9sZFZpZXdzID0gdGhpcy52aWV3cztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaXRlbSA9IGRhdGFbaV07XG4gICAgICBsZXQgdmlldztcblxuICAgICAgaWYgKGtleVNldCkge1xuICAgICAgICBjb25zdCBpZCA9IGtleShpdGVtKTtcblxuICAgICAgICB2aWV3ID0gb2xkTG9va3VwW2lkXSB8fCBuZXcgVmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSk7XG4gICAgICAgIG5ld0xvb2t1cFtpZF0gPSB2aWV3O1xuICAgICAgICB2aWV3Ll9fcmVkb21faWQgPSBpZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZpZXcgPSBvbGRWaWV3c1tpXSB8fCBuZXcgVmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSk7XG4gICAgICB9XG4gICAgICB2aWV3LnVwZGF0ZT8uKGl0ZW0sIGksIGRhdGEsIGNvbnRleHQpO1xuXG4gICAgICBjb25zdCBlbCA9IGdldEVsKHZpZXcuZWwpO1xuXG4gICAgICBlbC5fX3JlZG9tX3ZpZXcgPSB2aWV3O1xuICAgICAgbmV3Vmlld3NbaV0gPSB2aWV3O1xuICAgIH1cblxuICAgIHRoaXMub2xkVmlld3MgPSBvbGRWaWV3cztcbiAgICB0aGlzLnZpZXdzID0gbmV3Vmlld3M7XG5cbiAgICB0aGlzLm9sZExvb2t1cCA9IG9sZExvb2t1cDtcbiAgICB0aGlzLmxvb2t1cCA9IG5ld0xvb2t1cDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9wS2V5KGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24gcHJvcHBlZEtleShpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW1ba2V5XTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbGlzdChwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgcmV0dXJuIG5ldyBMaXN0KHBhcmVudCwgVmlldywga2V5LCBpbml0RGF0YSk7XG59XG5cbmNsYXNzIExpc3Qge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgICB0aGlzLlZpZXcgPSBWaWV3O1xuICAgIHRoaXMuaW5pdERhdGEgPSBpbml0RGF0YTtcbiAgICB0aGlzLnZpZXdzID0gW107XG4gICAgdGhpcy5wb29sID0gbmV3IExpc3RQb29sKFZpZXcsIGtleSwgaW5pdERhdGEpO1xuICAgIHRoaXMuZWwgPSBlbnN1cmVFbChwYXJlbnQpO1xuICAgIHRoaXMua2V5U2V0ID0ga2V5ICE9IG51bGw7XG4gIH1cblxuICB1cGRhdGUoZGF0YSwgY29udGV4dCkge1xuICAgIGNvbnN0IHsga2V5U2V0IH0gPSB0aGlzO1xuICAgIGNvbnN0IG9sZFZpZXdzID0gdGhpcy52aWV3cztcblxuICAgIHRoaXMucG9vbC51cGRhdGUoZGF0YSB8fCBbXSwgY29udGV4dCk7XG5cbiAgICBjb25zdCB7IHZpZXdzLCBsb29rdXAgfSA9IHRoaXMucG9vbDtcblxuICAgIGlmIChrZXlTZXQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2xkVmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgb2xkVmlldyA9IG9sZFZpZXdzW2ldO1xuICAgICAgICBjb25zdCBpZCA9IG9sZFZpZXcuX19yZWRvbV9pZDtcblxuICAgICAgICBpZiAobG9va3VwW2lkXSA9PSBudWxsKSB7XG4gICAgICAgICAgb2xkVmlldy5fX3JlZG9tX2luZGV4ID0gbnVsbDtcbiAgICAgICAgICB1bm1vdW50KHRoaXMsIG9sZFZpZXcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdmlldyA9IHZpZXdzW2ldO1xuXG4gICAgICB2aWV3Ll9fcmVkb21faW5kZXggPSBpO1xuICAgIH1cblxuICAgIHNldENoaWxkcmVuKHRoaXMsIHZpZXdzKTtcblxuICAgIGlmIChrZXlTZXQpIHtcbiAgICAgIHRoaXMubG9va3VwID0gbG9va3VwO1xuICAgIH1cbiAgICB0aGlzLnZpZXdzID0gdmlld3M7XG4gIH1cbn1cblxuTGlzdC5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmRMaXN0KHBhcmVudCwgVmlldywga2V5LCBpbml0RGF0YSkge1xuICByZXR1cm4gTGlzdC5iaW5kKExpc3QsIHBhcmVudCwgVmlldywga2V5LCBpbml0RGF0YSk7XG59O1xuXG5saXN0LmV4dGVuZCA9IExpc3QuZXh0ZW5kO1xuXG4vKiBnbG9iYWwgTm9kZSAqL1xuXG5cbmZ1bmN0aW9uIHBsYWNlKFZpZXcsIGluaXREYXRhKSB7XG4gIHJldHVybiBuZXcgUGxhY2UoVmlldywgaW5pdERhdGEpO1xufVxuXG5jbGFzcyBQbGFjZSB7XG4gIGNvbnN0cnVjdG9yKFZpZXcsIGluaXREYXRhKSB7XG4gICAgdGhpcy5lbCA9IHRleHQoXCJcIik7XG4gICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHRoaXMuZWw7XG5cbiAgICBpZiAoVmlldyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgIHRoaXMuX2VsID0gVmlldztcbiAgICB9IGVsc2UgaWYgKFZpZXcuZWwgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICB0aGlzLl9lbCA9IFZpZXc7XG4gICAgICB0aGlzLnZpZXcgPSBWaWV3O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9WaWV3ID0gVmlldztcbiAgICB9XG5cbiAgICB0aGlzLl9pbml0RGF0YSA9IGluaXREYXRhO1xuICB9XG5cbiAgdXBkYXRlKHZpc2libGUsIGRhdGEpIHtcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuX3BsYWNlaG9sZGVyO1xuICAgIGNvbnN0IHBhcmVudE5vZGUgPSB0aGlzLmVsLnBhcmVudE5vZGU7XG5cbiAgICBpZiAodmlzaWJsZSkge1xuICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VsKSB7XG4gICAgICAgICAgbW91bnQocGFyZW50Tm9kZSwgdGhpcy5fZWwsIHBsYWNlaG9sZGVyKTtcbiAgICAgICAgICB1bm1vdW50KHBhcmVudE5vZGUsIHBsYWNlaG9sZGVyKTtcblxuICAgICAgICAgIHRoaXMuZWwgPSBnZXRFbCh0aGlzLl9lbCk7XG4gICAgICAgICAgdGhpcy52aXNpYmxlID0gdmlzaWJsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBWaWV3ID0gdGhpcy5fVmlldztcbiAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IFZpZXcodGhpcy5faW5pdERhdGEpO1xuXG4gICAgICAgICAgdGhpcy5lbCA9IGdldEVsKHZpZXcpO1xuICAgICAgICAgIHRoaXMudmlldyA9IHZpZXc7XG5cbiAgICAgICAgICBtb3VudChwYXJlbnROb2RlLCB2aWV3LCBwbGFjZWhvbGRlcik7XG4gICAgICAgICAgdW5tb3VudChwYXJlbnROb2RlLCBwbGFjZWhvbGRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMudmlldz8udXBkYXRlPy4oZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VsKSB7XG4gICAgICAgICAgbW91bnQocGFyZW50Tm9kZSwgcGxhY2Vob2xkZXIsIHRoaXMuX2VsKTtcbiAgICAgICAgICB1bm1vdW50KHBhcmVudE5vZGUsIHRoaXMuX2VsKTtcblxuICAgICAgICAgIHRoaXMuZWwgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG1vdW50KHBhcmVudE5vZGUsIHBsYWNlaG9sZGVyLCB0aGlzLnZpZXcpO1xuICAgICAgICB1bm1vdW50KHBhcmVudE5vZGUsIHRoaXMudmlldyk7XG5cbiAgICAgICAgdGhpcy5lbCA9IHBsYWNlaG9sZGVyO1xuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlZihjdHgsIGtleSwgdmFsdWUpIHtcbiAgY3R4W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKiBnbG9iYWwgTm9kZSAqL1xuXG5cbmZ1bmN0aW9uIHJvdXRlcihwYXJlbnQsIHZpZXdzLCBpbml0RGF0YSkge1xuICByZXR1cm4gbmV3IFJvdXRlcihwYXJlbnQsIHZpZXdzLCBpbml0RGF0YSk7XG59XG5cbmNsYXNzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgdmlld3MsIGluaXREYXRhKSB7XG4gICAgdGhpcy5lbCA9IGVuc3VyZUVsKHBhcmVudCk7XG4gICAgdGhpcy52aWV3cyA9IHZpZXdzO1xuICAgIHRoaXMuVmlld3MgPSB2aWV3czsgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICB0aGlzLmluaXREYXRhID0gaW5pdERhdGE7XG4gIH1cblxuICB1cGRhdGUocm91dGUsIGRhdGEpIHtcbiAgICBpZiAocm91dGUgIT09IHRoaXMucm91dGUpIHtcbiAgICAgIGNvbnN0IHZpZXdzID0gdGhpcy52aWV3cztcbiAgICAgIGNvbnN0IFZpZXcgPSB2aWV3c1tyb3V0ZV07XG5cbiAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcblxuICAgICAgaWYgKFZpZXcgJiYgKFZpZXcgaW5zdGFuY2VvZiBOb2RlIHx8IFZpZXcuZWwgaW5zdGFuY2VvZiBOb2RlKSkge1xuICAgICAgICB0aGlzLnZpZXcgPSBWaWV3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52aWV3ID0gVmlldyAmJiBuZXcgVmlldyh0aGlzLmluaXREYXRhLCBkYXRhKTtcbiAgICAgIH1cblxuICAgICAgc2V0Q2hpbGRyZW4odGhpcy5lbCwgW3RoaXMudmlld10pO1xuICAgIH1cbiAgICB0aGlzLnZpZXc/LnVwZGF0ZT8uKGRhdGEsIHJvdXRlKTtcbiAgfVxufVxuXG5jb25zdCBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxuZnVuY3Rpb24gc3ZnKHF1ZXJ5LCAuLi5hcmdzKSB7XG4gIGxldCBlbGVtZW50O1xuXG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgcXVlcnk7XG5cbiAgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICBlbGVtZW50ID0gY3JlYXRlRWxlbWVudChxdWVyeSwgbnMpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGNvbnN0IFF1ZXJ5ID0gcXVlcnk7XG4gICAgZWxlbWVudCA9IG5ldyBRdWVyeSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgYXJndW1lbnQgcmVxdWlyZWRcIik7XG4gIH1cblxuICBwYXJzZUFyZ3VtZW50c0ludGVybmFsKGdldEVsKGVsZW1lbnQpLCBhcmdzLCB0cnVlKTtcblxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuY29uc3QgcyA9IHN2Zztcblxuc3ZnLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZFN2ZyguLi5hcmdzKSB7XG4gIHJldHVybiBzdmcuYmluZCh0aGlzLCAuLi5hcmdzKTtcbn07XG5cbnN2Zy5ucyA9IG5zO1xuXG5mdW5jdGlvbiB2aWV3RmFjdG9yeSh2aWV3cywga2V5KSB7XG4gIGlmICghdmlld3MgfHwgdHlwZW9mIHZpZXdzICE9PSBcIm9iamVjdFwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidmlld3MgbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gIH1cbiAgaWYgKCFrZXkgfHwgdHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IG5ldyBFcnJvcihcImtleSBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiBmYWN0b3J5Vmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSkge1xuICAgIGNvbnN0IHZpZXdLZXkgPSBpdGVtW2tleV07XG4gICAgY29uc3QgVmlldyA9IHZpZXdzW3ZpZXdLZXldO1xuXG4gICAgaWYgKFZpZXcpIHtcbiAgICAgIHJldHVybiBuZXcgVmlldyhpbml0RGF0YSwgaXRlbSwgaSwgZGF0YSk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGB2aWV3ICR7dmlld0tleX0gbm90IGZvdW5kYCk7XG4gIH07XG59XG5cbmV4cG9ydCB7IExpc3QsIExpc3RQb29sLCBQbGFjZSwgUm91dGVyLCBkaXNwYXRjaCwgZWwsIGgsIGh0bWwsIGxpc3QsIGxpc3RQb29sLCBtb3VudCwgcGxhY2UsIHJlZiwgcm91dGVyLCBzLCBzZXRBdHRyLCBzZXRDaGlsZHJlbiwgc2V0RGF0YSwgc2V0U3R5bGUsIHNldFhsaW5rLCBzdmcsIHRleHQsIHVubW91bnQsIHZpZXdGYWN0b3J5IH07XG4iLCJleHBvcnQgY29uc3QgTG9naW5QYXRoID0gXCJsb2dpblwiO1xuZXhwb3J0IGNvbnN0IFJlZ2lzdGVyUGF0aCA9IFwicmVnaXN0ZXJcIjtcbmV4cG9ydCBjb25zdCBUYXNrc1BhdGggPSBcInRhc2tzXCI7XG4iLCJpbXBvcnQgeyBlbCwgc2V0QXR0ciB9IGZyb20gXCIuLi9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lc1wiO1xuaW1wb3J0IHsgUmVnaXN0ZXJQYXRoLCBUYXNrc1BhdGggfSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcblxuZXhwb3J0IGNsYXNzIExvZ2luIHtcbiAgY29uc3RydWN0b3IoY29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5lbCA9IChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxmb3JtXG4gICAgICAgICAgaWQ9XCJmb3JtXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkLWZsZXggZmxleC1jb2x1bW4ganVzdGlmeS1jb250ZW50LWNlbnRlclwiXG4gICAgICAgICAgb25zdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fVxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiZW1haWxcIj5FbWFpbCBhZGRyZXNzPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2wgbWItMlwiXG4gICAgICAgICAgICAgIGlkPVwiZW1haWxcIlxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIGVtYWlsXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwicGFzc3dvcmRcIj5QYXNzd29yZDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sIG1iLTJcIlxuICAgICAgICAgICAgICBpZD1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBwYXNzd29yZFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJlcnJvclwiIGNsYXNzTmFtZT1cImFsZXJ0IGFsZXJ0LWRhbmdlciBwLTIgbWItMlwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgRXJyb3JcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5cbiAgICAgICAgICAgIExvZ2luXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbXQtMlwiPlxuICAgICAgICAgIDxhIGNsYXNzTmFtZT1cImxpbmstdW5kZXJsaW5lXCIgaHJlZj1cIlwiIG9uY2xpY2s9e3RoaXMuaGFuZGxlUmVnaXN0ZXJ9PlxuICAgICAgICAgICAgUmVnaXN0ZXJcbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KTtcbiAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XG4gICAgZm9yIChjb25zdCBwYWlyIG9mIGZvcm1EYXRhLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2cocGFpclswXSwgcGFpclsxXSk7XG4gICAgfVxuICAgIGNvbnN0IGRhdGEgPSBPYmplY3QuZnJvbUVudHJpZXMoZm9ybURhdGEuZW50cmllcygpKTtcblxuICAgIGNvbnNvbGUubG9nKFwiRm9ybSBEYXRhOlwiLCBkYXRhKTtcbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnVwZGF0ZShUYXNrc1BhdGgpO1xuICB9O1xuXG4gIGhhbmRsZVJlZ2lzdGVyID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnVwZGF0ZShSZWdpc3RlclBhdGgpO1xuICB9O1xuXG4gIHVwZGF0ZSgpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBlbCwgc2V0QXR0ciB9IGZyb20gXCIuLi9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lc1wiO1xuaW1wb3J0IHsgTG9naW5QYXRoIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBSZWdpc3RlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuZWwgPSAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8Zm9ybVxuICAgICAgICAgIGlkPVwiZm9ybVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZC1mbGV4IGZsZXgtY29sdW1uIGp1c3RpZnktY29udGVudC1jZW50ZXJcIlxuICAgICAgICAgIG9uc3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH1cbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cImVtYWlsXCI+RW1haWwgYWRkcmVzczwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sIG1iLTJcIlxuICAgICAgICAgICAgICBpZD1cImVtYWlsXCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBlbWFpbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cInBhc3N3b3JkXCI+UGFzc3dvcmQ8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbCBtYi0yXCJcbiAgICAgICAgICAgICAgaWQ9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgcGFzc3dvcmRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2wgbWItMlwiXG4gICAgICAgICAgICAgIGlkPVwicGFzc3dvcmQyXCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJSZXBlYXQgcGFzd29yZFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9XCJlcnJvclwiIGNsYXNzTmFtZT1cImFsZXJ0IGFsZXJ0LWRhbmdlciBwLTIgbWItMlwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgRXJyb3JcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5cbiAgICAgICAgICAgIFJlZ2lzdGVyXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbXQtMlwiPlxuICAgICAgICAgIDxhIGNsYXNzTmFtZT1cImxpbmstdW5kZXJsaW5lXCIgaHJlZj1cIlwiPlxuICAgICAgICAgICAgTG9naW5cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVTdWJtaXQgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KTtcbiAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XG4gICAgZm9yIChjb25zdCBwYWlyIG9mIGZvcm1EYXRhLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2cocGFpclswXSwgcGFpclsxXSk7XG4gICAgfVxuICAgIGNvbnN0IGRhdGEgPSBPYmplY3QuZnJvbUVudHJpZXMoZm9ybURhdGEuZW50cmllcygpKTtcblxuICAgIGNvbnNvbGUubG9nKFwiRm9ybSBEYXRhOlwiLCBkYXRhKTtcbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnVwZGF0ZShMb2dpblBhdGgpO1xuICB9O1xuXG4gIGhhbmRsZVJlZ2lzdGVyID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmNvbnRleHQucm91dGVyLnVwZGF0ZShMb2dpblBhdGgpO1xuICB9O1xuXG4gIHVwZGF0ZSgpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBlbCB9IGZyb20gXCIuLi9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lc1wiO1xuXG5jbGFzcyBUYXNrIHtcbiAgY29uc3RydWN0b3IobmFtZSwgZW5kX2RhdGUsIHVyZ2VuY3kpIHtcbiAgICB0aGlzLnV1aWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5lbmRfZGF0ZSA9IGVuZF9kYXRlO1xuICAgIHRoaXMudXJnZW5jeSA9IHVyZ2VuY3k7XG4gIH1cbn1cblxuLy8gVE9ET1xubGV0IGRhdGEgPSBbXG4gIG5ldyBUYXNrKFwiRml4IGxvZ2luIGJ1Z1wiLCBcIjIwMjMtMTAtMDFcIiwgXCJIaWdoXCIpLFxuICBuZXcgVGFzayhcIlVwZGF0ZSBkb2N1bWVudGF0aW9uXCIsIFwiMjAyMy0xMC0wMlwiLCBcIkxvd1wiKSxcbiAgbmV3IFRhc2soXCJPcHRpbWl6ZSBkYXRhYmFzZSBxdWVyaWVzXCIsIFwiMjAyMy0xMC0wM1wiLCBcIk1lZGl1bVwiKSxcbiAgbmV3IFRhc2soXCJEZXNpZ24gbmV3IGRhc2hib2FyZFwiLCBcIjIwMjMtMTAtMDRcIiwgXCJIaWdoXCIpLFxuICBuZXcgVGFzayhcIlRlc3QgQVBJIGVuZHBvaW50c1wiLCBcIjIwMjMtMTAtMDVcIiwgXCJNZWRpdW1cIiksXG5dO1xuXG5leHBvcnQgY2xhc3MgVGFza3Mge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuY29udGV4dCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIGdlbmVyYXRlUm93cygpIHtcbiAgICByZXR1cm4gZGF0YS5tYXAoKHRhc2spID0+IChcbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPnt0YXNrLm5hbWV9PC90ZD5cbiAgICAgICAgPHRkPnt0YXNrLmVuZF9kYXRlfTwvdGQ+XG4gICAgICAgIDx0ZD57dGFzay51cmdlbmN5fTwvdGQ+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJiaSBiaS1wZW5jaWxcIj48L2k+XG4gICAgICAgIDwvdGQ+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8aSBjbGFzc05hbWU9XCJiaSBiaS10cmFzaFwiPjwvaT5cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgKSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5lbCA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGFibGUtcmVzcG9uc2l2ZVwiPlxuICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtc3RyaXBlZFwiPlxuICAgICAgICAgIHt9XG4gICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGg+VGFzazwvdGg+XG4gICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cbiAgICAgICAgICAgICAgPHRoPlNldmVyaXR5PC90aD5cbiAgICAgICAgICAgICAgPHRoPjwvdGg+XG4gICAgICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgIDx0Ym9keT57dGhpcy5nZW5lcmF0ZVJvd3MoKX08L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgcm91dGVyLCBtb3VudCwgZWwgfSBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL3JlZG9tL2Rpc3QvcmVkb20uZXNcIjtcbmltcG9ydCB7IExvZ2luIH0gZnJvbSBcIi4vbG9naW4uanNcIjtcbmltcG9ydCB7IFJlZ2lzdGVyIH0gZnJvbSBcIi4vcmVnaXN0ZXIuanNcIjtcbmltcG9ydCB7IFRhc2tzIH0gZnJvbSBcIi4vdGFza3MuanNcIjtcbmltcG9ydCB7IExvZ2luUGF0aCwgUmVnaXN0ZXJQYXRoLCBUYXNrc1BhdGggfSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcblxubGV0IGNvbnRleHQgPSB7XG4gIHJvdXRlcjogbnVsbCxcbiAgbnVtYmVyOiAxMjMsXG59O1xuXG5jb25zdCBhcHBfcm91dGVyID0gcm91dGVyKFwiLmFwcFwiLCB7XG4gIFtMb2dpblBhdGhdOiBuZXcgTG9naW4oY29udGV4dCksXG4gIFtSZWdpc3RlclBhdGhdOiBuZXcgUmVnaXN0ZXIoY29udGV4dCksXG4gIFtUYXNrc1BhdGhdOiBuZXcgVGFza3MoY29udGV4dCksXG59KTtcblxuY29udGV4dC5yb3V0ZXIgPSBhcHBfcm91dGVyO1xuXG5tb3VudChcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLFxuICA8ZGl2XG4gICAgY2xhc3NOYW1lPVwiZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXIgYWxpZ24taXRlbXMtY2VudGVyXCJcbiAgICBzdHlsZT1cImhlaWdodDogMTAwdmg7XCJcbiAgPlxuICAgIHthcHBfcm91dGVyfVxuICA8L2Rpdj4sXG4pO1xuXG5hcHBfcm91dGVyLnVwZGF0ZShMb2dpblBhdGgpO1xuIl0sIm5hbWVzIjpbImNyZWF0ZUVsZW1lbnQiLCJxdWVyeSIsIm5zIiwidGFnIiwiaWQiLCJjbGFzc05hbWUiLCJwYXJzZSIsImVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImNodW5rcyIsInNwbGl0IiwiaSIsImxlbmd0aCIsInRyaW0iLCJodG1sIiwiYXJncyIsInR5cGUiLCJRdWVyeSIsIkVycm9yIiwicGFyc2VBcmd1bWVudHNJbnRlcm5hbCIsImdldEVsIiwiZWwiLCJleHRlbmQiLCJleHRlbmRIdG1sIiwiYmluZCIsInVubW91bnQiLCJwYXJlbnQiLCJfY2hpbGQiLCJjaGlsZCIsInBhcmVudEVsIiwiY2hpbGRFbCIsIl9fcmVkb21fdmlldyIsInBhcmVudE5vZGUiLCJkb1VubW91bnQiLCJyZW1vdmVDaGlsZCIsImhvb2tzIiwiX19yZWRvbV9saWZlY3ljbGUiLCJob29rc0FyZUVtcHR5IiwidHJhdmVyc2UiLCJfX3JlZG9tX21vdW50ZWQiLCJ0cmlnZ2VyIiwicGFyZW50SG9va3MiLCJob29rIiwia2V5IiwiaG9va05hbWVzIiwic2hhZG93Um9vdEF2YWlsYWJsZSIsIndpbmRvdyIsIm1vdW50IiwiYmVmb3JlIiwicmVwbGFjZSIsIndhc01vdW50ZWQiLCJvbGRQYXJlbnQiLCJiZWZvcmVFbCIsInJlcGxhY2VDaGlsZCIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwiZG9Nb3VudCIsImV2ZW50TmFtZSIsInZpZXciLCJob29rQ291bnQiLCJmaXJzdENoaWxkIiwibmV4dCIsIm5leHRTaWJsaW5nIiwicmVtb3VudCIsImhvb2tzRm91bmQiLCJob29rTmFtZSIsInRyaWdnZXJlZCIsIm5vZGVUeXBlIiwiTm9kZSIsIkRPQ1VNRU5UX05PREUiLCJTaGFkb3dSb290Iiwic2V0U3R5bGUiLCJhcmcxIiwiYXJnMiIsInNldFN0eWxlVmFsdWUiLCJ2YWx1ZSIsInN0eWxlIiwieGxpbmtucyIsInNldEF0dHJJbnRlcm5hbCIsImluaXRpYWwiLCJpc09iaiIsImlzU1ZHIiwiU1ZHRWxlbWVudCIsImlzRnVuYyIsInNldERhdGEiLCJzZXRYbGluayIsInNldENsYXNzTmFtZSIsInJlbW92ZUF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsImFkZGl0aW9uVG9DbGFzc05hbWUiLCJjbGFzc0xpc3QiLCJhZGQiLCJiYXNlVmFsIiwic2V0QXR0cmlidXRlTlMiLCJyZW1vdmVBdHRyaWJ1dGVOUyIsImRhdGFzZXQiLCJ0ZXh0Iiwic3RyIiwiY3JlYXRlVGV4dE5vZGUiLCJhcmciLCJpc05vZGUiLCJlbnN1cmVFbCIsInNldENoaWxkcmVuIiwiY2hpbGRyZW4iLCJjdXJyZW50IiwiX2N1cnJlbnQiLCJjaGlsZEVscyIsIkFycmF5IiwiZXhpc3RzIiwiX19yZWRvbV9pbmRleCIsInJvdXRlciIsInZpZXdzIiwiaW5pdERhdGEiLCJSb3V0ZXIiLCJjb25zdHJ1Y3RvciIsIlZpZXdzIiwidXBkYXRlIiwicm91dGUiLCJkYXRhIiwiVmlldyIsIkxvZ2luUGF0aCIsIlJlZ2lzdGVyUGF0aCIsIlRhc2tzUGF0aCIsIkxvZ2luIiwiY29udGV4dCIsIl90aGlzIiwiX2NsYXNzQ2FsbENoZWNrIiwiX2RlZmluZVByb3BlcnR5IiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJ0YXJnZXQiLCJjb25zb2xlIiwibG9nIiwiX2l0ZXJhdG9yIiwiX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIiLCJlbnRyaWVzIiwiX3N0ZXAiLCJzIiwibiIsImRvbmUiLCJwYWlyIiwiZXJyIiwiZSIsImYiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsIm9uc3VibWl0IiwiaGFuZGxlU3VibWl0IiwicGxhY2Vob2xkZXIiLCJyb2xlIiwiaHJlZiIsIm9uY2xpY2siLCJoYW5kbGVSZWdpc3RlciIsIl9jcmVhdGVDbGFzcyIsIlJlZ2lzdGVyIiwiVGFzayIsIm5hbWUiLCJlbmRfZGF0ZSIsInVyZ2VuY3kiLCJ1dWlkIiwiY3J5cHRvIiwicmFuZG9tVVVJRCIsIlRhc2tzIiwicmVuZGVyIiwiZ2VuZXJhdGVS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
