/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, Ue = te.ShadowRoot && (te.ShadyCSS === void 0 || te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ze = Symbol(), us = /* @__PURE__ */ new WeakMap();
let Ds = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== ze) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Ue && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = us.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && us.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ni = (i) => new Ds(typeof i == "string" ? i : i + "", void 0, ze), pt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, o, n) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[n + 1], i[0]);
  return new Ds(e, i, ze);
}, ai = (i, t) => {
  if (Ue) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), o = te.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = e.cssText, i.appendChild(s);
  }
}, ds = Ue ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return ni(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: li, defineProperty: ci, getOwnPropertyDescriptor: pi, getOwnPropertyNames: hi, getOwnPropertySymbols: ui, getPrototypeOf: di } = Object, Z = globalThis, fs = Z.trustedTypes, fi = fs ? fs.emptyScript : "", xe = Z.reactiveElementPolyfillSupport, Lt = (i, t) => i, se = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? fi : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, He = (i, t) => !li(i, t), ms = { attribute: !0, type: String, converter: se, reflect: !1, useDefault: !1, hasChanged: He };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Z.litPropertyMetadata ?? (Z.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let vt = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ms) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(t, s, e);
      o !== void 0 && ci(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: o, set: n } = pi(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: o, set(a) {
      const u = o == null ? void 0 : o.call(this);
      n == null || n.call(this, a), this.requestUpdate(t, u, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ms;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Lt("elementProperties"))) return;
    const t = di(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Lt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Lt("properties"))) {
      const e = this.properties, s = [...hi(e), ...ui(e)];
      for (const o of s) this.createProperty(o, e[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, o] of e) this.elementProperties.set(s, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const o = this._$Eu(e, s);
      o !== void 0 && this._$Eh.set(o, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const o of s) e.unshift(ds(o));
    } else t !== void 0 && e.push(ds(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ai(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var n;
    const s = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, s);
    if (o !== void 0 && s.reflect === !0) {
      const a = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : se).toAttribute(e, s.type);
      this._$Em = t, a == null ? this.removeAttribute(o) : this.setAttribute(o, a), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, a;
    const s = this.constructor, o = s._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const u = s.getPropertyOptions(o), p = typeof u.converter == "function" ? { fromAttribute: u.converter } : ((n = u.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? u.converter : se;
      this._$Em = o;
      const f = p.fromAttribute(e, u.type);
      this[o] = f ?? ((a = this._$Ej) == null ? void 0 : a.get(o)) ?? f, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, o = !1, n) {
    var a;
    if (t !== void 0) {
      const u = this.constructor;
      if (o === !1 && (n = this[t]), s ?? (s = u.getPropertyOptions(t)), !((s.hasChanged ?? He)(n, e) || s.useDefault && s.reflect && n === ((a = this._$Ej) == null ? void 0 : a.get(t)) && !this.hasAttribute(u._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: o, wrapped: n }, a) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), n !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), o === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, a] of this._$Ep) this[n] = a;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [n, a] of o) {
        const { wrapped: u } = a, p = this[n];
        u !== !0 || this._$AL.has(n) || p === void 0 || this.C(n, void 0, a, p);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((o) => {
        var n;
        return (n = o.hostUpdate) == null ? void 0 : n.call(o);
      }), this.update(e)) : this._$EM();
    } catch (o) {
      throw t = !1, this._$EM(), o;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var o;
      return (o = s.hostUpdated) == null ? void 0 : o.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
vt.elementStyles = [], vt.shadowRootOptions = { mode: "open" }, vt[Lt("elementProperties")] = /* @__PURE__ */ new Map(), vt[Lt("finalized")] = /* @__PURE__ */ new Map(), xe == null || xe({ ReactiveElement: vt }), (Z.reactiveElementVersions ?? (Z.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ut = globalThis, gs = (i) => i, ie = Ut.trustedTypes, bs = ie ? ie.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Ms = "$lit$", J = `lit$${Math.random().toFixed(9).slice(2)}$`, Ns = "?" + J, mi = `<${Ns}>`, lt = document, zt = () => lt.createComment(""), Ht = (i) => i === null || typeof i != "object" && typeof i != "function", Fe = Array.isArray, gi = (i) => Fe(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", Te = `[ 	
\f\r]`, kt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ys = /-->/g, _s = />/g, rt = RegExp(`>|${Te}(?:([^\\s"'>=/]+)(${Te}*=${Te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), vs = /'/g, ws = /"/g, Ls = /^(?:script|style|textarea|title)$/i, bi = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), g = bi(1), ct = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), As = /* @__PURE__ */ new WeakMap(), nt = lt.createTreeWalker(lt, 129);
function Us(i, t) {
  if (!Fe(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return bs !== void 0 ? bs.createHTML(t) : t;
}
const yi = (i, t) => {
  const e = i.length - 1, s = [];
  let o, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = kt;
  for (let u = 0; u < e; u++) {
    const p = i[u];
    let f, _, m = -1, C = 0;
    for (; C < p.length && (a.lastIndex = C, _ = a.exec(p), _ !== null); ) C = a.lastIndex, a === kt ? _[1] === "!--" ? a = ys : _[1] !== void 0 ? a = _s : _[2] !== void 0 ? (Ls.test(_[2]) && (o = RegExp("</" + _[2], "g")), a = rt) : _[3] !== void 0 && (a = rt) : a === rt ? _[0] === ">" ? (a = o ?? kt, m = -1) : _[1] === void 0 ? m = -2 : (m = a.lastIndex - _[2].length, f = _[1], a = _[3] === void 0 ? rt : _[3] === '"' ? ws : vs) : a === ws || a === vs ? a = rt : a === ys || a === _s ? a = kt : (a = rt, o = void 0);
    const O = a === rt && i[u + 1].startsWith("/>") ? " " : "";
    n += a === kt ? p + mi : m >= 0 ? (s.push(f), p.slice(0, m) + Ms + p.slice(m) + J + O) : p + J + (m === -2 ? u : O);
  }
  return [Us(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Ft {
  constructor({ strings: t, _$litType$: e }, s) {
    let o;
    this.parts = [];
    let n = 0, a = 0;
    const u = t.length - 1, p = this.parts, [f, _] = yi(t, e);
    if (this.el = Ft.createElement(f, s), nt.currentNode = this.el.content, e === 2 || e === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (o = nt.nextNode()) !== null && p.length < u; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const m of o.getAttributeNames()) if (m.endsWith(Ms)) {
          const C = _[a++], O = o.getAttribute(m).split(J), H = /([.?@])?(.*)/.exec(C);
          p.push({ type: 1, index: n, name: H[2], strings: O, ctor: H[1] === "." ? vi : H[1] === "?" ? wi : H[1] === "@" ? Ai : oe }), o.removeAttribute(m);
        } else m.startsWith(J) && (p.push({ type: 6, index: n }), o.removeAttribute(m));
        if (Ls.test(o.tagName)) {
          const m = o.textContent.split(J), C = m.length - 1;
          if (C > 0) {
            o.textContent = ie ? ie.emptyScript : "";
            for (let O = 0; O < C; O++) o.append(m[O], zt()), nt.nextNode(), p.push({ type: 2, index: ++n });
            o.append(m[C], zt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Ns) p.push({ type: 2, index: n });
      else {
        let m = -1;
        for (; (m = o.data.indexOf(J, m + 1)) !== -1; ) p.push({ type: 7, index: n }), m += J.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = lt.createElement("template");
    return s.innerHTML = t, s;
  }
}
function wt(i, t, e = i, s) {
  var a, u;
  if (t === ct) return t;
  let o = s !== void 0 ? (a = e._$Co) == null ? void 0 : a[s] : e._$Cl;
  const n = Ht(t) ? void 0 : t._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== n && ((u = o == null ? void 0 : o._$AO) == null || u.call(o, !1), n === void 0 ? o = void 0 : (o = new n(i), o._$AT(i, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = o : e._$Cl = o), o !== void 0 && (t = wt(i, o._$AS(i, t.values), o, s)), t;
}
class _i {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, o = ((t == null ? void 0 : t.creationScope) ?? lt).importNode(e, !0);
    nt.currentNode = o;
    let n = nt.nextNode(), a = 0, u = 0, p = s[0];
    for (; p !== void 0; ) {
      if (a === p.index) {
        let f;
        p.type === 2 ? f = new Bt(n, n.nextSibling, this, t) : p.type === 1 ? f = new p.ctor(n, p.name, p.strings, this, t) : p.type === 6 && (f = new Ei(n, this, t)), this._$AV.push(f), p = s[++u];
      }
      a !== (p == null ? void 0 : p.index) && (n = nt.nextNode(), a++);
    }
    return nt.currentNode = lt, o;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class Bt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, o) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = o, this._$Cv = (o == null ? void 0 : o.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = wt(this, t, e), Ht(t) ? t === A || t == null || t === "" ? (this._$AH !== A && this._$AR(), this._$AH = A) : t !== this._$AH && t !== ct && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : gi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== A && Ht(this._$AH) ? this._$AA.nextSibling.data = t : this.T(lt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: s } = t, o = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Ft.createElement(Us(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === o) this._$AH.p(e);
    else {
      const a = new _i(o, this), u = a.u(this.options);
      a.p(e), this.T(u), this._$AH = a;
    }
  }
  _$AC(t) {
    let e = As.get(t.strings);
    return e === void 0 && As.set(t.strings, e = new Ft(t)), e;
  }
  k(t) {
    Fe(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, o = 0;
    for (const n of t) o === e.length ? e.push(s = new Bt(this.O(zt()), this.O(zt()), this, this.options)) : s = e[o], s._$AI(n), o++;
    o < e.length && (this._$AR(s && s._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t !== this._$AB; ) {
      const o = gs(t).nextSibling;
      gs(t).remove(), t = o;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class oe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, o, n) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = A;
  }
  _$AI(t, e = this, s, o) {
    const n = this.strings;
    let a = !1;
    if (n === void 0) t = wt(this, t, e, 0), a = !Ht(t) || t !== this._$AH && t !== ct, a && (this._$AH = t);
    else {
      const u = t;
      let p, f;
      for (t = n[0], p = 0; p < n.length - 1; p++) f = wt(this, u[s + p], e, p), f === ct && (f = this._$AH[p]), a || (a = !Ht(f) || f !== this._$AH[p]), f === A ? t = A : t !== A && (t += (f ?? "") + n[p + 1]), this._$AH[p] = f;
    }
    a && !o && this.j(t);
  }
  j(t) {
    t === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class vi extends oe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === A ? void 0 : t;
  }
}
class wi extends oe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== A);
  }
}
class Ai extends oe {
  constructor(t, e, s, o, n) {
    super(t, e, s, o, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = wt(this, t, e, 0) ?? A) === ct) return;
    const s = this._$AH, o = t === A && s !== A || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== A && (s === A || o);
    o && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ei {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    wt(this, t);
  }
}
const Se = Ut.litHtmlPolyfillSupport;
Se == null || Se(Ft, Bt), (Ut.litHtmlVersions ?? (Ut.litHtmlVersions = [])).push("3.3.2");
const xi = (i, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let o = s._$litPart$;
  if (o === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = o = new Bt(t.insertBefore(zt(), n), n, void 0, e ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = globalThis;
let B = class extends vt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = xi(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return ct;
  }
};
var Is;
B._$litElement$ = !0, B.finalized = !0, (Is = at.litElementHydrateSupport) == null || Is.call(at, { LitElement: B });
const $e = at.litElementPolyfillSupport;
$e == null || $e({ LitElement: B });
(at.litElementVersions ?? (at.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ti = { attribute: !0, type: String, converter: se, reflect: !1, hasChanged: He }, Si = (i = Ti, t, e) => {
  const { kind: s, metadata: o } = e;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), n.set(e.name, i), s === "accessor") {
    const { name: a } = e;
    return { set(u) {
      const p = t.get.call(this);
      t.set.call(this, u), this.requestUpdate(a, p, i, !0, u);
    }, init(u) {
      return u !== void 0 && this.C(a, void 0, i, u), u;
    } };
  }
  if (s === "setter") {
    const { name: a } = e;
    return function(u) {
      const p = this[a];
      t.call(this, u), this.requestUpdate(a, p, i, !0, u);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function y(i) {
  return (t, e) => typeof e == "object" ? Si(i, t, e) : ((s, o, n) => {
    const a = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, s), a ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function M(i) {
  return y({ ...i, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $i = (i, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(i, t, e), e);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ci(i, t) {
  return (e, s, o) => {
    const n = (a) => {
      var u;
      return ((u = a.renderRoot) == null ? void 0 : u.querySelector(i)) ?? null;
    };
    return $i(e, s, { get() {
      return n(this);
    } });
  };
}
const Oi = pt`
  :host {
    display: block;
    font-family: var(--pc-font-family, system-ui, sans-serif);
    --pc-primary: #007bff;
    --pc-bg: #fff;
    --pc-text: #000;
  }

  * { box-sizing: border-box; }

  .chat-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 380px;
    height: 600px;
    max-height: 80vh;
    background: var(--pc-bg);
    color: var(--pc-text);
    border-radius: var(--pc-radius, 12px);
    box-shadow: 0 5px 25px rgba(0,0,0,0.15);
    overflow: hidden;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: var(--pc-z-index, 9999);
  }

  .chat-container.closed {
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px) scale(0.95);
  }

  .chat-container.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }

  /* Positions */
  .pos-bottom-right { bottom: 20px; right: 20px; }
  .pos-bottom-left { bottom: 20px; left: 20px; }

  .launcher-wrapper {
    position: fixed;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    /* Background and color removed here as they are handled by inner component or passed down? 
       Actually chat-bubble handles its own background/color. 
       Let's check if we need to remove them or if they are just ignored/overridden.
       The template says: <chat-bubble ...></chat-bubble>
       The wrapper is just for positioning.
       So we probably don't want background on the wrapper if the bubble is circular.
       But let's look at chat-bubble.ts again.
    */
    /* Keeping original styles but renaming for now to be safe, assuming wrapper should behave like the launcher button container */
    /* Wait, chat-bubble has .launcher class too inside it! */
    /* If we style wrapper with background, we might have double circles. */
    /* Let's look at pristine-chat.ts again. */
    /* <div class="launcher-wrapper ..."> <chat-bubble ...> </div> */
    /* Wrapper is for positioning. chat-bubble is the visual. */
    /* So wrapper should NOT have background/shadow/size if chat-bubble has it. */
    /* OR wrapper IS the visual container? */
    /* chat-bubble.ts styles: .launcher { width: 60px; height: 60px; ... background: ... } */
    /* So chat-bubble HAS the visual styles. */
    /* So styles.ts .launcher having background/width/height/shadow is WRONG or REDUNDANT? */
    /* styles.ts .launcher has position: fixed. chat-bubble .launcher does NOT. */
    /* So styles.ts was trying to be the positioning container. */
    /* If I rename it to .launcher-wrapper, I should REMOVE visual styles (bg, shadow, etc) and KEEP positioning styles (fixed, z-index). */
  }

  .launcher-wrapper {
    position: fixed;
    z-index: var(--pc-z-index, 9999);
    /* No visual styles, just positioning */
    display: flex;
    align-items: center;
    justify-content: center;
    /* We need width/height??? No, let child determine size? */
    /* But standardizing layout helps. */
    /* If I remove width/height/bg, will it break? */
    /* The original code had ALL styles on .launcher in styles.ts. */
    /* AND chat-bubble.ts has styles on .launcher too. */
  }


  @media (max-width: 480px) {
    .chat-container {
      width: 100%;
      height: 100%;
      max-height: 100%;
      bottom: 0 !important;
      right: 0 !important;
      left: 0 !important;
      border-radius: 0;
    }
  }
`, Es = {
  apiBaseUrl: "https://dev.pristinedata.ai/api/hydrolecagentKim",
  theme: "light",
  primaryColor: "#007bff",
  secondaryColor: "#6c757d",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  borderRadius: "12px",
  fontFamily: "Inter, system-ui, sans-serif",
  position: "bottom-right",
  zIndex: "9999",
  launcherIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
  headerTitle: "Support",
  headerSubtitle: "We are online",
  welcomeMessage: "Hello! How can I help you?",
  typingIndicator: !0,
  typingText: "Agent is typing...",
  features: {
    enableFileUpload: !1,
    allowedFileTypes: ["jpg", "png", "pdf"],
    maxFileSizeMB: 5,
    enableEmoji: !0,
    enableMarkdown: !0,
    enableStreaming: !0,
    enableFeedback: !1,
    enableConversationReset: !0
  }
};
function xs(i, t = {}, e = {}) {
  return {
    ...i,
    ...t,
    ...e,
    features: {
      ...i.features,
      ...t.features || {},
      ...e.features || {}
    }
  };
}
class Ri {
  constructor(t) {
    this.config = t;
  }
  async fetchConfig() {
    try {
      const t = new URL(`https://dev.pristinedata.ai/api/hydrolecagentKim/widget/config`);
      this.config.tenantId && t.searchParams.append("tenantId", this.config.tenantId);
      const e = await fetch(t.toString());
      if (!e.ok) throw new Error("Failed to fetch config");
      return await e.json();
    } catch (t) {
      return console.warn("Failed to load remote config:", t), {};
    }
  }
  async storeConversationMessage(t, e, s) {
    await fetch(`${this.config.apiBaseUrl}/chat/store-conversation-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: t, sender: e, message: s })
    });
  }
  async resetConversation(t) {
    const e = await fetch(`${this.config.apiBaseUrl}/chat/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: t })
    });
    return e.ok ? await e.json() : { active: !1 };
  }
  async checkStatus(t) {
    const e = new URL(`${this.config.apiBaseUrl}/chat/status/${t}`), s = await fetch(e.toString());
    return s.ok ? await s.json() : { active: !1 };
  }
  async getMessages(t) {
    const e = await fetch(`${this.config.apiBaseUrl}/conversations/${t}/messages`);
    return e.ok ? await e.json() : [];
  }
  // Streaming is handled directly in the component via EventSource or fetch reader
}
var ki = Object.defineProperty, Pi = Object.getOwnPropertyDescriptor, re = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? Pi(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && ki(t, e, o), o;
};
let At = class extends B {
  constructor() {
    super(...arguments), this.title = "Chat", this.subtitle = "", this.primaryColor = "#007bff";
  }
  render() {
    return g`
      <div class="header-top">
        <div style="display:flex;gap:5px;align-items:center;">
            <span style="padding:8px;background:#ffffff33;line-height: 0;border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles h-4 w-4"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
            </span>
          <div style="display:flex;flex-direction:column;">
             <h2 style="font-size:14px;">${this.title}</h2>
             ${this.subtitle ? g`<p style="font-size:12px;margin:0px;">${this.subtitle}</p>` : ""}
          </div>
        </div>
        <div class="actions">
            <button class="icon-btn" title="End Conversation" @click=${() => this.dispatchEvent(new CustomEvent("reset"))}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
            <button class="icon-btn" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>&times;</button>
        </div>
      </div>
    `;
  }
};
At.styles = pt`
    :host {
      display: flex;
      flex-direction: column;
      padding: 5px 20px;
      color: white;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h2 { margin: 0; font-size: 1.1rem; }
    p { margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 4px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.1); }
    .icon-btn svg { width: 20px; height: 20px; }
  `;
re([
  y()
], At.prototype, "title", 2);
re([
  y()
], At.prototype, "subtitle", 2);
re([
  y()
], At.prototype, "primaryColor", 2);
At = re([
  ht("chat-header")
], At);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ii = { CHILD: 2 }, Di = (i) => (...t) => ({ _$litDirective$: i, values: t });
class Mi {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, s) {
    this._$Ct = t, this._$AM = e, this._$Ci = s;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class De extends Mi {
  constructor(t) {
    if (super(t), this.it = A, t.type !== Ii.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === A || t == null) return this._t = void 0, this.it = t;
    if (t === ct) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const e = [t];
    return e.raw = e, this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] };
  }
}
De.directiveName = "unsafeHTML", De.resultType = 1;
const zs = Di(De);
/*! @license DOMPurify 3.3.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.1/LICENSE */
const {
  entries: Hs,
  setPrototypeOf: Ts,
  isFrozen: Ni,
  getPrototypeOf: Li,
  getOwnPropertyDescriptor: Ui
} = Object;
let {
  freeze: I,
  seal: L,
  create: Me
} = Object, {
  apply: Ne,
  construct: Le
} = typeof Reflect < "u" && Reflect;
I || (I = function(t) {
  return t;
});
L || (L = function(t) {
  return t;
});
Ne || (Ne = function(t, e) {
  for (var s = arguments.length, o = new Array(s > 2 ? s - 2 : 0), n = 2; n < s; n++)
    o[n - 2] = arguments[n];
  return t.apply(e, o);
});
Le || (Le = function(t) {
  for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), o = 1; o < e; o++)
    s[o - 1] = arguments[o];
  return new t(...s);
});
const Zt = D(Array.prototype.forEach), zi = D(Array.prototype.lastIndexOf), Ss = D(Array.prototype.pop), Pt = D(Array.prototype.push), Hi = D(Array.prototype.splice), ee = D(String.prototype.toLowerCase), Ce = D(String.prototype.toString), Oe = D(String.prototype.match), It = D(String.prototype.replace), Fi = D(String.prototype.indexOf), Bi = D(String.prototype.trim), F = D(Object.prototype.hasOwnProperty), P = D(RegExp.prototype.test), Dt = ji(TypeError);
function D(i) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), o = 1; o < e; o++)
      s[o - 1] = arguments[o];
    return Ne(i, t, s);
  };
}
function ji(i) {
  return function() {
    for (var t = arguments.length, e = new Array(t), s = 0; s < t; s++)
      e[s] = arguments[s];
    return Le(i, e);
  };
}
function d(i, t) {
  let e = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : ee;
  Ts && Ts(i, null);
  let s = t.length;
  for (; s--; ) {
    let o = t[s];
    if (typeof o == "string") {
      const n = e(o);
      n !== o && (Ni(t) || (t[s] = n), o = n);
    }
    i[o] = !0;
  }
  return i;
}
function Wi(i) {
  for (let t = 0; t < i.length; t++)
    F(i, t) || (i[t] = null);
  return i;
}
function G(i) {
  const t = Me(null);
  for (const [e, s] of Hs(i))
    F(i, e) && (Array.isArray(s) ? t[e] = Wi(s) : s && typeof s == "object" && s.constructor === Object ? t[e] = G(s) : t[e] = s);
  return t;
}
function Mt(i, t) {
  for (; i !== null; ) {
    const s = Ui(i, t);
    if (s) {
      if (s.get)
        return D(s.get);
      if (typeof s.value == "function")
        return D(s.value);
    }
    i = Li(i);
  }
  function e() {
    return null;
  }
  return e;
}
const $s = I(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Re = I(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), ke = I(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Gi = I(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Pe = I(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), qi = I(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Cs = I(["#text"]), Os = I(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Ie = I(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Rs = I(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Qt = I(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Yi = L(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Vi = L(/<%[\w\W]*|[\w\W]*%>/gm), Xi = L(/\$\{[\w\W]*/gm), Ki = L(/^data-[\-\w.\u00B7-\uFFFF]+$/), Ji = L(/^aria-[\-\w]+$/), Fs = L(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Zi = L(/^(?:\w+script|data):/i), Qi = L(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Bs = L(/^html$/i), to = L(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ARIA_ATTR: Ji,
  ATTR_WHITESPACE: Qi,
  CUSTOM_ELEMENT: to,
  DATA_ATTR: Ki,
  DOCTYPE_NAME: Bs,
  ERB_EXPR: Vi,
  IS_ALLOWED_URI: Fs,
  IS_SCRIPT_OR_DATA: Zi,
  MUSTACHE_EXPR: Yi,
  TMPLIT_EXPR: Xi
});
const Nt = {
  element: 1,
  text: 3,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9
}, eo = function() {
  return typeof window > "u" ? null : window;
}, so = function(t, e) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let s = null;
  const o = "data-tt-policy-suffix";
  e && e.hasAttribute(o) && (s = e.getAttribute(o));
  const n = "dompurify" + (s ? "#" + s : "");
  try {
    return t.createPolicy(n, {
      createHTML(a) {
        return a;
      },
      createScriptURL(a) {
        return a;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + n + " could not be created."), null;
  }
}, Ps = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function js() {
  let i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : eo();
  const t = (h) => js(h);
  if (t.version = "3.3.1", t.removed = [], !i || !i.document || i.document.nodeType !== Nt.document || !i.Element)
    return t.isSupported = !1, t;
  let {
    document: e
  } = i;
  const s = e, o = s.currentScript, {
    DocumentFragment: n,
    HTMLTemplateElement: a,
    Node: u,
    Element: p,
    NodeFilter: f,
    NamedNodeMap: _ = i.NamedNodeMap || i.MozNamedAttrMap,
    HTMLFormElement: m,
    DOMParser: C,
    trustedTypes: O
  } = i, H = p.prototype, ae = Mt(H, "cloneNode"), jt = Mt(H, "remove"), Wt = Mt(H, "nextSibling"), ut = Mt(H, "childNodes"), st = Mt(H, "parentNode");
  if (typeof a == "function") {
    const h = e.createElement("template");
    h.content && h.content.ownerDocument && (e = h.content.ownerDocument);
  }
  let R, $t = "";
  const {
    implementation: le,
    createNodeIterator: Ws,
    createDocumentFragment: Gs,
    getElementsByTagName: qs
  } = e, {
    importNode: Ys
  } = s;
  let k = Ps();
  t.isSupported = typeof Hs == "function" && typeof st == "function" && le && le.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: ce,
    ERB_EXPR: pe,
    TMPLIT_EXPR: he,
    DATA_ATTR: Vs,
    ARIA_ATTR: Xs,
    IS_SCRIPT_OR_DATA: Ks,
    ATTR_WHITESPACE: Be,
    CUSTOM_ELEMENT: Js
  } = ks;
  let {
    IS_ALLOWED_URI: je
  } = ks, x = null;
  const We = d({}, [...$s, ...Re, ...ke, ...Pe, ...Cs]);
  let T = null;
  const Ge = d({}, [...Os, ...Ie, ...Rs, ...Qt]);
  let v = Object.seal(Me(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), Ct = null, ue = null;
  const dt = Object.seal(Me(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let qe = !0, de = !0, Ye = !1, Ve = !0, ft = !1, Gt = !0, it = !1, fe = !1, me = !1, mt = !1, qt = !1, Yt = !1, Xe = !0, Ke = !1;
  const Zs = "user-content-";
  let ge = !0, Ot = !1, gt = {}, j = null;
  const be = d({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let Je = null;
  const Ze = d({}, ["audio", "video", "img", "source", "image", "track"]);
  let ye = null;
  const Qe = d({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Vt = "http://www.w3.org/1998/Math/MathML", Xt = "http://www.w3.org/2000/svg", V = "http://www.w3.org/1999/xhtml";
  let bt = V, _e = !1, ve = null;
  const Qs = d({}, [Vt, Xt, V], Ce);
  let Kt = d({}, ["mi", "mo", "mn", "ms", "mtext"]), Jt = d({}, ["annotation-xml"]);
  const ti = d({}, ["title", "style", "font", "a", "script"]);
  let Rt = null;
  const ei = ["application/xhtml+xml", "text/html"], si = "text/html";
  let E = null, yt = null;
  const ii = e.createElement("form"), ts = function(r) {
    return r instanceof RegExp || r instanceof Function;
  }, we = function() {
    let r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(yt && yt === r)) {
      if ((!r || typeof r != "object") && (r = {}), r = G(r), Rt = // eslint-disable-next-line unicorn/prefer-includes
      ei.indexOf(r.PARSER_MEDIA_TYPE) === -1 ? si : r.PARSER_MEDIA_TYPE, E = Rt === "application/xhtml+xml" ? Ce : ee, x = F(r, "ALLOWED_TAGS") ? d({}, r.ALLOWED_TAGS, E) : We, T = F(r, "ALLOWED_ATTR") ? d({}, r.ALLOWED_ATTR, E) : Ge, ve = F(r, "ALLOWED_NAMESPACES") ? d({}, r.ALLOWED_NAMESPACES, Ce) : Qs, ye = F(r, "ADD_URI_SAFE_ATTR") ? d(G(Qe), r.ADD_URI_SAFE_ATTR, E) : Qe, Je = F(r, "ADD_DATA_URI_TAGS") ? d(G(Ze), r.ADD_DATA_URI_TAGS, E) : Ze, j = F(r, "FORBID_CONTENTS") ? d({}, r.FORBID_CONTENTS, E) : be, Ct = F(r, "FORBID_TAGS") ? d({}, r.FORBID_TAGS, E) : G({}), ue = F(r, "FORBID_ATTR") ? d({}, r.FORBID_ATTR, E) : G({}), gt = F(r, "USE_PROFILES") ? r.USE_PROFILES : !1, qe = r.ALLOW_ARIA_ATTR !== !1, de = r.ALLOW_DATA_ATTR !== !1, Ye = r.ALLOW_UNKNOWN_PROTOCOLS || !1, Ve = r.ALLOW_SELF_CLOSE_IN_ATTR !== !1, ft = r.SAFE_FOR_TEMPLATES || !1, Gt = r.SAFE_FOR_XML !== !1, it = r.WHOLE_DOCUMENT || !1, mt = r.RETURN_DOM || !1, qt = r.RETURN_DOM_FRAGMENT || !1, Yt = r.RETURN_TRUSTED_TYPE || !1, me = r.FORCE_BODY || !1, Xe = r.SANITIZE_DOM !== !1, Ke = r.SANITIZE_NAMED_PROPS || !1, ge = r.KEEP_CONTENT !== !1, Ot = r.IN_PLACE || !1, je = r.ALLOWED_URI_REGEXP || Fs, bt = r.NAMESPACE || V, Kt = r.MATHML_TEXT_INTEGRATION_POINTS || Kt, Jt = r.HTML_INTEGRATION_POINTS || Jt, v = r.CUSTOM_ELEMENT_HANDLING || {}, r.CUSTOM_ELEMENT_HANDLING && ts(r.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (v.tagNameCheck = r.CUSTOM_ELEMENT_HANDLING.tagNameCheck), r.CUSTOM_ELEMENT_HANDLING && ts(r.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (v.attributeNameCheck = r.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), r.CUSTOM_ELEMENT_HANDLING && typeof r.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (v.allowCustomizedBuiltInElements = r.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), ft && (de = !1), qt && (mt = !0), gt && (x = d({}, Cs), T = [], gt.html === !0 && (d(x, $s), d(T, Os)), gt.svg === !0 && (d(x, Re), d(T, Ie), d(T, Qt)), gt.svgFilters === !0 && (d(x, ke), d(T, Ie), d(T, Qt)), gt.mathMl === !0 && (d(x, Pe), d(T, Rs), d(T, Qt))), r.ADD_TAGS && (typeof r.ADD_TAGS == "function" ? dt.tagCheck = r.ADD_TAGS : (x === We && (x = G(x)), d(x, r.ADD_TAGS, E))), r.ADD_ATTR && (typeof r.ADD_ATTR == "function" ? dt.attributeCheck = r.ADD_ATTR : (T === Ge && (T = G(T)), d(T, r.ADD_ATTR, E))), r.ADD_URI_SAFE_ATTR && d(ye, r.ADD_URI_SAFE_ATTR, E), r.FORBID_CONTENTS && (j === be && (j = G(j)), d(j, r.FORBID_CONTENTS, E)), r.ADD_FORBID_CONTENTS && (j === be && (j = G(j)), d(j, r.ADD_FORBID_CONTENTS, E)), ge && (x["#text"] = !0), it && d(x, ["html", "head", "body"]), x.table && (d(x, ["tbody"]), delete Ct.tbody), r.TRUSTED_TYPES_POLICY) {
        if (typeof r.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw Dt('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof r.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw Dt('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        R = r.TRUSTED_TYPES_POLICY, $t = R.createHTML("");
      } else
        R === void 0 && (R = so(O, o)), R !== null && typeof $t == "string" && ($t = R.createHTML(""));
      I && I(r), yt = r;
    }
  }, es = d({}, [...Re, ...ke, ...Gi]), ss = d({}, [...Pe, ...qi]), oi = function(r) {
    let l = st(r);
    (!l || !l.tagName) && (l = {
      namespaceURI: bt,
      tagName: "template"
    });
    const c = ee(r.tagName), b = ee(l.tagName);
    return ve[r.namespaceURI] ? r.namespaceURI === Xt ? l.namespaceURI === V ? c === "svg" : l.namespaceURI === Vt ? c === "svg" && (b === "annotation-xml" || Kt[b]) : !!es[c] : r.namespaceURI === Vt ? l.namespaceURI === V ? c === "math" : l.namespaceURI === Xt ? c === "math" && Jt[b] : !!ss[c] : r.namespaceURI === V ? l.namespaceURI === Xt && !Jt[b] || l.namespaceURI === Vt && !Kt[b] ? !1 : !ss[c] && (ti[c] || !es[c]) : !!(Rt === "application/xhtml+xml" && ve[r.namespaceURI]) : !1;
  }, W = function(r) {
    Pt(t.removed, {
      element: r
    });
    try {
      st(r).removeChild(r);
    } catch {
      jt(r);
    }
  }, ot = function(r, l) {
    try {
      Pt(t.removed, {
        attribute: l.getAttributeNode(r),
        from: l
      });
    } catch {
      Pt(t.removed, {
        attribute: null,
        from: l
      });
    }
    if (l.removeAttribute(r), r === "is")
      if (mt || qt)
        try {
          W(l);
        } catch {
        }
      else
        try {
          l.setAttribute(r, "");
        } catch {
        }
  }, is = function(r) {
    let l = null, c = null;
    if (me)
      r = "<remove></remove>" + r;
    else {
      const w = Oe(r, /^[\r\n\t ]+/);
      c = w && w[0];
    }
    Rt === "application/xhtml+xml" && bt === V && (r = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + r + "</body></html>");
    const b = R ? R.createHTML(r) : r;
    if (bt === V)
      try {
        l = new C().parseFromString(b, Rt);
      } catch {
      }
    if (!l || !l.documentElement) {
      l = le.createDocument(bt, "template", null);
      try {
        l.documentElement.innerHTML = _e ? $t : b;
      } catch {
      }
    }
    const $ = l.body || l.documentElement;
    return r && c && $.insertBefore(e.createTextNode(c), $.childNodes[0] || null), bt === V ? qs.call(l, it ? "html" : "body")[0] : it ? l.documentElement : $;
  }, os = function(r) {
    return Ws.call(
      r.ownerDocument || r,
      r,
      // eslint-disable-next-line no-bitwise
      f.SHOW_ELEMENT | f.SHOW_COMMENT | f.SHOW_TEXT | f.SHOW_PROCESSING_INSTRUCTION | f.SHOW_CDATA_SECTION,
      null
    );
  }, Ae = function(r) {
    return r instanceof m && (typeof r.nodeName != "string" || typeof r.textContent != "string" || typeof r.removeChild != "function" || !(r.attributes instanceof _) || typeof r.removeAttribute != "function" || typeof r.setAttribute != "function" || typeof r.namespaceURI != "string" || typeof r.insertBefore != "function" || typeof r.hasChildNodes != "function");
  }, rs = function(r) {
    return typeof u == "function" && r instanceof u;
  };
  function X(h, r, l) {
    Zt(h, (c) => {
      c.call(t, r, l, yt);
    });
  }
  const ns = function(r) {
    let l = null;
    if (X(k.beforeSanitizeElements, r, null), Ae(r))
      return W(r), !0;
    const c = E(r.nodeName);
    if (X(k.uponSanitizeElement, r, {
      tagName: c,
      allowedTags: x
    }), Gt && r.hasChildNodes() && !rs(r.firstElementChild) && P(/<[/\w!]/g, r.innerHTML) && P(/<[/\w!]/g, r.textContent) || r.nodeType === Nt.progressingInstruction || Gt && r.nodeType === Nt.comment && P(/<[/\w]/g, r.data))
      return W(r), !0;
    if (!(dt.tagCheck instanceof Function && dt.tagCheck(c)) && (!x[c] || Ct[c])) {
      if (!Ct[c] && ls(c) && (v.tagNameCheck instanceof RegExp && P(v.tagNameCheck, c) || v.tagNameCheck instanceof Function && v.tagNameCheck(c)))
        return !1;
      if (ge && !j[c]) {
        const b = st(r) || r.parentNode, $ = ut(r) || r.childNodes;
        if ($ && b) {
          const w = $.length;
          for (let N = w - 1; N >= 0; --N) {
            const K = ae($[N], !0);
            K.__removalCount = (r.__removalCount || 0) + 1, b.insertBefore(K, Wt(r));
          }
        }
      }
      return W(r), !0;
    }
    return r instanceof p && !oi(r) || (c === "noscript" || c === "noembed" || c === "noframes") && P(/<\/no(script|embed|frames)/i, r.innerHTML) ? (W(r), !0) : (ft && r.nodeType === Nt.text && (l = r.textContent, Zt([ce, pe, he], (b) => {
      l = It(l, b, " ");
    }), r.textContent !== l && (Pt(t.removed, {
      element: r.cloneNode()
    }), r.textContent = l)), X(k.afterSanitizeElements, r, null), !1);
  }, as = function(r, l, c) {
    if (Xe && (l === "id" || l === "name") && (c in e || c in ii))
      return !1;
    if (!(de && !ue[l] && P(Vs, l))) {
      if (!(qe && P(Xs, l))) {
        if (!(dt.attributeCheck instanceof Function && dt.attributeCheck(l, r))) {
          if (!T[l] || ue[l]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(ls(r) && (v.tagNameCheck instanceof RegExp && P(v.tagNameCheck, r) || v.tagNameCheck instanceof Function && v.tagNameCheck(r)) && (v.attributeNameCheck instanceof RegExp && P(v.attributeNameCheck, l) || v.attributeNameCheck instanceof Function && v.attributeNameCheck(l, r)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              l === "is" && v.allowCustomizedBuiltInElements && (v.tagNameCheck instanceof RegExp && P(v.tagNameCheck, c) || v.tagNameCheck instanceof Function && v.tagNameCheck(c)))
            ) return !1;
          } else if (!ye[l]) {
            if (!P(je, It(c, Be, ""))) {
              if (!((l === "src" || l === "xlink:href" || l === "href") && r !== "script" && Fi(c, "data:") === 0 && Je[r])) {
                if (!(Ye && !P(Ks, It(c, Be, "")))) {
                  if (c)
                    return !1;
                }
              }
            }
          }
        }
      }
    }
    return !0;
  }, ls = function(r) {
    return r !== "annotation-xml" && Oe(r, Js);
  }, cs = function(r) {
    X(k.beforeSanitizeAttributes, r, null);
    const {
      attributes: l
    } = r;
    if (!l || Ae(r))
      return;
    const c = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: T,
      forceKeepAttr: void 0
    };
    let b = l.length;
    for (; b--; ) {
      const $ = l[b], {
        name: w,
        namespaceURI: N,
        value: K
      } = $, _t = E(w), Ee = K;
      let S = w === "value" ? Ee : Bi(Ee);
      if (c.attrName = _t, c.attrValue = S, c.keepAttr = !0, c.forceKeepAttr = void 0, X(k.uponSanitizeAttribute, r, c), S = c.attrValue, Ke && (_t === "id" || _t === "name") && (ot(w, r), S = Zs + S), Gt && P(/((--!?|])>)|<\/(style|title|textarea)/i, S)) {
        ot(w, r);
        continue;
      }
      if (_t === "attributename" && Oe(S, "href")) {
        ot(w, r);
        continue;
      }
      if (c.forceKeepAttr)
        continue;
      if (!c.keepAttr) {
        ot(w, r);
        continue;
      }
      if (!Ve && P(/\/>/i, S)) {
        ot(w, r);
        continue;
      }
      ft && Zt([ce, pe, he], (hs) => {
        S = It(S, hs, " ");
      });
      const ps = E(r.nodeName);
      if (!as(ps, _t, S)) {
        ot(w, r);
        continue;
      }
      if (R && typeof O == "object" && typeof O.getAttributeType == "function" && !N)
        switch (O.getAttributeType(ps, _t)) {
          case "TrustedHTML": {
            S = R.createHTML(S);
            break;
          }
          case "TrustedScriptURL": {
            S = R.createScriptURL(S);
            break;
          }
        }
      if (S !== Ee)
        try {
          N ? r.setAttributeNS(N, w, S) : r.setAttribute(w, S), Ae(r) ? W(r) : Ss(t.removed);
        } catch {
          ot(w, r);
        }
    }
    X(k.afterSanitizeAttributes, r, null);
  }, ri = function h(r) {
    let l = null;
    const c = os(r);
    for (X(k.beforeSanitizeShadowDOM, r, null); l = c.nextNode(); )
      X(k.uponSanitizeShadowNode, l, null), ns(l), cs(l), l.content instanceof n && h(l.content);
    X(k.afterSanitizeShadowDOM, r, null);
  };
  return t.sanitize = function(h) {
    let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = null, c = null, b = null, $ = null;
    if (_e = !h, _e && (h = "<!-->"), typeof h != "string" && !rs(h))
      if (typeof h.toString == "function") {
        if (h = h.toString(), typeof h != "string")
          throw Dt("dirty is not a string, aborting");
      } else
        throw Dt("toString is not a function");
    if (!t.isSupported)
      return h;
    if (fe || we(r), t.removed = [], typeof h == "string" && (Ot = !1), Ot) {
      if (h.nodeName) {
        const K = E(h.nodeName);
        if (!x[K] || Ct[K])
          throw Dt("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (h instanceof u)
      l = is("<!---->"), c = l.ownerDocument.importNode(h, !0), c.nodeType === Nt.element && c.nodeName === "BODY" || c.nodeName === "HTML" ? l = c : l.appendChild(c);
    else {
      if (!mt && !ft && !it && // eslint-disable-next-line unicorn/prefer-includes
      h.indexOf("<") === -1)
        return R && Yt ? R.createHTML(h) : h;
      if (l = is(h), !l)
        return mt ? null : Yt ? $t : "";
    }
    l && me && W(l.firstChild);
    const w = os(Ot ? h : l);
    for (; b = w.nextNode(); )
      ns(b), cs(b), b.content instanceof n && ri(b.content);
    if (Ot)
      return h;
    if (mt) {
      if (qt)
        for ($ = Gs.call(l.ownerDocument); l.firstChild; )
          $.appendChild(l.firstChild);
      else
        $ = l;
      return (T.shadowroot || T.shadowrootmode) && ($ = Ys.call(s, $, !0)), $;
    }
    let N = it ? l.outerHTML : l.innerHTML;
    return it && x["!doctype"] && l.ownerDocument && l.ownerDocument.doctype && l.ownerDocument.doctype.name && P(Bs, l.ownerDocument.doctype.name) && (N = "<!DOCTYPE " + l.ownerDocument.doctype.name + `>
` + N), ft && Zt([ce, pe, he], (K) => {
      N = It(N, K, " ");
    }), R && Yt ? R.createHTML(N) : N;
  }, t.setConfig = function() {
    let h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    we(h), fe = !0;
  }, t.clearConfig = function() {
    yt = null, fe = !1;
  }, t.isValidAttribute = function(h, r, l) {
    yt || we({});
    const c = E(h), b = E(r);
    return as(c, b, l);
  }, t.addHook = function(h, r) {
    typeof r == "function" && Pt(k[h], r);
  }, t.removeHook = function(h, r) {
    if (r !== void 0) {
      const l = zi(k[h], r);
      return l === -1 ? void 0 : Hi(k[h], l, 1)[0];
    }
    return Ss(k[h]);
  }, t.removeHooks = function(h) {
    k[h] = [];
  }, t.removeAllHooks = function() {
    k = Ps();
  }, t;
}
var io = js(), oo = Object.defineProperty, ro = Object.getOwnPropertyDescriptor, q = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? ro(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && oo(t, e, o), o;
};
let U = class extends B {
  constructor() {
    super(...arguments), this.messages = [], this.primaryColor = "#007bff", this.assistantIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot h-4 w-4 text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>', this.userIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-4 w-4 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', this.typing = !1, this.typingText = "Agent is typing...", this.showCallbackForm = !1, this.showSupportInfo = !1, this.error = "";
  }
  updated() {
    this.scrollTop = this.scrollHeight;
  }
  renderMarkdown(i) {
    const t = io.sanitize(i);
    return zs(t.replace(/\n/g, "<br>"));
  }
  onFollowupClick(i) {
    this.dispatchEvent(new CustomEvent("followup-selected", {
      detail: i,
      bubbles: !0,
      composed: !0
    }));
  }
  onSpecialClick(i) {
    i === "Request Callback" && (this.showCallbackForm = !this.showCallbackForm, this.showSupportInfo = !1), i === "Contact Customer" && (this.showSupportInfo = !this.showSupportInfo, this.showCallbackForm = !1);
  }
  submitCallbackForm(i) {
    i.preventDefault();
    const t = i.target, e = {
      phone: t.elements.namedItem("phone").value,
      message: t.elements.namedItem("message").value
    };
    if (!/^[0-9+\-\s]{7,15}$/.test(e.phone)) {
      this.error = "Please enter a valid phone number.";
      return;
    }
    this.dispatchEvent(new CustomEvent("callback-submitted", {
      detail: e,
      bubbles: !0,
      composed: !0
    })), this.showCallbackForm = !1;
  }
  renderIcon(i) {
    if (!i) return null;
    if (typeof i == "string" && /<svg[\s\S]*?>/i.test(i)) {
      const e = document.createElement("span");
      return e.style.color = this.primaryColor, e.innerHTML = i, g`${e}`;
    }
    return g`<img src=${i} width="30"/>`;
  }
  renderIconByRole(i) {
    return i === "assistant" ? this.renderIcon(this.assistantIcon) : i === "user" ? this.renderIcon(this.userIcon) : null;
  }
  clearError() {
    this.error && (this.error = "");
  }
  render() {
    const i = this.messages.some((t) => t.role === "assistant");
    return g`
      ${this.messages.map((t) => g`
        <div style="display:flex;gap:5px;align-items:center;margin-bottom: 12px; ${t.role === "user" ? "flex-flow: row-reverse;" : ""}">
          <div class="message-icon">
            ${this.renderIconByRole(t.role)}
          </div>
          <div
          class="message ${t.role}"
          style="${t.role === "user" ? `background:${this.primaryColor}` : ""}">
            ${this.renderMarkdown(t.content)}

            ${t.role === "assistant" ? g`
                    <div class="followups">
                      ${(t.followups ?? []).map((e) => g`
                        <button
                          class="followup-btn"
                          @click=${() => this.onFollowupClick(e)}>
                          ${e}
                        </button>
                      `)}
                    </div>
                  ` : ""}
          </div>
        </div>
      `)}

      ${this.typing ? g`<div class="typing">${this.typingText}</div>` : ""}

      ${i ? g`
            <div class="followups">
              <button
                class="followup-btn"
                style="background:#e7f1ff"
                @click=${() => this.onSpecialClick("Request Callback")}>
                Request Callback
              </button>
              <button
                class="followup-btn"
                style="background:#e7f1ff"
                @click=${() => this.onSpecialClick("Contact Customer")}>
                Contact Customer
              </button>
            </div>
          ` : ""}

      ${this.showCallbackForm ? g`
            <form class="callback-form" @submit=${this.submitCallbackForm}>
              <h3 class="form-title">Request a Callback</h3>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  required
                   @input=${this.clearError}
                />
                ${this.error ? g`<div class="error">${this.error}</div>` : ""}
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  required
                  placeholder="How can we help you?"
                ></textarea>
              </label>

              <button type="submit">Request Callback</button>
            </form>
          ` : ""}

      ${this.showSupportInfo ? g`
          <div class="callback-form">
            <h3 class="form-title">Contact Support</h3>

            <p>
              📧 <strong>Email:</strong>
              <a href="mailto:support@company.com">support@company.com</a>
            </p>

            <p>
              📞 <strong>Phone:</strong>
              <a href="tel:+1234567890">+1 234 567 890</a>
            </p>
          </div>
    ` : ""}

    `;
  }
};
U.styles = pt`
    :host {
      display: block;
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8f9fa;
    }

    /* ---------------- MESSAGES ---------------- */

    .message {
      display:flex;
      flex-direction:column;
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .user {
      margin-left: auto;
      background: var(--msg-user-bg, #007bff);
      color: #fff;
      border-bottom-right-radius: 2px;
    }

    .assistant {
      margin-right: auto;
      background: #fff;
      color: #333;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 2px;
    }

    .typing {
      font-style: italic;
      color: #666;
      font-size: 0.8rem;
      margin-top: 6px;
      margin-bottom: 20px;
    }

    .message p { margin: 0 0 8px; }
    .message p:last-child { margin: 0; }

    .message code {
      background: rgba(0,0,0,0.08);
      padding: 2px 4px;
      border-radius: 4px;
    }

    .message pre {
      background: #333;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      overflow-x: auto;
    }

    /* ---------------- FOLLOWUPS ---------------- */

    .followups {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .followup-btn {
      background: #f1f3f5;
      border: 1px solid #dee2e6;
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 14px;
      cursor: pointer;
      color: inherit;
      text-align: left;
      line-height: inherit;
    }

    .followup-btn:hover {
      background: #e9ecef;
    }

    /* ---------------- CALLBACK FORM ---------------- */

    .callback-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      margin-top: 14px;
      padding: 16px;

      background: #e9f7ef;
      border: 1px solid #c3e6cb;
      border-radius: 10px;
    }

    .callback-form .form-title {
      margin: 0 0 6px;
      font-size: 1.05rem;
      font-weight: 600;
      color: #155724;
    }

    .callback-form label {
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      font-size: 0.85rem;
      font-weight: 500;
      color: #155724;
    }

    .callback-form input,
    .callback-form textarea {
      padding: 10px 12px;
      font-size: 0.95rem;
      border-radius: 6px;
      border: 1px solid #ced4da;
      background: #fff;
      outline: none;
    }

    .callback-form input:focus,
    .callback-form textarea:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.15);
    }

    .callback-form textarea {
      resize: vertical;
      min-height: 80px;
    }

    .callback-form button {
      width: 100%;
      max-width: 320px;
      height: 30px;

      background: #28a745;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;

      border: none;
      border-radius: 6px;
      cursor: pointer;

      transition: background 0.15s ease, transform 0.05s ease;
    }

    .callback-form button:hover {
      background: #218838;
    }

    .callback-form button:active {
      transform: translateY(1px);
    }
    .error {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 5px;
    }
    .message-icon{
      line-height: 0;
      background: #00a35a1a;
      padding: 8px;
      border-radius: 8px;
    }
  `;
q([
  y({ type: Array })
], U.prototype, "messages", 2);
q([
  y()
], U.prototype, "primaryColor", 2);
q([
  y()
], U.prototype, "assistantIcon", 2);
q([
  y()
], U.prototype, "userIcon", 2);
q([
  y({ type: Boolean })
], U.prototype, "typing", 2);
q([
  y()
], U.prototype, "typingText", 2);
q([
  y({ type: Boolean })
], U.prototype, "showCallbackForm", 2);
q([
  y({ type: Boolean })
], U.prototype, "showSupportInfo", 2);
q([
  M()
], U.prototype, "error", 2);
U = q([
  ht("chat-message-list")
], U);
var no = Object.defineProperty, ao = Object.getOwnPropertyDescriptor, ne = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? ao(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && no(t, e, o), o;
};
let Et = class extends B {
  constructor() {
    super(...arguments), this.disabled = !1, this.primaryColor = "#007bff";
  }
  handleKey(i) {
    i.key === "Enter" && !i.shiftKey && (i.preventDefault(), this.send());
  }
  send() {
    const i = this.input.value.trim();
    !i || this.disabled || (this.dispatchEvent(new CustomEvent("send", { detail: i })), this.input.value = "");
  }
  render() {
    return g`
      <textarea 
        placeholder="Type a message..." 
        ?disabled=${this.disabled}
        @keydown=${this.handleKey}
      ></textarea>
      <button @click=${this.send} ?disabled=${this.disabled}>
        <svg fill="${this.primaryColor}" width="24" height="24" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    `;
  }
};
Et.styles = pt`
    :host {
      display: flex;
      padding: 12px;
      background: white;
      border-top: 1px solid #eee;
    }
    textarea {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 10px 15px;
      resize: none;
      font-family: inherit;
      outline: none;
    }
    textarea:focus { border-color: #aaa; }
    button {
      margin-left: 10px;
      background: none;
      border: none;
      cursor: pointer;
      color: #007bff;
      padding: 0 10px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
ne([
  Ci("textarea")
], Et.prototype, "input", 2);
ne([
  y({ type: Boolean })
], Et.prototype, "disabled", 2);
ne([
  y()
], Et.prototype, "primaryColor", 2);
Et = ne([
  ht("chat-input")
], Et);
var lo = Object.defineProperty, co = Object.getOwnPropertyDescriptor, xt = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? co(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && lo(t, e, o), o;
};
let Q = class extends B {
  constructor() {
    super(...arguments), this.primaryColor = "#007bff", this.loading = !1, this.email = "", this.name = "", this.error = "";
  }
  handleSubmit(i) {
    if (i.preventDefault(), !this.email || !this.email.includes("@")) {
      this.error = "Please enter a valid business email address.";
      return;
    }
    this.error = "", this.dispatchEvent(new CustomEvent("submit-email", {
      detail: { email: this.email, name: this.name },
      bubbles: !0,
      composed: !0
    }));
  }
  render() {
    return g`
            <form @submit=${this.handleSubmit} style="--pc-primary: ${this.primaryColor}">
                <h3>Welcome! 👋</h3>
                <p>Please provide your email to connect with Agent Kim.</p>
                
                <div class="form-group">
                    <label for="name">Name (Optional)</label>
                    <input 
                        type="text" 
                        id="name" 
                        .value=${this.name} 
                        @input=${(i) => this.name = i.target.value}
                        placeholder="John Doe"
                    >
                </div>

                <div class="form-group">
                    <label for="email">Business Email *</label>
                    <input 
                        type="email" 
                        id="email" 
                        required
                        .value=${this.email} 
                        @input=${(i) => this.email = i.target.value}
                        placeholder="john@company.com"
                    >
                    ${this.error ? g`<div class="error">${this.error}</div>` : ""}
                </div>

                <button type="submit" ?disabled=${this.loading}>
                    ${this.loading ? "Connecting..." : "Start Chat"}
                </button>
            </form>
        `;
  }
};
Q.styles = pt`
        :host {
            background: #fff;
          height: 100vh;
            display: block;
            padding: 20px;
            font-family: inherit;
        }
        h3 {
            margin-top: 0;
            color: #333;
        }
        p {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 1rem;
        }
        input:focus {
            outline: none;
            border-color: var(--pc-primary, #007bff);
        }
        button {
            width: 100%;
            padding: 10px;
            background: var(--pc-primary, #007bff);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
        }
        button:hover {
            opacity: 0.9;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .error {
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 5px;
        }
    `;
xt([
  y()
], Q.prototype, "primaryColor", 2);
xt([
  y({ type: Boolean })
], Q.prototype, "loading", 2);
xt([
  M()
], Q.prototype, "email", 2);
xt([
  M()
], Q.prototype, "name", 2);
xt([
  M()
], Q.prototype, "error", 2);
Q = xt([
  ht("chat-email-form")
], Q);
var po = Object.defineProperty, ho = Object.getOwnPropertyDescriptor, Tt = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? ho(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && po(t, e, o), o;
};
let tt = class extends B {
  constructor() {
    super(...arguments), this.icon = "", this.color = "#007bff", this.launcherText = "Need assistance?", this.showPopup = !1, this.popupText = "Need assistance?";
  }
  render() {
    return g`
            <div class="bubble-container" @click=${() => this.dispatchEvent(new CustomEvent("toggle"))}>
                ${this.showPopup ? g`
                    <div class="popup-message">
                        ${this.popupText}
                    </div>
                ` : ""}
                
                <div class="launcher" style="background: ${this.color}">
                    ${zs(this.icon)}
                    ${this.launcherText}
                </div>
            </div>
        `;
  }
};
tt.styles = pt`
        :host {
            display: block;
            position: relative;
            cursor: pointer;
        }
        .bubble-container {
            display: flex;
            align-items: center;
        }
        .popup-message {
            background: white;
            color: #333;
            padding: 10px 15px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-right: 15px;
            white-space: nowrap;
            font-size: 0.9rem;
            animation: fadeIn 0.3s ease-out;
            position: relative;
        }
        .popup-message::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-style: solid;
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent white;
        }
        .launcher {
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap:10px;
            font-weight:600;
            padding:10px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.2s;
            color: white;
        }
        .launcher:hover {
            transform: scale(1.05);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
Tt([
  y()
], tt.prototype, "icon", 2);
Tt([
  y()
], tt.prototype, "color", 2);
Tt([
  y()
], tt.prototype, "launcherText", 2);
Tt([
  y({ type: Boolean })
], tt.prototype, "showPopup", 2);
Tt([
  y()
], tt.prototype, "popupText", 2);
tt = Tt([
  ht("chat-bubble")
], tt);
var uo = Object.defineProperty, fo = Object.getOwnPropertyDescriptor, St = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? fo(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && uo(t, e, o), o;
};
let et = class extends B {
  constructor() {
    super(...arguments), this.primaryColor = "#007bff", this.supportPhone = "1-800-HYDROLEC", this.mode = "menu", this.phone = "", this.status = "idle";
  }
  handleCallbackRequest() {
    this.phone && (this.status = "submitting", this.dispatchEvent(new CustomEvent("callback-request", {
      detail: { phone: this.phone },
      bubbles: !0,
      composed: !0
    })));
  }
  setStatus(i) {
    this.status = i, i === "success" && setTimeout(() => {
      this.mode = "menu", this.status = "idle";
    }, 3e3);
  }
  render() {
    return this.mode === "menu" ? g`
                <h4>Follow-up Options</h4>
                <div class="buttons">
                    <button @click=${() => this.mode = "callback"}>Request Callback</button>
                    <button @click=${() => alert(`Call us at ${this.supportPhone}`)}>Call Support</button>
                </div>
            ` : g`
            <div class="callback-form" style="--pc-primary: ${this.primaryColor}">
                <h4>Request Callback</h4>
                ${this.status === "success" ? g`<div class="success">Request sent! We'll call you shortly.</div>` : this.status === "error" ? g`<div class="error">Failed to send request.</div>` : g`
                    <p style="font-size:0.8rem; margin:0 0 5px 0;">Enter your number:</p>
                    <input 
                        type="tel" 
                        .value=${this.phone} 
                        @input=${(i) => this.phone = i.target.value}
                        placeholder="+1 (555) ..."
                    >
                    <div class="buttons">
                        <button @click=${() => this.mode = "menu"}>Cancel</button>
                        <button class="submit-btn" @click=${this.handleCallbackRequest} ?disabled=${this.status === "submitting"}>
                            ${this.status === "submitting" ? "Sending..." : "Submit"}
                        </button>
                    </div>
                `}
            </div>
        `;
  }
};
et.styles = pt`
        :host {
            display: block;
            padding: 15px;
            border-top: 1px solid #eee;
        }
        h4 {
            margin: 0 0 10px 0;
            font-size: 0.9rem;
            color: #333;
        }
        .buttons {
            display: flex;
            gap: 10px;
        }
        button {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        button:hover {
            background: #f8f9fa;
            border-color: #ccc;
        }
        .callback-form {
            margin-top: 10px;
            animation: slideDown 0.2s;
        }
        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 5px;
            box-sizing: border-box;
        }
        .submit-btn {
            width: 100%;
            background: var(--pc-primary, #007bff);
            color: white;
            border: none;
        }
        .submit-btn:hover {
             background: var(--pc-primary-dark, #0056b3);
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .success { color: green; font-size: 0.9rem; }
        .error { color: #dc3545; font-size: 0.9rem; }
    `;
St([
  y()
], et.prototype, "primaryColor", 2);
St([
  y()
], et.prototype, "supportPhone", 2);
St([
  M()
], et.prototype, "mode", 2);
St([
  M()
], et.prototype, "phone", 2);
St([
  M()
], et.prototype, "status", 2);
et = St([
  ht("chat-support-options")
], et);
var mo = Object.defineProperty, go = Object.getOwnPropertyDescriptor, Y = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? go(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && mo(t, e, o), o;
};
let z = class extends B {
  constructor() {
    super(...arguments), this.config = {}, this._config = Es, this.isOpen = !1, this.messages = [], this.isTyping = !1, this.visitor = null, this.showAutoPopup = !1, this.view = "chat", this.loading = !1;
  }
  async firstUpdated() {
    super.connectedCallback(), this.initialize();
  }
  async initialize() {
    this._config = xs(Es, {}, this.config), this.api = new Ri(this._config), console.log("Initial Config", this.config);
    try {
      const i = await this.api.fetchConfig();
      this._config = xs(this._config, i, this.config);
      const t = localStorage.getItem("lastConversationTime");
      if (t) {
        const e = Number(t), s = Date.now();
        let o = this._config.sessionTimeout ? this._config.sessionTimeout * 60 * 60 * 1e3 : 60 * 60 * 1e3;
        s - e > o && (localStorage.getItem("pristine-chat-visitor") && await this.handleReset(!1), localStorage.clear());
      }
    } catch (i) {
      console.error("Failed to fetch remote config", i);
    }
    this.loadState(), this._config.backgroundColor && this.style.setProperty("--pc-bg", this._config.backgroundColor), this._config.textColor && this.style.setProperty("--pc-text", this._config.textColor), this._config.autoOpenDelay && this._config.autoOpenDelay > 0 ? setTimeout(() => {
      this.isOpen || this.open();
    }, this._config.autoOpenDelay) : !this.isOpen && !localStorage.getItem("pristine-chat-interacted") && setTimeout(() => {
      this.isOpen || (this.showAutoPopup = !0);
    }, 4e3);
  }
  async loadState() {
    localStorage.getItem("pristine-chat-history");
    const i = localStorage.getItem("pristine-chat-visitor");
    if (i)
      try {
        if (this.visitor = JSON.parse(i), this.visitor && this.visitor.id) {
          const t = localStorage.getItem("pristine-chat-history");
          t && (this.messages = JSON.parse(t)), this.isOpen = !0;
        }
      } catch (t) {
        console.error(t);
      }
    this.messages.length === 0 && this._config.welcomeMessage && (this.messages = [{ role: "assistant", content: this._config.welcomeMessage }]);
  }
  saveState() {
    localStorage.setItem("pristine-chat-history", JSON.stringify(this.messages)), localStorage.setItem("pristine-chat-interacted", "true"), this.visitor && localStorage.setItem("pristine-chat-visitor", JSON.stringify(this.visitor));
  }
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  open() {
    this.isOpen = !0, this.showAutoPopup = !1, localStorage.setItem("pristine-chat-interacted", "true");
  }
  close() {
    this.isOpen = !1;
  }
  async handleEmailSubmit(i) {
    const { email: t, name: e } = i.detail;
    try {
      this.loading = !0;
      const s = await fetch(`${this._config.apiBaseUrl}/visitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: t, name: e })
      });
      if (!s.ok) throw new Error("Failed to register visitor");
      const o = await s.json();
      this.visitor = o, this.saveState(), this.loading = !1;
    } catch (s) {
      console.error("Visitor registration failed:", s), alert("Visitor registration failed"), this.loading = !1;
    }
  }
  async handleCallbackRequest(i) {
    var o;
    if (console.log("Enter in handleCallbackRequest"), !this.visitor) return;
    const { name: t, phone: e, message: s } = i.detail;
    try {
      const n = await fetch(`${this._config.apiBaseUrl}/visitor/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: (o = this.visitor) == null ? void 0 : o.id, name: t, phone: e, message: s })
      });
      if (!n.ok) throw new Error("Failed to register visitor");
      const a = await n.json();
      console.log("res", a);
      const u = this.messages.length - 1, p = [...this.messages];
      p[u] = { role: "assistant", content: (a == null ? void 0 : a.message) || "Thanks your call back request is registered our team will call you. Thanks" }, this.messages = p;
    } catch (n) {
      console.error("Callback request failed:", n), alert("Error: Please try again later");
    }
  }
  async handleSend(i) {
    var o, n;
    const t = i.detail;
    if (!t) return;
    localStorage.setItem("lastConversationTime", Date.now().toString());
    const e = (o = this.visitor) == null ? void 0 : o.id, s = (n = this.visitor) == null ? void 0 : n.email;
    this.api.storeConversationMessage(e, "user", t), this.messages = [...this.messages, { role: "user", content: t }], this.saveState(), this.isTyping = !0;
    try {
      await this.streamResponse(t, s, e);
    } catch (a) {
      console.error(a), this.messages = [...this.messages, { role: "system", content: "Failed to send message." }];
    } finally {
      this.isTyping = !1, this.saveState();
    }
  }
  async streamResponse(i, t, e) {
    const s = await fetch(`${this._config.apiBaseUrl}/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: i, email: t, visitorId: e })
    });
    if (!s.body) throw new Error("No response body");
    const o = s.body.getReader(), n = new TextDecoder();
    let a = "";
    const u = "followup_question";
    let p = "message";
    this.messages.push({ role: "assistant", content: "" });
    const f = this.messages.length - 1;
    let _ = !1;
    for (; !_; ) {
      const { done: C, value: O } = await o.read();
      if (C) break;
      const ae = n.decode(O, { stream: !0 }).split(`
`);
      for (const jt of ae) {
        if (!jt.startsWith("data: ")) continue;
        const Wt = jt.slice(6).trim();
        if (Wt === "[DONE]") {
          _ = !0;
          break;
        }
        try {
          const ut = JSON.parse(Wt);
          if (ut.content) {
            if (a += ut.content, p === "message") {
              const st = [...this.messages];
              st[f] = { role: "assistant", content: a }, this.messages = st;
            }
            p === "message" && a.includes(u) && (p = "followup", this.messages[f].content = this.messages[f].content.replace(u, ""));
          }
        } catch (ut) {
          console.warn("Failed to parse stream chunk:", ut);
        }
      }
    }
    const { followups: m } = this.normalizeAssistantResponse(a);
    m != null && m.length && (this.messages[f].followups = m);
    try {
      await this.api.storeConversationMessage(e, "assistant", a);
    } catch (C) {
      console.error("Failed to store conversation message:", C);
    }
    this.saveState();
  }
  normalizeAssistantResponse(i) {
    const t = /followups?_question/i, [e, s] = i.split(t), o = e.trim(), n = s ? s.split(`
`).map(
      (a) => a.replace(/^[\-\•\d\.\)]*/, "").trim()
    ).filter(Boolean) : [];
    return { message: o, followups: n };
  }
  async handleReset(i = !0) {
    var e;
    if (i && !confirm("End conversation? You cannot resume this chat.")) return;
    const t = (e = this.visitor) == null ? void 0 : e.id;
    try {
      if (t) {
        const s = await this.api.resetConversation(t);
        if (s.status) {
          localStorage.clear();
          let o = document.querySelector("pristine-chat");
          o && o.remove(), document.querySelector("pristine-chat") || (o = document.createElement("pristine-chat"), document.body.appendChild(o)), o && o.open(), o.config = this.config;
        } else
          alert(s == null ? void 0 : s.message);
      }
    } catch (s) {
      console.error("Reset failed", s), i && alert("Error: Failed to reset chat. Try again later");
    }
  }
  handleFollowup(i) {
    const t = i.detail;
    t && this.handleSend({ detail: t });
  }
  render() {
    const { primaryColor: i, position: t, launcherIcon: e, headerTitle: s, headerSubtitle: o, width: n, launcherText: a } = this._config;
    return g`
        <div class="chat-container ${this.isOpen ? "open" : "closed"} pos-${t}"
            style="--pc-primary: ${i}; ${n ? `width: ${n}px;` : ""}">
            
            <chat-header 
                title="${s}" 
                subtitle="${o}"
                @close=${this.close}
                @reset=${this.handleReset}
                style="background: ${i}"
            >
                <button slot="actions" 
                        class="icon-btn" 
                        title="Support Options"
                        style="background:none; border:none; color:white; cursor:pointer;"
                        @click=${() => this.view = this.view === "chat" ? "support" : "chat"}>
                    ${this.view === "chat" ? "📞" : "💬"}
                </button>
            </chat-header>
            
            ${this.visitor ? this.view === "support" ? g`
                <chat-support-options
                    primaryColor="${i}"
                    @callback-request=${this.handleCallbackRequest}
                ></chat-support-options>
            ` : g`
                <chat-message-list 
                    .messages=${this.messages} 
                    .typing=${this.isTyping}
                    typingText="${this._config.typingText}"
                    primaryColor="${i}"
                    @followup-selected=${this.handleFollowup}
                    @callback-submitted=${this.handleCallbackRequest}
                ></chat-message-list>
                <chat-input @send=${this.handleSend}
                primaryColor="${i}"></chat-input>
            ` : g`
                <chat-email-form 
                    primaryColor="${i}"
                    .loading="${this.loading}"
                    @submit-email=${this.handleEmailSubmit}
                ></chat-email-form>
            `}
        </div>

        <div class="pos-${t}" style="position:absolute;">
            <chat-bubble
                icon="${e}"
                color="${i}"
                launcherText=${a}
                .showPopup=${this.showAutoPopup}
                @toggle=${this.toggle}
            ></chat-bubble>
        </div>
        `;
  }
};
z.styles = Oi;
Y([
  y({ type: Object })
], z.prototype, "config", 2);
Y([
  M()
], z.prototype, "_config", 2);
Y([
  M()
], z.prototype, "isOpen", 2);
Y([
  M()
], z.prototype, "messages", 2);
Y([
  M()
], z.prototype, "isTyping", 2);
Y([
  M()
], z.prototype, "visitor", 2);
Y([
  M()
], z.prototype, "showAutoPopup", 2);
Y([
  M()
], z.prototype, "view", 2);
Y([
  M()
], z.prototype, "loading", 2);
z = Y([
  ht("pristine-chat")
], z);
window.PristineChat = {
  init: (i) => {
    let t = document.querySelector("pristine-chat");
    t || (t = document.createElement("pristine-chat"), document.body.appendChild(t)), t.config = i;
  },
  open: () => {
    const i = document.querySelector("pristine-chat");
    i && i.open();
  },
  close: () => {
    const i = document.querySelector("pristine-chat");
    i && i.close();
  },
  destroy: () => {
    const i = document.querySelector("pristine-chat");
    i && i.remove();
  }
};
export {
  z as PristineChat
};
