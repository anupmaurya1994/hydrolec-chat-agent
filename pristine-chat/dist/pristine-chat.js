/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, Le = te.ShadowRoot && (te.ShadyCSS === void 0 || te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ue = Symbol(), us = /* @__PURE__ */ new WeakMap();
let Ds = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Ue) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Le && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = us.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && us.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ni = (i) => new Ds(typeof i == "string" ? i : i + "", void 0, Ue), ht = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, o, n) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[n + 1], i[0]);
  return new Ds(e, i, Ue);
}, ai = (i, t) => {
  if (Le) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), o = te.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = e.cssText, i.appendChild(s);
  }
}, ds = Le ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return ni(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: li, defineProperty: ci, getOwnPropertyDescriptor: pi, getOwnPropertyNames: hi, getOwnPropertySymbols: ui, getPrototypeOf: di } = Object, Z = globalThis, fs = Z.trustedTypes, fi = fs ? fs.emptyScript : "", Ee = Z.reactiveElementPolyfillSupport, Ut = (i, t) => i, se = { toAttribute(i, t) {
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
let wt = class extends HTMLElement {
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
    if (this.hasOwnProperty(Ut("elementProperties"))) return;
    const t = di(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ut("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ut("properties"))) {
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
      const u = s.getPropertyOptions(o), h = typeof u.converter == "function" ? { fromAttribute: u.converter } : ((n = u.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? u.converter : se;
      this._$Em = o;
      const f = h.fromAttribute(e, u.type);
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
        const { wrapped: u } = a, h = this[n];
        u !== !0 || this._$AL.has(n) || h === void 0 || this.C(n, void 0, a, h);
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
wt.elementStyles = [], wt.shadowRootOptions = { mode: "open" }, wt[Ut("elementProperties")] = /* @__PURE__ */ new Map(), wt[Ut("finalized")] = /* @__PURE__ */ new Map(), Ee == null || Ee({ ReactiveElement: wt }), (Z.reactiveElementVersions ?? (Z.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ht = globalThis, gs = (i) => i, ie = Ht.trustedTypes, bs = ie ? ie.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Ms = "$lit$", J = `lit$${Math.random().toFixed(9).slice(2)}$`, Ns = "?" + J, mi = `<${Ns}>`, ct = document, zt = () => ct.createComment(""), Ft = (i) => i === null || typeof i != "object" && typeof i != "function", ze = Array.isArray, gi = (i) => ze(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", xe = `[ 	
\f\r]`, It = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ys = /-->/g, _s = />/g, nt = RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), vs = /'/g, ws = /"/g, Ls = /^(?:script|style|textarea|title)$/i, bi = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), g = bi(1), pt = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), As = /* @__PURE__ */ new WeakMap(), at = ct.createTreeWalker(ct, 129);
function Us(i, t) {
  if (!ze(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return bs !== void 0 ? bs.createHTML(t) : t;
}
const yi = (i, t) => {
  const e = i.length - 1, s = [];
  let o, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = It;
  for (let u = 0; u < e; u++) {
    const h = i[u];
    let f, b, m = -1, L = 0;
    for (; L < h.length && (a.lastIndex = L, b = a.exec(h), b !== null); ) L = a.lastIndex, a === It ? b[1] === "!--" ? a = ys : b[1] !== void 0 ? a = _s : b[2] !== void 0 ? (Ls.test(b[2]) && (o = RegExp("</" + b[2], "g")), a = nt) : b[3] !== void 0 && (a = nt) : a === nt ? b[0] === ">" ? (a = o ?? It, m = -1) : b[1] === void 0 ? m = -2 : (m = a.lastIndex - b[2].length, f = b[1], a = b[3] === void 0 ? nt : b[3] === '"' ? ws : vs) : a === ws || a === vs ? a = nt : a === ys || a === _s ? a = It : (a = nt, o = void 0);
    const T = a === nt && i[u + 1].startsWith("/>") ? " " : "";
    n += a === It ? h + mi : m >= 0 ? (s.push(f), h.slice(0, m) + Ms + h.slice(m) + J + T) : h + J + (m === -2 ? u : T);
  }
  return [Us(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Bt {
  constructor({ strings: t, _$litType$: e }, s) {
    let o;
    this.parts = [];
    let n = 0, a = 0;
    const u = t.length - 1, h = this.parts, [f, b] = yi(t, e);
    if (this.el = Bt.createElement(f, s), at.currentNode = this.el.content, e === 2 || e === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (o = at.nextNode()) !== null && h.length < u; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const m of o.getAttributeNames()) if (m.endsWith(Ms)) {
          const L = b[a++], T = o.getAttribute(m).split(J), $ = /([.?@])?(.*)/.exec(L);
          h.push({ type: 1, index: n, name: $[2], strings: T, ctor: $[1] === "." ? vi : $[1] === "?" ? wi : $[1] === "@" ? Ai : oe }), o.removeAttribute(m);
        } else m.startsWith(J) && (h.push({ type: 6, index: n }), o.removeAttribute(m));
        if (Ls.test(o.tagName)) {
          const m = o.textContent.split(J), L = m.length - 1;
          if (L > 0) {
            o.textContent = ie ? ie.emptyScript : "";
            for (let T = 0; T < L; T++) o.append(m[T], zt()), at.nextNode(), h.push({ type: 2, index: ++n });
            o.append(m[L], zt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Ns) h.push({ type: 2, index: n });
      else {
        let m = -1;
        for (; (m = o.data.indexOf(J, m + 1)) !== -1; ) h.push({ type: 7, index: n }), m += J.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = ct.createElement("template");
    return s.innerHTML = t, s;
  }
}
function At(i, t, e = i, s) {
  var a, u;
  if (t === pt) return t;
  let o = s !== void 0 ? (a = e._$Co) == null ? void 0 : a[s] : e._$Cl;
  const n = Ft(t) ? void 0 : t._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== n && ((u = o == null ? void 0 : o._$AO) == null || u.call(o, !1), n === void 0 ? o = void 0 : (o = new n(i), o._$AT(i, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = o : e._$Cl = o), o !== void 0 && (t = At(i, o._$AS(i, t.values), o, s)), t;
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
    const { el: { content: e }, parts: s } = this._$AD, o = ((t == null ? void 0 : t.creationScope) ?? ct).importNode(e, !0);
    at.currentNode = o;
    let n = at.nextNode(), a = 0, u = 0, h = s[0];
    for (; h !== void 0; ) {
      if (a === h.index) {
        let f;
        h.type === 2 ? f = new jt(n, n.nextSibling, this, t) : h.type === 1 ? f = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (f = new Ei(n, this, t)), this._$AV.push(f), h = s[++u];
      }
      a !== (h == null ? void 0 : h.index) && (n = at.nextNode(), a++);
    }
    return at.currentNode = ct, o;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class jt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, o) {
    this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = o, this._$Cv = (o == null ? void 0 : o.isConnected) ?? !0;
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
    t = At(this, t, e), Ft(t) ? t === E || t == null || t === "" ? (this._$AH !== E && this._$AR(), this._$AH = E) : t !== this._$AH && t !== pt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : gi(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== E && Ft(this._$AH) ? this._$AA.nextSibling.data = t : this.T(ct.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: s } = t, o = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Bt.createElement(Us(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === o) this._$AH.p(e);
    else {
      const a = new _i(o, this), u = a.u(this.options);
      a.p(e), this.T(u), this._$AH = a;
    }
  }
  _$AC(t) {
    let e = As.get(t.strings);
    return e === void 0 && As.set(t.strings, e = new Bt(t)), e;
  }
  k(t) {
    ze(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, o = 0;
    for (const n of t) o === e.length ? e.push(s = new jt(this.O(zt()), this.O(zt()), this, this.options)) : s = e[o], s._$AI(n), o++;
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
    this.type = 1, this._$AH = E, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = E;
  }
  _$AI(t, e = this, s, o) {
    const n = this.strings;
    let a = !1;
    if (n === void 0) t = At(this, t, e, 0), a = !Ft(t) || t !== this._$AH && t !== pt, a && (this._$AH = t);
    else {
      const u = t;
      let h, f;
      for (t = n[0], h = 0; h < n.length - 1; h++) f = At(this, u[s + h], e, h), f === pt && (f = this._$AH[h]), a || (a = !Ft(f) || f !== this._$AH[h]), f === E ? t = E : t !== E && (t += (f ?? "") + n[h + 1]), this._$AH[h] = f;
    }
    a && !o && this.j(t);
  }
  j(t) {
    t === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class vi extends oe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === E ? void 0 : t;
  }
}
class wi extends oe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== E);
  }
}
class Ai extends oe {
  constructor(t, e, s, o, n) {
    super(t, e, s, o, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = At(this, t, e, 0) ?? E) === pt) return;
    const s = this._$AH, o = t === E && s !== E || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== E && (s === E || o);
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
    At(this, t);
  }
}
const Te = Ht.litHtmlPolyfillSupport;
Te == null || Te(Bt, jt), (Ht.litHtmlVersions ?? (Ht.litHtmlVersions = [])).push("3.3.2");
const xi = (i, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let o = s._$litPart$;
  if (o === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = o = new jt(t.insertBefore(zt(), n), n, void 0, e ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = globalThis;
let B = class extends wt {
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
    return pt;
  }
};
var Ps;
B._$litElement$ = !0, B.finalized = !0, (Ps = lt.litElementHydrateSupport) == null || Ps.call(lt, { LitElement: B });
const Se = lt.litElementPolyfillSupport;
Se == null || Se({ LitElement: B });
(lt.litElementVersions ?? (lt.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = (i) => (t, e) => {
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
      const h = t.get.call(this);
      t.set.call(this, u), this.requestUpdate(a, h, i, !0, u);
    }, init(u) {
      return u !== void 0 && this.C(a, void 0, i, u), u;
    } };
  }
  if (s === "setter") {
    const { name: a } = e;
    return function(u) {
      const h = this[a];
      t.call(this, u), this.requestUpdate(a, h, i, !0, u);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function _(i) {
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
  return _({ ...i, state: !0, attribute: !1 });
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
const Oi = ht`
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
  apiBaseUrl: "http://localhost:3000/api/hydrolecagentKim",
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
      const t = new URL(`${this.config.apiBaseUrl}/widget/config`);
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
var ki = Object.defineProperty, Ii = Object.getOwnPropertyDescriptor, re = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? Ii(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && ki(t, e, o), o;
};
let Et = class extends B {
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
Et.styles = ht`
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
  _()
], Et.prototype, "title", 2);
re([
  _()
], Et.prototype, "subtitle", 2);
re([
  _()
], Et.prototype, "primaryColor", 2);
Et = re([
  ut("chat-header")
], Et);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Pi = { CHILD: 2 }, Di = (i) => (...t) => ({ _$litDirective$: i, values: t });
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
class Pe extends Mi {
  constructor(t) {
    if (super(t), this.it = E, t.type !== Pi.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === E || t == null) return this._t = void 0, this.it = t;
    if (t === pt) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const e = [t];
    return e.raw = e, this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] };
  }
}
Pe.directiveName = "unsafeHTML", Pe.resultType = 1;
const Hs = Di(Pe);
/*! @license DOMPurify 3.3.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.1/LICENSE */
const {
  entries: zs,
  setPrototypeOf: Ts,
  isFrozen: Ni,
  getPrototypeOf: Li,
  getOwnPropertyDescriptor: Ui
} = Object;
let {
  freeze: P,
  seal: U,
  create: De
} = Object, {
  apply: Me,
  construct: Ne
} = typeof Reflect < "u" && Reflect;
P || (P = function(t) {
  return t;
});
U || (U = function(t) {
  return t;
});
Me || (Me = function(t, e) {
  for (var s = arguments.length, o = new Array(s > 2 ? s - 2 : 0), n = 2; n < s; n++)
    o[n - 2] = arguments[n];
  return t.apply(e, o);
});
Ne || (Ne = function(t) {
  for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), o = 1; o < e; o++)
    s[o - 1] = arguments[o];
  return new t(...s);
});
const Zt = D(Array.prototype.forEach), Hi = D(Array.prototype.lastIndexOf), Ss = D(Array.prototype.pop), Pt = D(Array.prototype.push), zi = D(Array.prototype.splice), ee = D(String.prototype.toLowerCase), $e = D(String.prototype.toString), Ce = D(String.prototype.match), Dt = D(String.prototype.replace), Fi = D(String.prototype.indexOf), Bi = D(String.prototype.trim), F = D(Object.prototype.hasOwnProperty), I = D(RegExp.prototype.test), Mt = ji(TypeError);
function D(i) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var e = arguments.length, s = new Array(e > 1 ? e - 1 : 0), o = 1; o < e; o++)
      s[o - 1] = arguments[o];
    return Me(i, t, s);
  };
}
function ji(i) {
  return function() {
    for (var t = arguments.length, e = new Array(t), s = 0; s < t; s++)
      e[s] = arguments[s];
    return Ne(i, e);
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
  const t = De(null);
  for (const [e, s] of zs(i))
    F(i, e) && (Array.isArray(s) ? t[e] = Wi(s) : s && typeof s == "object" && s.constructor === Object ? t[e] = G(s) : t[e] = s);
  return t;
}
function Nt(i, t) {
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
const $s = P(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Oe = P(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Re = P(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Gi = P(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), ke = P(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), qi = P(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Cs = P(["#text"]), Os = P(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]), Ie = P(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Rs = P(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), Qt = P(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Yi = U(/\{\{[\w\W]*|[\w\W]*\}\}/gm), Vi = U(/<%[\w\W]*|[\w\W]*%>/gm), Xi = U(/\$\{[\w\W]*/gm), Ki = U(/^data-[\-\w.\u00B7-\uFFFF]+$/), Ji = U(/^aria-[\-\w]+$/), Fs = U(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  // eslint-disable-line no-useless-escape
), Zi = U(/^(?:\w+script|data):/i), Qi = U(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g
  // eslint-disable-line no-control-regex
), Bs = U(/^html$/i), to = U(/^[a-z][.\w]*(-[.\w]+)+$/i);
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
const Lt = {
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
}, Is = function() {
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
  const t = (p) => js(p);
  if (t.version = "3.3.1", t.removed = [], !i || !i.document || i.document.nodeType !== Lt.document || !i.Element)
    return t.isSupported = !1, t;
  let {
    document: e
  } = i;
  const s = e, o = s.currentScript, {
    DocumentFragment: n,
    HTMLTemplateElement: a,
    Node: u,
    Element: h,
    NodeFilter: f,
    NamedNodeMap: b = i.NamedNodeMap || i.MozNamedAttrMap,
    HTMLFormElement: m,
    DOMParser: L,
    trustedTypes: T
  } = i, $ = h.prototype, Ct = Nt($, "cloneNode"), Fe = Nt($, "remove"), ae = Nt($, "nextSibling"), Wt = Nt($, "childNodes"), st = Nt($, "parentNode");
  if (typeof a == "function") {
    const p = e.createElement("template");
    p.content && p.content.ownerDocument && (e = p.content.ownerDocument);
  }
  let w, it = "";
  const {
    implementation: dt,
    createNodeIterator: Ws,
    createDocumentFragment: Gs,
    getElementsByTagName: qs
  } = e, {
    importNode: Ys
  } = s;
  let k = Is();
  t.isSupported = typeof zs == "function" && typeof st == "function" && dt && dt.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: le,
    ERB_EXPR: ce,
    TMPLIT_EXPR: pe,
    DATA_ATTR: Vs,
    ARIA_ATTR: Xs,
    IS_SCRIPT_OR_DATA: Ks,
    ATTR_WHITESPACE: Be,
    CUSTOM_ELEMENT: Js
  } = ks;
  let {
    IS_ALLOWED_URI: je
  } = ks, S = null;
  const We = d({}, [...$s, ...Oe, ...Re, ...ke, ...Cs]);
  let C = null;
  const Ge = d({}, [...Os, ...Ie, ...Rs, ...Qt]);
  let v = Object.seal(De(null, {
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
  })), Ot = null, he = null;
  const ft = Object.seal(De(null, {
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
  let qe = !0, ue = !0, Ye = !1, Ve = !0, mt = !1, Gt = !0, ot = !1, de = !1, fe = !1, gt = !1, qt = !1, Yt = !1, Xe = !0, Ke = !1;
  const Zs = "user-content-";
  let me = !0, Rt = !1, bt = {}, j = null;
  const ge = d({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let Je = null;
  const Ze = d({}, ["audio", "video", "img", "source", "image", "track"]);
  let be = null;
  const Qe = d({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Vt = "http://www.w3.org/1998/Math/MathML", Xt = "http://www.w3.org/2000/svg", V = "http://www.w3.org/1999/xhtml";
  let yt = V, ye = !1, _e = null;
  const Qs = d({}, [Vt, Xt, V], $e);
  let Kt = d({}, ["mi", "mo", "mn", "ms", "mtext"]), Jt = d({}, ["annotation-xml"]);
  const ti = d({}, ["title", "style", "font", "a", "script"]);
  let kt = null;
  const ei = ["application/xhtml+xml", "text/html"], si = "text/html";
  let x = null, _t = null;
  const ii = e.createElement("form"), ts = function(r) {
    return r instanceof RegExp || r instanceof Function;
  }, ve = function() {
    let r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!(_t && _t === r)) {
      if ((!r || typeof r != "object") && (r = {}), r = G(r), kt = // eslint-disable-next-line unicorn/prefer-includes
      ei.indexOf(r.PARSER_MEDIA_TYPE) === -1 ? si : r.PARSER_MEDIA_TYPE, x = kt === "application/xhtml+xml" ? $e : ee, S = F(r, "ALLOWED_TAGS") ? d({}, r.ALLOWED_TAGS, x) : We, C = F(r, "ALLOWED_ATTR") ? d({}, r.ALLOWED_ATTR, x) : Ge, _e = F(r, "ALLOWED_NAMESPACES") ? d({}, r.ALLOWED_NAMESPACES, $e) : Qs, be = F(r, "ADD_URI_SAFE_ATTR") ? d(G(Qe), r.ADD_URI_SAFE_ATTR, x) : Qe, Je = F(r, "ADD_DATA_URI_TAGS") ? d(G(Ze), r.ADD_DATA_URI_TAGS, x) : Ze, j = F(r, "FORBID_CONTENTS") ? d({}, r.FORBID_CONTENTS, x) : ge, Ot = F(r, "FORBID_TAGS") ? d({}, r.FORBID_TAGS, x) : G({}), he = F(r, "FORBID_ATTR") ? d({}, r.FORBID_ATTR, x) : G({}), bt = F(r, "USE_PROFILES") ? r.USE_PROFILES : !1, qe = r.ALLOW_ARIA_ATTR !== !1, ue = r.ALLOW_DATA_ATTR !== !1, Ye = r.ALLOW_UNKNOWN_PROTOCOLS || !1, Ve = r.ALLOW_SELF_CLOSE_IN_ATTR !== !1, mt = r.SAFE_FOR_TEMPLATES || !1, Gt = r.SAFE_FOR_XML !== !1, ot = r.WHOLE_DOCUMENT || !1, gt = r.RETURN_DOM || !1, qt = r.RETURN_DOM_FRAGMENT || !1, Yt = r.RETURN_TRUSTED_TYPE || !1, fe = r.FORCE_BODY || !1, Xe = r.SANITIZE_DOM !== !1, Ke = r.SANITIZE_NAMED_PROPS || !1, me = r.KEEP_CONTENT !== !1, Rt = r.IN_PLACE || !1, je = r.ALLOWED_URI_REGEXP || Fs, yt = r.NAMESPACE || V, Kt = r.MATHML_TEXT_INTEGRATION_POINTS || Kt, Jt = r.HTML_INTEGRATION_POINTS || Jt, v = r.CUSTOM_ELEMENT_HANDLING || {}, r.CUSTOM_ELEMENT_HANDLING && ts(r.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (v.tagNameCheck = r.CUSTOM_ELEMENT_HANDLING.tagNameCheck), r.CUSTOM_ELEMENT_HANDLING && ts(r.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (v.attributeNameCheck = r.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), r.CUSTOM_ELEMENT_HANDLING && typeof r.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements == "boolean" && (v.allowCustomizedBuiltInElements = r.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), mt && (ue = !1), qt && (gt = !0), bt && (S = d({}, Cs), C = [], bt.html === !0 && (d(S, $s), d(C, Os)), bt.svg === !0 && (d(S, Oe), d(C, Ie), d(C, Qt)), bt.svgFilters === !0 && (d(S, Re), d(C, Ie), d(C, Qt)), bt.mathMl === !0 && (d(S, ke), d(C, Rs), d(C, Qt))), r.ADD_TAGS && (typeof r.ADD_TAGS == "function" ? ft.tagCheck = r.ADD_TAGS : (S === We && (S = G(S)), d(S, r.ADD_TAGS, x))), r.ADD_ATTR && (typeof r.ADD_ATTR == "function" ? ft.attributeCheck = r.ADD_ATTR : (C === Ge && (C = G(C)), d(C, r.ADD_ATTR, x))), r.ADD_URI_SAFE_ATTR && d(be, r.ADD_URI_SAFE_ATTR, x), r.FORBID_CONTENTS && (j === ge && (j = G(j)), d(j, r.FORBID_CONTENTS, x)), r.ADD_FORBID_CONTENTS && (j === ge && (j = G(j)), d(j, r.ADD_FORBID_CONTENTS, x)), me && (S["#text"] = !0), ot && d(S, ["html", "head", "body"]), S.table && (d(S, ["tbody"]), delete Ot.tbody), r.TRUSTED_TYPES_POLICY) {
        if (typeof r.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw Mt('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof r.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw Mt('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
        w = r.TRUSTED_TYPES_POLICY, it = w.createHTML("");
      } else
        w === void 0 && (w = so(T, o)), w !== null && typeof it == "string" && (it = w.createHTML(""));
      P && P(r), _t = r;
    }
  }, es = d({}, [...Oe, ...Re, ...Gi]), ss = d({}, [...ke, ...qi]), oi = function(r) {
    let l = st(r);
    (!l || !l.tagName) && (l = {
      namespaceURI: yt,
      tagName: "template"
    });
    const c = ee(r.tagName), y = ee(l.tagName);
    return _e[r.namespaceURI] ? r.namespaceURI === Xt ? l.namespaceURI === V ? c === "svg" : l.namespaceURI === Vt ? c === "svg" && (y === "annotation-xml" || Kt[y]) : !!es[c] : r.namespaceURI === Vt ? l.namespaceURI === V ? c === "math" : l.namespaceURI === Xt ? c === "math" && Jt[y] : !!ss[c] : r.namespaceURI === V ? l.namespaceURI === Xt && !Jt[y] || l.namespaceURI === Vt && !Kt[y] ? !1 : !ss[c] && (ti[c] || !es[c]) : !!(kt === "application/xhtml+xml" && _e[r.namespaceURI]) : !1;
  }, W = function(r) {
    Pt(t.removed, {
      element: r
    });
    try {
      st(r).removeChild(r);
    } catch {
      Fe(r);
    }
  }, rt = function(r, l) {
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
      if (gt || qt)
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
    if (fe)
      r = "<remove></remove>" + r;
    else {
      const A = Ce(r, /^[\r\n\t ]+/);
      c = A && A[0];
    }
    kt === "application/xhtml+xml" && yt === V && (r = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + r + "</body></html>");
    const y = w ? w.createHTML(r) : r;
    if (yt === V)
      try {
        l = new L().parseFromString(y, kt);
      } catch {
      }
    if (!l || !l.documentElement) {
      l = dt.createDocument(yt, "template", null);
      try {
        l.documentElement.innerHTML = ye ? it : y;
      } catch {
      }
    }
    const R = l.body || l.documentElement;
    return r && c && R.insertBefore(e.createTextNode(c), R.childNodes[0] || null), yt === V ? qs.call(l, ot ? "html" : "body")[0] : ot ? l.documentElement : R;
  }, os = function(r) {
    return Ws.call(
      r.ownerDocument || r,
      r,
      // eslint-disable-next-line no-bitwise
      f.SHOW_ELEMENT | f.SHOW_COMMENT | f.SHOW_TEXT | f.SHOW_PROCESSING_INSTRUCTION | f.SHOW_CDATA_SECTION,
      null
    );
  }, we = function(r) {
    return r instanceof m && (typeof r.nodeName != "string" || typeof r.textContent != "string" || typeof r.removeChild != "function" || !(r.attributes instanceof b) || typeof r.removeAttribute != "function" || typeof r.setAttribute != "function" || typeof r.namespaceURI != "string" || typeof r.insertBefore != "function" || typeof r.hasChildNodes != "function");
  }, rs = function(r) {
    return typeof u == "function" && r instanceof u;
  };
  function X(p, r, l) {
    Zt(p, (c) => {
      c.call(t, r, l, _t);
    });
  }
  const ns = function(r) {
    let l = null;
    if (X(k.beforeSanitizeElements, r, null), we(r))
      return W(r), !0;
    const c = x(r.nodeName);
    if (X(k.uponSanitizeElement, r, {
      tagName: c,
      allowedTags: S
    }), Gt && r.hasChildNodes() && !rs(r.firstElementChild) && I(/<[/\w!]/g, r.innerHTML) && I(/<[/\w!]/g, r.textContent) || r.nodeType === Lt.progressingInstruction || Gt && r.nodeType === Lt.comment && I(/<[/\w]/g, r.data))
      return W(r), !0;
    if (!(ft.tagCheck instanceof Function && ft.tagCheck(c)) && (!S[c] || Ot[c])) {
      if (!Ot[c] && ls(c) && (v.tagNameCheck instanceof RegExp && I(v.tagNameCheck, c) || v.tagNameCheck instanceof Function && v.tagNameCheck(c)))
        return !1;
      if (me && !j[c]) {
        const y = st(r) || r.parentNode, R = Wt(r) || r.childNodes;
        if (R && y) {
          const A = R.length;
          for (let N = A - 1; N >= 0; --N) {
            const K = Ct(R[N], !0);
            K.__removalCount = (r.__removalCount || 0) + 1, y.insertBefore(K, ae(r));
          }
        }
      }
      return W(r), !0;
    }
    return r instanceof h && !oi(r) || (c === "noscript" || c === "noembed" || c === "noframes") && I(/<\/no(script|embed|frames)/i, r.innerHTML) ? (W(r), !0) : (mt && r.nodeType === Lt.text && (l = r.textContent, Zt([le, ce, pe], (y) => {
      l = Dt(l, y, " ");
    }), r.textContent !== l && (Pt(t.removed, {
      element: r.cloneNode()
    }), r.textContent = l)), X(k.afterSanitizeElements, r, null), !1);
  }, as = function(r, l, c) {
    if (Xe && (l === "id" || l === "name") && (c in e || c in ii))
      return !1;
    if (!(ue && !he[l] && I(Vs, l))) {
      if (!(qe && I(Xs, l))) {
        if (!(ft.attributeCheck instanceof Function && ft.attributeCheck(l, r))) {
          if (!C[l] || he[l]) {
            if (
              // First condition does a very basic check if a) it's basically a valid custom element tagname AND
              // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
              !(ls(r) && (v.tagNameCheck instanceof RegExp && I(v.tagNameCheck, r) || v.tagNameCheck instanceof Function && v.tagNameCheck(r)) && (v.attributeNameCheck instanceof RegExp && I(v.attributeNameCheck, l) || v.attributeNameCheck instanceof Function && v.attributeNameCheck(l, r)) || // Alternative, second condition checks if it's an `is`-attribute, AND
              // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
              l === "is" && v.allowCustomizedBuiltInElements && (v.tagNameCheck instanceof RegExp && I(v.tagNameCheck, c) || v.tagNameCheck instanceof Function && v.tagNameCheck(c)))
            ) return !1;
          } else if (!be[l]) {
            if (!I(je, Dt(c, Be, ""))) {
              if (!((l === "src" || l === "xlink:href" || l === "href") && r !== "script" && Fi(c, "data:") === 0 && Je[r])) {
                if (!(Ye && !I(Ks, Dt(c, Be, "")))) {
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
    return r !== "annotation-xml" && Ce(r, Js);
  }, cs = function(r) {
    X(k.beforeSanitizeAttributes, r, null);
    const {
      attributes: l
    } = r;
    if (!l || we(r))
      return;
    const c = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: C,
      forceKeepAttr: void 0
    };
    let y = l.length;
    for (; y--; ) {
      const R = l[y], {
        name: A,
        namespaceURI: N,
        value: K
      } = R, vt = x(A), Ae = K;
      let O = A === "value" ? Ae : Bi(Ae);
      if (c.attrName = vt, c.attrValue = O, c.keepAttr = !0, c.forceKeepAttr = void 0, X(k.uponSanitizeAttribute, r, c), O = c.attrValue, Ke && (vt === "id" || vt === "name") && (rt(A, r), O = Zs + O), Gt && I(/((--!?|])>)|<\/(style|title|textarea)/i, O)) {
        rt(A, r);
        continue;
      }
      if (vt === "attributename" && Ce(O, "href")) {
        rt(A, r);
        continue;
      }
      if (c.forceKeepAttr)
        continue;
      if (!c.keepAttr) {
        rt(A, r);
        continue;
      }
      if (!Ve && I(/\/>/i, O)) {
        rt(A, r);
        continue;
      }
      mt && Zt([le, ce, pe], (hs) => {
        O = Dt(O, hs, " ");
      });
      const ps = x(r.nodeName);
      if (!as(ps, vt, O)) {
        rt(A, r);
        continue;
      }
      if (w && typeof T == "object" && typeof T.getAttributeType == "function" && !N)
        switch (T.getAttributeType(ps, vt)) {
          case "TrustedHTML": {
            O = w.createHTML(O);
            break;
          }
          case "TrustedScriptURL": {
            O = w.createScriptURL(O);
            break;
          }
        }
      if (O !== Ae)
        try {
          N ? r.setAttributeNS(N, A, O) : r.setAttribute(A, O), we(r) ? W(r) : Ss(t.removed);
        } catch {
          rt(A, r);
        }
    }
    X(k.afterSanitizeAttributes, r, null);
  }, ri = function p(r) {
    let l = null;
    const c = os(r);
    for (X(k.beforeSanitizeShadowDOM, r, null); l = c.nextNode(); )
      X(k.uponSanitizeShadowNode, l, null), ns(l), cs(l), l.content instanceof n && p(l.content);
    X(k.afterSanitizeShadowDOM, r, null);
  };
  return t.sanitize = function(p) {
    let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = null, c = null, y = null, R = null;
    if (ye = !p, ye && (p = "<!-->"), typeof p != "string" && !rs(p))
      if (typeof p.toString == "function") {
        if (p = p.toString(), typeof p != "string")
          throw Mt("dirty is not a string, aborting");
      } else
        throw Mt("toString is not a function");
    if (!t.isSupported)
      return p;
    if (de || ve(r), t.removed = [], typeof p == "string" && (Rt = !1), Rt) {
      if (p.nodeName) {
        const K = x(p.nodeName);
        if (!S[K] || Ot[K])
          throw Mt("root node is forbidden and cannot be sanitized in-place");
      }
    } else if (p instanceof u)
      l = is("<!---->"), c = l.ownerDocument.importNode(p, !0), c.nodeType === Lt.element && c.nodeName === "BODY" || c.nodeName === "HTML" ? l = c : l.appendChild(c);
    else {
      if (!gt && !mt && !ot && // eslint-disable-next-line unicorn/prefer-includes
      p.indexOf("<") === -1)
        return w && Yt ? w.createHTML(p) : p;
      if (l = is(p), !l)
        return gt ? null : Yt ? it : "";
    }
    l && fe && W(l.firstChild);
    const A = os(Rt ? p : l);
    for (; y = A.nextNode(); )
      ns(y), cs(y), y.content instanceof n && ri(y.content);
    if (Rt)
      return p;
    if (gt) {
      if (qt)
        for (R = Gs.call(l.ownerDocument); l.firstChild; )
          R.appendChild(l.firstChild);
      else
        R = l;
      return (C.shadowroot || C.shadowrootmode) && (R = Ys.call(s, R, !0)), R;
    }
    let N = ot ? l.outerHTML : l.innerHTML;
    return ot && S["!doctype"] && l.ownerDocument && l.ownerDocument.doctype && l.ownerDocument.doctype.name && I(Bs, l.ownerDocument.doctype.name) && (N = "<!DOCTYPE " + l.ownerDocument.doctype.name + `>
` + N), mt && Zt([le, ce, pe], (K) => {
      N = Dt(N, K, " ");
    }), w && Yt ? w.createHTML(N) : N;
  }, t.setConfig = function() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ve(p), de = !0;
  }, t.clearConfig = function() {
    _t = null, de = !1;
  }, t.isValidAttribute = function(p, r, l) {
    _t || ve({});
    const c = x(p), y = x(r);
    return as(c, y, l);
  }, t.addHook = function(p, r) {
    typeof r == "function" && Pt(k[p], r);
  }, t.removeHook = function(p, r) {
    if (r !== void 0) {
      const l = Hi(k[p], r);
      return l === -1 ? void 0 : zi(k[p], l, 1)[0];
    }
    return Ss(k[p]);
  }, t.removeHooks = function(p) {
    k[p] = [];
  }, t.removeAllHooks = function() {
    k = Is();
  }, t;
}
var io = js(), oo = Object.defineProperty, ro = Object.getOwnPropertyDescriptor, q = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? ro(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && oo(t, e, o), o;
};
let H = class extends B {
  constructor() {
    super(...arguments), this.messages = [], this.primaryColor = "#007bff", this.assistantIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot h-4 w-4 text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>', this.userIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-4 w-4 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', this.typing = !1, this.typingText = "Agent is typing...", this.showCallbackForm = !1, this.showSupportInfo = !1, this.error = "", this.isFirst = !0, this.oldScrollHeight = 0;
  }
  firstUpdated() {
    this.scrollTop = this.scrollHeight;
  }
  updated(i) {
    (i.has("showSupportInfo") || i.has("showCallbackForm")) && (this.scrollTop = this.scrollHeight), this.typing ? (this.isFirst && (this.oldScrollHeight = this.scrollHeight, this.isFirst = !1), this.scrollHeight <= this.oldScrollHeight + 375 && (this.scrollTop = this.scrollHeight)) : this.isFirst = !0;
  }
  renderMarkdown(i) {
    const t = io.sanitize(i);
    return Hs(t.replace(/\n/g, "<br>"));
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
    return ["assistant", "system"].includes(i) ? this.renderIcon(this.assistantIcon) : i === "user" ? this.renderIcon(this.userIcon) : null;
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

              <div style="display:flex; flex-direction:column; width:100%;">
                <label>
                  Phone Number <span class="red">*</span>
                </label>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    required
                    @input=${this.clearError}
                  />
                  ${this.error ? g`<div class="error">${this.error}</div>` : ""}
              </div>
              

              <div style="display:flex; flex-direction:column;width:100%;">
                <label>
                  Message <span class="red">*</span>
                </label>
                <textarea
                    name="message"
                    required
                    placeholder="How can we help you?"
                  ></textarea>
              </div>

              
              <button type="submit">Request Callback</button>
            </form>
          ` : ""}

      ${this.showSupportInfo ? g`
          <div class="callback-form">
            <p style="font-size:18px; margin:0">
              📧 <strong>Email:</strong>
              <a href="mailto:support@company.com">support@company.com</a>
            </p>
            <p style="font-size:18px; margin:0">
              📞 <strong>Phone:</strong>
              <a href="tel:+1234567890">+1 234 567 890</a>
            </p>
          </div>
    ` : ""}

    `;
  }
};
H.styles = ht`
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
      font-family:inherit;
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
      gap: 4px;
      font-weight: 500;
      color: #155724;
      font-family:inherit;
    }

    .callback-form input,
    .callback-form textarea {
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #ced4da;
      background: #fff;
      outline: none;
      font-family:inherit;
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
    .red{
      color:#dc3545;
    }
  `;
q([
  _({ type: Array })
], H.prototype, "messages", 2);
q([
  _()
], H.prototype, "primaryColor", 2);
q([
  _()
], H.prototype, "assistantIcon", 2);
q([
  _()
], H.prototype, "userIcon", 2);
q([
  _({ type: Boolean })
], H.prototype, "typing", 2);
q([
  _()
], H.prototype, "typingText", 2);
q([
  _({ type: Boolean })
], H.prototype, "showCallbackForm", 2);
q([
  _({ type: Boolean })
], H.prototype, "showSupportInfo", 2);
q([
  M()
], H.prototype, "error", 2);
H = q([
  ut("chat-message-list")
], H);
var no = Object.defineProperty, ao = Object.getOwnPropertyDescriptor, ne = (i, t, e, s) => {
  for (var o = s > 1 ? void 0 : s ? ao(t, e) : t, n = i.length - 1, a; n >= 0; n--)
    (a = i[n]) && (o = (s ? a(t, e, o) : a(o)) || o);
  return s && o && no(t, e, o), o;
};
let xt = class extends B {
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
xt.styles = ht`
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
], xt.prototype, "input", 2);
ne([
  _({ type: Boolean })
], xt.prototype, "disabled", 2);
ne([
  _()
], xt.prototype, "primaryColor", 2);
xt = ne([
  ut("chat-input")
], xt);
var lo = Object.defineProperty, co = Object.getOwnPropertyDescriptor, Tt = (i, t, e, s) => {
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
Q.styles = ht`
        :host {
            background: rgb(255, 255, 255);
            display: block;
            padding: 20px;
            height: 100vh;
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
Tt([
  _()
], Q.prototype, "primaryColor", 2);
Tt([
  _({ type: Boolean })
], Q.prototype, "loading", 2);
Tt([
  M()
], Q.prototype, "email", 2);
Tt([
  M()
], Q.prototype, "name", 2);
Tt([
  M()
], Q.prototype, "error", 2);
Q = Tt([
  ut("chat-email-form")
], Q);
var po = Object.defineProperty, ho = Object.getOwnPropertyDescriptor, St = (i, t, e, s) => {
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
                <div class="launcher" style="background: ${this.color}">
                    ${Hs(this.icon)}
                    ${this.launcherText}
                </div>
            </div>
        `;
  }
};
tt.styles = ht`
        :host {
            display: block;
            position: relative;
            cursor: pointer;
        }
        .bubble-container {
            display: flex;
            align-items: center;
            right: 10px;
            position: fixed;
            bottom: 20px;
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
            min-width:188px;
            height:25px;
        }
        .launcher:hover {
            transform: scale(1.05);
        }
            .launcher svg {
    width: 24px;
    height: 24px;
}
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
St([
  _()
], tt.prototype, "icon", 2);
St([
  _()
], tt.prototype, "color", 2);
St([
  _()
], tt.prototype, "launcherText", 2);
St([
  _({ type: Boolean })
], tt.prototype, "showPopup", 2);
St([
  _()
], tt.prototype, "popupText", 2);
tt = St([
  ut("chat-bubble")
], tt);
var uo = Object.defineProperty, fo = Object.getOwnPropertyDescriptor, $t = (i, t, e, s) => {
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
et.styles = ht`
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
$t([
  _()
], et.prototype, "primaryColor", 2);
$t([
  _()
], et.prototype, "supportPhone", 2);
$t([
  M()
], et.prototype, "mode", 2);
$t([
  M()
], et.prototype, "phone", 2);
$t([
  M()
], et.prototype, "status", 2);
et = $t([
  ut("chat-support-options")
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
      const u = this.messages.length - 1, h = [...this.messages];
      h[u] = { role: "assistant", content: (a == null ? void 0 : a.message) || "Thanks your call back request is registered our team will call you. Thanks" }, this.messages = h;
    } catch (n) {
      console.error("Callback request failed:", n), this.messages = [...this.messages, { role: "system", content: "Error: Please try again later" }];
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
    const u = /(https?:\/\/[^\s]+)/g, h = "followup_question";
    let f = "message";
    this.messages.push({ role: "assistant", content: "" });
    const b = this.messages.length - 1;
    let m = !1;
    const L = /【\d+:\d+†source】/g;
    for (; !m; ) {
      const { done: $, value: Ct } = await o.read();
      if ($) break;
      const ae = n.decode(Ct, { stream: !0 }).split(`
`);
      for (const Wt of ae) {
        if (!Wt.startsWith("data: ")) continue;
        const st = Wt.slice(6).trim();
        if (st === "[DONE]") {
          m = !0;
          break;
        }
        try {
          const w = JSON.parse(st);
          if (w.content) {
            const it = w.content.replace(L, "");
            if (a += it, f === "message") {
              const dt = [...this.messages];
              dt[b] = { role: "assistant", content: a }, this.messages = dt;
            }
            f === "message" && a.includes(h) && (f = "followup", this.messages[b].content = this.messages[b].content.replace(h, ""));
          }
        } catch (w) {
          console.warn("Failed to parse stream chunk:", w);
        }
      }
    }
    this.messages[b].content = a.replace(u, ($) => {
      const Ct = $.split("/").pop();
      return `<a href="${$}" target="_blank">${Ct}</a>`;
    });
    const { followups: T } = this.normalizeAssistantResponse(a);
    T != null && T.length && (this.messages[b].followups = T);
    try {
      await this.api.storeConversationMessage(e, "assistant", a);
    } catch ($) {
      console.error("Failed to store conversation message:", $), this.messages = [...this.messages, { role: "system", content: "Internal server error" }];
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
      console.error("Reset failed", s), i && (this.messages = [...this.messages, { role: "system", content: "Error: Failed to reset chat. Try again later" }]);
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
  _({ type: Object })
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
  ut("pristine-chat")
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
