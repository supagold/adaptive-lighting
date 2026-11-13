/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = globalThis, Y = D.ShadowRoot && (D.ShadyCSS === void 0 || D.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = Symbol(), st = /* @__PURE__ */ new WeakMap();
let _t = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Y && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = st.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && st.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Tt = (s) => new _t(typeof s == "string" ? s : s + "", void 0, Q), Lt = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new _t(e, s, Q);
}, Ot = (s, t) => {
  if (Y) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = D.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, rt = Y ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Tt(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ht, defineProperty: Rt, getOwnPropertyDescriptor: Nt, getOwnPropertyNames: Ut, getOwnPropertySymbols: jt, getPrototypeOf: Dt } = Object, F = globalThis, nt = F.trustedTypes, Bt = nt ? nt.emptyScript : "", zt = F.reactiveElementPolyfillSupport, T = (s, t) => s, V = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Bt : null;
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
} }, xt = (s, t) => !Ht(s, t), ot = { attribute: !0, type: String, converter: V, reflect: !1, useDefault: !1, hasChanged: xt };
Symbol.metadata ??= Symbol("metadata"), F.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let x = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ot) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && Rt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: n } = Nt(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? ot;
  }
  static _$Ei() {
    if (this.hasOwnProperty(T("elementProperties"))) return;
    const t = Dt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(T("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(T("properties"))) {
      const e = this.properties, i = [...Ut(e), ...jt(e)];
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
      for (const r of i) e.unshift(rt(r));
    } else t !== void 0 && e.push(rt(t));
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
    return Ot(t, this.constructor.elementStyles), t;
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
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : V).toAttribute(e, i.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : V;
      this._$Em = r;
      const l = o.fromAttribute(e, n.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? xt)(n, e) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
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
x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, x[T("elementProperties")] = /* @__PURE__ */ new Map(), x[T("finalized")] = /* @__PURE__ */ new Map(), zt?.({ ReactiveElement: x }), (F.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt = globalThis, at = (s) => s, B = tt.trustedTypes, lt = B ? B.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, kt = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, At = "?" + v, Ft = `<${At}>`, w = document, O = () => w.createComment(""), H = (s) => s === null || typeof s != "object" && typeof s != "function", et = Array.isArray, It = (s) => et(s) || typeof s?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ht = /-->/g, ct = />/g, y = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), dt = /'/g, ut = /"/g, St = /^(?:script|style|textarea|title)$/i, Et = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), c = Et(1), $ = Et(2), S = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), pt = /* @__PURE__ */ new WeakMap(), b = w.createTreeWalker(w, 129);
function Mt(s, t) {
  if (!et(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return lt !== void 0 ? lt.createHTML(t) : t;
}
const Wt = (s, t) => {
  const e = s.length - 1, i = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = P;
  for (let l = 0; l < e; l++) {
    const h = s[l];
    let a, d, p = -1, m = 0;
    for (; m < h.length && (o.lastIndex = m, d = o.exec(h), d !== null); ) m = o.lastIndex, o === P ? d[1] === "!--" ? o = ht : d[1] !== void 0 ? o = ct : d[2] !== void 0 ? (St.test(d[2]) && (r = RegExp("</" + d[2], "g")), o = y) : d[3] !== void 0 && (o = y) : o === y ? d[0] === ">" ? (o = r ?? P, p = -1) : d[1] === void 0 ? p = -2 : (p = o.lastIndex - d[2].length, a = d[1], o = d[3] === void 0 ? y : d[3] === '"' ? ut : dt) : o === ut || o === dt ? o = y : o === ht || o === ct ? o = P : (o = y, r = void 0);
    const g = o === y && s[l + 1].startsWith("/>") ? " " : "";
    n += o === P ? h + Ft : p >= 0 ? (i.push(a), h.slice(0, p) + kt + h.slice(p) + v + g) : h + v + (p === -2 ? l : g);
  }
  return [Mt(s, n + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class R {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, h = this.parts, [a, d] = Wt(t, e);
    if (this.el = R.createElement(a, i), b.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = b.nextNode()) !== null && h.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(kt)) {
          const m = d[o++], g = r.getAttribute(p).split(v), f = /([.?@])?(.*)/.exec(m);
          h.push({ type: 1, index: n, name: f[2], strings: g, ctor: f[1] === "." ? Gt : f[1] === "?" ? Kt : f[1] === "@" ? Vt : I }), r.removeAttribute(p);
        } else p.startsWith(v) && (h.push({ type: 6, index: n }), r.removeAttribute(p));
        if (St.test(r.tagName)) {
          const p = r.textContent.split(v), m = p.length - 1;
          if (m > 0) {
            r.textContent = B ? B.emptyScript : "";
            for (let g = 0; g < m; g++) r.append(p[g], O()), b.nextNode(), h.push({ type: 2, index: ++n });
            r.append(p[m], O());
          }
        }
      } else if (r.nodeType === 8) if (r.data === At) h.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(v, p + 1)) !== -1; ) h.push({ type: 7, index: n }), p += v.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = w.createElement("template");
    return i.innerHTML = t, i;
  }
}
function E(s, t, e = s, i) {
  if (t === S) return t;
  let r = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const n = H(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = r : e._$Cl = r), r !== void 0 && (t = E(s, r._$AS(s, t.values), r, i)), t;
}
class qt {
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
    const { el: { content: e }, parts: i } = this._$AD, r = (t?.creationScope ?? w).importNode(e, !0);
    b.currentNode = r;
    let n = b.nextNode(), o = 0, l = 0, h = i[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let a;
        h.type === 2 ? a = new N(n, n.nextSibling, this, t) : h.type === 1 ? a = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (a = new Jt(n, this, t)), this._$AV.push(a), h = i[++l];
      }
      o !== h?.index && (n = b.nextNode(), o++);
    }
    return b.currentNode = w, r;
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
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = E(this, t, e), H(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : It(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(w.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = R.createElement(Mt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const n = new qt(r, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = pt.get(t.strings);
    return e === void 0 && pt.set(t.strings, e = new R(t)), e;
  }
  k(t) {
    et(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const n of t) r === e.length ? e.push(i = new N(this.O(O()), this.O(O()), this, this.options)) : i = e[r], i._$AI(n), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = at(t).nextSibling;
      at(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class I {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = u;
  }
  _$AI(t, e = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = E(this, t, e, 0), o = !H(t) || t !== this._$AH && t !== S, o && (this._$AH = t);
    else {
      const l = t;
      let h, a;
      for (t = n[0], h = 0; h < n.length - 1; h++) a = E(this, l[i + h], e, h), a === S && (a = this._$AH[h]), o ||= !H(a) || a !== this._$AH[h], a === u ? t = u : t !== u && (t += (a ?? "") + n[h + 1]), this._$AH[h] = a;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Gt extends I {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Kt extends I {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Vt extends I {
  constructor(t, e, i, r, n) {
    super(t, e, i, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = E(this, t, e, 0) ?? u) === S) return;
    const i = this._$AH, r = t === u && i !== u || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== u && (i === u || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Jt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    E(this, t);
  }
}
const Xt = tt.litHtmlPolyfillSupport;
Xt?.(R, N), (tt.litHtmlVersions ??= []).push("3.3.3");
const Zt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = e?.renderBefore ?? null;
    i._$litPart$ = r = new N(t.insertBefore(O(), n), n, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const it = globalThis;
class L extends x {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Zt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return S;
  }
}
L._$litElement$ = !0, L.finalized = !0, it.litElementHydrateSupport?.({ LitElement: L });
const Yt = it.litElementPolyfillSupport;
Yt?.({ LitElement: L });
(it.litElementVersions ??= []).push("4.2.2");
function ft(s) {
  return s.length ? s[s.length - 1].minute : 1440;
}
function k(s, t) {
  const e = t.width - t.padLeft - t.padRight, i = Math.min(Math.max(s, 0), t.totalMinutes);
  return t.padLeft + i / t.totalMinutes * e;
}
function Qt(s, t) {
  const e = t.width - t.padLeft - t.padRight, i = (s - t.padLeft) / e;
  return Math.min(Math.max(i, 0), 1) * t.totalMinutes;
}
function J(s, t) {
  if (!s.length) return -1;
  let e = 0, i = s.length - 1;
  for (; e < i; ) {
    const r = e + i >> 1;
    s[r].minute < t ? e = r + 1 : i = r;
  }
  return e > 0 && t - s[e - 1].minute <= s[e].minute - t ? e - 1 : e;
}
function j(s) {
  const t = parseInt(s.slice(11, 13), 10), e = s.slice(14, 16);
  return `${t % 12 || 12}:${e} ${t < 12 ? "AM" : "PM"}`;
}
function te(s, t = !1) {
  const e = parseInt(s.slice(11, 13), 10), i = s.slice(14, 16), r = e % 12 || 12, n = e < 12 ? "AM" : "PM";
  return t ? `${r}${i === "00" ? "" : ":" + i}${n[0].toLowerCase()}` : `${r}${i === "00" ? "" : ":" + i} ${n}`;
}
function mt(s, t) {
  const e = J(s, t);
  if (e < 0) throw new Error("no samples");
  const i = s[e], r = Date.parse(i.t) + (t - i.minute) * 6e4, n = i.t.slice(19), o = ee(n);
  return new Date(r + o * 6e4).toISOString().slice(0, 19) + n;
}
function ee(s) {
  const t = /^([+-])(\d{2}):(\d{2})$/.exec(s);
  return t ? (t[1] === "-" ? -1 : 1) * (parseInt(t[2], 10) * 60 + parseInt(t[3], 10)) : 0;
}
function ie(s, t = 5) {
  return Math.round(s / t) * t;
}
function A(s, t) {
  const e = t.height - t.padTop - t.padBottom, i = Math.min(Math.max(s, 0), 100);
  return t.padTop + (1 - i / 100) * e;
}
function se(s, t) {
  return s.map((e, i) => `${i ? "L" : "M"}${k(e.minute, t).toFixed(1)},${A(e.brightness_pct, t).toFixed(1)}`).join("");
}
function re(s, t = 3) {
  if (!s.length) return [];
  const e = s[s.length - 1].minute || 1, i = [];
  for (let n = 0; n < s.length; n += t) {
    const o = s[n];
    i.push({ offset: o.minute / e, rgb: `rgb(${o.rgb_color.join(",")})` });
  }
  const r = s[s.length - 1];
  return i[i.length - 1].offset !== 1 && i.push({ offset: 1, rgb: `rgb(${r.rgb_color.join(",")})` }), i;
}
function ne(s, t = 3) {
  const e = [];
  for (let i = 0; i <= s; i += t * 60) e.push(i);
  return e;
}
const oe = {
  now: () => performance.now(),
  schedule: (s) => requestAnimationFrame(() => s()),
  cancel: (s) => cancelAnimationFrame(s)
};
class ae {
  constructor(t, e, i, r = oe) {
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
class le {
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
function gt(s, t) {
  let e = "string", i;
  if (s.selector) {
    const r = Object.keys(s.selector)[0];
    r === "select" ? (e = "select", i = s.selector.select.options) : r === "entity" ? e = "entity" : r === "color_rgb" && (e = "color_rgb");
  } else (s.type === "boolean" || s.type === "integer" || s.type === "float") && (e = s.type);
  return { name: s.name, section: t, kind: e, min: s.valueMin, max: s.valueMax, options: i, value: s.default };
}
function X(s) {
  if (!s.data_schema) throw new Error("This profile has no editable options (YAML-configured?)");
  const t = { flowId: s.flow_id, sections: [], fields: [] };
  for (const e of s.data_schema)
    if (e.type === "expandable") {
      t.sections.push(e.name);
      for (const i of e.schema ?? []) t.fields.push(gt(i, e.name));
    } else
      t.fields.push(gt(e, null));
  return t;
}
function C(s) {
  return Object.fromEntries(s.fields.map((t) => [t.name, t.value]));
}
function he(s, t) {
  return JSON.stringify(s) === JSON.stringify(t);
}
function ce(s, t) {
  const e = {};
  for (const [i, r] of Object.entries(t)) he(s[i], r) || (e[i] = r);
  return e;
}
function Pt(s, t) {
  const e = Object.fromEntries(s.sections.map((i) => [i, {}]));
  for (const i of s.fields) {
    const r = i.name in t ? t[i.name] : i.value;
    i.section ? e[i.section][i.name] = r : e[i.name] = r;
  }
  return e;
}
function de(s, t) {
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
function _(s) {
  return s == null ? "—" : Array.isArray(s) ? s.join(", ") : String(s);
}
const G = () => ({ muted: /* @__PURE__ */ new Set(), solo: /* @__PURE__ */ new Set() });
function K(s) {
  const t = Array.isArray(s) ? s : typeof s == "string" ? s.split(",") : [], e = [];
  for (const i of t) {
    const r = String(i).trim();
    r && !e.includes(r) && e.push(r);
  }
  return e;
}
function ue(s, t) {
  return t.solo.size ? t.solo.has(s) ? "solo" : "not-soloed" : t.muted.has(s) ? "muted" : "active";
}
function $t(s, t) {
  const e = new Set(s);
  return e.delete(t) || e.add(t), e;
}
function vt(s, t) {
  const e = (i) => new Set([...i].filter((r) => t.includes(r)));
  return { muted: e(s.muted), solo: e(s.solo) };
}
function Ct(s, t, e) {
  return t.map((i) => {
    const r = ue(i, e);
    return { id: i, saved: s.includes(i), status: r, active: r === "active" || r === "solo" };
  });
}
function pe(s, t, e) {
  return Ct(s, t, e).filter((i) => i.active && i.saved).map((i) => i.id);
}
function fe(s, t) {
  return s.length === t.length && s.every((e) => t.includes(e));
}
let yt = null;
function me(s = 5e3) {
  return customElements.get("ha-selector") ? Promise.resolve(!0) : (yt ??= Promise.race([
    (async () => {
      const t = await window.loadCardHelpers?.();
      return t ? (t.createCardElement({ type: "button", entity: "sun.sun" }), await customElements.whenDefined("hui-button-card"), await customElements.get("hui-button-card").getConfigElement?.(), await customElements.whenDefined("ha-selector"), !0) : !1;
    })().catch(() => !1),
    new Promise((t) => setTimeout(() => t(!1), s))
  ]), yt);
}
function ge(s, t) {
  s.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: t }, bubbles: !0, composed: !0 }));
}
const $e = (s) => typeof s.result == "string" ? s.result : s.result?.entry_id ?? null;
function ve(s, t, e) {
  const i = {};
  for (const r of s)
    if (r.entry_id !== e)
      for (const n of r.lights)
        t.includes(n.entity_id) && (i[n.entity_id] ??= []).push(r.title);
  return i;
}
async function ye(s, t, e) {
  let i = null, r = null;
  try {
    let o = await s("POST", "config/config_entries/flow", { handler: "adaptive_lighting" });
    if (i = o.flow_id ?? null, o.type === "form" && o.step_id === "menu" && (o = await s("POST", `config/config_entries/flow/${i}`, { action: "new" })), o.type === "form" && o.step_id === "user" && (o = await s("POST", `config/config_entries/flow/${i}`, { name: t })), o.type === "abort")
      return i = null, { ok: !1, error: o.reason === "already_configured" ? `A profile named "${t}" already exists.` : `Home Assistant refused: ${o.reason}` };
    if (o.type !== "create_entry") return { ok: !1, error: `Unexpected step: ${o.type} ${o.step_id ?? ""}` };
    if (i = null, r = $e(o), !r) return { ok: !1, error: "Home Assistant did not return the new profile's id." };
  } catch (o) {
    return i && await s("DELETE", `config/config_entries/flow/${i}`).catch(() => {
    }), { ok: !1, error: `Could not create the profile: ${o.message ?? o}` };
  }
  let n = null;
  try {
    const o = await s("POST", "config/config_entries/options/flow", { handler: r });
    n = o.flow_id;
    const l = await s(
      "POST",
      `config/config_entries/options/flow/${n}`,
      Pt(X(o), e)
    );
    if (l.type !== "create_entry") throw new Error(`Home Assistant rejected the options: ${JSON.stringify(l.errors ?? l)}`);
    return { ok: !0, entryId: r };
  } catch (o) {
    return n && await s("DELETE", `config/config_entries/options/flow/${n}`).catch(() => {
    }), await s("DELETE", `config/config_entries/entry/${r}`).catch(() => {
    }), { ok: !1, error: `${o.message ?? o} The new profile was removed.` };
  }
}
const be = {
  lights: "The lights this profile controls. Give each light to only one profile, or two profiles will fight over it.",
  interval: "How often, in seconds, Adaptive Lighting re-applies the curve to lights that are on. Lower is smoother but sends more commands.",
  transition: "Fade time, in seconds, when the profile changes a light's brightness or colour.",
  min_brightness: "Brightness % at the dimmest point of the curve (night).",
  max_brightness: "Brightness % at the brightest point of the curve (daytime).",
  min_color_temp: "Warmest colour, in Kelvin, used at night. Lower is more orange.",
  max_color_temp: "Coolest colour, in Kelvin, used at midday. Higher is more blue-white.",
  sleep_brightness: "Brightness % while Sleep mode is on.",
  sleep_color_temp: "Colour temperature, in Kelvin, while Sleep mode is on (when sleep uses colour temperature).",
  initial_transition: "Fade time, in seconds, when a light goes from off to on.",
  prefer_rgb_color: "Use RGB colour instead of colour temperature when a light supports both. Colour temperature is usually more accurate.",
  sleep_rgb_or_color_temp: "Whether Sleep mode uses an RGB colour or a colour temperature.",
  sleep_rgb_color: "RGB colour used in Sleep mode, as R,G,B from 0 to 255 (only if sleep uses RGB).",
  sleep_transition: "Fade time, in seconds, when Sleep mode is switched on or off.",
  transition_until_sleep: "Treat the sleep settings as the bottom of the curve: lights fade toward the sleep values after sunset instead of the minimums.",
  sunrise_time: "Fixed sunrise time (HH:MM:SS). Leave empty to follow the real sunrise.",
  min_sunrise_time: "Earliest the virtual sunrise may be (HH:MM:SS). Later real sunrises are used as they are.",
  max_sunrise_time: "Latest the virtual sunrise may be (HH:MM:SS). Earlier real sunrises are used as they are.",
  sunrise_offset: "Shift sunrise by this many seconds. Positive is later, negative is earlier.",
  sunset_time: "Fixed sunset time (HH:MM:SS). Leave empty to follow the real sunset.",
  min_sunset_time: "Earliest the virtual sunset may be (HH:MM:SS).",
  max_sunset_time: "Latest the virtual sunset may be (HH:MM:SS).",
  sunset_offset: "Shift sunset by this many seconds. Positive is later, negative is earlier.",
  brightness_mode: "Shape of the brightness curve. default follows the sun's height smoothly; linear ramps in a straight line; tanh ramps in an S shape. Linear and tanh use the two ramp times below.",
  brightness_mode_time_dark: "Ramp length, in seconds, on the dark side of sunrise and sunset (before sunrise, after sunset). Ignored in default mode.",
  brightness_mode_time_light: "Ramp length, in seconds, on the light side of sunrise and sunset (after sunrise, before sunset). Ignored in default mode. These two times apply to sunrise and sunset alike.",
  take_over_control: "Stop adapting a light when something else changes it (you, a wall switch, another automation) until it is turned off and on or reset.",
  take_over_control_mode: "What pauses when a light is taken over: everything (pause_all) or only the attribute that was changed (pause_changed).",
  detect_non_ha_changes: "Also notice changes made outside Home Assistant, such as a wall switch or the light's own app. Needs take over control. Can misfire on lights that report state oddly.",
  autoreset_control_seconds: "Give control back to Adaptive Lighting this many seconds after a manual change. 0 never resets automatically.",
  only_once: "Adapt a light only when it turns on, not continuously afterwards.",
  adapt_only_on_bare_turn_on: "Adapt only when a light is turned on without a chosen brightness or colour. Turn-ons that set them (scenes, colours you picked) are left alone.",
  manual_control_on_external_turn_on: "Treat a light turned on from outside Home Assistant as manually controlled.",
  reset_manual_control_on_sleep_mode_change: "Hand lights back to Adaptive Lighting when Sleep mode is switched on or off.",
  separate_turn_on_commands: "Send brightness and colour as separate commands. Needed for lights that cannot set both at once.",
  send_split_delay: "Delay, in milliseconds, between the separate commands. Only used with separate turn-on commands.",
  adapt_delay: "Seconds to wait after a light turns on before adapting it. Can reduce flicker.",
  skip_redundant_commands: "Do not send a command if the light is already at the target value.",
  intercept: "Catch turn-on calls and apply the curve to them right away, so lights don't flash at the wrong brightness first.",
  multi_light_intercept: "Do the same when one turn-on call targets several lights, by splitting it per light.",
  include_config_in_attributes: "Show all of this profile's options as attributes on its switch.",
  expand_light_groups: "When a light group is listed, adapt each member light on its own."
}, we = (s) => be[s] ?? "", bt = { totalMinutes: 1440, width: 1e3, height: 300, padLeft: 44, padRight: 24, padTop: 14, padBottom: 58 }, wt = 18, _e = [15, 30, 60, 120], xe = { sunrise: "sunrise", sunset: "sunset", solar_noon: "noon", solar_midnight: "midnight" }, z = class z extends L {
  constructor() {
    super(), this.curveTimer = null, this.pointTimer = null, this.unsubPreview = null, this.loaded = !1, this.previewSet = [], this.instantSaveLights = !1, this.resize = new ResizeObserver((t) => {
      const e = Math.round(t[0].contentRect.width);
      e > 0 && Math.abs(e - this.chartWidth) > 4 && (this.chartWidth = Math.min(Math.max(e, 300), 1400));
    }), this.profiles = [], this.selected = "", this.form = null, this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.curve = null, this.date = "", this.sleep = !1, this.minute = 12 * 60, this.playing = !1, this.duration = 30, this.point = null, this.preview = "off", this.message = "", this.confirming = !1, this.busy = !1, this.chartWidth = 1e3, this.mix = G(), this.picker = "loading", this.draft = null, this.playback = new ae(1440, 3e4, (t, e) => {
      this.minute = t, this.playing = e, this.schedulePoint(e ? 120 : 0);
    }), this.playback.minute = this.minute, this.previewSender = new le(1e3, (t) => void this.sendPreview(t));
  }
  // ------------------------------------------------------------- lifecycle
  updated(t) {
    t.has("hass") && this.hass && !this.loaded && (this.loaded = !0, this.loadProfiles(), me().then((e) => this.picker = e ? "ready" : "failed"));
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
    await this.stopPreview(), this.playback.pause(), this.selected = t, this.draft = null, this.mix = G(), this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.confirming = !1, this.form = await this.readForm(t), await this.refreshCurve();
  }
  /** Read the options form (types, limits, current values) and close the flow again. */
  async readForm(t) {
    let e = null;
    try {
      const i = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: t });
      return e = i.flow_id, X(i);
    } catch (i) {
      return this.message = `Could not read options: ${i.message ?? i}`, null;
    } finally {
      e && await this.hass.callApi("DELETE", `config/config_entries/options/flow/${e}`).catch(() => {
      });
    }
  }
  get overrides() {
    return this.form ? ce(C(this.form), this.edited) : {};
  }
  get savedLights() {
    return (this.profiles.find((t) => t.entry_id === this.selected)?.lights ?? []).map((t) => t.entity_id);
  }
  /** The lights as edited (unsaved additions included, removals left out). */
  get effectiveLights() {
    return "lights" in this.edited ? K(this.edited.lights) : this.savedLights;
  }
  get previewTargets() {
    return pe(this.savedLights, this.effectiveLights, this.mix);
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
    const i = ft(e.samples);
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
    const t = mt(this.curve.samples, this.minute), e = await this.ws({
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
    const t = this.previewTargets;
    if (!t.length) {
      this.message = "Every saved light is muted or not soloed, so there's nothing to preview.", this.requestUpdate();
      return;
    }
    this.previewSet = t, this.preview = "starting";
    try {
      this.unsubPreview = await this.hass.connection.subscribeMessage(
        (e) => {
          e.status === "active" ? (this.preview = "active", this.syncPreviewLights(), this.schedulePoint(0)) : e.status === "ended" && (this.preview = "off", this.unsubPreview = null, this.previewSender.cancel(), this.message = e.reason === "timeout" ? "Preview timed out; lights are back to normal." : `Preview ended (${e.reason}).`);
        },
        { type: "adaptive_lighting/sim/preview", entry_id: this.selected, lights: t, timeout_s: 600 }
      );
    } catch (e) {
      this.preview = "off", this.message = `Couldn't start preview: ${e.message ?? e}`;
    }
  }
  async stopPreview() {
    this.previewSender.cancel();
    const t = this.unsubPreview;
    this.unsubPreview = null, this.preview = "off", t && await t().catch(() => {
    });
  }
  /** Hand muted lights back / take unmuted ones over in the running preview. */
  async syncPreviewLights() {
    const t = this.previewTargets;
    if (!(this.preview !== "active" || fe(t, this.previewSet))) {
      this.previewSet = t;
      try {
        await this.ws({ type: "adaptive_lighting/sim/preview/lights", entry_id: this.selected, lights: t }), this.schedulePoint(0);
      } catch (e) {
        this.message = `Couldn't change the previewed lights: ${e.message ?? e}`;
      }
    }
  }
  setMix(t) {
    this.mix = t, this.syncPreviewLights();
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
    const [i, r] = de(t, e), n = { ...this.fieldErrors };
    r ? n[t.name] = r : delete n[t.name], this.fieldErrors = n, r || (this.edited = { ...this.edited, [t.name]: i }, this.scheduleCurve());
  }
  onLights(t) {
    this.edited = { ...this.edited, lights: t }, this.setMix(vt(this.mix, t)), this.scheduleCurve(), this.instantSaveLights && this.saveFields({ lights: t });
  }
  /** Start a new profile: it borrows the selected profile's curve as a starting point, lights cleared. */
  async startDraft() {
    await this.stopPreview(), this.playback.pause(), this.draft = { name: "" }, this.edited = { lights: [] }, this.fieldErrors = {}, this.confirming = !1, this.mix = G(), this.scheduleCurve();
  }
  async cancelDraft() {
    await this.selectProfile(this.selected);
  }
  async create() {
    if (!(!this.form || !this.draft)) {
      this.busy = !0;
      try {
        const t = { ...C(this.form), ...this.edited }, e = await ye((r, n, o) => this.hass.callApi(r, n, o), this.draft.name.trim(), t);
        if (!e.ok) {
          this.message = e.error;
          return;
        }
        const i = this.draft.name.trim();
        this.confirming = !1, this.draft = null, this.selected = e.entryId, await this.loadProfiles(!0);
        for (let r = 0; r < 10 && this.profiles.find((n) => n.entry_id === e.entryId)?.loaded === !1; r++) {
          await new Promise((o) => setTimeout(o, 1e3));
          const n = await this.ws({ type: "adaptive_lighting/sim/profiles" });
          this.profiles = n.profiles;
        }
        this.message = `Created profile ${i}.`;
      } catch (t) {
        this.message = `Create failed: ${t.message ?? t}`;
      } finally {
        this.busy = !1;
      }
    }
  }
  discard() {
    this.edited = this.draft ? { lights: [] } : {}, this.fieldErrors = {}, this.confirming = !1, this.setMix(vt(this.mix, this.savedLights)), this.scheduleCurve();
  }
  async apply() {
    if (this.draft) return this.create();
    await this.saveFields(this.overrides);
  }
  /** Write `pending` (field -> value) to the profile through HA's options flow. */
  async saveFields(t) {
    if (!this.form) return;
    this.busy = !0;
    let e = null, i = !1;
    try {
      const r = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: this.selected });
      e = r.flow_id;
      const n = X(r), o = C(this.form), l = C(n), h = Object.keys(l).filter((d) => !(d in t) && JSON.stringify(l[d]) !== JSON.stringify(o[d]));
      if (h.length) {
        this.message = `This profile was changed elsewhere since you opened it (${h.join(", ")}). Reload before saving.`;
        return;
      }
      const a = await this.hass.callApi(
        "POST",
        `config/config_entries/options/flow/${e}`,
        Pt(n, { ...l, ...t })
      );
      if (a.type !== "create_entry") {
        this.message = `Home Assistant rejected the options: ${JSON.stringify(a.errors ?? a)}`;
        return;
      }
      i = !0, this.message = `Saved ${Object.keys(t).length} change(s) to ${this.profileTitle}.`, this.confirming = !1, await this.loadProfiles(!0);
      for (let d = 0; d < 10 && this.profiles.find((p) => p.entry_id === this.selected)?.loaded === !1; d++) {
        await new Promise((m) => setTimeout(m, 1e3));
        const p = await this.ws({ type: "adaptive_lighting/sim/profiles" });
        this.profiles = p.profiles;
      }
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
    this.playback.seek(ie(Qt(n, r))), t.type === "pointerdown" && e.setPointerCapture(t.pointerId);
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
    return { ...bt, width: this.chartWidth, height: e ? 240 : bt.height, totalMinutes: t };
  }
  renderChart() {
    const t = this.curve?.samples ?? [], e = this.box(ft(t)), i = e.width < 600, n = (this.profiles.find((f) => f.entry_id === this.selected)?.lights ?? []).some((f) => f.features?.includes("color") || f.features?.includes("color_temp")), o = e.height - e.padBottom + 22, l = J(t, this.minute), h = l >= 0 ? t[l] : null, a = k(this.minute, e), d = re(t), p = Object.entries(this.curve?.sun ?? {}), m = t.length ? Date.parse(t[0].t) : 0, g = t.length ? mt(t, Math.round(this.minute)) : "";
    return c`
      <svg
        class="chart"
        viewBox="0 0 ${e.width} ${e.height}"
        role="slider"
        tabindex="0"
        aria-label="Time of day. Arrow keys move 15 minutes, space plays."
        aria-valuemin="0"
        aria-valuemax=${e.totalMinutes}
        aria-valuenow=${Math.round(this.minute)}
        aria-valuetext=${g ? j(g) : ""}
        @pointerdown=${this.onChartPointer}
        @pointermove=${this.onChartPointer}
        @keydown=${this.onChartKey}
      >
        <defs>
          <linearGradient id="ct" x1="0" x2="1">
            ${d.map((f) => $`<stop offset=${f.offset} stop-color=${f.rgb}></stop>`)}
          </linearGradient>
        </defs>
        ${[0, 25, 50, 75, 100].map(
      (f) => $`
            <line class="grid" x1=${e.padLeft} x2=${e.width - e.padRight} y1=${A(f, e)} y2=${A(f, e)}></line>
            <text class="axis" x=${e.padLeft - 6} y=${A(f, e) + 4} text-anchor="end">${f}%</text>`
    )}
        ${ne(e.totalMinutes, i ? 6 : 3).map(
      (f) => $`
            <line class="grid" x1=${k(f, e)} x2=${k(f, e)} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            <text class="axis" x=${k(f, e)} y=${e.height - e.padBottom + 14} text-anchor="middle">${t.length ? te(t[J(t, f)].t, i) : ""}</text>`
    )}
        ${p.map(([f, U]) => {
      const M = (Date.parse(U) - m) / 6e4;
      if (M < 0 || M > e.totalMinutes) return u;
      const W = k(M, e);
      return $`
            <line class="sun" x1=${W} x2=${W} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            ${i && (f === "solar_noon" || f === "solar_midnight") ? u : $`<text class="sunlabel" x=${W + 3} y=${e.padTop + 10}>${i ? "" : `${xe[f] ?? f} `}${j(U)}</text>`}`;
    })}
        <path class="line" d=${se(t, e)}></path>
        <rect x=${e.padLeft} y=${o} width=${e.width - e.padLeft - e.padRight} height=${wt} rx="3" fill="url(#ct)" opacity=${n ? 1 : 0.25}></rect>
        <text class="axis" x=${e.padLeft - 6} y=${o + 13} text-anchor="end">colour</text>
        ${n ? u : $`<text class="axis" x=${e.padLeft + 8} y=${o + 13}>not used: these lights are dimmer-only</text>`}
        <line class="playhead" x1=${a} x2=${a} y1=${e.padTop} y2=${o + wt}></line>
        ${h ? $`<circle class="dot" cx=${a} cy=${A(h.brightness_pct, e)} r="6"></circle>` : u}
        ${h ? this.renderTip(j(g), a, A(h.brightness_pct, e), e) : u}
      </svg>
    `;
  }
  /** Time label beside the playhead dot: above it, or below when the dot is near the top. */
  renderTip(t, e, i, r) {
    const n = t.length * 7.2 + 14, o = 22, l = r.padLeft, h = r.width - r.padRight - n, a = Math.min(Math.max(e - n / 2, l), h), d = i - 12 - o, p = d >= r.padTop + 14 ? d : i + 12;
    return $`
      <g class="tip" pointer-events="none">
        <rect x=${a} y=${p} width=${n} height=${o} rx="5"></rect>
        <text x=${a + n / 2} y=${p + 15} text-anchor="middle">${t}</text>
      </g>`;
  }
  // ------------------------------------------------------------- point view
  renderPoint() {
    const t = this.point;
    if (!t) return c`<p class="muted">Pick a time on the chart.</p>`;
    const e = this.profiles.find((r) => r.entry_id === this.selected), i = t.settings;
    return c`
      <div class="now">
        <span class="time">${j(t.t)}</span>
        <span>${i.brightness_pct.toFixed(0)}% brightness</span>
        <span>${i.color_temp_kelvin} K</span>
        ${this.sleep ? c`<span class="tag">sleep mode</span>` : u}
      </div>
      <div class="lights">
        ${Ct(this.savedLights, this.effectiveLights, this.mix).map(
      (r) => this.renderLight(r, this.lightName(r.id, e), t.per_light[r.id])
    )}
      </div>
      <p class="muted small">
        Swatches show colour and relative brightness; a screen can't show how bright a bulb really is.
        <b>M</b> mutes and <b>S</b> solos a light in this preview only; nothing is saved.
        Click a light's name to control it. Adaptive Lighting may then treat it as manually controlled.
      </p>
    `;
  }
  lightName(t, e) {
    const i = e?.lights.find((n) => n.entity_id === t)?.name, r = this.hass?.states?.[t]?.attributes.friendly_name;
    return i ?? (typeof r == "string" ? r : t);
  }
  renderLight(t, e, i) {
    const r = t.id, n = { active: "", solo: "solo", muted: "muted", "not-soloed": "not soloed" }[t.status], o = c`
      ${n ? c`<span class="tag">${n}</span>` : u}
      ${t.saved ? u : c`<span class="tag">unsaved</span>`}`, l = this.preview === "off" ? u : t.saved ? t.active ? c`<br /><span class="muted small">preview is driving this light; a manual change lasts until the playhead moves</span>` : u : c`<br /><span class="muted small">save to preview on the real light</span>`;
    let h, a;
    if (!i || i.error)
      h = c`<span class="swatch none"></span>`, a = c`<span class="warn">${i?.error ?? "no data"}</span>`;
    else {
      const p = i.brightness !== void 0 ? Math.round(i.brightness / 255 * 100) : null, m = i.display_rgb ?? [255, 244, 229], g = p === null ? 1 : 0.15 + 0.85 * (p / 100), f = `rgb(${m.map((M) => Math.round(M * g)).join(",")})`, U = i.rgb_color ? `RGB ${i.rgb_color.join(", ")}` : i.color_temp_kelvin ? `${i.color_temp_kelvin} K` : "dimmer only";
      h = c`<span class="swatch" style="background:${f}"></span>`, a = c`<span>${p ?? "—"}% · ${U}</span>`;
    }
    const d = () => ge(this, r);
    return c`
      <div class="light ${t.active ? "" : "inactive"}" title=${r}>
        <button class="swatchbtn" aria-label="Control ${e}" @click=${d}>${h}</button>
        <div class="lightinfo">
          <button class="link name" @click=${d}>${e}</button>${o}<br />${a}${l}
        </div>
        <div class="ms">
          <button class="mute" aria-pressed=${this.mix.muted.has(r)} title="Mute in preview" aria-label="Mute ${e}"
            @click=${() => this.setMix({ ...this.mix, muted: $t(this.mix.muted, r) })}>M</button>
          <button class="solo" aria-pressed=${this.mix.solo.has(r)} title="Solo in preview" aria-label="Solo ${e}"
            @click=${() => this.setMix({ ...this.mix, solo: $t(this.mix.solo, r) })}>S</button>
        </div>
      </div>
    `;
  }
  // ------------------------------------------------------------ options UI
  /** Option name with a help tooltip (hover, keyboard focus or tap on the ⓘ). */
  renderLabel(t, e, i) {
    const r = we(t);
    return c`<span class="lbl">${e}${i ? c` <em>(edited)</em>` : u}${r ? c` <span class="help" tabindex="0" role="note" aria-label="${e}: ${r}" data-tip=${r}>ⓘ</span>` : u}</span>`;
  }
  renderField(t) {
    const e = t.name in this.edited ? this.edited[t.name] : t.value, i = t.name in this.overrides, r = this.fieldErrors[t.name] ?? this.serverErrors[t.name], n = t.name.replaceAll("_", " ");
    let o;
    return t.name === "lights" && t.kind === "entity" && this.picker === "ready" ? c`
        <div class="field wide ${i ? "changed" : ""} ${r ? "error" : ""}">
          ${this.renderLabel(t.name, n, i)}
          <ha-selector .hass=${this.hass} .selector=${{ entity: { domain: "light", multiple: !0 } }}
            .value=${K(e)} @value-changed=${(l) => this.onLights(K(l.detail.value))}></ha-selector>
          ${r ? c`<span class="warn">⚠ ${r}</span>` : u}
        </div>
      ` : (t.kind === "boolean" ? o = c`<input type="checkbox" .checked=${!!e} @change=${(l) => this.onField(t, l.target.checked)} />` : t.kind === "select" ? o = c`<select @change=${(l) => this.onField(t, l.target.value)}>
        ${t.options?.map((l) => c`<option value=${l} ?selected=${l === e}>${l}</option>`)}
      </select>` : t.kind === "integer" || t.kind === "float" ? o = c`<input type="number" .value=${String(e ?? "")} min=${t.min ?? u} max=${t.max ?? u} step=${t.kind === "integer" ? 1 : "any"}
        @input=${(l) => this.onField(t, l.target.value)} />` : o = c`<input type="text" .value=${_(e) === "—" ? "" : Array.isArray(e) ? e.join(", ") : String(e)}
        @change=${(l) => this.onField(t, l.target.value)} />`, c`
      <label class="field ${t.name === "lights" ? "wide" : ""} ${i ? "changed" : ""} ${r ? "error" : ""}">
        ${this.renderLabel(t.name, n, i)}
        ${o}
        ${t.name === "lights" && this.picker === "failed" ? c`<span class="muted small">Home Assistant's light picker didn't load; type entity ids separated by commas.</span>` : u}
        ${r ? c`<span class="warn">⚠ ${r}</span>` : u}
      </label>
    `);
  }
  renderOptionsCard() {
    if (!this.form) return c`<p class="muted">Options unavailable.</p>`;
    const t = this.form.fields.filter((a) => !a.section), e = this.overrides, i = Object.keys(e).length, r = C(this.form), n = this.draft, o = n ? ve(this.profiles, this.effectiveLights, null) : {}, l = !!n?.name.trim(), h = l && this.effectiveLights.length > 0 && Object.keys(this.fieldErrors).length === 0 && !this.busy;
    return n ? c`
        <label class="field wide ${l ? "" : "error"}">
          <span>name</span>
          <input type="text" placeholder="e.g. Hallway" .value=${n.name} @input=${(a) => this.draft = { name: a.target.value }} />
          ${l ? u : c`<span class="warn">⚠ required</span>`}
        </label>
        <div class="fields">${t.map((a) => this.renderField(a))}</div>
        ${this.form.sections.map(
      (a) => c`<details>
            <summary>${a} options</summary>
            <div class="fields">${this.form.fields.filter((d) => d.section === a).map((d) => this.renderField(d))}</div>
          </details>`
    )}
        ${Object.keys(o).length ? c`<p class="warn">⚠ Already controlled by another profile: ${Object.entries(o).map(([a, d]) => `${a} (${d.join(", ")})`).join("; ")}. Two profiles on one light will fight.</p>` : u}
        ${this.effectiveLights.length ? u : c`<p class="warn">⚠ Pick at least one light.</p>`}
        <div class="actions">
          <button ?disabled=${this.busy} @click=${this.cancelDraft}>Cancel</button>
          <button ?disabled=${this.busy} @click=${this.discard}>Reset</button>
          <button class="primary" ?disabled=${!h} @click=${() => this.confirming = !0}>Create…</button>
        </div>
        ${this.confirming ? c`<div class="confirm" role="dialog" aria-label="Confirm new profile">
              <b>Create profile "${n.name.trim()}"?</b>
              <table>
                <tr><td>lights</td><td><b>${_(this.effectiveLights)}</b></td></tr>
                ${Object.entries(e).filter(([a]) => a !== "lights").map(([a, d]) => c`<tr><td>${a.replaceAll("_", " ")}</td><td>${_(r[a])}</td><td>→</td><td><b>${_(d)}</b></td></tr>`)}
              </table>
              <p class="muted small">All other options start as in ${this.profileTitle}.</p>
              <div class="actions">
                <button @click=${() => this.confirming = !1}>Cancel</button>
                <button class="primary" ?disabled=${this.busy} @click=${this.apply}>${this.busy ? "Creating…" : "Create profile"}</button>
              </div>
            </div>` : u}
      ` : c`
      <div class="fields">${t.map((a) => this.renderField(a))}</div>
      ${this.form.sections.map(
      (a) => c`<details>
          <summary>${a} options</summary>
          <div class="fields">${this.form.fields.filter((d) => d.section === a).map((d) => this.renderField(d))}</div>
        </details>`
    )}
      <div class="actions">
        <span class="muted">${i ? `${i} unsaved change(s), already shown in the chart` : "No unsaved changes"}</span>
        <button ?disabled=${!i || this.busy} @click=${this.discard}>Discard</button>
        <button class="primary" ?disabled=${!i || this.busy || Object.keys(this.fieldErrors).length > 0} @click=${() => this.confirming = !0}>Save…</button>
      </div>
      ${this.confirming ? c`<div class="confirm" role="dialog" aria-label="Confirm changes">
            <b>Save these changes to ${this.profileTitle}?</b>
            <table>
              ${Object.entries(e).map(([a, d]) => c`<tr><td>${a.replaceAll("_", " ")}</td><td>${_(r[a])}</td><td>→</td><td><b>${_(d)}</b></td></tr>`)}
            </table>
            <div class="actions">
              <button @click=${() => this.confirming = !1}>Cancel</button>
              <button class="primary" ?disabled=${this.busy} @click=${this.apply}>${this.busy ? "Saving…" : "Save to profile"}</button>
            </div>
          </div>` : u}
    `;
  }
  // ----------------------------------------------------------------- render
  render() {
    const t = this.profiles.find((e) => e.entry_id === this.selected);
    return c`
      <div class="toolbar">
        <h1>Adaptive Lighting</h1>
        <label>Profile
          <select ?disabled=${!!this.draft} @change=${(e) => void this.selectProfile(e.target.value)}>
            ${this.profiles.map((e) => c`<option value=${e.entry_id} ?selected=${e.entry_id === this.selected}>${e.title}${e.lights.length ? "" : " (no lights)"}</option>`)}
          </select>
        </label>
        <button ?disabled=${!!this.draft || this.busy || !this.form} @click=${this.startDraft}>+ New profile</button>
        <label>Day <input type="date" .value=${this.date} @change=${(e) => {
      this.date = e.target.value, this.refreshCurve();
    }} /></label>
        <label class="inline"><input type="checkbox" .checked=${this.sleep} @change=${(e) => {
      this.sleep = e.target.checked, this.refreshCurve();
    }} /> Sleep mode</label>
      </div>
      ${this.message ? c`<div class="banner" role="status">${this.message} <button class="link" @click=${() => this.message = ""}>dismiss</button></div>` : u}
      ${this.draft ? c`<div class="banner" role="status"><b>New profile (draft).</b> The curve starts as a copy of ${this.profileTitle}'s. Add lights, adjust the curve, name it, then Create. Nothing exists until you create it.</div>` : u}
      ${t?.error ? c`<div class="banner warnbg">⚠ ${t.error}</div>` : u}
      ${t && !this.draft && !t.lights.length ? c`<div class="banner">This profile has no lights, so it doesn't control anything.</div>` : u}

      <section class="card chartcard">
        ${this.renderChart()}
        <div class="controls">
          <button class="primary" @click=${() => this.playback.toggle()} aria-pressed=${this.playing}>${this.playing ? "❚❚ Pause" : "▶ Play the day"}</button>
          <label>over
            <select @change=${(e) => {
      this.duration = Number(e.target.value), this.playback.setDuration(this.duration * 1e3);
    }}>
              ${_e.map((e) => c`<option value=${e} ?selected=${e === this.duration}>${e} s</option>`)}
            </select>
          </label>
          <span class="spacer"></span>
          <label class="inline preview ${this.preview}">
            <input type="checkbox" .checked=${this.preview !== "off"} ?disabled=${!!this.draft || !t?.loaded || !t?.lights.length} @change=${this.togglePreview} />
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
z.properties = {
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
  chartWidth: { state: !0 },
  mix: { state: !0 },
  picker: { state: !0 },
  draft: { state: !0 }
}, z.styles = Lt`
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
    .tip rect { fill: var(--primary-text-color); opacity: 0.88; }
    .tip text { fill: var(--card-background-color, #fff); font-size: 12px; font-weight: 600; }
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
    .lights { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 10px; }
    .light { display: flex; gap: 10px; align-items: center; }
    .swatch { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--divider-color); flex: none; }
    .swatch.none { background: repeating-linear-gradient(45deg, var(--divider-color) 0 4px, transparent 4px 8px); }
    .swatch { display: block; }
    .swatchbtn { padding: 0; border: none; background: none; border-radius: 50%; }
    .lightinfo { flex: 1; min-width: 0; }
    .lightinfo .tag { margin-left: 6px; }
    button.name { padding: 0; font-weight: 700; text-decoration: none; color: var(--primary-text-color); text-align: left; }
    button.name:hover { text-decoration: underline; }
    /* Mute/solo: pressed = filled + the card's text label; never colour alone. */
    .ms { display: flex; gap: 4px; flex: none; }
    .ms button { width: 30px; height: 30px; padding: 0; border-radius: 6px; font-weight: 700; }
    .ms button.mute[aria-pressed="true"] { background: var(--warning-color, #ffa600); border-color: var(--warning-color, #ffa600); color: #000; }
    .ms button.solo[aria-pressed="true"] { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .light.inactive .swatch { opacity: 0.3; border-style: dashed; }
    .light.inactive .lightinfo > span { opacity: 0.6; }
    .field.wide { grid-column: 1 / -1; }
    .muted { color: var(--secondary-text-color); }
    .small { font-size: 0.8em; margin-bottom: 0; }
    .fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px 16px; margin-bottom: 12px; }
    .field { display: flex; flex-direction: column; gap: 3px; font-size: 0.9em; }
    .field > span:first-child { color: var(--secondary-text-color); text-transform: capitalize; }
    .field.changed > span:first-child { color: var(--primary-color); font-weight: 600; }
    .field.changed input, .field.changed select { border-color: var(--primary-color); border-width: 2px; }
    .field.error input, .field.error select { border-color: var(--warning-color, #ffa600); border-width: 2px; }
    .field em { font-style: normal; font-weight: 400; }
    .lbl { position: relative; }
    .help { display: inline-block; cursor: help; color: var(--secondary-text-color); font-size: 0.95em; text-transform: none; outline: none; }
    .help:hover, .help:focus-visible { color: var(--primary-color); }
    .help::after { content: attr(data-tip); display: none; position: absolute; z-index: 5; left: 0; top: 1.6em;
      width: max-content; max-width: min(320px, 80vw); padding: 8px 10px; border-radius: 8px; font-size: 0.9em; font-weight: 400;
      line-height: 1.35; text-transform: none; white-space: normal; background: var(--primary-text-color); color: var(--card-background-color, #fff);
      box-shadow: 0 2px 8px rgba(0,0,0,.3); }
    .help:hover::after, .help:focus::after { display: block; }
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
let Z = z;
customElements.get("al-sim-panel") || customElements.define("al-sim-panel", Z);
export {
  Z as AlSimPanel
};
