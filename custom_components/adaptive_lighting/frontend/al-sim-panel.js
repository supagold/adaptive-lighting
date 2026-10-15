/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = globalThis, K = H.ShadowRoot && (H.ShadyCSS === void 0 || H.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), Q = /* @__PURE__ */ new WeakMap();
let mt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (K && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Q.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Q.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const wt = (s) => new mt(typeof s == "string" ? s : s + "", void 0, G), xt = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new mt(e, s, G);
}, At = (s, t) => {
  if (K) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = H.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, tt = K ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return wt(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: kt, defineProperty: Et, getOwnPropertyDescriptor: St, getOwnPropertyNames: Pt, getOwnPropertySymbols: Mt, getPrototypeOf: Ct } = Object, z = globalThis, et = z.trustedTypes, Tt = et ? et.emptyScript : "", Ot = z.reactiveElementPolyfillSupport, P = (s, t) => s, q = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Tt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, gt = (s, t) => !kt(s, t), it = { attribute: !0, type: String, converter: q, reflect: !1, useDefault: !1, hasChanged: gt };
Symbol.metadata ??= Symbol("metadata"), z.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let w = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = it) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Et(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: n } = St(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const l = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? it;
  }
  static _$Ei() {
    if (this.hasOwnProperty(P("elementProperties"))) return;
    const t = Ct(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(P("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(P("properties"))) {
      const e = this.properties, i = [...Pt(e), ...Mt(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(tt(r));
    } else t !== void 0 && e.push(tt(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return At(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : q).toAttribute(e, i.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : q;
      this._$Em = r;
      const l = o.fromAttribute(e, n.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? gt)(n, e) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, n] of i) {
        const { wrapped: o } = n, l = this[r];
        o !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, n, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
w.elementStyles = [], w.shadowRootOptions = { mode: "open" }, w[P("elementProperties")] = /* @__PURE__ */ new Map(), w[P("finalized")] = /* @__PURE__ */ new Map(), Ot?.({ ReactiveElement: w }), (z.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, st = (s) => s, L = X.trustedTypes, rt = L ? L.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, $t = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, vt = "?" + g, Nt = `<${vt}>`, _ = document, C = () => _.createComment(""), T = (s) => s === null || typeof s != "object" && typeof s != "function", Z = Array.isArray, Rt = (s) => Z(s) || typeof s?.[Symbol.iterator] == "function", I = `[ 	
\f\r]`, E = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, nt = /-->/g, ot = />/g, v = RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), at = /'/g, lt = /"/g, yt = /^(?:script|style|textarea|title)$/i, bt = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), u = bt(1), y = bt(2), A = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), ht = /* @__PURE__ */ new WeakMap(), b = _.createTreeWalker(_, 129);
function _t(s, t) {
  if (!Z(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return rt !== void 0 ? rt.createHTML(t) : t;
}
const Ut = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = E;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let d, f, p = -1, m = 0;
    for (; m < a.length && (o.lastIndex = m, f = o.exec(a), f !== null); ) m = o.lastIndex, o === E ? f[1] === "!--" ? o = nt : f[1] !== void 0 ? o = ot : f[2] !== void 0 ? (yt.test(f[2]) && (r = RegExp("</" + f[2], "g")), o = v) : f[3] !== void 0 && (o = v) : o === v ? f[0] === ">" ? (o = r ?? E, p = -1) : f[1] === void 0 ? p = -2 : (p = o.lastIndex - f[2].length, d = f[1], o = f[3] === void 0 ? v : f[3] === '"' ? lt : at) : o === lt || o === at ? o = v : o === nt || o === ot ? o = E : (o = v, r = void 0);
    const h = o === v && s[l + 1].startsWith("/>") ? " " : "";
    n += o === E ? a + Nt : p >= 0 ? (i.push(d), a.slice(0, p) + $t + a.slice(p) + g + h) : a + g + (p === -2 ? l : h);
  }
  return [_t(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class O {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [d, f] = Ut(t, e);
    if (this.el = O.createElement(d, i), b.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = b.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith($t)) {
          const m = f[o++], h = r.getAttribute(p).split(g), $ = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: n, name: $[2], strings: h, ctor: $[1] === "." ? Lt : $[1] === "?" ? jt : $[1] === "@" ? zt : D }), r.removeAttribute(p);
        } else p.startsWith(g) && (a.push({ type: 6, index: n }), r.removeAttribute(p));
        if (yt.test(r.tagName)) {
          const p = r.textContent.split(g), m = p.length - 1;
          if (m > 0) {
            r.textContent = L ? L.emptyScript : "";
            for (let h = 0; h < m; h++) r.append(p[h], C()), b.nextNode(), a.push({ type: 2, index: ++n });
            r.append(p[m], C());
          }
        }
      } else if (r.nodeType === 8) if (r.data === vt) a.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(g, p + 1)) !== -1; ) a.push({ type: 7, index: n }), p += g.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = _.createElement("template");
    return i.innerHTML = t, i;
  }
}
function k(s, t, e = s, i) {
  if (t === A) return t;
  let r = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const n = T(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = r : e._$Cl = r), r !== void 0 && (t = k(s, r._$AS(s, t.values), r, i)), t;
}
class Ht {
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
    const { el: { content: e }, parts: i } = this._$AD, r = (t?.creationScope ?? _).importNode(e, !0);
    b.currentNode = r;
    let n = b.nextNode(), o = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let d;
        a.type === 2 ? d = new N(n, n.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (d = new Dt(n, this, t)), this._$AV.push(d), a = i[++l];
      }
      o !== a?.index && (n = b.nextNode(), o++);
    }
    return b.currentNode = _, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class N {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = k(this, t, e), T(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Rt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && T(this._$AH) ? this._$AA.nextSibling.data = t : this.T(_.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = O.createElement(_t(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const n = new Ht(r, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = ht.get(t.strings);
    return e === void 0 && ht.set(t.strings, e = new O(t)), e;
  }
  k(t) {
    Z(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new N(this.O(C()), this.O(C()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = st(t).nextSibling;
      st(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class D {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = k(this, t, e, 0), o = !T(t) || t !== this._$AH && t !== A, o && (this._$AH = t);
    else {
      const l = t;
      let a, d;
      for (t = n[0], a = 0; a < n.length - 1; a++) d = k(this, l[i + a], e, a), d === A && (d = this._$AH[a]), o ||= !T(d) || d !== this._$AH[a], d === c ? t = c : t !== c && (t += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Lt extends D {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class jt extends D {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class zt extends D {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = k(this, t, e, 0) ?? c) === A) return;
    const i = this._$AH, r = t === c && i !== c || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== c && (i === c || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Dt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    k(this, t);
  }
}
const Bt = X.litHtmlPolyfillSupport;
Bt?.(O, N), (X.litHtmlVersions ??= []).push("3.3.3");
const Ft = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = e?.renderBefore ?? null;
    i._$litPart$ = r = new N(t.insertBefore(C(), n), n, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis;
class M extends w {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ft(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return A;
  }
}
M._$litElement$ = !0, M.finalized = !0, Y.litElementHydrateSupport?.({ LitElement: M });
const It = Y.litElementPolyfillSupport;
It?.({ LitElement: M });
(Y.litElementVersions ??= []).push("4.2.2");
function ct(s) {
  return s.length ? s[s.length - 1].minute : 1440;
}
function x(s, t) {
  const e = t.width - t.padLeft - t.padRight, i = Math.min(Math.max(s, 0), t.totalMinutes);
  return t.padLeft + i / t.totalMinutes * e;
}
function Wt(s, t) {
  const e = t.width - t.padLeft - t.padRight, i = (s - t.padLeft) / e;
  return Math.min(Math.max(i, 0), 1) * t.totalMinutes;
}
function V(s, t) {
  if (!s.length) return -1;
  let e = 0, i = s.length - 1;
  for (; e < i; ) {
    const r = e + i >> 1;
    s[r].minute < t ? e = r + 1 : i = r;
  }
  return e > 0 && t - s[e - 1].minute <= s[e].minute - t ? e - 1 : e;
}
function R(s) {
  return s.slice(11, 16);
}
function qt(s, t) {
  const e = V(s, t);
  if (e < 0) throw new Error("no samples");
  const i = s[e], r = Date.parse(i.t) + (t - i.minute) * 6e4, n = i.t.slice(19), o = Vt(n);
  return new Date(r + o * 6e4).toISOString().slice(0, 19) + n;
}
function Vt(s) {
  const t = /^([+-])(\d{2}):(\d{2})$/.exec(s);
  return t ? (t[1] === "-" ? -1 : 1) * (parseInt(t[2], 10) * 60 + parseInt(t[3], 10)) : 0;
}
function Jt(s, t = 5) {
  return Math.round(s / t) * t;
}
function S(s, t) {
  const e = t.height - t.padTop - t.padBottom, i = Math.min(Math.max(s, 0), 100);
  return t.padTop + (1 - i / 100) * e;
}
function Kt(s, t) {
  return s.map((e, i) => `${i ? "L" : "M"}${x(e.minute, t).toFixed(1)},${S(e.brightness_pct, t).toFixed(1)}`).join("");
}
function Gt(s, t = 3) {
  if (!s.length) return [];
  const e = s[s.length - 1].minute || 1, i = [];
  for (let n = 0; n < s.length; n += t) {
    const o = s[n];
    i.push({ offset: o.minute / e, rgb: `rgb(${o.rgb_color.join(",")})` });
  }
  const r = s[s.length - 1];
  return i[i.length - 1].offset !== 1 && i.push({ offset: 1, rgb: `rgb(${r.rgb_color.join(",")})` }), i;
}
function Xt(s, t = 3) {
  const e = [];
  for (let i = 0; i <= s; i += t * 60) e.push(i);
  return e;
}
const Zt = {
  now: () => performance.now(),
  schedule: (s) => requestAnimationFrame(() => s()),
  cancel: (s) => cancelAnimationFrame(s)
};
class Yt {
  constructor(t, e, i, r = Zt) {
    this.totalMinutes = t, this.durationMs = e, this.onTick = i, this.clock = r, this.minute = 0, this.playing = !1, this.startedAt = 0, this.startMinute = 0, this.handle = null;
  }
  play() {
    this.playing || (this.minute >= this.totalMinutes && (this.minute = 0), this.playing = !0, this.startedAt = this.clock.now(), this.startMinute = this.minute, this.loop());
  }
  pause() {
    this.playing && (this.playing = !1, this.handle !== null && this.clock.cancel(this.handle), this.handle = null, this.onTick(this.minute, !1));
  }
  toggle() {
    this.playing ? this.pause() : this.play();
  }
  /** Jump to a minute; keeps playing from there if playing. */
  seek(t) {
    this.minute = Math.min(Math.max(t, 0), this.totalMinutes), this.startedAt = this.clock.now(), this.startMinute = this.minute, this.onTick(this.minute, this.playing);
  }
  setDuration(t) {
    this.startedAt = this.clock.now(), this.startMinute = this.minute, this.durationMs = Math.max(t, 1e3);
  }
  /** Advance to the clock's current time. Called every frame; public for tests. */
  tick() {
    if (!this.playing) return;
    const t = this.clock.now() - this.startedAt, e = this.totalMinutes / this.durationMs;
    if (this.minute = Math.min(this.startMinute + t * e, this.totalMinutes), this.minute >= this.totalMinutes) {
      this.playing = !1, this.handle = null, this.onTick(this.minute, !1);
      return;
    }
    this.onTick(this.minute, !0);
  }
  loop() {
    this.handle = this.clock.schedule(() => {
      this.tick(), this.playing && this.loop();
    });
  }
}
class Qt {
  constructor(t, e, i = () => Date.now(), r = (o, l) => setTimeout(o, l), n = (o) => clearTimeout(o)) {
    this.intervalMs = t, this.send = e, this.now = i, this.setTimer = r, this.clearTimer = n, this.last = -1 / 0, this.pending = null, this.timer = null;
  }
  push(t) {
    const e = this.last + this.intervalMs - this.now();
    if (e <= 0) {
      this.fire(t);
      return;
    }
    this.pending = { value: t }, this.timer === null && (this.timer = this.setTimer(() => {
      this.timer = null;
      const i = this.pending;
      this.pending = null, i && this.fire(i.value);
    }, e));
  }
  cancel() {
    this.timer !== null && this.clearTimer(this.timer), this.timer = null, this.pending = null;
  }
  fire(t) {
    this.last = this.now(), this.send(t);
  }
}
function dt(s, t) {
  let e = "string", i;
  if (s.selector) {
    const r = Object.keys(s.selector)[0];
    r === "select" ? (e = "select", i = s.selector.select.options) : r === "entity" ? e = "entity" : r === "color_rgb" && (e = "color_rgb");
  } else (s.type === "boolean" || s.type === "integer" || s.type === "float") && (e = s.type);
  return { name: s.name, section: t, kind: e, min: s.valueMin, max: s.valueMax, options: i, value: s.default };
}
function pt(s) {
  if (!s.data_schema) throw new Error("This profile has no editable options (YAML-configured?)");
  const t = { flowId: s.flow_id, sections: [], fields: [] };
  for (const e of s.data_schema)
    if (e.type === "expandable") {
      t.sections.push(e.name);
      for (const i of e.schema ?? []) t.fields.push(dt(i, e.name));
    } else
      t.fields.push(dt(e, null));
  return t;
}
function U(s) {
  return Object.fromEntries(s.fields.map((t) => [t.name, t.value]));
}
function te(s, t) {
  return JSON.stringify(s) === JSON.stringify(t);
}
function ee(s, t) {
  const e = {};
  for (const [i, r] of Object.entries(t)) te(s[i], r) || (e[i] = r);
  return e;
}
function ie(s, t) {
  const e = Object.fromEntries(s.sections.map((i) => [i, {}]));
  for (const i of s.fields) {
    const r = i.name in t ? t[i.name] : i.value;
    i.section ? e[i.section][i.name] = r : e[i.name] = r;
  }
  return e;
}
function se(s, t) {
  if (s.kind === "boolean") return [!!t, null];
  const e = String(t).trim();
  if (s.kind === "integer" || s.kind === "float") {
    if (e === "") return [null, "required"];
    const i = s.kind === "integer" ? Number(e) : parseFloat(e);
    return !Number.isFinite(i) || s.kind === "integer" && !Number.isInteger(i) ? [e, `expected ${s.kind === "integer" ? "a whole number" : "a number"}`] : s.min !== void 0 && i < s.min ? [i, `minimum ${s.min}`] : s.max !== void 0 && i > s.max ? [i, `maximum ${s.max}`] : [i, null];
  }
  if (s.kind === "select") return s.options?.includes(e) ? [e, null] : [e, "not an allowed value"];
  if (s.kind === "entity") return [e.split(",").map((i) => i.trim()).filter(Boolean), null];
  if (s.kind === "color_rgb") {
    const i = e.split(",").map((r) => Number(r.trim()));
    return i.length !== 3 || i.some((r) => !Number.isInteger(r) || r < 0 || r > 255) ? [e, "expected R,G,B (0-255)"] : [i, null];
  }
  return [e, null];
}
function W(s) {
  return s == null ? "—" : Array.isArray(s) ? s.join(", ") : String(s);
}
const ut = { totalMinutes: 1440, width: 1e3, height: 300, padLeft: 44, padRight: 12, padTop: 14, padBottom: 58 }, ft = 18, re = [15, 30, 60, 120], ne = { sunrise: "sunrise", sunset: "sunset", solar_noon: "noon", solar_midnight: "midnight" }, j = class j extends M {
  constructor() {
    super(), this.curveTimer = null, this.pointTimer = null, this.unsubPreview = null, this.loaded = !1, this.resize = new ResizeObserver((t) => {
      const e = Math.round(t[0].contentRect.width);
      e > 0 && Math.abs(e - this.chartWidth) > 4 && (this.chartWidth = Math.min(Math.max(e, 300), 1400));
    }), this.profiles = [], this.selected = "", this.form = null, this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.curve = null, this.date = "", this.sleep = !1, this.minute = 12 * 60, this.playing = !1, this.duration = 30, this.point = null, this.preview = "off", this.message = "", this.confirming = !1, this.busy = !1, this.chartWidth = 1e3, this.playback = new Yt(1440, 3e4, (t, e) => {
      this.minute = t, this.playing = e, this.schedulePoint(e ? 120 : 0);
    }), this.playback.minute = this.minute, this.previewSender = new Qt(1e3, (t) => void this.sendPreview(t));
  }
  // ------------------------------------------------------------- lifecycle
  updated(t) {
    t.has("hass") && this.hass && !this.loaded && (this.loaded = !0, this.loadProfiles());
  }
  firstUpdated() {
    const t = this.renderRoot.querySelector(".chartcard");
    t && this.resize.observe(t);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.resize.disconnect(), this.playback.pause(), this.stopPreview();
  }
  ws(t) {
    return this.hass.connection.sendMessagePromise(t);
  }
  // ---------------------------------------------------------------- loading
  async loadProfiles(t = !1) {
    try {
      const e = await this.ws({ type: "adaptive_lighting/sim/profiles" });
      this.profiles = e.profiles;
      const i = t && this.profiles.some((n) => n.entry_id === this.selected), r = this.profiles.find((n) => n.lights.length) ?? this.profiles[0];
      !i && r ? await this.selectProfile(r.entry_id) : i && await this.selectProfile(this.selected);
    } catch (e) {
      this.message = `Could not load profiles: ${e.message ?? e}`;
    }
  }
  async selectProfile(t) {
    await this.stopPreview(), this.playback.pause(), this.selected = t, this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.confirming = !1, this.form = await this.readForm(t), await this.refreshCurve();
  }
  /** Read the options form (types, limits, current values) and close the flow again. */
  async readForm(t) {
    let e = null;
    try {
      const i = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: t });
      return e = i.flow_id, pt(i);
    } catch (i) {
      return this.message = `Could not read options: ${i.message ?? i}`, null;
    } finally {
      e && await this.hass.callApi("DELETE", `config/config_entries/options/flow/${e}`).catch(() => {
      });
    }
  }
  get overrides() {
    return this.form ? ee(U(this.form), this.edited) : {};
  }
  async refreshCurve() {
    if (!this.selected) return;
    const t = {
      type: "adaptive_lighting/sim/curve",
      entry_id: this.selected,
      overrides: this.overrides,
      sleep: this.sleep
    };
    this.date && (t.date = this.date);
    const e = await this.ws(t);
    if (e.errors) {
      this.serverErrors = e.errors;
      return;
    }
    this.serverErrors = {}, this.curve = e, this.date = e.date;
    const i = ct(e.samples);
    this.playback.totalMinutes = i, this.minute > i && (this.minute = i), this.schedulePoint(0);
  }
  scheduleCurve() {
    this.curveTimer && clearTimeout(this.curveTimer), this.curveTimer = setTimeout(() => void this.refreshCurve(), 250);
  }
  schedulePoint(t) {
    this.pointTimer || (this.pointTimer = setTimeout(() => {
      this.pointTimer = null, this.refreshPoint();
    }, t));
  }
  async refreshPoint() {
    if (!this.curve?.samples.length) return;
    const t = qt(this.curve.samples, this.minute), e = await this.ws({
      type: "adaptive_lighting/sim/point",
      entry_id: this.selected,
      overrides: this.overrides,
      at: t,
      sleep: this.sleep
    });
    e.errors || (this.point = e), this.preview === "active" && this.previewSender.push(t);
  }
  // ---------------------------------------------------------------- preview
  async togglePreview() {
    this.preview === "off" ? await this.startPreview() : await this.stopPreview();
  }
  async startPreview() {
    this.preview = "starting";
    try {
      this.unsubPreview = await this.hass.connection.subscribeMessage(
        (t) => {
          t.status === "active" ? (this.preview = "active", this.schedulePoint(0)) : t.status === "ended" && (this.preview = "off", this.unsubPreview = null, this.previewSender.cancel(), this.message = t.reason === "timeout" ? "Preview timed out; lights are back to normal." : `Preview ended (${t.reason}).`);
        },
        { type: "adaptive_lighting/sim/preview", entry_id: this.selected, timeout_s: 600 }
      );
    } catch (t) {
      this.preview = "off", this.message = `Couldn't start preview: ${t.message ?? t}`;
    }
  }
  async stopPreview() {
    this.previewSender.cancel();
    const t = this.unsubPreview;
    this.unsubPreview = null, this.preview = "off", t && await t().catch(() => {
    });
  }
  async sendPreview(t) {
    this.preview === "active" && await this.ws({
      type: "adaptive_lighting/sim/preview/set",
      entry_id: this.selected,
      overrides: this.overrides,
      at: t,
      sleep: this.sleep,
      transition_s: 1
    }).catch(() => {
    });
  }
  // ---------------------------------------------------------------- editing
  onField(t, e) {
    const [i, r] = se(t, e), n = { ...this.fieldErrors };
    r ? n[t.name] = r : delete n[t.name], this.fieldErrors = n, r || (this.edited = { ...this.edited, [t.name]: i }, this.scheduleCurve());
  }
  discard() {
    this.edited = {}, this.fieldErrors = {}, this.confirming = !1, this.scheduleCurve();
  }
  async apply() {
    if (!this.form) return;
    const t = this.overrides;
    this.busy = !0;
    let e = null, i = !1;
    try {
      const r = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: this.selected });
      e = r.flow_id;
      const n = pt(r), o = U(this.form), l = U(n), a = Object.keys(l).filter((f) => !(f in t) && JSON.stringify(l[f]) !== JSON.stringify(o[f]));
      if (a.length) {
        this.message = `This profile was changed elsewhere since you opened it (${a.join(", ")}). Reload before saving.`;
        return;
      }
      const d = await this.hass.callApi(
        "POST",
        `config/config_entries/options/flow/${e}`,
        ie(n, { ...l, ...t })
      );
      if (d.type !== "create_entry") {
        this.message = `Home Assistant rejected the options: ${JSON.stringify(d.errors ?? d)}`;
        return;
      }
      i = !0, this.message = `Saved ${Object.keys(t).length} change(s) to ${this.profileTitle}.`, this.confirming = !1, await this.loadProfiles(!0);
    } catch (r) {
      this.message = `Save failed: ${r.message ?? r}`;
    } finally {
      e && !i && await this.hass.callApi("DELETE", `config/config_entries/options/flow/${e}`).catch(() => {
      }), this.busy = !1;
    }
  }
  get profileTitle() {
    return this.profiles.find((t) => t.entry_id === this.selected)?.title ?? "";
  }
  // ------------------------------------------------------------------ chart
  onChartPointer(t) {
    if (t.type === "pointermove" && t.buttons === 0) return;
    const e = t.currentTarget, i = e.getBoundingClientRect(), r = this.box(this.playback.totalMinutes), n = (t.clientX - i.left) / i.width * r.width;
    this.playback.seek(Jt(Wt(n, r))), t.type === "pointerdown" && e.setPointerCapture(t.pointerId);
  }
  onChartKey(t) {
    const e = t.shiftKey ? 60 : 15;
    if (t.key === "ArrowRight") this.playback.seek(this.minute + e);
    else if (t.key === "ArrowLeft") this.playback.seek(this.minute - e);
    else if (t.key === " ") this.playback.toggle();
    else return;
    t.preventDefault();
  }
  box(t) {
    const e = this.chartWidth < 600;
    return { ...ut, width: this.chartWidth, height: e ? 240 : ut.height, totalMinutes: t };
  }
  renderChart() {
    const t = this.curve?.samples ?? [], e = this.box(ct(t)), i = e.width < 600, n = (this.profiles.find((h) => h.entry_id === this.selected)?.lights ?? []).some((h) => h.features?.includes("color") || h.features?.includes("color_temp")), o = e.height - e.padBottom + 22, l = V(t, this.minute), a = l >= 0 ? t[l] : null, d = x(this.minute, e), f = Gt(t), p = Object.entries(this.curve?.sun ?? {}), m = t.length ? Date.parse(t[0].t) : 0;
    return u`
      <svg
        class="chart"
        viewBox="0 0 ${e.width} ${e.height}"
        role="slider"
        tabindex="0"
        aria-label="Time of day. Arrow keys move 15 minutes, space plays."
        aria-valuemin="0"
        aria-valuemax=${e.totalMinutes}
        aria-valuenow=${Math.round(this.minute)}
        aria-valuetext=${a ? R(a.t) : ""}
        @pointerdown=${this.onChartPointer}
        @pointermove=${this.onChartPointer}
        @keydown=${this.onChartKey}
      >
        <defs>
          <linearGradient id="ct" x1="0" x2="1">
            ${f.map((h) => y`<stop offset=${h.offset} stop-color=${h.rgb}></stop>`)}
          </linearGradient>
        </defs>
        ${[0, 25, 50, 75, 100].map(
      (h) => y`
            <line class="grid" x1=${e.padLeft} x2=${e.width - e.padRight} y1=${S(h, e)} y2=${S(h, e)}></line>
            <text class="axis" x=${e.padLeft - 6} y=${S(h, e) + 4} text-anchor="end">${h}%</text>`
    )}
        ${Xt(e.totalMinutes, i ? 6 : 3).map(
      (h) => y`
            <line class="grid" x1=${x(h, e)} x2=${x(h, e)} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            <text class="axis" x=${x(h, e)} y=${e.height - e.padBottom + 14} text-anchor="middle">${t.length ? R(t[V(t, h)].t) : ""}</text>`
    )}
        ${p.map(([h, $]) => {
      const B = (Date.parse($) - m) / 6e4;
      if (B < 0 || B > e.totalMinutes) return c;
      const F = x(B, e);
      return y`
            <line class="sun" x1=${F} x2=${F} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            ${i && (h === "solar_noon" || h === "solar_midnight") ? c : y`<text class="sunlabel" x=${F + 3} y=${e.padTop + 10}>${i ? "" : `${ne[h] ?? h} `}${R($)}</text>`}`;
    })}
        <path class="line" d=${Kt(t, e)}></path>
        <rect x=${e.padLeft} y=${o} width=${e.width - e.padLeft - e.padRight} height=${ft} rx="3" fill="url(#ct)" opacity=${n ? 1 : 0.25}></rect>
        <text class="axis" x=${e.padLeft - 6} y=${o + 13} text-anchor="end">colour</text>
        ${n ? c : y`<text class="axis" x=${e.padLeft + 8} y=${o + 13}>not used: these lights are dimmer-only</text>`}
        <line class="playhead" x1=${d} x2=${d} y1=${e.padTop} y2=${o + ft}></line>
        ${a ? y`<circle class="dot" cx=${d} cy=${S(a.brightness_pct, e)} r="6"></circle>` : c}
      </svg>
    `;
  }
  // ------------------------------------------------------------- point view
  renderPoint() {
    const t = this.point;
    if (!t) return u`<p class="muted">Pick a time on the chart.</p>`;
    const e = this.profiles.find((r) => r.entry_id === this.selected), i = t.settings;
    return u`
      <div class="now">
        <span class="time">${R(t.t)}</span>
        <span>${i.brightness_pct.toFixed(0)}% brightness</span>
        <span>${i.color_temp_kelvin} K</span>
        ${this.sleep ? u`<span class="tag">sleep mode</span>` : c}
      </div>
      <div class="lights">
        ${(e?.lights ?? []).map((r) => this.renderLight(r.entity_id, r.name ?? r.entity_id, t.per_light[r.entity_id]))}
      </div>
      <p class="muted small">Swatches show colour and relative brightness; a screen can't show how bright a bulb really is.</p>
    `;
  }
  renderLight(t, e, i) {
    if (!i || i.error) return u`<div class="light"><div class="swatch none"></div><div><b>${e}</b><br /><span class="warn">${i?.error ?? "no data"}</span></div></div>`;
    const r = i.brightness !== void 0 ? Math.round(i.brightness / 255 * 100) : null, n = i.display_rgb ?? [255, 244, 229], o = r === null ? 1 : 0.15 + 0.85 * (r / 100), l = `rgb(${n.map((d) => Math.round(d * o)).join(",")})`, a = i.rgb_color ? `RGB ${i.rgb_color.join(", ")}` : i.color_temp_kelvin ? `${i.color_temp_kelvin} K` : "dimmer only";
    return u`
      <div class="light" title=${t}>
        <div class="swatch" style="background:${l}"></div>
        <div><b>${e}</b><br /><span>${r ?? "—"}% · ${a}</span></div>
      </div>
    `;
  }
  // ------------------------------------------------------------ options UI
  renderField(t) {
    const e = t.name in this.edited ? this.edited[t.name] : t.value, i = t.name in this.overrides, r = this.fieldErrors[t.name] ?? this.serverErrors[t.name], n = t.name.replaceAll("_", " ");
    let o;
    return t.kind === "boolean" ? o = u`<input type="checkbox" .checked=${!!e} @change=${(l) => this.onField(t, l.target.checked)} />` : t.kind === "select" ? o = u`<select @change=${(l) => this.onField(t, l.target.value)}>
        ${t.options?.map((l) => u`<option value=${l} ?selected=${l === e}>${l}</option>`)}
      </select>` : t.kind === "integer" || t.kind === "float" ? o = u`<input type="number" .value=${String(e ?? "")} min=${t.min ?? c} max=${t.max ?? c} step=${t.kind === "integer" ? 1 : "any"}
        @input=${(l) => this.onField(t, l.target.value)} />` : o = u`<input type="text" .value=${W(e) === "—" ? "" : Array.isArray(e) ? e.join(", ") : String(e)}
        @change=${(l) => this.onField(t, l.target.value)} />`, u`
      <label class="field ${i ? "changed" : ""} ${r ? "error" : ""}">
        <span>${n}${i ? u` <em>(edited)</em>` : c}</span>
        ${o}
        ${r ? u`<span class="warn">⚠ ${r}</span>` : c}
      </label>
    `;
  }
  renderOptionsCard() {
    if (!this.form) return u`<p class="muted">Options unavailable.</p>`;
    const t = this.form.fields.filter((n) => !n.section), e = this.overrides, i = Object.keys(e).length, r = U(this.form);
    return u`
      <div class="fields">${t.map((n) => this.renderField(n))}</div>
      ${this.form.sections.map(
      (n) => u`<details>
          <summary>${n} options</summary>
          <div class="fields">${this.form.fields.filter((o) => o.section === n).map((o) => this.renderField(o))}</div>
        </details>`
    )}
      <div class="actions">
        <span class="muted">${i ? `${i} unsaved change(s), already shown in the chart` : "No unsaved changes"}</span>
        <button ?disabled=${!i || this.busy} @click=${this.discard}>Discard</button>
        <button class="primary" ?disabled=${!i || this.busy || Object.keys(this.fieldErrors).length > 0} @click=${() => this.confirming = !0}>Save…</button>
      </div>
      ${this.confirming ? u`<div class="confirm" role="dialog" aria-label="Confirm changes">
            <b>Save these changes to ${this.profileTitle}?</b>
            <table>
              ${Object.entries(e).map(([n, o]) => u`<tr><td>${n.replaceAll("_", " ")}</td><td>${W(r[n])}</td><td>→</td><td><b>${W(o)}</b></td></tr>`)}
            </table>
            <div class="actions">
              <button @click=${() => this.confirming = !1}>Cancel</button>
              <button class="primary" ?disabled=${this.busy} @click=${this.apply}>${this.busy ? "Saving…" : "Save to profile"}</button>
            </div>
          </div>` : c}
    `;
  }
  // ----------------------------------------------------------------- render
  render() {
    const t = this.profiles.find((e) => e.entry_id === this.selected);
    return u`
      <div class="toolbar">
        <h1>Adaptive Lighting</h1>
        <label>Profile
          <select @change=${(e) => void this.selectProfile(e.target.value)}>
            ${this.profiles.map((e) => u`<option value=${e.entry_id} ?selected=${e.entry_id === this.selected}>${e.title}${e.lights.length ? "" : " (no lights)"}</option>`)}
          </select>
        </label>
        <label>Day <input type="date" .value=${this.date} @change=${(e) => {
      this.date = e.target.value, this.refreshCurve();
    }} /></label>
        <label class="inline"><input type="checkbox" .checked=${this.sleep} @change=${(e) => {
      this.sleep = e.target.checked, this.refreshCurve();
    }} /> Sleep mode</label>
      </div>
      ${this.message ? u`<div class="banner" role="status">${this.message} <button class="link" @click=${() => this.message = ""}>dismiss</button></div>` : c}
      ${t?.error ? u`<div class="banner warnbg">⚠ ${t.error}</div>` : c}
      ${t && !t.lights.length ? u`<div class="banner">This profile has no lights, so it doesn't control anything.</div>` : c}

      <section class="card chartcard">
        ${this.renderChart()}
        <div class="controls">
          <button class="primary" @click=${() => this.playback.toggle()} aria-pressed=${this.playing}>${this.playing ? "❚❚ Pause" : "▶ Play the day"}</button>
          <label>over
            <select @change=${(e) => {
      this.duration = Number(e.target.value), this.playback.setDuration(this.duration * 1e3);
    }}>
              ${re.map((e) => u`<option value=${e} ?selected=${e === this.duration}>${e} s</option>`)}
            </select>
          </label>
          <span class="spacer"></span>
          <label class="inline preview ${this.preview}">
            <input type="checkbox" .checked=${this.preview !== "off"} ?disabled=${!t?.loaded || !t?.lights.length} @change=${this.togglePreview} />
            Preview on real lights
            <span class="tag">${this.preview === "active" ? "ON: lights follow the playhead" : this.preview === "starting" ? "starting…" : "off"}</span>
          </label>
        </div>
      </section>

      <section class="card">${this.renderPoint()}</section>
      <section class="card"><h2>Options</h2>${this.renderOptionsCard()}</section>
    `;
  }
};
j.properties = {
  hass: { attribute: !1 },
  narrow: { type: Boolean },
  profiles: { state: !0 },
  selected: { state: !0 },
  form: { state: !0 },
  edited: { state: !0 },
  fieldErrors: { state: !0 },
  serverErrors: { state: !0 },
  curve: { state: !0 },
  date: { state: !0 },
  sleep: { state: !0 },
  minute: { state: !0 },
  playing: { state: !0 },
  duration: { state: !0 },
  point: { state: !0 },
  preview: { state: !0 },
  message: { state: !0 },
  confirming: { state: !0 },
  busy: { state: !0 },
  chartWidth: { state: !0 }
}, j.styles = xt`
    :host {
      display: block;
      padding: 16px;
      max-width: 1100px;
      margin: 0 auto;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, inherit);
      box-sizing: border-box;
    }
    h1 { font-size: 1.4em; margin: 0 16px 0 0; font-weight: 400; }
    h2 { font-size: 1.1em; margin: 0 0 12px; font-weight: 500; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: end; margin-bottom: 12px; }
    .toolbar label { display: flex; flex-direction: column; font-size: 0.85em; color: var(--secondary-text-color); gap: 2px; }
    label.inline { flex-direction: row !important; align-items: center; gap: 6px; }
    select, input[type="text"], input[type="number"], input[type="date"] {
      font: inherit; color: var(--primary-text-color); background: var(--card-background-color);
      border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; min-width: 0;
    }
    .card { background: var(--card-background-color); border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, none); border: 1px solid var(--divider-color); padding: 16px; margin-bottom: 16px; }
    .chart { width: 100%; height: auto; touch-action: none; cursor: crosshair; display: block; outline: none; }
    .chart:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 6px; }
    .grid { stroke: var(--divider-color); stroke-width: 1; }
    .axis { fill: var(--secondary-text-color); font-size: 12px; }
    .sun { stroke: var(--secondary-text-color); stroke-dasharray: 4 4; stroke-width: 1; opacity: 0.7; }
    .sunlabel { fill: var(--secondary-text-color); font-size: 11px; }
    .line { fill: none; stroke: var(--primary-color); stroke-width: 3; }
    .playhead { stroke: var(--primary-text-color); stroke-width: 2; }
    .dot { fill: var(--card-background-color); stroke: var(--primary-color); stroke-width: 3; }
    .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin-top: 12px; }
    .spacer { flex: 1; }
    button { font: inherit; padding: 6px 14px; border-radius: 18px; border: 1px solid var(--divider-color);
      background: var(--card-background-color); color: var(--primary-text-color); cursor: pointer; }
    button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
    button:disabled { opacity: 0.45; cursor: default; }
    button.link { border: none; background: none; color: var(--primary-color); padding: 0 4px; text-decoration: underline; }
    .tag { font-size: 0.8em; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
    .preview.active .tag { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); font-weight: 600; }
    .now { display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: baseline; margin-bottom: 12px; }
    .now .time { font-size: 1.8em; font-weight: 300; }
    .lights { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
    .light { display: flex; gap: 10px; align-items: center; }
    .swatch { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--divider-color); flex: none; }
    .swatch.none { background: repeating-linear-gradient(45deg, var(--divider-color) 0 4px, transparent 4px 8px); }
    .muted { color: var(--secondary-text-color); }
    .small { font-size: 0.8em; margin-bottom: 0; }
    .fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px 16px; margin-bottom: 12px; }
    .field { display: flex; flex-direction: column; gap: 3px; font-size: 0.9em; }
    .field > span:first-child { color: var(--secondary-text-color); text-transform: capitalize; }
    .field.changed > span:first-child { color: var(--primary-color); font-weight: 600; }
    .field.changed input, .field.changed select { border-color: var(--primary-color); border-width: 2px; }
    .field.error input, .field.error select { border-color: var(--warning-color, #ffa600); border-width: 2px; }
    .field em { font-style: normal; font-weight: 400; }
    .warn { color: var(--warning-color, #b36b00); font-size: 0.85em; }
    details { margin: 4px 0 12px; }
    summary { cursor: pointer; color: var(--primary-color); margin-bottom: 10px; text-transform: capitalize; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-end; }
    .actions .muted { margin-right: auto; }
    .confirm { margin-top: 12px; padding: 12px; border: 2px solid var(--primary-color); border-radius: 10px; }
    .confirm table { border-collapse: collapse; margin: 10px 0; }
    .confirm td { padding: 2px 10px 2px 0; }
    .banner { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--divider-color); background: var(--card-background-color); }
    .warnbg { border-color: var(--warning-color, #ffa600); }
    @media (max-width: 600px) {
      :host { padding: 8px; }
      .card { padding: 10px; }
      .now .time { font-size: 1.4em; }
    }
  `;
let J = j;
customElements.get("al-sim-panel") || customElements.define("al-sim-panel", J);
export {
  J as AlSimPanel
};
