/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis, rt = z.ShadowRoot && (z.ShadyCSS === void 0 || z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, nt = Symbol(), ct = /* @__PURE__ */ new WeakMap();
let Ot = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== nt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (rt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = ct.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && ct.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Kt = (i) => new Ot(typeof i == "string" ? i : i + "", void 0, nt), Wt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[n + 1], i[0]);
  return new Ot(e, i, nt);
}, Vt = (i, t) => {
  if (rt) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), r = z.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, dt = rt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Kt(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Gt, defineProperty: qt, getOwnPropertyDescriptor: Jt, getOwnPropertyNames: Xt, getOwnPropertySymbols: Yt, getPrototypeOf: Zt } = Object, V = globalThis, ut = V.trustedTypes, Qt = ut ? ut.emptyScript : "", te = V.reactiveElementPolyfillSupport, O = (i, t) => i, et = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Qt : null;
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
} }, Ht = (i, t) => !Gt(i, t), pt = { attribute: !0, type: String, converter: et, reflect: !1, useDefault: !1, hasChanged: Ht };
Symbol.metadata ??= Symbol("metadata"), V.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let E = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = pt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && qt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: n } = Jt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: r, set(o) {
      const l = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? pt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const t = Zt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const e = this.properties, s = [...Xt(e), ...Yt(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(dt(r));
    } else t !== void 0 && e.push(dt(t));
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
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Vt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : et).toAttribute(e, s.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = s.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : et;
      this._$Em = r;
      const l = o.fromAttribute(e, n.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? Ht)(n, e) || s.useDefault && s.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, n] of s) {
        const { wrapped: o } = n, l = this[r];
        o !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, n, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
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
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[O("elementProperties")] = /* @__PURE__ */ new Map(), E[O("finalized")] = /* @__PURE__ */ new Map(), te?.({ ReactiveElement: E }), (V.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ot = globalThis, ft = (i) => i, K = ot.trustedTypes, mt = K ? K.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Nt = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, Rt = "?" + y, ee = `<${Rt}>`, S = document, N = () => S.createComment(""), R = (i) => i === null || typeof i != "object" && typeof i != "function", at = Array.isArray, se = (i) => at(i) || typeof i?.[Symbol.iterator] == "function", J = `[ 	
\f\r]`, L = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, gt = /-->/g, $t = />/g, b = RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), vt = /'/g, yt = /"/g, Ut = /^(?:script|style|textarea|title)$/i, Dt = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), d = Dt(1), $ = Dt(2), P = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), bt = /* @__PURE__ */ new WeakMap(), k = S.createTreeWalker(S, 129);
function Bt(i, t) {
  if (!at(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return mt !== void 0 ? mt.createHTML(t) : t;
}
const ie = (i, t) => {
  const e = i.length - 1, s = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = L;
  for (let l = 0; l < e; l++) {
    const h = i[l];
    let a, c, p = -1, m = 0;
    for (; m < h.length && (o.lastIndex = m, c = o.exec(h), c !== null); ) m = o.lastIndex, o === L ? c[1] === "!--" ? o = gt : c[1] !== void 0 ? o = $t : c[2] !== void 0 ? (Ut.test(c[2]) && (r = RegExp("</" + c[2], "g")), o = b) : c[3] !== void 0 && (o = b) : o === b ? c[0] === ">" ? (o = r ?? L, p = -1) : c[1] === void 0 ? p = -2 : (p = o.lastIndex - c[2].length, a = c[1], o = c[3] === void 0 ? b : c[3] === '"' ? yt : vt) : o === yt || o === vt ? o = b : o === gt || o === $t ? o = L : (o = b, r = void 0);
    const g = o === b && i[l + 1].startsWith("/>") ? " " : "";
    n += o === L ? h + ee : p >= 0 ? (s.push(a), h.slice(0, p) + Nt + h.slice(p) + y + g) : h + y + (p === -2 ? l : g);
  }
  return [Bt(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class U {
  constructor({ strings: t, _$litType$: e }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, h = this.parts, [a, c] = ie(t, e);
    if (this.el = U.createElement(a, s), k.currentNode = this.el.content, e === 2 || e === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = k.nextNode()) !== null && h.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(Nt)) {
          const m = c[o++], g = r.getAttribute(p).split(y), f = /([.?@])?(.*)/.exec(m);
          h.push({ type: 1, index: n, name: f[2], strings: g, ctor: f[1] === "." ? ne : f[1] === "?" ? oe : f[1] === "@" ? ae : G }), r.removeAttribute(p);
        } else p.startsWith(y) && (h.push({ type: 6, index: n }), r.removeAttribute(p));
        if (Ut.test(r.tagName)) {
          const p = r.textContent.split(y), m = p.length - 1;
          if (m > 0) {
            r.textContent = K ? K.emptyScript : "";
            for (let g = 0; g < m; g++) r.append(p[g], N()), k.nextNode(), h.push({ type: 2, index: ++n });
            r.append(p[m], N());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Rt) h.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(y, p + 1)) !== -1; ) h.push({ type: 7, index: n }), p += y.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = S.createElement("template");
    return s.innerHTML = t, s;
  }
}
function T(i, t, e = i, s) {
  if (t === P) return t;
  let r = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const n = R(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(i), r._$AT(i, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = r : e._$Cl = r), r !== void 0 && (t = T(i, r._$AS(i, t.values), r, s)), t;
}
class re {
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
    const { el: { content: e }, parts: s } = this._$AD, r = (t?.creationScope ?? S).importNode(e, !0);
    k.currentNode = r;
    let n = k.nextNode(), o = 0, l = 0, h = s[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let a;
        h.type === 2 ? a = new D(n, n.nextSibling, this, t) : h.type === 1 ? a = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (a = new le(n, this, t)), this._$AV.push(a), h = s[++l];
      }
      o !== h?.index && (n = k.nextNode(), o++);
    }
    return k.currentNode = S, r;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class D {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = T(this, t, e), R(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== P && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : se(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && R(this._$AH) ? this._$AA.nextSibling.data = t : this.T(S.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = U.createElement(Bt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const n = new re(r, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = bt.get(t.strings);
    return e === void 0 && bt.set(t.strings, e = new U(t)), e;
  }
  k(t) {
    at(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, r = 0;
    for (const n of t) r === e.length ? e.push(s = new D(this.O(N()), this.O(N()), this, this.options)) : s = e[r], s._$AI(n), r++;
    r < e.length && (this._$AR(s && s._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = ft(t).nextSibling;
      ft(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class G {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, r, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(t, e = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = T(this, t, e, 0), o = !R(t) || t !== this._$AH && t !== P, o && (this._$AH = t);
    else {
      const l = t;
      let h, a;
      for (t = n[0], h = 0; h < n.length - 1; h++) a = T(this, l[s + h], e, h), a === P && (a = this._$AH[h]), o ||= !R(a) || a !== this._$AH[h], a === u ? t = u : t !== u && (t += (a ?? "") + n[h + 1]), this._$AH[h] = a;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class ne extends G {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class oe extends G {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class ae extends G {
  constructor(t, e, s, r, n) {
    super(t, e, s, r, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = T(this, t, e, 0) ?? u) === P) return;
    const s = this._$AH, r = t === u && s !== u || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== u && (s === u || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class le {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    T(this, t);
  }
}
const he = ot.litHtmlPolyfillSupport;
he?.(U, D), (ot.litHtmlVersions ??= []).push("3.3.3");
const ce = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = e?.renderBefore ?? null;
    s._$litPart$ = r = new D(t.insertBefore(N(), n), n, void 0, e ?? {});
  }
  return r._$AI(i), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = globalThis;
class H extends E {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ce(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return P;
  }
}
H._$litElement$ = !0, H.finalized = !0, lt.litElementHydrateSupport?.({ LitElement: H });
const de = lt.litElementPolyfillSupport;
de?.({ LitElement: H });
(lt.litElementVersions ??= []).push("4.2.2");
const jt = 5, ue = 64;
function v(i) {
  const t = i.trim().toLowerCase();
  let e = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(t);
  if (e) {
    const r = Number(e[1]), n = Number(e[2]);
    return r < 24 && n < 60 ? { kind: "clock", minutes: r * 60 + n } : null;
  }
  if (e = /^(sunrise|sunset)(?:([+-])(?:(\d{1,3})(m|h)|(\d{1,2}):(\d{2})))?$/.exec(t), !e) return null;
  let s = 0;
  if (e[2]) {
    const r = e[3] ? Number(e[3]) * (e[4] === "h" ? 60 : 1) : Number(e[5]) * 60 + Number(e[6]);
    s = e[2] === "-" ? -r : r;
  }
  return { kind: "sun", anchor: e[1], offset: s };
}
function A(i) {
  if (i.kind === "clock") {
    const e = Math.floor(i.minutes / 60);
    return `${String(e).padStart(2, "0")}:${String(i.minutes % 60).padStart(2, "0")}`;
  }
  if (i.offset === 0) return i.anchor;
  const t = Math.abs(i.offset);
  return `${i.anchor}${i.offset > 0 ? "+" : "-"}${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function Ft(i) {
  if (typeof i != "string" || !i.trim() || i.trim() === "None") return null;
  try {
    const t = JSON.parse(i);
    return Array.isArray(t) ? t.map((e) => ({ at: String(e.at), brightness: Number(e.brightness), ...e.color_temp != null ? { color_temp: Number(e.color_temp) } : {} })) : null;
  } catch {
    return null;
  }
}
function pe(i) {
  return i ? JSON.stringify(i.map((t) => ({ at: t.at, brightness: t.brightness, ...t.color_temp != null ? { color_temp: t.color_temp } : {} }))) : "None";
}
function w(i, t) {
  const e = v(i.at);
  return e ? e.kind === "clock" ? e.minutes : (t[e.anchor] ?? (e.anchor === "sunrise" ? 360 : 1080)) + e.offset : 0;
}
const ht = (i) => Math.min(Math.max(Math.round(i), 1), 100);
function X(i, t, e, s, r = jt) {
  const n = v(i[t].at);
  if (!n) return i;
  const o = Math.round(e / r) * r;
  let l;
  if (n.kind === "sun") {
    const h = s[n.anchor] ?? (n.anchor === "sunrise" ? 360 : 1080);
    l = A({ kind: "sun", anchor: n.anchor, offset: o - Math.round(h) });
  } else {
    let h = Math.min(Math.max(o, 0), 1435);
    const a = new Set(i.flatMap((c, p) => p === t ? [] : [v(c.at)]).flatMap((c) => c && c.kind === "clock" ? [c.minutes] : []));
    for (; a.has(h) && h < 1435; ) h += r;
    for (; a.has(h) && h > 0; ) h -= r;
    l = A({ kind: "clock", minutes: h });
  }
  return i.map((h, a) => a === t ? { ...h, at: l } : h);
}
function j(i, t, e) {
  return i.map((s, r) => r === t ? { ...s, brightness: ht(e) } : s);
}
function Y(i, t, e) {
  return v(e) ? i.map((s, r) => r === t ? { ...s, at: A(v(e)) } : s) : i;
}
function fe(i, t, e) {
  return i.map((s, r) => {
    if (r !== t) return s;
    const { color_temp: n, ...o } = s;
    return e == null ? o : { ...o, color_temp: Math.min(Math.max(Math.round(e), 1e3), 1e4) };
  });
}
function me(i, t, e, s = jt) {
  if (i.length >= ue) return i;
  const r = new Set(i.flatMap((o) => {
    const l = v(o.at);
    return l && l.kind === "clock" ? [l.minutes] : [];
  }));
  let n = Math.min(Math.max(Math.round(t / s) * s, 0), 1435);
  for (; r.has(n) && n < 1435; ) n += s;
  for (; r.has(n) && n > 0; ) n -= s;
  return [...i, { at: A({ kind: "clock", minutes: n }), brightness: ht(e) }];
}
function wt(i, t) {
  return i.length <= 2 ? i : i.filter((e, s) => s !== t);
}
function ge(i) {
  const t = (e) => i.reduce((s, r) => Math.abs(r.minute - e) < Math.abs(s.minute - e) ? r : s, i[0]);
  return [360, 720, 1080, 1320].map((e) => ({ at: A({ kind: "clock", minutes: e }), brightness: ht(t(e).brightness_pct) }));
}
function _t(i) {
  const t = v(i);
  return !t || t.kind === "clock" ? "" : t.offset === 0 ? t.anchor : `${t.anchor} ${t.offset > 0 ? "+" : "−"} ${Math.abs(t.offset)} min`;
}
function xt(i) {
  const t = (Math.round(i) % 1440 + 1440) % 1440, e = Math.floor(t / 60);
  return `${e % 12 === 0 ? 12 : e % 12}:${String(t % 60).padStart(2, "0")} ${e < 12 ? "AM" : "PM"}`;
}
function $e(i) {
  const t = Ft(i);
  return t ? t.map((e) => `${e.at} ${e.brightness}%`).join(" · ") : "off (sunrise/sunset curve)";
}
function kt(i) {
  return i.length ? i[i.length - 1].minute : 1440;
}
function _(i, t) {
  const e = t.width - t.padLeft - t.padRight, s = Math.min(Math.max(i, 0), t.totalMinutes);
  return t.padLeft + s / t.totalMinutes * e;
}
function St(i, t) {
  const e = t.width - t.padLeft - t.padRight, s = (i - t.padLeft) / e;
  return Math.min(Math.max(s, 0), 1) * t.totalMinutes;
}
function I(i, t) {
  if (!i.length) return -1;
  let e = 0, s = i.length - 1;
  for (; e < s; ) {
    const r = e + s >> 1;
    i[r].minute < t ? e = r + 1 : s = r;
  }
  return e > 0 && t - i[e - 1].minute <= i[e].minute - t ? e - 1 : e;
}
function F(i) {
  const t = parseInt(i.slice(11, 13), 10), e = i.slice(14, 16);
  return `${t % 12 || 12}:${e} ${t < 12 ? "AM" : "PM"}`;
}
function ve(i, t = !1) {
  const e = parseInt(i.slice(11, 13), 10), s = i.slice(14, 16), r = e % 12 || 12, n = e < 12 ? "AM" : "PM";
  return t ? `${r}${s === "00" ? "" : ":" + s}${n[0].toLowerCase()}` : `${r}${s === "00" ? "" : ":" + s} ${n}`;
}
function At(i, t) {
  const e = I(i, t);
  if (e < 0) throw new Error("no samples");
  const s = i[e], r = Date.parse(s.t) + (t - s.minute) * 6e4, n = s.t.slice(19), o = ye(n);
  return new Date(r + o * 6e4).toISOString().slice(0, 19) + n;
}
function ye(i) {
  const t = /^([+-])(\d{2}):(\d{2})$/.exec(i);
  return t ? (t[1] === "-" ? -1 : 1) * (parseInt(t[2], 10) * 60 + parseInt(t[3], 10)) : 0;
}
function be(i, t = 5) {
  return Math.round(i / t) * t;
}
function x(i, t) {
  const e = t.height - t.padTop - t.padBottom, s = Math.min(Math.max(i, 0), 100);
  return t.padTop + (1 - s / 100) * e;
}
function we(i, t) {
  return i.map((e, s) => `${s ? "L" : "M"}${_(e.minute, t).toFixed(1)},${x(e.brightness_pct, t).toFixed(1)}`).join("");
}
function _e(i, t = 3) {
  if (!i.length) return [];
  const e = i[i.length - 1].minute || 1, s = [];
  for (let n = 0; n < i.length; n += t) {
    const o = i[n];
    s.push({ offset: o.minute / e, rgb: `rgb(${o.rgb_color.join(",")})` });
  }
  const r = i[i.length - 1];
  return s[s.length - 1].offset !== 1 && s.push({ offset: 1, rgb: `rgb(${r.rgb_color.join(",")})` }), s;
}
function xe(i, t = 3) {
  const e = [];
  for (let s = 0; s <= i; s += t * 60) e.push(s);
  return e;
}
function ke(i, t) {
  const e = t.height - t.padTop - t.padBottom, s = (1 - (i - t.padTop) / e) * 100;
  return Math.min(Math.max(Math.round(s), 1), 100);
}
const Se = {
  now: () => performance.now(),
  schedule: (i) => requestAnimationFrame(() => i()),
  cancel: (i) => cancelAnimationFrame(i)
};
class Ae {
  constructor(t, e, s, r = Se) {
    this.totalMinutes = t, this.durationMs = e, this.onTick = s, this.clock = r, this.minute = 0, this.playing = !1, this.startedAt = 0, this.startMinute = 0, this.handle = null;
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
class Me {
  constructor(t, e, s = () => Date.now(), r = (o, l) => setTimeout(o, l), n = (o) => clearTimeout(o)) {
    this.intervalMs = t, this.send = e, this.now = s, this.setTimer = r, this.clearTimer = n, this.last = -1 / 0, this.pending = null, this.timer = null;
  }
  push(t) {
    const e = this.last + this.intervalMs - this.now();
    if (e <= 0) {
      this.fire(t);
      return;
    }
    this.pending = { value: t }, this.timer === null && (this.timer = this.setTimer(() => {
      this.timer = null;
      const s = this.pending;
      this.pending = null, s && this.fire(s.value);
    }, e));
  }
  cancel() {
    this.timer !== null && this.clearTimer(this.timer), this.timer = null, this.pending = null;
  }
  fire(t) {
    this.last = this.now(), this.send(t);
  }
}
function Mt(i, t) {
  let e = "string", s;
  if (i.selector) {
    const r = Object.keys(i.selector)[0];
    r === "select" ? (e = "select", s = i.selector.select.options) : r === "entity" ? e = "entity" : r === "color_rgb" && (e = "color_rgb");
  } else (i.type === "boolean" || i.type === "integer" || i.type === "float") && (e = i.type);
  return { name: i.name, section: t, kind: e, min: i.valueMin, max: i.valueMax, options: s, value: i.default };
}
function st(i) {
  if (!i.data_schema) throw new Error("This profile has no editable options (YAML-configured?)");
  const t = { flowId: i.flow_id, sections: [], fields: [] };
  for (const e of i.data_schema)
    if (e.type === "expandable") {
      t.sections.push(e.name);
      for (const s of e.schema ?? []) t.fields.push(Mt(s, e.name));
    } else
      t.fields.push(Mt(e, null));
  return t;
}
function M(i) {
  return Object.fromEntries(i.fields.map((t) => [t.name, t.value]));
}
function Ee(i, t) {
  return JSON.stringify(i) === JSON.stringify(t);
}
function Pe(i, t) {
  const e = {};
  for (const [s, r] of Object.entries(t)) Ee(i[s], r) || (e[s] = r);
  return e;
}
function zt(i, t) {
  const e = Object.fromEntries(i.sections.map((s) => [s, {}]));
  for (const s of i.fields) {
    const r = s.name in t ? t[s.name] : s.value;
    s.section ? e[s.section][s.name] = r : e[s.name] = r;
  }
  return e;
}
function Te(i, t) {
  if (i.kind === "boolean") return [!!t, null];
  const e = String(t).trim();
  if (i.kind === "integer" || i.kind === "float") {
    if (e === "") return [null, "required"];
    const s = i.kind === "integer" ? Number(e) : parseFloat(e);
    return !Number.isFinite(s) || i.kind === "integer" && !Number.isInteger(s) ? [e, `expected ${i.kind === "integer" ? "a whole number" : "a number"}`] : i.min !== void 0 && s < i.min ? [s, `minimum ${i.min}`] : i.max !== void 0 && s > i.max ? [s, `maximum ${i.max}`] : [s, null];
  }
  if (i.kind === "select") return i.options?.includes(e) ? [e, null] : [e, "not an allowed value"];
  if (i.kind === "entity") return [e.split(",").map((s) => s.trim()).filter(Boolean), null];
  if (i.kind === "color_rgb") {
    const s = e.split(",").map((r) => Number(r.trim()));
    return s.length !== 3 || s.some((r) => !Number.isInteger(r) || r < 0 || r > 255) ? [e, "expected R,G,B (0-255)"] : [s, null];
  }
  return [e, null];
}
function Z(i) {
  return i == null ? "—" : Array.isArray(i) ? i.join(", ") : String(i);
}
const Q = () => ({ muted: /* @__PURE__ */ new Set(), solo: /* @__PURE__ */ new Set() });
function tt(i) {
  const t = Array.isArray(i) ? i : typeof i == "string" ? i.split(",") : [], e = [];
  for (const s of t) {
    const r = String(s).trim();
    r && !e.includes(r) && e.push(r);
  }
  return e;
}
function Ce(i, t) {
  return t.solo.size ? t.solo.has(i) ? "solo" : "not-soloed" : t.muted.has(i) ? "muted" : "active";
}
function Et(i, t) {
  const e = new Set(i);
  return e.delete(t) || e.add(t), e;
}
function Pt(i, t) {
  const e = (s) => new Set([...s].filter((r) => t.includes(r)));
  return { muted: e(i.muted), solo: e(i.solo) };
}
function It(i, t, e) {
  return t.map((s) => {
    const r = Ce(s, e);
    return { id: s, saved: i.includes(s), status: r, active: r === "active" || r === "solo" };
  });
}
function Le(i, t, e) {
  return It(i, t, e).filter((s) => s.active && s.saved).map((s) => s.id);
}
function Oe(i, t) {
  return i.length === t.length && i.every((e) => t.includes(e));
}
let Tt = null;
function He(i = 5e3) {
  return customElements.get("ha-selector") ? Promise.resolve(!0) : (Tt ??= Promise.race([
    (async () => {
      const t = await window.loadCardHelpers?.();
      return t ? (t.createCardElement({ type: "button", entity: "sun.sun" }), await customElements.whenDefined("hui-button-card"), await customElements.get("hui-button-card").getConfigElement?.(), await customElements.whenDefined("ha-selector"), !0) : !1;
    })().catch(() => !1),
    new Promise((t) => setTimeout(() => t(!1), i))
  ]), Tt);
}
function Ne(i, t) {
  i.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: t }, bubbles: !0, composed: !0 }));
}
const Re = (i) => typeof i.result == "string" ? i.result : i.result?.entry_id ?? null;
function Ue(i, t, e) {
  const s = {};
  for (const r of i)
    if (r.entry_id !== e)
      for (const n of r.lights)
        t.includes(n.entity_id) && (s[n.entity_id] ??= []).push(r.title);
  return s;
}
async function De(i, t, e) {
  let s = null, r = null;
  try {
    let o = await i("POST", "config/config_entries/flow", { handler: "adaptive_lighting" });
    if (s = o.flow_id ?? null, o.type === "form" && o.step_id === "menu" && (o = await i("POST", `config/config_entries/flow/${s}`, { action: "new" })), o.type === "form" && o.step_id === "user" && (o = await i("POST", `config/config_entries/flow/${s}`, { name: t })), o.type === "abort")
      return s = null, { ok: !1, error: o.reason === "already_configured" ? `A profile named "${t}" already exists.` : `Home Assistant refused: ${o.reason}` };
    if (o.type !== "create_entry") return { ok: !1, error: `Unexpected step: ${o.type} ${o.step_id ?? ""}` };
    if (s = null, r = Re(o), !r) return { ok: !1, error: "Home Assistant did not return the new profile's id." };
  } catch (o) {
    return s && await i("DELETE", `config/config_entries/flow/${s}`).catch(() => {
    }), { ok: !1, error: `Could not create the profile: ${o.message ?? o}` };
  }
  let n = null;
  try {
    const o = await i("POST", "config/config_entries/options/flow", { handler: r });
    n = o.flow_id;
    const l = await i(
      "POST",
      `config/config_entries/options/flow/${n}`,
      zt(st(o), e)
    );
    if (l.type !== "create_entry") throw new Error(`Home Assistant rejected the options: ${JSON.stringify(l.errors ?? l)}`);
    return { ok: !0, entryId: r };
  } catch (o) {
    return n && await i("DELETE", `config/config_entries/options/flow/${n}`).catch(() => {
    }), await i("DELETE", `config/config_entries/entry/${r}`).catch(() => {
    }), { ok: !1, error: `${o.message ?? o} The new profile was removed.` };
  }
}
const Be = {
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
  schedule: "Your own fade points: a time and a brightness each, with the lamps fading in a straight line between them. Edit it in the Schedule card, by dragging the dots on the chart.",
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
}, je = (i) => Be[i] ?? "", Ct = { totalMinutes: 1440, width: 1e3, height: 300, padLeft: 44, padRight: 24, padTop: 14, padBottom: 58 }, Lt = 18, Fe = [15, 30, 60, 120], ze = { sunrise: "sunrise", sunset: "sunset", solar_noon: "noon", solar_midnight: "midnight" }, W = class W extends H {
  constructor() {
    super(), this.curveTimer = null, this.pointTimer = null, this.unsubPreview = null, this.loaded = !1, this.previewSet = [], this.instantSaveLights = !1, this.resize = new ResizeObserver((t) => {
      const e = Math.round(t[0].contentRect.width);
      e > 0 && Math.abs(e - this.chartWidth) > 4 && (this.chartWidth = Math.min(Math.max(e, 300), 1400));
    }), this.profiles = [], this.selected = "", this.form = null, this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.curve = null, this.date = "", this.sleep = !1, this.minute = 12 * 60, this.playing = !1, this.duration = 30, this.point = null, this.preview = "off", this.message = "", this.confirming = !1, this.busy = !1, this.chartWidth = 1e3, this.mix = Q(), this.picker = "loading", this.draft = null, this.dragging = null, this.playback = new Ae(1440, 3e4, (t, e) => {
      this.minute = t, this.playing = e, this.schedulePoint(e ? 120 : 0);
    }), this.playback.minute = this.minute, this.previewSender = new Me(1e3, (t) => void this.sendPreview(t));
  }
  // ------------------------------------------------------------- lifecycle
  updated(t) {
    t.has("hass") && this.hass && !this.loaded && (this.loaded = !0, this.loadProfiles(), He().then((e) => this.picker = e ? "ready" : "failed"));
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
      const s = t && this.profiles.some((n) => n.entry_id === this.selected), r = this.profiles.find((n) => n.lights.length) ?? this.profiles[0];
      !s && r ? await this.selectProfile(r.entry_id) : s && await this.selectProfile(this.selected);
    } catch (e) {
      this.message = `Could not load profiles: ${e.message ?? e}`;
    }
  }
  async selectProfile(t) {
    await this.stopPreview(), this.playback.pause(), this.selected = t, this.draft = null, this.mix = Q(), this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.confirming = !1, this.form = await this.readForm(t), await this.refreshCurve();
  }
  /** Read the options form (types, limits, current values) and close the flow again. */
  async readForm(t) {
    let e = null;
    try {
      const s = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: t });
      return e = s.flow_id, st(s);
    } catch (s) {
      return this.message = `Could not read options: ${s.message ?? s}`, null;
    } finally {
      e && await this.hass.callApi("DELETE", `config/config_entries/options/flow/${e}`).catch(() => {
      });
    }
  }
  get overrides() {
    return this.form ? Pe(M(this.form), this.edited) : {};
  }
  get savedLights() {
    return (this.profiles.find((t) => t.entry_id === this.selected)?.lights ?? []).map((t) => t.entity_id);
  }
  /** The lights as edited (unsaved additions included, removals left out). */
  get effectiveLights() {
    return "lights" in this.edited ? tt(this.edited.lights) : this.savedLights;
  }
  get previewTargets() {
    return Le(this.savedLights, this.effectiveLights, this.mix);
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
    const s = kt(e.samples);
    this.playback.totalMinutes = s, this.minute > s && (this.minute = s), this.schedulePoint(0);
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
    const t = At(this.curve.samples, this.minute), e = await this.ws({
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
    if (!(this.preview !== "active" || Oe(t, this.previewSet))) {
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
    const [s, r] = Te(t, e), n = { ...this.fieldErrors };
    r ? n[t.name] = r : delete n[t.name], this.fieldErrors = n, r || (this.edited = { ...this.edited, [t.name]: s }, this.scheduleCurve());
  }
  onLights(t) {
    this.edited = { ...this.edited, lights: t }, this.setMix(Pt(this.mix, t)), this.scheduleCurve(), this.instantSaveLights && this.saveFields({ lights: t });
  }
  /** Start a new profile: it borrows the selected profile's curve as a starting point, lights cleared. */
  async startDraft() {
    await this.stopPreview(), this.playback.pause(), this.draft = { name: "" }, this.edited = { lights: [] }, this.fieldErrors = {}, this.confirming = !1, this.mix = Q(), this.scheduleCurve();
  }
  async cancelDraft() {
    await this.selectProfile(this.selected);
  }
  async create() {
    if (!(!this.form || !this.draft)) {
      this.busy = !0;
      try {
        const t = { ...M(this.form), ...this.edited }, e = await De((r, n, o) => this.hass.callApi(r, n, o), this.draft.name.trim(), t);
        if (!e.ok) {
          this.message = e.error;
          return;
        }
        const s = this.draft.name.trim();
        this.confirming = !1, this.draft = null, this.selected = e.entryId, await this.loadProfiles(!0);
        for (let r = 0; r < 10 && this.profiles.find((n) => n.entry_id === e.entryId)?.loaded === !1; r++) {
          await new Promise((o) => setTimeout(o, 1e3));
          const n = await this.ws({ type: "adaptive_lighting/sim/profiles" });
          this.profiles = n.profiles;
        }
        this.message = `Created profile ${s}.`;
      } catch (t) {
        this.message = `Create failed: ${t.message ?? t}`;
      } finally {
        this.busy = !1;
      }
    }
  }
  discard() {
    this.edited = this.draft ? { lights: [] } : {}, this.fieldErrors = {}, this.confirming = !1, this.setMix(Pt(this.mix, this.savedLights)), this.scheduleCurve();
  }
  async apply() {
    if (this.draft) return this.create();
    await this.saveFields(this.overrides);
  }
  /** Write `pending` (field -> value) to the profile through HA's options flow. */
  async saveFields(t) {
    if (!this.form) return;
    this.busy = !0;
    let e = null, s = !1;
    try {
      const r = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: this.selected });
      e = r.flow_id;
      const n = st(r), o = M(this.form), l = M(n), h = Object.keys(l).filter((c) => !(c in t) && JSON.stringify(l[c]) !== JSON.stringify(o[c]));
      if (h.length) {
        this.message = `This profile was changed elsewhere since you opened it (${h.join(", ")}). Reload before saving.`;
        return;
      }
      const a = await this.hass.callApi(
        "POST",
        `config/config_entries/options/flow/${e}`,
        zt(n, { ...l, ...t })
      );
      if (a.type !== "create_entry") {
        this.message = `Home Assistant rejected the options: ${JSON.stringify(a.errors ?? a)}`;
        return;
      }
      s = !0, this.message = `Saved ${Object.keys(t).length} change(s) to ${this.profileTitle}.`, this.confirming = !1, await this.loadProfiles(!0);
      for (let c = 0; c < 10 && this.profiles.find((p) => p.entry_id === this.selected)?.loaded === !1; c++) {
        await new Promise((m) => setTimeout(m, 1e3));
        const p = await this.ws({ type: "adaptive_lighting/sim/profiles" });
        this.profiles = p.profiles;
      }
    } catch (r) {
      this.message = `Save failed: ${r.message ?? r}`;
    } finally {
      e && !s && await this.hass.callApi("DELETE", `config/config_entries/options/flow/${e}`).catch(() => {
      }), this.busy = !1;
    }
  }
  get profileTitle() {
    return this.profiles.find((t) => t.entry_id === this.selected)?.title ?? "";
  }
  // --------------------------------------------------------------- schedule
  /** The schedule's points as edited (null = the profile follows the sun). */
  get schedule() {
    const t = "schedule" in this.edited ? this.edited.schedule : this.form ? M(this.form).schedule : null;
    return Ft(t);
  }
  /** Sunrise and sunset as minutes of the shown day, for placing sun-anchored points. */
  get sunMinutes() {
    const t = this.curve?.samples ?? [];
    if (!t.length) return {};
    const e = Date.parse(t[0].t), s = (r) => r ? (Date.parse(r) - e) / 6e4 : void 0;
    return { sunrise: s(this.curve?.sun?.sunrise), sunset: s(this.curve?.sun?.sunset) };
  }
  setSchedule(t) {
    this.edited = { ...this.edited, schedule: pe(t) }, this.scheduleCurve();
  }
  useSchedule() {
    const t = this.curve?.samples ?? [];
    t.length && this.setSchedule(ge(t));
  }
  dragFromEvent(t) {
    const s = t.currentTarget.ownerSVGElement.getBoundingClientRect(), r = this.box(this.playback.totalMinutes), n = (t.clientX - s.left) / s.width * r.width, o = (t.clientY - s.top) / s.height * r.height;
    return { minute: St(n, r), pct: ke(o, r) };
  }
  onHandleDown(t, e) {
    e.stopPropagation(), e.preventDefault(), e.currentTarget.setPointerCapture(e.pointerId), this.dragging = t;
  }
  onHandleMove(t, e) {
    if (this.dragging !== t) return;
    const s = this.schedule;
    if (!s) return;
    const { minute: r, pct: n } = this.dragFromEvent(e);
    this.setSchedule(j(X(s, t, r, this.sunMinutes, e.shiftKey ? 1 : 5), t, n));
  }
  onHandleUp() {
    this.dragging = null;
  }
  onHandleKey(t, e) {
    const s = this.schedule;
    if (!s) return;
    const r = w(s[t], this.sunMinutes), n = e.shiftKey ? 60 : 5;
    if (e.key === "ArrowLeft") this.setSchedule(X(s, t, r - n, this.sunMinutes));
    else if (e.key === "ArrowRight") this.setSchedule(X(s, t, r + n, this.sunMinutes));
    else if (e.key === "ArrowUp") this.setSchedule(j(s, t, s[t].brightness + (e.shiftKey ? 10 : 1)));
    else if (e.key === "ArrowDown") this.setSchedule(j(s, t, s[t].brightness - (e.shiftKey ? 10 : 1)));
    else if (e.key === "Delete" || e.key === "Backspace") this.setSchedule(wt(s, t));
    else return;
    e.preventDefault(), e.stopPropagation();
  }
  addAtPlayhead() {
    const t = this.schedule;
    if (!t) return;
    const e = this.curve?.samples[I(this.curve.samples, this.minute)];
    this.setSchedule(me(t, this.minute, e?.brightness_pct ?? 50));
  }
  changeKind(t, e) {
    const s = this.schedule;
    if (!s) return;
    const r = w(s[t], this.sunMinutes), n = e === "clock" ? A({ kind: "clock", minutes: Math.min(Math.max(Math.round(r / 5) * 5, 0), 1435) }) : e;
    this.setSchedule(Y(s, t, n));
  }
  showValue(t, e) {
    return t === "schedule" ? $e(e) : Z(e);
  }
  /** Handles drawn on the chart: a dot per point (a diamond when tied to sunrise or sunset). */
  renderHandles(t) {
    const e = this.schedule;
    if (!e) return u;
    const s = this.sunMinutes, r = e.map((o, l) => {
      const h = _(w(o, s), t), a = x(o.brightness, t), c = v(o.at)?.kind === "sun", p = `${xt(w(o, s))}, ${o.brightness}%${c ? `, ${_t(o.at)}` : ""}`;
      return { i: l, p: o, x: h, y: a, anchored: c, label: p };
    }), n = this.dragging !== null ? r.find((o) => o.i === this.dragging) : void 0;
    return $`
      ${r.map(
      (o) => $`
          <g class="handle ${this.dragging === o.i ? "active" : ""}" tabindex="0" role="slider" aria-label="Schedule point: ${o.label}. Arrow keys move it, Shift is bigger steps, Delete removes it."
            aria-valuenow=${o.p.brightness} aria-valuemin="1" aria-valuemax="100" aria-valuetext=${o.label}
            @pointerdown=${(l) => this.onHandleDown(o.i, l)}
            @pointermove=${(l) => this.onHandleMove(o.i, l)}
            @pointerup=${() => this.onHandleUp()} @pointercancel=${() => this.onHandleUp()}
            @keydown=${(l) => this.onHandleKey(o.i, l)}>
            <title>${o.label}</title>
            ${o.anchored ? $`<rect x=${o.x - 8} y=${o.y - 8} width="16" height="16" transform="rotate(45 ${o.x} ${o.y})"></rect>` : $`<circle cx=${o.x} cy=${o.y} r="8"></circle>`}
            <circle class="hit" cx=${o.x} cy=${o.y} r="16"></circle>
          </g>`
    )}
      ${n ? this.renderTip(`${xt(w(n.p, s))} · ${n.p.brightness}%${n.anchored ? ` · ${_t(n.p.at)}` : ""}`, n.x, n.y, t) : u}
    `;
  }
  renderSchedule() {
    const t = this.schedule;
    if (!this.form) return u;
    if (!t)
      return d`<section class="card">
        <h2>Schedule</h2>
        <p class="muted">This profile follows sunrise and sunset. A schedule lets you set your own times and levels instead, for example 100% from 8:00 to 17:00, 50% in the evening, 10% overnight. The lights fade in a straight line between points.</p>
        <button class="primary" ?disabled=${!this.curve?.samples.length} @click=${this.useSchedule}>Use a schedule</button>
      </section>`;
    const e = this.sunMinutes, s = t.map((r, n) => n).sort((r, n) => w(t[r], e) - w(t[n], e));
    return d`<section class="card">
      <h2>Schedule</h2>
      <p class="muted small">Drag a dot on the chart (left and right = time in 5-minute steps, hold Shift for 1 minute; up and down = brightness), or edit the rows. A diamond is tied to sunrise or sunset and follows it through the year. The schedule replaces the brightness mode and min/max brightness. Sleep mode still wins.</p>
      <div class="sched">
        <div class="schedhead"><span>When</span><span>Time</span><span>Brightness %</span><span>Colour K (optional)</span><span></span></div>
        ${s.map((r) => {
      const n = t[r], o = v(n.at), l = o?.kind === "sun" ? o.anchor : "clock", h = o?.kind === "clock" ? `${String(Math.floor(o.minutes / 60)).padStart(2, "0")}:${String(o.minutes % 60).padStart(2, "0")}` : "";
      return d`<div class="schedrow ${this.dragging === r ? "active" : ""}">
            <select aria-label="Time type" @change=${(a) => this.changeKind(r, a.target.value)}>
              <option value="clock" ?selected=${l === "clock"}>Clock time</option>
              <option value="sunrise" ?selected=${l === "sunrise"}>Sunrise</option>
              <option value="sunset" ?selected=${l === "sunset"}>Sunset</option>
            </select>
            ${o?.kind === "sun" ? d`<label class="inline">offset <input type="number" step="5" .value=${String(o.offset)} aria-label="Minutes after ${o.anchor} (negative = before)"
                  @change=${(a) => this.setSchedule(Y(t, r, A({ kind: "sun", anchor: o.anchor, offset: Number(a.target.value) || 0 })))} /> min</label>` : d`<input type="time" step="300" .value=${h} aria-label="Time of day" @change=${(a) => this.setSchedule(Y(t, r, a.target.value))} />`}
            <input type="number" min="1" max="100" .value=${String(n.brightness)} aria-label="Brightness percent"
              @change=${(a) => this.setSchedule(j(t, r, Number(a.target.value)))} />
            <input type="number" min="1000" max="10000" step="50" placeholder="sun-based" .value=${n.color_temp != null ? String(n.color_temp) : ""} aria-label="Colour temperature in Kelvin, optional"
              @change=${(a) => {
        const c = a.target.value;
        this.setSchedule(fe(t, r, c === "" ? null : Number(c)));
      }} />
            <button aria-label="Remove this point" title="Remove this point" ?disabled=${t.length <= 2} @click=${() => this.setSchedule(wt(t, r))}>✕</button>
          </div>`;
    })}
      </div>
      <div class="actions">
        <button @click=${() => this.setSchedule(null)}>Back to sunrise/sunset</button>
        <button class="primary" @click=${this.addAtPlayhead}>+ Add point at the playhead</button>
      </div>
    </section>`;
  }
  // ------------------------------------------------------------------ chart
  onChartPointer(t) {
    if (t.type === "pointermove" && t.buttons === 0) return;
    const e = t.currentTarget, s = e.getBoundingClientRect(), r = this.box(this.playback.totalMinutes), n = (t.clientX - s.left) / s.width * r.width;
    this.playback.seek(be(St(n, r))), t.type === "pointerdown" && e.setPointerCapture(t.pointerId);
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
    return { ...Ct, width: this.chartWidth, height: e ? 240 : Ct.height, totalMinutes: t };
  }
  renderChart() {
    const t = this.curve?.samples ?? [], e = this.box(kt(t)), s = e.width < 600, n = (this.profiles.find((f) => f.entry_id === this.selected)?.lights ?? []).some((f) => f.features?.includes("color") || f.features?.includes("color_temp")), o = e.height - e.padBottom + 22, l = I(t, this.minute), h = l >= 0 ? t[l] : null, a = _(this.minute, e), c = _e(t), p = Object.entries(this.curve?.sun ?? {}), m = t.length ? Date.parse(t[0].t) : 0, g = t.length ? At(t, Math.round(this.minute)) : "";
    return d`
      <svg
        class="chart"
        viewBox="0 0 ${e.width} ${e.height}"
        role="slider"
        tabindex="0"
        aria-label="Time of day. Arrow keys move 15 minutes, space plays."
        aria-valuemin="0"
        aria-valuemax=${e.totalMinutes}
        aria-valuenow=${Math.round(this.minute)}
        aria-valuetext=${g ? F(g) : ""}
        @pointerdown=${this.onChartPointer}
        @pointermove=${this.onChartPointer}
        @keydown=${this.onChartKey}
      >
        <defs>
          <linearGradient id="ct" x1="0" x2="1">
            ${c.map((f) => $`<stop offset=${f.offset} stop-color=${f.rgb}></stop>`)}
          </linearGradient>
        </defs>
        ${[0, 25, 50, 75, 100].map(
      (f) => $`
            <line class="grid" x1=${e.padLeft} x2=${e.width - e.padRight} y1=${x(f, e)} y2=${x(f, e)}></line>
            <text class="axis" x=${e.padLeft - 6} y=${x(f, e) + 4} text-anchor="end">${f}%</text>`
    )}
        ${xe(e.totalMinutes, s ? 6 : 3).map(
      (f) => $`
            <line class="grid" x1=${_(f, e)} x2=${_(f, e)} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            <text class="axis" x=${_(f, e)} y=${e.height - e.padBottom + 14} text-anchor="middle">${t.length ? ve(t[I(t, f)].t, s) : ""}</text>`
    )}
        ${p.map(([f, B]) => {
      const C = (Date.parse(B) - m) / 6e4;
      if (C < 0 || C > e.totalMinutes) return u;
      const q = _(C, e);
      return $`
            <line class="sun" x1=${q} x2=${q} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            ${s && (f === "solar_noon" || f === "solar_midnight") ? u : $`<text class="sunlabel" x=${q + 3} y=${e.padTop + 10}>${s ? "" : `${ze[f] ?? f} `}${F(B)}</text>`}`;
    })}
        <path class="line" d=${we(t, e)}></path>
        <rect x=${e.padLeft} y=${o} width=${e.width - e.padLeft - e.padRight} height=${Lt} rx="3" fill="url(#ct)" opacity=${n ? 1 : 0.25}></rect>
        <text class="axis" x=${e.padLeft - 6} y=${o + 13} text-anchor="end">colour</text>
        ${n ? u : $`<text class="axis" x=${e.padLeft + 8} y=${o + 13}>not used: these lights are dimmer-only</text>`}
        <line class="playhead" x1=${a} x2=${a} y1=${e.padTop} y2=${o + Lt}></line>
        ${h ? $`<circle class="dot" cx=${a} cy=${x(h.brightness_pct, e)} r="6"></circle>` : u}
        ${this.renderHandles(e)}
        ${h ? this.renderTip(F(g), a, x(h.brightness_pct, e), e) : u}
      </svg>
    `;
  }
  /** Time label beside the playhead dot: above it, or below when the dot is near the top. */
  renderTip(t, e, s, r) {
    const n = t.length * 7.2 + 14, o = 22, l = r.padLeft, h = r.width - r.padRight - n, a = Math.min(Math.max(e - n / 2, l), h), c = s - 12 - o, p = c >= r.padTop + 14 ? c : s + 12;
    return $`
      <g class="tip" pointer-events="none">
        <rect x=${a} y=${p} width=${n} height=${o} rx="5"></rect>
        <text x=${a + n / 2} y=${p + 15} text-anchor="middle">${t}</text>
      </g>`;
  }
  // ------------------------------------------------------------- point view
  renderPoint() {
    const t = this.point;
    if (!t) return d`<p class="muted">Pick a time on the chart.</p>`;
    const e = this.profiles.find((r) => r.entry_id === this.selected), s = t.settings;
    return d`
      <div class="now">
        <span class="time">${F(t.t)}</span>
        <span>${s.brightness_pct.toFixed(0)}% brightness</span>
        <span>${s.color_temp_kelvin} K</span>
        ${this.sleep ? d`<span class="tag">sleep mode</span>` : u}
      </div>
      <div class="lights">
        ${It(this.savedLights, this.effectiveLights, this.mix).map(
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
    const s = e?.lights.find((n) => n.entity_id === t)?.name, r = this.hass?.states?.[t]?.attributes.friendly_name;
    return s ?? (typeof r == "string" ? r : t);
  }
  renderLight(t, e, s) {
    const r = t.id, n = { active: "", solo: "solo", muted: "muted", "not-soloed": "not soloed" }[t.status], o = d`
      ${n ? d`<span class="tag">${n}</span>` : u}
      ${t.saved ? u : d`<span class="tag">unsaved</span>`}`, l = this.preview === "off" ? u : t.saved ? t.active ? d`<br /><span class="muted small">preview is driving this light; a manual change lasts until the playhead moves</span>` : u : d`<br /><span class="muted small">save to preview on the real light</span>`;
    let h, a;
    if (!s || s.error)
      h = d`<span class="swatch none"></span>`, a = d`<span class="warn">${s?.error ?? "no data"}</span>`;
    else {
      const p = s.brightness !== void 0 ? Math.round(s.brightness / 255 * 100) : null, m = s.display_rgb ?? [255, 244, 229], g = p === null ? 1 : 0.15 + 0.85 * (p / 100), f = `rgb(${m.map((C) => Math.round(C * g)).join(",")})`, B = s.rgb_color ? `RGB ${s.rgb_color.join(", ")}` : s.color_temp_kelvin ? `${s.color_temp_kelvin} K` : "dimmer only";
      h = d`<span class="swatch" style="background:${f}"></span>`, a = d`<span>${p ?? "—"}% · ${B}</span>`;
    }
    const c = () => Ne(this, r);
    return d`
      <div class="light ${t.active ? "" : "inactive"}" title=${r}>
        <button class="swatchbtn" aria-label="Control ${e}" @click=${c}>${h}</button>
        <div class="lightinfo">
          <button class="link name" @click=${c}>${e}</button>${o}<br />${a}${l}
        </div>
        <div class="ms">
          <button class="mute" aria-pressed=${this.mix.muted.has(r)} title="Mute in preview" aria-label="Mute ${e}"
            @click=${() => this.setMix({ ...this.mix, muted: Et(this.mix.muted, r) })}>M</button>
          <button class="solo" aria-pressed=${this.mix.solo.has(r)} title="Solo in preview" aria-label="Solo ${e}"
            @click=${() => this.setMix({ ...this.mix, solo: Et(this.mix.solo, r) })}>S</button>
        </div>
      </div>
    `;
  }
  // ------------------------------------------------------------ options UI
  /** Option name with a help tooltip (hover, keyboard focus or tap on the ⓘ). */
  renderLabel(t, e, s) {
    const r = je(t);
    return d`<span class="lbl">${e}${s ? d` <em>(edited)</em>` : u}${r ? d` <span class="help" tabindex="0" role="note" aria-label="${e}: ${r}" data-tip=${r}>ⓘ</span>` : u}</span>`;
  }
  renderField(t) {
    if (t.name === "schedule") return u;
    const e = t.name in this.edited ? this.edited[t.name] : t.value, s = t.name in this.overrides, r = this.fieldErrors[t.name] ?? this.serverErrors[t.name], n = t.name.replaceAll("_", " ");
    let o;
    return t.name === "lights" && t.kind === "entity" && this.picker === "ready" ? d`
        <div class="field wide ${s ? "changed" : ""} ${r ? "error" : ""}">
          ${this.renderLabel(t.name, n, s)}
          <ha-selector .hass=${this.hass} .selector=${{ entity: { domain: "light", multiple: !0 } }}
            .value=${tt(e)} @value-changed=${(l) => this.onLights(tt(l.detail.value))}></ha-selector>
          ${r ? d`<span class="warn">⚠ ${r}</span>` : u}
        </div>
      ` : (t.kind === "boolean" ? o = d`<input type="checkbox" .checked=${!!e} @change=${(l) => this.onField(t, l.target.checked)} />` : t.kind === "select" ? o = d`<select @change=${(l) => this.onField(t, l.target.value)}>
        ${t.options?.map((l) => d`<option value=${l} ?selected=${l === e}>${l}</option>`)}
      </select>` : t.kind === "integer" || t.kind === "float" ? o = d`<input type="number" .value=${String(e ?? "")} min=${t.min ?? u} max=${t.max ?? u} step=${t.kind === "integer" ? 1 : "any"}
        @input=${(l) => this.onField(t, l.target.value)} />` : o = d`<input type="text" .value=${Z(e) === "—" ? "" : Array.isArray(e) ? e.join(", ") : String(e)}
        @change=${(l) => this.onField(t, l.target.value)} />`, d`
      <label class="field ${t.name === "lights" ? "wide" : ""} ${s ? "changed" : ""} ${r ? "error" : ""}">
        ${this.renderLabel(t.name, n, s)}
        ${o}
        ${t.name === "lights" && this.picker === "failed" ? d`<span class="muted small">Home Assistant's light picker didn't load; type entity ids separated by commas.</span>` : u}
        ${r ? d`<span class="warn">⚠ ${r}</span>` : u}
      </label>
    `);
  }
  renderOptionsCard() {
    if (!this.form) return d`<p class="muted">Options unavailable.</p>`;
    const t = this.form.fields.filter((a) => !a.section), e = this.overrides, s = Object.keys(e).length, r = M(this.form), n = this.draft, o = n ? Ue(this.profiles, this.effectiveLights, null) : {}, l = !!n?.name.trim(), h = l && this.effectiveLights.length > 0 && Object.keys(this.fieldErrors).length === 0 && !this.busy;
    return n ? d`
        <label class="field wide ${l ? "" : "error"}">
          <span>name</span>
          <input type="text" placeholder="e.g. Hallway" .value=${n.name} @input=${(a) => this.draft = { name: a.target.value }} />
          ${l ? u : d`<span class="warn">⚠ required</span>`}
        </label>
        <div class="fields">${t.map((a) => this.renderField(a))}</div>
        ${this.form.sections.map(
      (a) => d`<details>
            <summary>${a} options</summary>
            <div class="fields">${this.form.fields.filter((c) => c.section === a).map((c) => this.renderField(c))}</div>
          </details>`
    )}
        ${Object.keys(o).length ? d`<p class="warn">⚠ Already controlled by another profile: ${Object.entries(o).map(([a, c]) => `${a} (${c.join(", ")})`).join("; ")}. Two profiles on one light will fight.</p>` : u}
        ${this.effectiveLights.length ? u : d`<p class="warn">⚠ Pick at least one light.</p>`}
        <div class="actions">
          <button ?disabled=${this.busy} @click=${this.cancelDraft}>Cancel</button>
          <button ?disabled=${this.busy} @click=${this.discard}>Reset</button>
          <button class="primary" ?disabled=${!h} @click=${() => this.confirming = !0}>Create…</button>
        </div>
        ${this.confirming ? d`<div class="confirm" role="dialog" aria-label="Confirm new profile">
              <b>Create profile "${n.name.trim()}"?</b>
              <table>
                <tr><td>lights</td><td><b>${Z(this.effectiveLights)}</b></td></tr>
                ${Object.entries(e).filter(([a]) => a !== "lights").map(([a, c]) => d`<tr><td>${a.replaceAll("_", " ")}</td><td>${this.showValue(a, r[a])}</td><td>→</td><td><b>${this.showValue(a, c)}</b></td></tr>`)}
              </table>
              <p class="muted small">All other options start as in ${this.profileTitle}.</p>
              <div class="actions">
                <button @click=${() => this.confirming = !1}>Cancel</button>
                <button class="primary" ?disabled=${this.busy} @click=${this.apply}>${this.busy ? "Creating…" : "Create profile"}</button>
              </div>
            </div>` : u}
      ` : d`
      <div class="fields">${t.map((a) => this.renderField(a))}</div>
      ${this.form.sections.map(
      (a) => d`<details>
          <summary>${a} options</summary>
          <div class="fields">${this.form.fields.filter((c) => c.section === a).map((c) => this.renderField(c))}</div>
        </details>`
    )}
      <div class="actions">
        <span class="muted">${s ? `${s} unsaved change(s), already shown in the chart` : "No unsaved changes"}</span>
        <button ?disabled=${!s || this.busy} @click=${this.discard}>Discard</button>
        <button class="primary" ?disabled=${!s || this.busy || Object.keys(this.fieldErrors).length > 0} @click=${() => this.confirming = !0}>Save…</button>
      </div>
      ${this.confirming ? d`<div class="confirm" role="dialog" aria-label="Confirm changes">
            <b>Save these changes to ${this.profileTitle}?</b>
            <table>
              ${Object.entries(e).map(([a, c]) => d`<tr><td>${a.replaceAll("_", " ")}</td><td>${this.showValue(a, r[a])}</td><td>→</td><td><b>${this.showValue(a, c)}</b></td></tr>`)}
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
    return d`
      <div class="toolbar">
        <h1>Adaptive Lighting</h1>
        <label>Profile
          <select ?disabled=${!!this.draft} @change=${(e) => void this.selectProfile(e.target.value)}>
            ${this.profiles.map((e) => d`<option value=${e.entry_id} ?selected=${e.entry_id === this.selected}>${e.title}${e.lights.length ? "" : " (no lights)"}</option>`)}
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
      ${this.message ? d`<div class="banner" role="status">${this.message} <button class="link" @click=${() => this.message = ""}>dismiss</button></div>` : u}
      ${this.draft ? d`<div class="banner" role="status"><b>New profile (draft).</b> The curve starts as a copy of ${this.profileTitle}'s. Add lights, adjust the curve, name it, then Create. Nothing exists until you create it.</div>` : u}
      ${t?.error ? d`<div class="banner warnbg">⚠ ${t.error}</div>` : u}
      ${t && !this.draft && !t.lights.length ? d`<div class="banner">This profile has no lights, so it doesn't control anything.</div>` : u}

      <section class="card chartcard">
        ${this.renderChart()}
        <div class="controls">
          <button class="primary" @click=${() => this.playback.toggle()} aria-pressed=${this.playing}>${this.playing ? "❚❚ Pause" : "▶ Play the day"}</button>
          <label>over
            <select @change=${(e) => {
      this.duration = Number(e.target.value), this.playback.setDuration(this.duration * 1e3);
    }}>
              ${Fe.map((e) => d`<option value=${e} ?selected=${e === this.duration}>${e} s</option>`)}
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
      ${this.renderSchedule()}
      <section class="card"><h2>Options</h2>${this.renderOptionsCard()}</section>
    `;
  }
};
W.properties = {
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
  draft: { state: !0 },
  dragging: { state: !0 }
}, W.styles = Wt`
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
    .handle { cursor: grab; outline: none; }
    .handle circle:not(.hit), .handle rect { fill: var(--card-background-color); stroke: var(--primary-color); stroke-width: 3; }
    .handle .hit { fill: transparent; stroke: none; }
    .handle:hover circle:not(.hit), .handle:hover rect, .handle:focus-visible circle:not(.hit), .handle:focus-visible rect, .handle.active circle:not(.hit), .handle.active rect { fill: var(--primary-color); }
    .handle:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .handle.active { cursor: grabbing; }
    .sched { display: grid; gap: 6px; margin-bottom: 12px; }
    .schedhead, .schedrow { display: grid; grid-template-columns: minmax(110px, 1.2fr) minmax(130px, 1.4fr) minmax(90px, 1fr) minmax(120px, 1.2fr) 36px; gap: 8px; align-items: center; }
    .schedhead { font-size: 0.8em; color: var(--secondary-text-color); }
    .schedrow.active { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 6px; }
    .schedrow input, .schedrow select { width: 100%; box-sizing: border-box; }
    .schedrow label.inline { display: flex; gap: 4px; align-items: center; }
    @media (max-width: 600px) { .schedhead { display: none; } .schedrow { grid-template-columns: 1fr 1fr; } }
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
let it = W;
customElements.get("al-sim-panel") || customElements.define("al-sim-panel", it);
export {
  it as AlSimPanel
};
