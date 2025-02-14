'use strict';

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
  parseArgumentsInternal(getEl(element), args, true);
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
function setAttr(view, arg1, arg2) {
  setAttrInternal(view, arg1, arg2);
}
function setAttrInternal(view, arg1, arg2, initial) {
  const el = getEl(view);
  const isObj = typeof arg1 === "object";
  if (isObj) {
    for (const key in arg1) {
      setAttrInternal(el, key, arg1[key], initial);
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
      if (initial && arg1 === "class") {
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
      parseArgumentsInternal(element, arg, initial);
    } else if (type === "object") {
      setAttrInternal(element, arg, null, initial);
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

var HomePath = "home";
var Home = /*#__PURE__*/function () {
  function Home(context) {
    var _this = this;
    _classCallCheck(this, Home);
    this.context = context;
    this.el = el("div", null, el("h1", null, "Welcome to the Home Page"), el("p", null, "This is the home page content."), el("p", {
      id: "number"
    }, "context.number ", this.context.number), el("button", {
      type: "button",
      "class": "btn",
      onclick: function onclick() {
        _this.context.number += 1;
        _this.update();
      }
    }, "Home"));
  }
  return _createClass(Home, [{
    key: "update",
    value: function update() {
      console.log(this.context);
      setAttr(this.el.querySelector("#number"), {
        textContent: "context.number ".concat(this.context.number)
      });
    }
  }]);
}();

var ContactPath = "contact";
var Contact = /*#__PURE__*/function () {
  function Contact() {
    _classCallCheck(this, Contact);
    this.el = el("div", null, el("h1", null, "Contact Us"), el("p", null, "This is the contact page content."));
  }
  return _createClass(Contact, [{
    key: "update",
    value: function update(context) {
      console.log(context);
    }
  }]);
}();

var AboutPath = "about";
var About = /*#__PURE__*/function () {
  function About() {
    _classCallCheck(this, About);
    this.el = el("div", null, el("h1", null, "About Us"), el("p", null, "This is the about page content."));
  }
  return _createClass(About, [{
    key: "update",
    value: function update(context) {
      console.log(context);
    }
  }]);
}();

var Header = /*#__PURE__*/_createClass(function Header(context) {
  _classCallCheck(this, Header);
  this.el = el("header", null, el("nav", null, el("button", {
    type: "button",
    "class": "btn",
    onclick: function onclick() {
      context.router.update(HomePath, context);
    }
  }, "Home"), el("button", {
    type: "button",
    "class": "btn",
    onclick: function onclick() {
      context.router.update(AboutPath, context);
    }
  }, "About"), el("button", {
    type: "button",
    "class": "btn",
    onclick: function onclick() {
      context.router.update(ContactPath, context);
    }
  }, "Contact")));
});

var context = {
  router: null,
  number: 123
};
var app_router = router(".app", _defineProperty(_defineProperty(_defineProperty({}, HomePath, new Home(context)), AboutPath, About), ContactPath, Contact));
context.router = app_router;
mount(document.getElementById("main"), new Header(context));
mount(document.getElementById("main"), app_router);
app_router.update(HomePath, context);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NsaWVudC9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lcy5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvaG9tZS5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvY29udGFjdC5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvYWJvdXQuanMiLCIuLi8uLi8uLi9jbGllbnQvc3JjL2hlYWRlci5qcyIsIi4uLy4uLy4uL2NsaWVudC9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY3JlYXRlRWxlbWVudChxdWVyeSwgbnMpIHtcbiAgY29uc3QgeyB0YWcsIGlkLCBjbGFzc05hbWUgfSA9IHBhcnNlKHF1ZXJ5KTtcbiAgY29uc3QgZWxlbWVudCA9IG5zXG4gICAgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHRhZylcbiAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcblxuICBpZiAoaWQpIHtcbiAgICBlbGVtZW50LmlkID0gaWQ7XG4gIH1cblxuICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgaWYgKG5zKSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5mdW5jdGlvbiBwYXJzZShxdWVyeSkge1xuICBjb25zdCBjaHVua3MgPSBxdWVyeS5zcGxpdCgvKFsuI10pLyk7XG4gIGxldCBjbGFzc05hbWUgPSBcIlwiO1xuICBsZXQgaWQgPSBcIlwiO1xuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgc3dpdGNoIChjaHVua3NbaV0pIHtcbiAgICAgIGNhc2UgXCIuXCI6XG4gICAgICAgIGNsYXNzTmFtZSArPSBgICR7Y2h1bmtzW2kgKyAxXX1gO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcIiNcIjpcbiAgICAgICAgaWQgPSBjaHVua3NbaSArIDFdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWUudHJpbSgpLFxuICAgIHRhZzogY2h1bmtzWzBdIHx8IFwiZGl2XCIsXG4gICAgaWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWwocXVlcnksIC4uLmFyZ3MpIHtcbiAgbGV0IGVsZW1lbnQ7XG5cbiAgY29uc3QgdHlwZSA9IHR5cGVvZiBxdWVyeTtcblxuICBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50KHF1ZXJ5KTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBjb25zdCBRdWVyeSA9IHF1ZXJ5O1xuICAgIGVsZW1lbnQgPSBuZXcgUXVlcnkoLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXQgbGVhc3Qgb25lIGFyZ3VtZW50IHJlcXVpcmVkXCIpO1xuICB9XG5cbiAgcGFyc2VBcmd1bWVudHNJbnRlcm5hbChnZXRFbChlbGVtZW50KSwgYXJncywgdHJ1ZSk7XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbmNvbnN0IGVsID0gaHRtbDtcbmNvbnN0IGggPSBodG1sO1xuXG5odG1sLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZEh0bWwoLi4uYXJncykge1xuICByZXR1cm4gaHRtbC5iaW5kKHRoaXMsIC4uLmFyZ3MpO1xufTtcblxuZnVuY3Rpb24gdW5tb3VudChwYXJlbnQsIF9jaGlsZCkge1xuICBsZXQgY2hpbGQgPSBfY2hpbGQ7XG4gIGNvbnN0IHBhcmVudEVsID0gZ2V0RWwocGFyZW50KTtcbiAgY29uc3QgY2hpbGRFbCA9IGdldEVsKGNoaWxkKTtcblxuICBpZiAoY2hpbGQgPT09IGNoaWxkRWwgJiYgY2hpbGRFbC5fX3JlZG9tX3ZpZXcpIHtcbiAgICAvLyB0cnkgdG8gbG9vayB1cCB0aGUgdmlldyBpZiBub3QgcHJvdmlkZWRcbiAgICBjaGlsZCA9IGNoaWxkRWwuX19yZWRvbV92aWV3O1xuICB9XG5cbiAgaWYgKGNoaWxkRWwucGFyZW50Tm9kZSkge1xuICAgIGRvVW5tb3VudChjaGlsZCwgY2hpbGRFbCwgcGFyZW50RWwpO1xuXG4gICAgcGFyZW50RWwucmVtb3ZlQ2hpbGQoY2hpbGRFbCk7XG4gIH1cblxuICByZXR1cm4gY2hpbGQ7XG59XG5cbmZ1bmN0aW9uIGRvVW5tb3VudChjaGlsZCwgY2hpbGRFbCwgcGFyZW50RWwpIHtcbiAgY29uc3QgaG9va3MgPSBjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlO1xuXG4gIGlmIChob29rc0FyZUVtcHR5KGhvb2tzKSkge1xuICAgIGNoaWxkRWwuX19yZWRvbV9saWZlY3ljbGUgPSB7fTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgdHJhdmVyc2UgPSBwYXJlbnRFbDtcblxuICBpZiAoY2hpbGRFbC5fX3JlZG9tX21vdW50ZWQpIHtcbiAgICB0cmlnZ2VyKGNoaWxkRWwsIFwib251bm1vdW50XCIpO1xuICB9XG5cbiAgd2hpbGUgKHRyYXZlcnNlKSB7XG4gICAgY29uc3QgcGFyZW50SG9va3MgPSB0cmF2ZXJzZS5fX3JlZG9tX2xpZmVjeWNsZSB8fCB7fTtcblxuICAgIGZvciAoY29uc3QgaG9vayBpbiBob29rcykge1xuICAgICAgaWYgKHBhcmVudEhvb2tzW2hvb2tdKSB7XG4gICAgICAgIHBhcmVudEhvb2tzW2hvb2tdIC09IGhvb2tzW2hvb2tdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChob29rc0FyZUVtcHR5KHBhcmVudEhvb2tzKSkge1xuICAgICAgdHJhdmVyc2UuX19yZWRvbV9saWZlY3ljbGUgPSBudWxsO1xuICAgIH1cblxuICAgIHRyYXZlcnNlID0gdHJhdmVyc2UucGFyZW50Tm9kZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBob29rc0FyZUVtcHR5KGhvb2tzKSB7XG4gIGlmIChob29rcyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gaG9va3MpIHtcbiAgICBpZiAoaG9va3Nba2V5XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyogZ2xvYmFsIE5vZGUsIFNoYWRvd1Jvb3QgKi9cblxuXG5jb25zdCBob29rTmFtZXMgPSBbXCJvbm1vdW50XCIsIFwib25yZW1vdW50XCIsIFwib251bm1vdW50XCJdO1xuY29uc3Qgc2hhZG93Um9vdEF2YWlsYWJsZSA9XG4gIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgXCJTaGFkb3dSb290XCIgaW4gd2luZG93O1xuXG5mdW5jdGlvbiBtb3VudChwYXJlbnQsIF9jaGlsZCwgYmVmb3JlLCByZXBsYWNlKSB7XG4gIGxldCBjaGlsZCA9IF9jaGlsZDtcbiAgY29uc3QgcGFyZW50RWwgPSBnZXRFbChwYXJlbnQpO1xuICBjb25zdCBjaGlsZEVsID0gZ2V0RWwoY2hpbGQpO1xuXG4gIGlmIChjaGlsZCA9PT0gY2hpbGRFbCAmJiBjaGlsZEVsLl9fcmVkb21fdmlldykge1xuICAgIC8vIHRyeSB0byBsb29rIHVwIHRoZSB2aWV3IGlmIG5vdCBwcm92aWRlZFxuICAgIGNoaWxkID0gY2hpbGRFbC5fX3JlZG9tX3ZpZXc7XG4gIH1cblxuICBpZiAoY2hpbGQgIT09IGNoaWxkRWwpIHtcbiAgICBjaGlsZEVsLl9fcmVkb21fdmlldyA9IGNoaWxkO1xuICB9XG5cbiAgY29uc3Qgd2FzTW91bnRlZCA9IGNoaWxkRWwuX19yZWRvbV9tb3VudGVkO1xuICBjb25zdCBvbGRQYXJlbnQgPSBjaGlsZEVsLnBhcmVudE5vZGU7XG5cbiAgaWYgKHdhc01vdW50ZWQgJiYgb2xkUGFyZW50ICE9PSBwYXJlbnRFbCkge1xuICAgIGRvVW5tb3VudChjaGlsZCwgY2hpbGRFbCwgb2xkUGFyZW50KTtcbiAgfVxuXG4gIGlmIChiZWZvcmUgIT0gbnVsbCkge1xuICAgIGlmIChyZXBsYWNlKSB7XG4gICAgICBjb25zdCBiZWZvcmVFbCA9IGdldEVsKGJlZm9yZSk7XG5cbiAgICAgIGlmIChiZWZvcmVFbC5fX3JlZG9tX21vdW50ZWQpIHtcbiAgICAgICAgdHJpZ2dlcihiZWZvcmVFbCwgXCJvbnVubW91bnRcIik7XG4gICAgICB9XG5cbiAgICAgIHBhcmVudEVsLnJlcGxhY2VDaGlsZChjaGlsZEVsLCBiZWZvcmVFbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEVsLmluc2VydEJlZm9yZShjaGlsZEVsLCBnZXRFbChiZWZvcmUpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50RWwuYXBwZW5kQ2hpbGQoY2hpbGRFbCk7XG4gIH1cblxuICBkb01vdW50KGNoaWxkLCBjaGlsZEVsLCBwYXJlbnRFbCwgb2xkUGFyZW50KTtcblxuICByZXR1cm4gY2hpbGQ7XG59XG5cbmZ1bmN0aW9uIHRyaWdnZXIoZWwsIGV2ZW50TmFtZSkge1xuICBpZiAoZXZlbnROYW1lID09PSBcIm9ubW91bnRcIiB8fCBldmVudE5hbWUgPT09IFwib25yZW1vdW50XCIpIHtcbiAgICBlbC5fX3JlZG9tX21vdW50ZWQgPSB0cnVlO1xuICB9IGVsc2UgaWYgKGV2ZW50TmFtZSA9PT0gXCJvbnVubW91bnRcIikge1xuICAgIGVsLl9fcmVkb21fbW91bnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgY29uc3QgaG9va3MgPSBlbC5fX3JlZG9tX2xpZmVjeWNsZTtcblxuICBpZiAoIWhvb2tzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdmlldyA9IGVsLl9fcmVkb21fdmlldztcbiAgbGV0IGhvb2tDb3VudCA9IDA7XG5cbiAgdmlldz8uW2V2ZW50TmFtZV0/LigpO1xuXG4gIGZvciAoY29uc3QgaG9vayBpbiBob29rcykge1xuICAgIGlmIChob29rKSB7XG4gICAgICBob29rQ291bnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAoaG9va0NvdW50KSB7XG4gICAgbGV0IHRyYXZlcnNlID0gZWwuZmlyc3RDaGlsZDtcblxuICAgIHdoaWxlICh0cmF2ZXJzZSkge1xuICAgICAgY29uc3QgbmV4dCA9IHRyYXZlcnNlLm5leHRTaWJsaW5nO1xuXG4gICAgICB0cmlnZ2VyKHRyYXZlcnNlLCBldmVudE5hbWUpO1xuXG4gICAgICB0cmF2ZXJzZSA9IG5leHQ7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRvTW91bnQoY2hpbGQsIGNoaWxkRWwsIHBhcmVudEVsLCBvbGRQYXJlbnQpIHtcbiAgaWYgKCFjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlKSB7XG4gICAgY2hpbGRFbC5fX3JlZG9tX2xpZmVjeWNsZSA9IHt9O1xuICB9XG5cbiAgY29uc3QgaG9va3MgPSBjaGlsZEVsLl9fcmVkb21fbGlmZWN5Y2xlO1xuICBjb25zdCByZW1vdW50ID0gcGFyZW50RWwgPT09IG9sZFBhcmVudDtcbiAgbGV0IGhvb2tzRm91bmQgPSBmYWxzZTtcblxuICBmb3IgKGNvbnN0IGhvb2tOYW1lIG9mIGhvb2tOYW1lcykge1xuICAgIGlmICghcmVtb3VudCkge1xuICAgICAgLy8gaWYgYWxyZWFkeSBtb3VudGVkLCBza2lwIHRoaXMgcGhhc2VcbiAgICAgIGlmIChjaGlsZCAhPT0gY2hpbGRFbCkge1xuICAgICAgICAvLyBvbmx5IFZpZXdzIGNhbiBoYXZlIGxpZmVjeWNsZSBldmVudHNcbiAgICAgICAgaWYgKGhvb2tOYW1lIGluIGNoaWxkKSB7XG4gICAgICAgICAgaG9va3NbaG9va05hbWVdID0gKGhvb2tzW2hvb2tOYW1lXSB8fCAwKSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGhvb2tzW2hvb2tOYW1lXSkge1xuICAgICAgaG9va3NGb3VuZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob29rc0ZvdW5kKSB7XG4gICAgY2hpbGRFbC5fX3JlZG9tX2xpZmVjeWNsZSA9IHt9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB0cmF2ZXJzZSA9IHBhcmVudEVsO1xuICBsZXQgdHJpZ2dlcmVkID0gZmFsc2U7XG5cbiAgaWYgKHJlbW91bnQgfHwgdHJhdmVyc2U/Ll9fcmVkb21fbW91bnRlZCkge1xuICAgIHRyaWdnZXIoY2hpbGRFbCwgcmVtb3VudCA/IFwib25yZW1vdW50XCIgOiBcIm9ubW91bnRcIik7XG4gICAgdHJpZ2dlcmVkID0gdHJ1ZTtcbiAgfVxuXG4gIHdoaWxlICh0cmF2ZXJzZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IHRyYXZlcnNlLnBhcmVudE5vZGU7XG5cbiAgICBpZiAoIXRyYXZlcnNlLl9fcmVkb21fbGlmZWN5Y2xlKSB7XG4gICAgICB0cmF2ZXJzZS5fX3JlZG9tX2xpZmVjeWNsZSA9IHt9O1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudEhvb2tzID0gdHJhdmVyc2UuX19yZWRvbV9saWZlY3ljbGU7XG5cbiAgICBmb3IgKGNvbnN0IGhvb2sgaW4gaG9va3MpIHtcbiAgICAgIHBhcmVudEhvb2tzW2hvb2tdID0gKHBhcmVudEhvb2tzW2hvb2tdIHx8IDApICsgaG9va3NbaG9va107XG4gICAgfVxuXG4gICAgaWYgKHRyaWdnZXJlZCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHRyYXZlcnNlLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX05PREUgfHxcbiAgICAgIChzaGFkb3dSb290QXZhaWxhYmxlICYmIHRyYXZlcnNlIGluc3RhbmNlb2YgU2hhZG93Um9vdCkgfHxcbiAgICAgIHBhcmVudD8uX19yZWRvbV9tb3VudGVkXG4gICAgKSB7XG4gICAgICB0cmlnZ2VyKHRyYXZlcnNlLCByZW1vdW50ID8gXCJvbnJlbW91bnRcIiA6IFwib25tb3VudFwiKTtcbiAgICAgIHRyaWdnZXJlZCA9IHRydWU7XG4gICAgfVxuICAgIHRyYXZlcnNlID0gcGFyZW50O1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFN0eWxlKHZpZXcsIGFyZzEsIGFyZzIpIHtcbiAgY29uc3QgZWwgPSBnZXRFbCh2aWV3KTtcblxuICBpZiAodHlwZW9mIGFyZzEgPT09IFwib2JqZWN0XCIpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhcmcxKSB7XG4gICAgICBzZXRTdHlsZVZhbHVlKGVsLCBrZXksIGFyZzFba2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHNldFN0eWxlVmFsdWUoZWwsIGFyZzEsIGFyZzIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFN0eWxlVmFsdWUoZWwsIGtleSwgdmFsdWUpIHtcbiAgZWwuc3R5bGVba2V5XSA9IHZhbHVlID09IG51bGwgPyBcIlwiIDogdmFsdWU7XG59XG5cbi8qIGdsb2JhbCBTVkdFbGVtZW50ICovXG5cblxuY29uc3QgeGxpbmtucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiO1xuXG5mdW5jdGlvbiBzZXRBdHRyKHZpZXcsIGFyZzEsIGFyZzIpIHtcbiAgc2V0QXR0ckludGVybmFsKHZpZXcsIGFyZzEsIGFyZzIpO1xufVxuXG5mdW5jdGlvbiBzZXRBdHRySW50ZXJuYWwodmlldywgYXJnMSwgYXJnMiwgaW5pdGlhbCkge1xuICBjb25zdCBlbCA9IGdldEVsKHZpZXcpO1xuXG4gIGNvbnN0IGlzT2JqID0gdHlwZW9mIGFyZzEgPT09IFwib2JqZWN0XCI7XG5cbiAgaWYgKGlzT2JqKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXJnMSkge1xuICAgICAgc2V0QXR0ckludGVybmFsKGVsLCBrZXksIGFyZzFba2V5XSwgaW5pdGlhbCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGlzU1ZHID0gZWwgaW5zdGFuY2VvZiBTVkdFbGVtZW50O1xuICAgIGNvbnN0IGlzRnVuYyA9IHR5cGVvZiBhcmcyID09PSBcImZ1bmN0aW9uXCI7XG5cbiAgICBpZiAoYXJnMSA9PT0gXCJzdHlsZVwiICYmIHR5cGVvZiBhcmcyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBzZXRTdHlsZShlbCwgYXJnMik7XG4gICAgfSBlbHNlIGlmIChpc1NWRyAmJiBpc0Z1bmMpIHtcbiAgICAgIGVsW2FyZzFdID0gYXJnMjtcbiAgICB9IGVsc2UgaWYgKGFyZzEgPT09IFwiZGF0YXNldFwiKSB7XG4gICAgICBzZXREYXRhKGVsLCBhcmcyKTtcbiAgICB9IGVsc2UgaWYgKCFpc1NWRyAmJiAoYXJnMSBpbiBlbCB8fCBpc0Z1bmMpICYmIGFyZzEgIT09IFwibGlzdFwiKSB7XG4gICAgICBlbFthcmcxXSA9IGFyZzI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1NWRyAmJiBhcmcxID09PSBcInhsaW5rXCIpIHtcbiAgICAgICAgc2V0WGxpbmsoZWwsIGFyZzIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoaW5pdGlhbCAmJiBhcmcxID09PSBcImNsYXNzXCIpIHtcbiAgICAgICAgc2V0Q2xhc3NOYW1lKGVsLCBhcmcyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGFyZzIgPT0gbnVsbCkge1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYXJnMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXJnMSwgYXJnMik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldENsYXNzTmFtZShlbCwgYWRkaXRpb25Ub0NsYXNzTmFtZSkge1xuICBpZiAoYWRkaXRpb25Ub0NsYXNzTmFtZSA9PSBudWxsKSB7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKFwiY2xhc3NcIik7XG4gIH0gZWxzZSBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgZWwuY2xhc3NMaXN0LmFkZChhZGRpdGlvblRvQ2xhc3NOYW1lKTtcbiAgfSBlbHNlIGlmIChcbiAgICB0eXBlb2YgZWwuY2xhc3NOYW1lID09PSBcIm9iamVjdFwiICYmXG4gICAgZWwuY2xhc3NOYW1lICYmXG4gICAgZWwuY2xhc3NOYW1lLmJhc2VWYWxcbiAgKSB7XG4gICAgZWwuY2xhc3NOYW1lLmJhc2VWYWwgPVxuICAgICAgYCR7ZWwuY2xhc3NOYW1lLmJhc2VWYWx9ICR7YWRkaXRpb25Ub0NsYXNzTmFtZX1gLnRyaW0oKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5jbGFzc05hbWUgPSBgJHtlbC5jbGFzc05hbWV9ICR7YWRkaXRpb25Ub0NsYXNzTmFtZX1gLnRyaW0oKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRYbGluayhlbCwgYXJnMSwgYXJnMikge1xuICBpZiAodHlwZW9mIGFyZzEgPT09IFwib2JqZWN0XCIpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhcmcxKSB7XG4gICAgICBzZXRYbGluayhlbCwga2V5LCBhcmcxW2tleV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYXJnMiAhPSBudWxsKSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGVOUyh4bGlua25zLCBhcmcxLCBhcmcyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlTlMoeGxpbmtucywgYXJnMSwgYXJnMik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldERhdGEoZWwsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKHR5cGVvZiBhcmcxID09PSBcIm9iamVjdFwiKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXJnMSkge1xuICAgICAgc2V0RGF0YShlbCwga2V5LCBhcmcxW2tleV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYXJnMiAhPSBudWxsKSB7XG4gICAgICBlbC5kYXRhc2V0W2FyZzFdID0gYXJnMjtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIGVsLmRhdGFzZXRbYXJnMV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRleHQoc3RyKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHIgIT0gbnVsbCA/IHN0ciA6IFwiXCIpO1xufVxuXG5mdW5jdGlvbiBwYXJzZUFyZ3VtZW50c0ludGVybmFsKGVsZW1lbnQsIGFyZ3MsIGluaXRpYWwpIHtcbiAgZm9yIChjb25zdCBhcmcgb2YgYXJncykge1xuICAgIGlmIChhcmcgIT09IDAgJiYgIWFyZykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZSA9IHR5cGVvZiBhcmc7XG5cbiAgICBpZiAodHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBhcmcoZWxlbWVudCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiIHx8IHR5cGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGV4dChhcmcpKTtcbiAgICB9IGVsc2UgaWYgKGlzTm9kZShnZXRFbChhcmcpKSkge1xuICAgICAgbW91bnQoZWxlbWVudCwgYXJnKTtcbiAgICB9IGVsc2UgaWYgKGFyZy5sZW5ndGgpIHtcbiAgICAgIHBhcnNlQXJndW1lbnRzSW50ZXJuYWwoZWxlbWVudCwgYXJnLCBpbml0aWFsKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHNldEF0dHJJbnRlcm5hbChlbGVtZW50LCBhcmcsIG51bGwsIGluaXRpYWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVFbChwYXJlbnQpIHtcbiAgcmV0dXJuIHR5cGVvZiBwYXJlbnQgPT09IFwic3RyaW5nXCIgPyBodG1sKHBhcmVudCkgOiBnZXRFbChwYXJlbnQpO1xufVxuXG5mdW5jdGlvbiBnZXRFbChwYXJlbnQpIHtcbiAgcmV0dXJuIChcbiAgICAocGFyZW50Lm5vZGVUeXBlICYmIHBhcmVudCkgfHwgKCFwYXJlbnQuZWwgJiYgcGFyZW50KSB8fCBnZXRFbChwYXJlbnQuZWwpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzTm9kZShhcmcpIHtcbiAgcmV0dXJuIGFyZz8ubm9kZVR5cGU7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKGNoaWxkLCBkYXRhLCBldmVudE5hbWUgPSBcInJlZG9tXCIpIHtcbiAgY29uc3QgY2hpbGRFbCA9IGdldEVsKGNoaWxkKTtcbiAgY29uc3QgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7IGJ1YmJsZXM6IHRydWUsIGRldGFpbDogZGF0YSB9KTtcbiAgY2hpbGRFbC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gc2V0Q2hpbGRyZW4ocGFyZW50LCAuLi5jaGlsZHJlbikge1xuICBjb25zdCBwYXJlbnRFbCA9IGdldEVsKHBhcmVudCk7XG4gIGxldCBjdXJyZW50ID0gdHJhdmVyc2UocGFyZW50LCBjaGlsZHJlbiwgcGFyZW50RWwuZmlyc3RDaGlsZCk7XG5cbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICBjb25zdCBuZXh0ID0gY3VycmVudC5uZXh0U2libGluZztcblxuICAgIHVubW91bnQocGFyZW50LCBjdXJyZW50KTtcblxuICAgIGN1cnJlbnQgPSBuZXh0O1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyYXZlcnNlKHBhcmVudCwgY2hpbGRyZW4sIF9jdXJyZW50KSB7XG4gIGxldCBjdXJyZW50ID0gX2N1cnJlbnQ7XG5cbiAgY29uc3QgY2hpbGRFbHMgPSBBcnJheShjaGlsZHJlbi5sZW5ndGgpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjaGlsZEVsc1tpXSA9IGNoaWxkcmVuW2ldICYmIGdldEVsKGNoaWxkcmVuW2ldKTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRFbCA9IGNoaWxkRWxzW2ldO1xuXG4gICAgaWYgKGNoaWxkRWwgPT09IGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGlzTm9kZShjaGlsZEVsKSkge1xuICAgICAgY29uc3QgbmV4dCA9IGN1cnJlbnQ/Lm5leHRTaWJsaW5nO1xuICAgICAgY29uc3QgZXhpc3RzID0gY2hpbGQuX19yZWRvbV9pbmRleCAhPSBudWxsO1xuICAgICAgY29uc3QgcmVwbGFjZSA9IGV4aXN0cyAmJiBuZXh0ID09PSBjaGlsZEVsc1tpICsgMV07XG5cbiAgICAgIG1vdW50KHBhcmVudCwgY2hpbGQsIGN1cnJlbnQsIHJlcGxhY2UpO1xuXG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICAgIH1cblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkLmxlbmd0aCAhPSBudWxsKSB7XG4gICAgICBjdXJyZW50ID0gdHJhdmVyc2UocGFyZW50LCBjaGlsZCwgY3VycmVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGN1cnJlbnQ7XG59XG5cbmZ1bmN0aW9uIGxpc3RQb29sKFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgcmV0dXJuIG5ldyBMaXN0UG9vbChWaWV3LCBrZXksIGluaXREYXRhKTtcbn1cblxuY2xhc3MgTGlzdFBvb2wge1xuICBjb25zdHJ1Y3RvcihWaWV3LCBrZXksIGluaXREYXRhKSB7XG4gICAgdGhpcy5WaWV3ID0gVmlldztcbiAgICB0aGlzLmluaXREYXRhID0gaW5pdERhdGE7XG4gICAgdGhpcy5vbGRMb29rdXAgPSB7fTtcbiAgICB0aGlzLmxvb2t1cCA9IHt9O1xuICAgIHRoaXMub2xkVmlld3MgPSBbXTtcbiAgICB0aGlzLnZpZXdzID0gW107XG5cbiAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgIHRoaXMua2V5ID0gdHlwZW9mIGtleSA9PT0gXCJmdW5jdGlvblwiID8ga2V5IDogcHJvcEtleShrZXkpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZShkYXRhLCBjb250ZXh0KSB7XG4gICAgY29uc3QgeyBWaWV3LCBrZXksIGluaXREYXRhIH0gPSB0aGlzO1xuICAgIGNvbnN0IGtleVNldCA9IGtleSAhPSBudWxsO1xuXG4gICAgY29uc3Qgb2xkTG9va3VwID0gdGhpcy5sb29rdXA7XG4gICAgY29uc3QgbmV3TG9va3VwID0ge307XG5cbiAgICBjb25zdCBuZXdWaWV3cyA9IEFycmF5KGRhdGEubGVuZ3RoKTtcbiAgICBjb25zdCBvbGRWaWV3cyA9IHRoaXMudmlld3M7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBkYXRhW2ldO1xuICAgICAgbGV0IHZpZXc7XG5cbiAgICAgIGlmIChrZXlTZXQpIHtcbiAgICAgICAgY29uc3QgaWQgPSBrZXkoaXRlbSk7XG5cbiAgICAgICAgdmlldyA9IG9sZExvb2t1cFtpZF0gfHwgbmV3IFZpZXcoaW5pdERhdGEsIGl0ZW0sIGksIGRhdGEpO1xuICAgICAgICBuZXdMb29rdXBbaWRdID0gdmlldztcbiAgICAgICAgdmlldy5fX3JlZG9tX2lkID0gaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2aWV3ID0gb2xkVmlld3NbaV0gfHwgbmV3IFZpZXcoaW5pdERhdGEsIGl0ZW0sIGksIGRhdGEpO1xuICAgICAgfVxuICAgICAgdmlldy51cGRhdGU/LihpdGVtLCBpLCBkYXRhLCBjb250ZXh0KTtcblxuICAgICAgY29uc3QgZWwgPSBnZXRFbCh2aWV3LmVsKTtcblxuICAgICAgZWwuX19yZWRvbV92aWV3ID0gdmlldztcbiAgICAgIG5ld1ZpZXdzW2ldID0gdmlldztcbiAgICB9XG5cbiAgICB0aGlzLm9sZFZpZXdzID0gb2xkVmlld3M7XG4gICAgdGhpcy52aWV3cyA9IG5ld1ZpZXdzO1xuXG4gICAgdGhpcy5vbGRMb29rdXAgPSBvbGRMb29rdXA7XG4gICAgdGhpcy5sb29rdXAgPSBuZXdMb29rdXA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvcEtleShrZXkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHByb3BwZWRLZXkoaXRlbSkge1xuICAgIHJldHVybiBpdGVtW2tleV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGxpc3QocGFyZW50LCBWaWV3LCBrZXksIGluaXREYXRhKSB7XG4gIHJldHVybiBuZXcgTGlzdChwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpO1xufVxuXG5jbGFzcyBMaXN0IHtcbiAgY29uc3RydWN0b3IocGFyZW50LCBWaWV3LCBrZXksIGluaXREYXRhKSB7XG4gICAgdGhpcy5WaWV3ID0gVmlldztcbiAgICB0aGlzLmluaXREYXRhID0gaW5pdERhdGE7XG4gICAgdGhpcy52aWV3cyA9IFtdO1xuICAgIHRoaXMucG9vbCA9IG5ldyBMaXN0UG9vbChWaWV3LCBrZXksIGluaXREYXRhKTtcbiAgICB0aGlzLmVsID0gZW5zdXJlRWwocGFyZW50KTtcbiAgICB0aGlzLmtleVNldCA9IGtleSAhPSBudWxsO1xuICB9XG5cbiAgdXBkYXRlKGRhdGEsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IGtleVNldCB9ID0gdGhpcztcbiAgICBjb25zdCBvbGRWaWV3cyA9IHRoaXMudmlld3M7XG5cbiAgICB0aGlzLnBvb2wudXBkYXRlKGRhdGEgfHwgW10sIGNvbnRleHQpO1xuXG4gICAgY29uc3QgeyB2aWV3cywgbG9va3VwIH0gPSB0aGlzLnBvb2w7XG5cbiAgICBpZiAoa2V5U2V0KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9sZFZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG9sZFZpZXcgPSBvbGRWaWV3c1tpXTtcbiAgICAgICAgY29uc3QgaWQgPSBvbGRWaWV3Ll9fcmVkb21faWQ7XG5cbiAgICAgICAgaWYgKGxvb2t1cFtpZF0gPT0gbnVsbCkge1xuICAgICAgICAgIG9sZFZpZXcuX19yZWRvbV9pbmRleCA9IG51bGw7XG4gICAgICAgICAgdW5tb3VudCh0aGlzLCBvbGRWaWV3KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB2aWV3c1tpXTtcblxuICAgICAgdmlldy5fX3JlZG9tX2luZGV4ID0gaTtcbiAgICB9XG5cbiAgICBzZXRDaGlsZHJlbih0aGlzLCB2aWV3cyk7XG5cbiAgICBpZiAoa2V5U2V0KSB7XG4gICAgICB0aGlzLmxvb2t1cCA9IGxvb2t1cDtcbiAgICB9XG4gICAgdGhpcy52aWV3cyA9IHZpZXdzO1xuICB9XG59XG5cbkxpc3QuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kTGlzdChwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpIHtcbiAgcmV0dXJuIExpc3QuYmluZChMaXN0LCBwYXJlbnQsIFZpZXcsIGtleSwgaW5pdERhdGEpO1xufTtcblxubGlzdC5leHRlbmQgPSBMaXN0LmV4dGVuZDtcblxuLyogZ2xvYmFsIE5vZGUgKi9cblxuXG5mdW5jdGlvbiBwbGFjZShWaWV3LCBpbml0RGF0YSkge1xuICByZXR1cm4gbmV3IFBsYWNlKFZpZXcsIGluaXREYXRhKTtcbn1cblxuY2xhc3MgUGxhY2Uge1xuICBjb25zdHJ1Y3RvcihWaWV3LCBpbml0RGF0YSkge1xuICAgIHRoaXMuZWwgPSB0ZXh0KFwiXCIpO1xuICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy5fcGxhY2Vob2xkZXIgPSB0aGlzLmVsO1xuXG4gICAgaWYgKFZpZXcgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICB0aGlzLl9lbCA9IFZpZXc7XG4gICAgfSBlbHNlIGlmIChWaWV3LmVsIGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgdGhpcy5fZWwgPSBWaWV3O1xuICAgICAgdGhpcy52aWV3ID0gVmlldztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fVmlldyA9IFZpZXc7XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdERhdGEgPSBpbml0RGF0YTtcbiAgfVxuXG4gIHVwZGF0ZSh2aXNpYmxlLCBkYXRhKSB7XG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLl9wbGFjZWhvbGRlcjtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gdGhpcy5lbC5wYXJlbnROb2RlO1xuXG4gICAgaWYgKHZpc2libGUpIHtcbiAgICAgIGlmICghdGhpcy52aXNpYmxlKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbCkge1xuICAgICAgICAgIG1vdW50KHBhcmVudE5vZGUsIHRoaXMuX2VsLCBwbGFjZWhvbGRlcik7XG4gICAgICAgICAgdW5tb3VudChwYXJlbnROb2RlLCBwbGFjZWhvbGRlcik7XG5cbiAgICAgICAgICB0aGlzLmVsID0gZ2V0RWwodGhpcy5fZWwpO1xuICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHZpc2libGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgVmlldyA9IHRoaXMuX1ZpZXc7XG4gICAgICAgICAgY29uc3QgdmlldyA9IG5ldyBWaWV3KHRoaXMuX2luaXREYXRhKTtcblxuICAgICAgICAgIHRoaXMuZWwgPSBnZXRFbCh2aWV3KTtcbiAgICAgICAgICB0aGlzLnZpZXcgPSB2aWV3O1xuXG4gICAgICAgICAgbW91bnQocGFyZW50Tm9kZSwgdmlldywgcGxhY2Vob2xkZXIpO1xuICAgICAgICAgIHVubW91bnQocGFyZW50Tm9kZSwgcGxhY2Vob2xkZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXc/LnVwZGF0ZT8uKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy52aXNpYmxlKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbCkge1xuICAgICAgICAgIG1vdW50KHBhcmVudE5vZGUsIHBsYWNlaG9sZGVyLCB0aGlzLl9lbCk7XG4gICAgICAgICAgdW5tb3VudChwYXJlbnROb2RlLCB0aGlzLl9lbCk7XG5cbiAgICAgICAgICB0aGlzLmVsID0gcGxhY2Vob2xkZXI7XG4gICAgICAgICAgdGhpcy52aXNpYmxlID0gdmlzaWJsZTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBtb3VudChwYXJlbnROb2RlLCBwbGFjZWhvbGRlciwgdGhpcy52aWV3KTtcbiAgICAgICAgdW5tb3VudChwYXJlbnROb2RlLCB0aGlzLnZpZXcpO1xuXG4gICAgICAgIHRoaXMuZWwgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy52aXNpYmxlID0gdmlzaWJsZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWYoY3R4LCBrZXksIHZhbHVlKSB7XG4gIGN0eFtrZXldID0gdmFsdWU7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyogZ2xvYmFsIE5vZGUgKi9cblxuXG5mdW5jdGlvbiByb3V0ZXIocGFyZW50LCB2aWV3cywgaW5pdERhdGEpIHtcbiAgcmV0dXJuIG5ldyBSb3V0ZXIocGFyZW50LCB2aWV3cywgaW5pdERhdGEpO1xufVxuXG5jbGFzcyBSb3V0ZXIge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIHZpZXdzLCBpbml0RGF0YSkge1xuICAgIHRoaXMuZWwgPSBlbnN1cmVFbChwYXJlbnQpO1xuICAgIHRoaXMudmlld3MgPSB2aWV3cztcbiAgICB0aGlzLlZpZXdzID0gdmlld3M7IC8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgdGhpcy5pbml0RGF0YSA9IGluaXREYXRhO1xuICB9XG5cbiAgdXBkYXRlKHJvdXRlLCBkYXRhKSB7XG4gICAgaWYgKHJvdXRlICE9PSB0aGlzLnJvdXRlKSB7XG4gICAgICBjb25zdCB2aWV3cyA9IHRoaXMudmlld3M7XG4gICAgICBjb25zdCBWaWV3ID0gdmlld3Nbcm91dGVdO1xuXG4gICAgICB0aGlzLnJvdXRlID0gcm91dGU7XG5cbiAgICAgIGlmIChWaWV3ICYmIChWaWV3IGluc3RhbmNlb2YgTm9kZSB8fCBWaWV3LmVsIGluc3RhbmNlb2YgTm9kZSkpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gVmlldztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmlldyA9IFZpZXcgJiYgbmV3IFZpZXcodGhpcy5pbml0RGF0YSwgZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHNldENoaWxkcmVuKHRoaXMuZWwsIFt0aGlzLnZpZXddKTtcbiAgICB9XG4gICAgdGhpcy52aWV3Py51cGRhdGU/LihkYXRhLCByb3V0ZSk7XG4gIH1cbn1cblxuY29uc3QgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG5cbmZ1bmN0aW9uIHN2ZyhxdWVyeSwgLi4uYXJncykge1xuICBsZXQgZWxlbWVudDtcblxuICBjb25zdCB0eXBlID0gdHlwZW9mIHF1ZXJ5O1xuXG4gIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQocXVlcnksIG5zKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBjb25zdCBRdWVyeSA9IHF1ZXJ5O1xuICAgIGVsZW1lbnQgPSBuZXcgUXVlcnkoLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXQgbGVhc3Qgb25lIGFyZ3VtZW50IHJlcXVpcmVkXCIpO1xuICB9XG5cbiAgcGFyc2VBcmd1bWVudHNJbnRlcm5hbChnZXRFbChlbGVtZW50KSwgYXJncywgdHJ1ZSk7XG5cbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbmNvbnN0IHMgPSBzdmc7XG5cbnN2Zy5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmRTdmcoLi4uYXJncykge1xuICByZXR1cm4gc3ZnLmJpbmQodGhpcywgLi4uYXJncyk7XG59O1xuXG5zdmcubnMgPSBucztcblxuZnVuY3Rpb24gdmlld0ZhY3Rvcnkodmlld3MsIGtleSkge1xuICBpZiAoIXZpZXdzIHx8IHR5cGVvZiB2aWV3cyAhPT0gXCJvYmplY3RcIikge1xuICAgIHRocm93IG5ldyBFcnJvcihcInZpZXdzIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xuICB9XG4gIGlmICgha2V5IHx8IHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJrZXkgbXVzdCBiZSBhIHN0cmluZ1wiKTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gZmFjdG9yeVZpZXcoaW5pdERhdGEsIGl0ZW0sIGksIGRhdGEpIHtcbiAgICBjb25zdCB2aWV3S2V5ID0gaXRlbVtrZXldO1xuICAgIGNvbnN0IFZpZXcgPSB2aWV3c1t2aWV3S2V5XTtcblxuICAgIGlmIChWaWV3KSB7XG4gICAgICByZXR1cm4gbmV3IFZpZXcoaW5pdERhdGEsIGl0ZW0sIGksIGRhdGEpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgdmlldyAke3ZpZXdLZXl9IG5vdCBmb3VuZGApO1xuICB9O1xufVxuXG5leHBvcnQgeyBMaXN0LCBMaXN0UG9vbCwgUGxhY2UsIFJvdXRlciwgZGlzcGF0Y2gsIGVsLCBoLCBodG1sLCBsaXN0LCBsaXN0UG9vbCwgbW91bnQsIHBsYWNlLCByZWYsIHJvdXRlciwgcywgc2V0QXR0ciwgc2V0Q2hpbGRyZW4sIHNldERhdGEsIHNldFN0eWxlLCBzZXRYbGluaywgc3ZnLCB0ZXh0LCB1bm1vdW50LCB2aWV3RmFjdG9yeSB9O1xuIiwiaW1wb3J0IHsgZWwsIHNldEF0dHIgfSBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL3JlZG9tL2Rpc3QvcmVkb20uZXNcIjtcblxuZXhwb3J0IGNvbnN0IEhvbWVQYXRoID0gXCJob21lXCI7XG5cbmV4cG9ydCBjbGFzcyBIb21lIHtcbiAgY29uc3RydWN0b3IoY29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5lbCA9IChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMT5XZWxjb21lIHRvIHRoZSBIb21lIFBhZ2U8L2gxPlxuICAgICAgICA8cD5UaGlzIGlzIHRoZSBob21lIHBhZ2UgY29udGVudC48L3A+XG4gICAgICAgIDxwIGlkPVwibnVtYmVyXCI+Y29udGV4dC5udW1iZXIge3RoaXMuY29udGV4dC5udW1iZXJ9PC9wPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3M9XCJidG5cIlxuICAgICAgICAgIG9uY2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5udW1iZXIgKz0gMTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIEhvbWVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuY29udGV4dCk7XG4gICAgc2V0QXR0cih0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoXCIjbnVtYmVyXCIpLCB7XG4gICAgICB0ZXh0Q29udGVudDogYGNvbnRleHQubnVtYmVyICR7dGhpcy5jb250ZXh0Lm51bWJlcn1gLFxuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgeyBlbCB9IGZyb20gXCIuLi9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lc1wiO1xuXG5leHBvcnQgY29uc3QgQ29udGFjdFBhdGggPSBcImNvbnRhY3RcIjtcblxuZXhwb3J0IGNsYXNzIENvbnRhY3Qge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVsID0gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPkNvbnRhY3QgVXM8L2gxPlxuICAgICAgICA8cD5UaGlzIGlzIHRoZSBjb250YWN0IHBhZ2UgY29udGVudC48L3A+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG4gIHVwZGF0ZShjb250ZXh0KSB7XG4gICAgY29uc29sZS5sb2coY29udGV4dCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IGVsIH0gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9yZWRvbS9kaXN0L3JlZG9tLmVzXCI7XG5cbmV4cG9ydCBjb25zdCBBYm91dFBhdGggPSBcImFib3V0XCI7XG5cbmV4cG9ydCBjbGFzcyBBYm91dCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZWwgPSAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDE+QWJvdXQgVXM8L2gxPlxuICAgICAgICA8cD5UaGlzIGlzIHRoZSBhYm91dCBwYWdlIGNvbnRlbnQuPC9wPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuICB1cGRhdGUoY29udGV4dCkge1xuICAgIGNvbnNvbGUubG9nKGNvbnRleHQpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBlbCB9IGZyb20gXCIuLi9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lc1wiO1xuaW1wb3J0IHsgSG9tZVBhdGggfSBmcm9tIFwiLi9ob21lLmpzXCI7XG5pbXBvcnQgeyBDb250YWN0UGF0aCB9IGZyb20gXCIuL2NvbnRhY3QuanNcIjtcbmltcG9ydCB7IEFib3V0UGF0aCB9IGZyb20gXCIuL2Fib3V0LmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBIZWFkZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0KSB7XG4gICAgdGhpcy5lbCA9IChcbiAgICAgIDxoZWFkZXI+XG4gICAgICAgIDxuYXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cImJ0blwiXG4gICAgICAgICAgICBvbmNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnRleHQucm91dGVyLnVwZGF0ZShIb21lUGF0aCwgY29udGV4dCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIEhvbWVcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzPVwiYnRuXCJcbiAgICAgICAgICAgIG9uY2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgY29udGV4dC5yb3V0ZXIudXBkYXRlKEFib3V0UGF0aCwgY29udGV4dCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIEFib3V0XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzcz1cImJ0blwiXG4gICAgICAgICAgICBvbmNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnRleHQucm91dGVyLnVwZGF0ZShDb250YWN0UGF0aCwgY29udGV4dCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIENvbnRhY3RcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9uYXY+XG4gICAgICA8L2hlYWRlcj5cbiAgICApO1xuICB9XG59XG4iLCJpbXBvcnQgeyByb3V0ZXIsIG1vdW50LCBlbCB9IGZyb20gXCIuLi9ub2RlX21vZHVsZXMvcmVkb20vZGlzdC9yZWRvbS5lc1wiO1xuaW1wb3J0IHsgSGVhZGVyIH0gZnJvbSBcIi4vaGVhZGVyLmpzXCI7XG5pbXBvcnQgeyBIb21lLCBIb21lUGF0aCB9IGZyb20gXCIuL2hvbWUuanNcIjtcbmltcG9ydCB7IEFib3V0LCBBYm91dFBhdGggfSBmcm9tIFwiLi9hYm91dC5qc1wiO1xuaW1wb3J0IHsgQ29udGFjdCwgQ29udGFjdFBhdGggfSBmcm9tIFwiLi9jb250YWN0LmpzXCI7XG5cbmxldCBjb250ZXh0ID0ge1xuICByb3V0ZXI6IG51bGwsXG4gIG51bWJlcjogMTIzLFxufTtcblxuY29uc3QgYXBwX3JvdXRlciA9IHJvdXRlcihcIi5hcHBcIiwge1xuICBbSG9tZVBhdGhdOiBuZXcgSG9tZShjb250ZXh0KSxcbiAgW0Fib3V0UGF0aF06IEFib3V0LFxuICBbQ29udGFjdFBhdGhdOiBDb250YWN0LFxufSk7XG5cbmNvbnRleHQucm91dGVyID0gYXBwX3JvdXRlcjtcblxubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpLCBuZXcgSGVhZGVyKGNvbnRleHQpKTtcbm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKSwgYXBwX3JvdXRlcik7XG5cbmFwcF9yb3V0ZXIudXBkYXRlKEhvbWVQYXRoLCBjb250ZXh0KTtcbiJdLCJuYW1lcyI6WyJjcmVhdGVFbGVtZW50IiwicXVlcnkiLCJucyIsInRhZyIsImlkIiwiY2xhc3NOYW1lIiwicGFyc2UiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJjaHVua3MiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJ0cmltIiwiaHRtbCIsImFyZ3MiLCJ0eXBlIiwiUXVlcnkiLCJFcnJvciIsInBhcnNlQXJndW1lbnRzSW50ZXJuYWwiLCJnZXRFbCIsImVsIiwiZXh0ZW5kIiwiZXh0ZW5kSHRtbCIsImJpbmQiLCJ1bm1vdW50IiwicGFyZW50IiwiX2NoaWxkIiwiY2hpbGQiLCJwYXJlbnRFbCIsImNoaWxkRWwiLCJfX3JlZG9tX3ZpZXciLCJwYXJlbnROb2RlIiwiZG9Vbm1vdW50IiwicmVtb3ZlQ2hpbGQiLCJob29rcyIsIl9fcmVkb21fbGlmZWN5Y2xlIiwiaG9va3NBcmVFbXB0eSIsInRyYXZlcnNlIiwiX19yZWRvbV9tb3VudGVkIiwidHJpZ2dlciIsInBhcmVudEhvb2tzIiwiaG9vayIsImtleSIsImhvb2tOYW1lcyIsInNoYWRvd1Jvb3RBdmFpbGFibGUiLCJ3aW5kb3ciLCJtb3VudCIsImJlZm9yZSIsInJlcGxhY2UiLCJ3YXNNb3VudGVkIiwib2xkUGFyZW50IiwiYmVmb3JlRWwiLCJyZXBsYWNlQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsImRvTW91bnQiLCJldmVudE5hbWUiLCJ2aWV3IiwiaG9va0NvdW50IiwiZmlyc3RDaGlsZCIsIm5leHQiLCJuZXh0U2libGluZyIsInJlbW91bnQiLCJob29rc0ZvdW5kIiwiaG9va05hbWUiLCJ0cmlnZ2VyZWQiLCJub2RlVHlwZSIsIk5vZGUiLCJET0NVTUVOVF9OT0RFIiwiU2hhZG93Um9vdCIsInNldFN0eWxlIiwiYXJnMSIsImFyZzIiLCJzZXRTdHlsZVZhbHVlIiwidmFsdWUiLCJzdHlsZSIsInhsaW5rbnMiLCJzZXRBdHRyIiwic2V0QXR0ckludGVybmFsIiwiaW5pdGlhbCIsImlzT2JqIiwiaXNTVkciLCJTVkdFbGVtZW50IiwiaXNGdW5jIiwic2V0RGF0YSIsInNldFhsaW5rIiwic2V0Q2xhc3NOYW1lIiwicmVtb3ZlQXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiYWRkaXRpb25Ub0NsYXNzTmFtZSIsImNsYXNzTGlzdCIsImFkZCIsImJhc2VWYWwiLCJzZXRBdHRyaWJ1dGVOUyIsInJlbW92ZUF0dHJpYnV0ZU5TIiwiZGF0YXNldCIsInRleHQiLCJzdHIiLCJjcmVhdGVUZXh0Tm9kZSIsImFyZyIsImlzTm9kZSIsImVuc3VyZUVsIiwic2V0Q2hpbGRyZW4iLCJjaGlsZHJlbiIsImN1cnJlbnQiLCJfY3VycmVudCIsImNoaWxkRWxzIiwiQXJyYXkiLCJleGlzdHMiLCJfX3JlZG9tX2luZGV4Iiwicm91dGVyIiwidmlld3MiLCJpbml0RGF0YSIsIlJvdXRlciIsImNvbnN0cnVjdG9yIiwiVmlld3MiLCJ1cGRhdGUiLCJyb3V0ZSIsImRhdGEiLCJWaWV3IiwiSG9tZVBhdGgiLCJIb21lIiwiY29udGV4dCIsIl90aGlzIiwiX2NsYXNzQ2FsbENoZWNrIiwibnVtYmVyIiwib25jbGljayIsIl9jcmVhdGVDbGFzcyIsImNvbnNvbGUiLCJsb2ciLCJxdWVyeVNlbGVjdG9yIiwidGV4dENvbnRlbnQiLCJjb25jYXQiLCJDb250YWN0UGF0aCIsIkNvbnRhY3QiLCJBYm91dFBhdGgiLCJBYm91dCIsIkhlYWRlciIsImFwcF9yb3V0ZXIiLCJfZGVmaW5lUHJvcGVydHkiLCJnZXRFbGVtZW50QnlJZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsYUFBYUEsQ0FBQ0MsS0FBSyxFQUFFQyxFQUFFLEVBQUU7RUFDaEMsTUFB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
