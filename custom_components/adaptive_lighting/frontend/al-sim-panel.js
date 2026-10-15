/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = globalThis, J = H.ShadowRoot && (H.ShadyCSS === void 0 || H.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, K = Symbol(), Y = /* @__PURE__ */ new WeakMap();
let ut = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== K) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (J && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Y.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Y.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const bt = (r) => new ut(typeof r == "string" ? r : r + "", void 0, K), _t = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((i, s, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + r[n + 1], r[0]);
  return new ut(e, r, K);
}, wt = (r, t) => {
  if (J) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = H.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, r.appendChild(i);
  }
}, Q = J ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return bt(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: xt, defineProperty: At, getOwnPropertyDescriptor: kt, getOwnPropertyNames: Et, getOwnPropertySymbols: St, getPrototypeOf: Pt } = Object, D = globalThis, tt = D.trustedTypes, Mt = tt ? tt.emptyScript : "", Ct = D.reactiveElementPolyfillSupport, S = (r, t) => r, V = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? Mt : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch {
        e = null;
      }
  }
  return e;
} }, ft = (r, t) => !xt(r, t), et = { attribute: !0, type: String, converter: V, reflect: !1, useDefault: !1, hasChanged: ft };
Symbol.metadata ??= Symbol("metadata"), D.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let b = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = et) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && At(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: n } = kt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: s, set(o) {
      const l = s?.call(this);
      n?.call(this, o), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? et;
  }
  static _$Ei() {
    if (this.hasOwnProperty(S("elementProperties"))) return;
    const t = Pt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(S("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(S("properties"))) {
      const e = this.properties, i = [...Et(e), ...St(e)];
      for (const s of i) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, s] of e) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const s = this._$Eu(e, i);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) e.unshift(Q(s));
    } else t !== void 0 && e.push(Q(t));
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
    return wt(t, this.constructor.elementStyles), t;
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
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : V).toAttribute(e, i.type);
      this._$Em = t, n == null ? this.removeAttribute(s) : this.setAttribute(s, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const n = i.getPropertyOptions(s), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : V;
      this._$Em = s;
      const l = o.fromAttribute(e, n.type);
      this[s] = l ?? this._$Ej?.get(s) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (n = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? ft)(n, e) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: n }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [s, n] of this._$Ep) this[s] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, n] of i) {
        const { wrapped: o } = n, l = this[s];
        o !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, n, l);
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
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[S("elementProperties")] = /* @__PURE__ */ new Map(), b[S("finalized")] = /* @__PURE__ */ new Map(), Ct?.({ ReactiveElement: b }), (D.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const G = globalThis, it = (r) => r, L = G.trustedTypes, st = L ? L.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, mt = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, gt = "?" + g, Tt = `<${gt}>`, y = document, M = () => y.createComment(""), C = (r) => r === null || typeof r != "object" && typeof r != "function", X = Array.isArray, Ot = (r) => X(r) || typeof r?.[Symbol.iterator] == "function", B = `[ 	
\f\r]`, A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, rt = /-->/g, nt = />/g, $ = RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ot = /'/g, at = /"/g, $t = /^(?:script|style|textarea|title)$/i, vt = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), u = vt(1), k = vt(2), w = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), lt = /* @__PURE__ */ new WeakMap(), v = y.createTreeWalker(y, 129);
function yt(r, t) {
  if (!X(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return st !== void 0 ? st.createHTML(t) : t;
}
const Nt = (r, t) => {
  const e = r.length - 1, i = [];
  let s, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
  for (let l = 0; l < e; l++) {
    const a = r[l];
    let p, h, d = -1, f = 0;
    for (; f < a.length && (o.lastIndex = f, h = o.exec(a), h !== null); ) f = o.lastIndex, o === A ? h[1] === "!--" ? o = rt : h[1] !== void 0 ? o = nt : h[2] !== void 0 ? ($t.test(h[2]) && (s = RegExp("</" + h[2], "g")), o = $) : h[3] !== void 0 && (o = $) : o === $ ? h[0] === ">" ? (o = s ?? A, d = -1) : h[1] === void 0 ? d = -2 : (d = o.lastIndex - h[2].length, p = h[1], o = h[3] === void 0 ? $ : h[3] === '"' ? at : ot) : o === at || o === ot ? o = $ : o === rt || o === nt ? o = A : (o = $, s = void 0);
    const m = o === $ && r[l + 1].startsWith("/>") ? " " : "";
    n += o === A ? a + Tt : d >= 0 ? (i.push(p), a.slice(0, d) + mt + a.slice(d) + g + m) : a + g + (d === -2 ? l : m);
  }
  return [yt(r, n + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class T {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, a = this.parts, [p, h] = Nt(t, e);
    if (this.el = T.createElement(p, i), v.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (s = v.nextNode()) !== null && a.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const d of s.getAttributeNames()) if (d.endsWith(mt)) {
          const f = h[o++], m = s.getAttribute(d).split(g), N = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: n, name: N[2], strings: m, ctor: N[1] === "." ? Rt : N[1] === "?" ? Ht : N[1] === "@" ? Lt : z }), s.removeAttribute(d);
        } else d.startsWith(g) && (a.push({ type: 6, index: n }), s.removeAttribute(d));
        if ($t.test(s.tagName)) {
          const d = s.textContent.split(g), f = d.length - 1;
          if (f > 0) {
            s.textContent = L ? L.emptyScript : "";
            for (let m = 0; m < f; m++) s.append(d[m], M()), v.nextNode(), a.push({ type: 2, index: ++n });
            s.append(d[f], M());
          }
        }
      } else if (s.nodeType === 8) if (s.data === gt) a.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = s.data.indexOf(g, d + 1)) !== -1; ) a.push({ type: 7, index: n }), d += g.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = y.createElement("template");
    return i.innerHTML = t, i;
  }
}
function x(r, t, e = r, i) {
  if (t === w) return t;
  let s = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const n = C(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== n && (s?._$AO?.(!1), n === void 0 ? s = void 0 : (s = new n(r), s._$AT(r, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = s : e._$Cl = s), s !== void 0 && (t = x(r, s._$AS(r, t.values), s, i)), t;
}
class Ut {
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
    const { el: { content: e }, parts: i } = this._$AD, s = (t?.creationScope ?? y).importNode(e, !0);
    v.currentNode = s;
    let n = v.nextNode(), o = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let p;
        a.type === 2 ? p = new O(n, n.nextSibling, this, t) : a.type === 1 ? p = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (p = new jt(n, this, t)), this._$AV.push(p), a = i[++l];
      }
      o !== a?.index && (n = v.nextNode(), o++);
    }
    return v.currentNode = y, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class O {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    t = x(this, t, e), C(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== w && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ot(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && C(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = T.createElement(yt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const n = new Ut(s, this), o = n.u(this.options);
      n.p(e), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = lt.get(t.strings);
    return e === void 0 && lt.set(t.strings, e = new T(t)), e;
  }
  k(t) {
    X(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const n of t) s === e.length ? e.push(i = new O(this.O(M()), this.O(M()), this, this.options)) : i = e[s], i._$AI(n), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = it(t).nextSibling;
      it(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class z {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, n) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(t, e = this, i, s) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = x(this, t, e, 0), o = !C(t) || t !== this._$AH && t !== w, o && (this._$AH = t);
    else {
      const l = t;
      let a, p;
      for (t = n[0], a = 0; a < n.length - 1; a++) p = x(this, l[i + a], e, a), p === w && (p = this._$AH[a]), o ||= !C(p) || p !== this._$AH[a], p === c ? t = c : t !== c && (t += (p ?? "") + n[a + 1]), this._$AH[a] = p;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Rt extends z {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class Ht extends z {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class Lt extends z {
  constructor(t, e, i, s, n) {
    super(t, e, i, s, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = x(this, t, e, 0) ?? c) === w) return;
    const i = this._$AH, s = t === c && i !== c || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== c && (i === c || s);
    s && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class jt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    x(this, t);
  }
}
const Dt = G.litHtmlPolyfillSupport;
Dt?.(T, O), (G.litHtmlVersions ??= []).push("3.3.3");
const zt = (r, t, e) => {
  const i = e?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const n = e?.renderBefore ?? null;
    i._$litPart$ = s = new O(t.insertBefore(M(), n), n, void 0, e ?? {});
  }
  return s._$AI(r), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Z = globalThis;
class P extends b {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = zt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return w;
  }
}
P._$litElement$ = !0, P.finalized = !0, Z.litElementHydrateSupport?.({ LitElement: P });
const Bt = Z.litElementPolyfillSupport;
Bt?.({ LitElement: P });
(Z.litElementVersions ??= []).push("4.2.2");
function ht(r) {
  return r.length ? r[r.length - 1].minute : 1440;
}
function _(r, t) {
  const e = t.width - t.padLeft - t.padRight, i = Math.min(Math.max(r, 0), t.totalMinutes);
  return t.padLeft + i / t.totalMinutes * e;
}
function Ft(r, t) {
  const e = t.width - t.padLeft - t.padRight, i = (r - t.padLeft) / e;
  return Math.min(Math.max(i, 0), 1) * t.totalMinutes;
}
function q(r, t) {
  if (!r.length) return -1;
  let e = 0, i = r.length - 1;
  for (; e < i; ) {
    const s = e + i >> 1;
    r[s].minute < t ? e = s + 1 : i = s;
  }
  return e > 0 && t - r[e - 1].minute <= r[e].minute - t ? e - 1 : e;
}
function U(r) {
  return r.slice(11, 16);
}
function It(r, t) {
  const e = q(r, t);
  if (e < 0) throw new Error("no samples");
  const i = r[e], s = Date.parse(i.t) + (t - i.minute) * 6e4, n = i.t.slice(19), o = Vt(n);
  return new Date(s + o * 6e4).toISOString().slice(0, 19) + n;
}
function Vt(r) {
  const t = /^([+-])(\d{2}):(\d{2})$/.exec(r);
  return t ? (t[1] === "-" ? -1 : 1) * (parseInt(t[2], 10) * 60 + parseInt(t[3], 10)) : 0;
}
function E(r, t) {
  const e = t.height - t.padTop - t.padBottom, i = Math.min(Math.max(r, 0), 100);
  return t.padTop + (1 - i / 100) * e;
}
function qt(r, t) {
  return r.map((e, i) => `${i ? "L" : "M"}${_(e.minute, t).toFixed(1)},${E(e.brightness_pct, t).toFixed(1)}`).join("");
}
function Wt(r, t = 3) {
  if (!r.length) return [];
  const e = r[r.length - 1].minute || 1, i = [];
  for (let n = 0; n < r.length; n += t) {
    const o = r[n];
    i.push({ offset: o.minute / e, rgb: `rgb(${o.rgb_color.join(",")})` });
  }
  const s = r[r.length - 1];
  return i[i.length - 1].offset !== 1 && i.push({ offset: 1, rgb: `rgb(${s.rgb_color.join(",")})` }), i;
}
function Jt(r, t = 3) {
  const e = [];
  for (let i = 0; i <= r; i += t * 60) e.push(i);
  return e;
}
const Kt = {
  now: () => performance.now(),
  schedule: (r) => requestAnimationFrame(() => r()),
  cancel: (r) => cancelAnimationFrame(r)
};
class Gt {
  constructor(t, e, i, s = Kt) {
    this.totalMinutes = t, this.durationMs = e, this.onTick = i, this.clock = s, this.minute = 0, this.playing = !1, this.startedAt = 0, this.startMinute = 0, this.handle = null;
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
class Xt {
  constructor(t, e, i = () => Date.now(), s = setTimeout, n = clearTimeout) {
    this.intervalMs = t, this.send = e, this.now = i, this.setTimer = s, this.clearTimer = n, this.last = -1 / 0, this.pending = null, this.timer = null;
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
function ct(r, t) {
  let e = "string", i;
  if (r.selector) {
    const s = Object.keys(r.selector)[0];
    s === "select" ? (e = "select", i = r.selector.select.options) : s === "entity" ? e = "entity" : s === "color_rgb" && (e = "color_rgb");
  } else (r.type === "boolean" || r.type === "integer" || r.type === "float") && (e = r.type);
  return { name: r.name, section: t, kind: e, min: r.valueMin, max: r.valueMax, options: i, value: r.default };
}
function dt(r) {
  if (!r.data_schema) throw new Error("This profile has no editable options (YAML-configured?)");
  const t = { flowId: r.flow_id, sections: [], fields: [] };
  for (const e of r.data_schema)
    if (e.type === "expandable") {
      t.sections.push(e.name);
      for (const i of e.schema ?? []) t.fields.push(ct(i, e.name));
    } else
      t.fields.push(ct(e, null));
  return t;
}
function R(r) {
  return Object.fromEntries(r.fields.map((t) => [t.name, t.value]));
}
function Zt(r, t) {
  return JSON.stringify(r) === JSON.stringify(t);
}
function Yt(r, t) {
  const e = {};
  for (const [i, s] of Object.entries(t)) Zt(r[i], s) || (e[i] = s);
  return e;
}
function Qt(r, t) {
  const e = Object.fromEntries(r.sections.map((i) => [i, {}]));
  for (const i of r.fields) {
    const s = i.name in t ? t[i.name] : i.value;
    i.section ? e[i.section][i.name] = s : e[i.name] = s;
  }
  return e;
}
function te(r, t) {
  if (r.kind === "boolean") return [!!t, null];
  const e = String(t).trim();
  if (r.kind === "integer" || r.kind === "float") {
    if (e === "") return [null, "required"];
    const i = r.kind === "integer" ? Number(e) : parseFloat(e);
    return !Number.isFinite(i) || r.kind === "integer" && !Number.isInteger(i) ? [e, `expected ${r.kind === "integer" ? "a whole number" : "a number"}`] : r.min !== void 0 && i < r.min ? [i, `minimum ${r.min}`] : r.max !== void 0 && i > r.max ? [i, `maximum ${r.max}`] : [i, null];
  }
  if (r.kind === "select") return r.options?.includes(e) ? [e, null] : [e, "not an allowed value"];
  if (r.kind === "entity") return [e.split(",").map((i) => i.trim()).filter(Boolean), null];
  if (r.kind === "color_rgb") {
    const i = e.split(",").map((s) => Number(s.trim()));
    return i.length !== 3 || i.some((s) => !Number.isInteger(s) || s < 0 || s > 255) ? [e, "expected R,G,B (0-255)"] : [i, null];
  }
  return [e, null];
}
function F(r) {
  return r == null ? "—" : Array.isArray(r) ? r.join(", ") : String(r);
}
const I = { totalMinutes: 1440, width: 1e3, height: 300, padLeft: 44, padRight: 12, padTop: 14, padBottom: 58 }, pt = 18, ee = [15, 30, 60, 120], ie = { sunrise: "sunrise", sunset: "sunset", solar_noon: "noon", solar_midnight: "midnight" }, j = class j extends P {
  constructor() {
    super(), this.curveTimer = null, this.pointTimer = null, this.unsubPreview = null, this.loaded = !1, this.profiles = [], this.selected = "", this.form = null, this.edited = {}, this.fieldErrors = {}, this.serverErrors = {}, this.curve = null, this.date = "", this.sleep = !1, this.minute = 12 * 60, this.playing = !1, this.duration = 30, this.point = null, this.preview = "off", this.message = "", this.confirming = !1, this.busy = !1, this.playback = new Gt(1440, 3e4, (t, e) => {
      this.minute = t, this.playing = e, this.schedulePoint(e ? 120 : 0);
    }), this.previewSender = new Xt(1e3, (t) => void this.sendPreview(t));
  }
  // ------------------------------------------------------------- lifecycle
  updated(t) {
    t.has("hass") && this.hass && !this.loaded && (this.loaded = !0, this.loadProfiles());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.playback.pause(), this.stopPreview();
  }
  ws(t) {
    return this.hass.connection.sendMessagePromise(t);
  }
  // ---------------------------------------------------------------- loading
  async loadProfiles(t = !1) {
    try {
      const e = await this.ws({ type: "adaptive_lighting/sim/profiles" });
      this.profiles = e.profiles;
      const i = t && this.profiles.some((n) => n.entry_id === this.selected), s = this.profiles.find((n) => n.lights.length) ?? this.profiles[0];
      !i && s ? await this.selectProfile(s.entry_id) : i && await this.selectProfile(this.selected);
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
      return e = i.flow_id, dt(i);
    } catch (i) {
      return this.message = `Could not read options: ${i.message ?? i}`, null;
    } finally {
      e && await this.hass.callApi("DELETE", `config/config_entries/options/flow/${e}`).catch(() => {
      });
    }
  }
  get overrides() {
    return this.form ? Yt(R(this.form), this.edited) : {};
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
    const i = ht(e.samples);
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
    const t = It(this.curve.samples, this.minute), e = await this.ws({
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
    const [i, s] = te(t, e), n = { ...this.fieldErrors };
    s ? n[t.name] = s : delete n[t.name], this.fieldErrors = n, s || (this.edited = { ...this.edited, [t.name]: i }, this.scheduleCurve());
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
      const s = await this.hass.callApi("POST", "config/config_entries/options/flow", { handler: this.selected });
      e = s.flow_id;
      const n = dt(s), o = R(this.form), l = R(n), a = Object.keys(l).filter((h) => !(h in t) && JSON.stringify(l[h]) !== JSON.stringify(o[h]));
      if (a.length) {
        this.message = `This profile was changed elsewhere since you opened it (${a.join(", ")}). Reload before saving.`;
        return;
      }
      const p = await this.hass.callApi(
        "POST",
        `config/config_entries/options/flow/${e}`,
        Qt(n, { ...l, ...t })
      );
      if (p.type !== "create_entry") {
        this.message = `Home Assistant rejected the options: ${JSON.stringify(p.errors ?? p)}`;
        return;
      }
      i = !0, this.message = `Saved ${Object.keys(t).length} change(s) to ${this.profileTitle}.`, this.confirming = !1, await this.loadProfiles(!0);
    } catch (s) {
      this.message = `Save failed: ${s.message ?? s}`;
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
    const e = t.currentTarget, i = e.getBoundingClientRect(), s = (t.clientX - i.left) / i.width * I.width;
    this.playback.seek(Ft(s, { ...I, totalMinutes: this.playback.totalMinutes })), t.type === "pointerdown" && e.setPointerCapture(t.pointerId);
  }
  onChartKey(t) {
    const e = t.shiftKey ? 60 : 15;
    if (t.key === "ArrowRight") this.playback.seek(this.minute + e);
    else if (t.key === "ArrowLeft") this.playback.seek(this.minute - e);
    else if (t.key === " ") this.playback.toggle();
    else return;
    t.preventDefault();
  }
  renderChart() {
    const t = this.curve?.samples ?? [], e = { ...I, totalMinutes: ht(t) }, i = e.height - e.padBottom + 22, s = q(t, this.minute), n = s >= 0 ? t[s] : null, o = _(this.minute, e), l = Wt(t), a = Object.entries(this.curve?.sun ?? {}), p = t.length ? Date.parse(t[0].t) : 0;
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
        aria-valuetext=${n ? U(n.t) : ""}
        @pointerdown=${this.onChartPointer}
        @pointermove=${this.onChartPointer}
        @keydown=${this.onChartKey}
      >
        <defs>
          <linearGradient id="ct" x1="0" x2="1">
            ${l.map((h) => k`<stop offset=${h.offset} stop-color=${h.rgb}></stop>`)}
          </linearGradient>
        </defs>
        ${[0, 25, 50, 75, 100].map(
      (h) => k`
            <line class="grid" x1=${e.padLeft} x2=${e.width - e.padRight} y1=${E(h, e)} y2=${E(h, e)}></line>
            <text class="axis" x=${e.padLeft - 6} y=${E(h, e) + 4} text-anchor="end">${h}%</text>`
    )}
        ${Jt(e.totalMinutes).map(
      (h) => k`
            <line class="grid" x1=${_(h, e)} x2=${_(h, e)} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            <text class="axis" x=${_(h, e)} y=${e.height - e.padBottom + 14} text-anchor="middle">${t.length ? U(t[q(t, h)].t) : ""}</text>`
    )}
        ${a.map(([h, d]) => {
      const f = (Date.parse(d) - p) / 6e4;
      if (f < 0 || f > e.totalMinutes) return c;
      const m = _(f, e);
      return k`
            <line class="sun" x1=${m} x2=${m} y1=${e.padTop} y2=${e.height - e.padBottom}></line>
            <text class="sunlabel" x=${m + 3} y=${e.padTop + 10}>${ie[h] ?? h} ${U(d)}</text>`;
    })}
        <path class="line" d=${qt(t, e)}></path>
        <rect x=${e.padLeft} y=${i} width=${e.width - e.padLeft - e.padRight} height=${pt} rx="3" fill="url(#ct)"></rect>
        <text class="axis" x=${e.padLeft - 6} y=${i + 13} text-anchor="end">colour</text>
        <line class="playhead" x1=${o} x2=${o} y1=${e.padTop} y2=${i + pt}></line>
        ${n ? k`<circle class="dot" cx=${o} cy=${E(n.brightness_pct, e)} r="6"></circle>` : c}
      </svg>
    `;
  }
  // ------------------------------------------------------------- point view
  renderPoint() {
    const t = this.point;
    if (!t) return u`<p class="muted">Pick a time on the chart.</p>`;
    const e = this.profiles.find((s) => s.entry_id === this.selected), i = t.settings;
    return u`
      <div class="now">
        <span class="time">${U(t.t)}</span>
        <span>${i.brightness_pct.toFixed(0)}% brightness</span>
        <span>${i.color_temp_kelvin} K</span>
        ${this.sleep ? u`<span class="tag">sleep mode</span>` : c}
      </div>
      <div class="lights">
        ${(e?.lights ?? []).map((s) => this.renderLight(s.entity_id, s.name ?? s.entity_id, t.per_light[s.entity_id]))}
      </div>
      <p class="muted small">Swatches show colour and relative brightness; a screen can't show how bright a bulb really is.</p>
    `;
  }
  renderLight(t, e, i) {
    if (!i || i.error) return u`<div class="light"><div class="swatch none"></div><div><b>${e}</b><br /><span class="warn">${i?.error ?? "no data"}</span></div></div>`;
    const s = i.brightness !== void 0 ? Math.round(i.brightness / 255 * 100) : null, n = i.display_rgb ?? [255, 244, 229], o = s === null ? 1 : 0.15 + 0.85 * (s / 100), l = `rgb(${n.map((p) => Math.round(p * o)).join(",")})`, a = i.rgb_color ? `RGB ${i.rgb_color.join(", ")}` : i.color_temp_kelvin ? `${i.color_temp_kelvin} K` : "dimmer only";
    return u`
      <div class="light" title=${t}>
        <div class="swatch" style="background:${l}"></div>
        <div><b>${e}</b><br /><span>${s ?? "—"}% · ${a}</span></div>
      </div>
    `;
  }
  // ------------------------------------------------------------ options UI
  renderField(t) {
    const e = t.name in this.edited ? this.edited[t.name] : t.value, i = t.name in this.overrides, s = this.fieldErrors[t.name] ?? this.serverErrors[t.name], n = t.name.replaceAll("_", " ");
    let o;
    return t.kind === "boolean" ? o = u`<input type="checkbox" .checked=${!!e} @change=${(l) => this.onField(t, l.target.checked)} />` : t.kind === "select" ? o = u`<select @change=${(l) => this.onField(t, l.target.value)}>
        ${t.options?.map((l) => u`<option value=${l} ?selected=${l === e}>${l}</option>`)}
      </select>` : t.kind === "integer" || t.kind === "float" ? o = u`<input type="number" .value=${String(e ?? "")} min=${t.min ?? c} max=${t.max ?? c} step=${t.kind === "integer" ? 1 : "any"}
        @input=${(l) => this.onField(t, l.target.value)} />` : o = u`<input type="text" .value=${F(e) === "—" ? "" : Array.isArray(e) ? e.join(", ") : String(e)}
        @change=${(l) => this.onField(t, l.target.value)} />`, u`
      <label class="field ${i ? "changed" : ""} ${s ? "error" : ""}">
        <span>${n}${i ? u` <em>(edited)</em>` : c}</span>
        ${o}
        ${s ? u`<span class="warn">⚠ ${s}</span>` : c}
      </label>
    `;
  }
  renderOptionsCard() {
    if (!this.form) return u`<p class="muted">Options unavailable.</p>`;
    const t = this.form.fields.filter((n) => !n.section), e = this.overrides, i = Object.keys(e).length, s = R(this.form);
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
              ${Object.entries(e).map(([n, o]) => u`<tr><td>${n.replaceAll("_", " ")}</td><td>${F(s[n])}</td><td>→</td><td><b>${F(o)}</b></td></tr>`)}
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

      <section class="card">
        ${this.renderChart()}
        <div class="controls">
          <button class="primary" @click=${() => this.playback.toggle()} aria-pressed=${this.playing}>${this.playing ? "❚❚ Pause" : "▶ Play the day"}</button>
          <label>over
            <select @change=${(e) => {
      this.duration = Number(e.target.value), this.playback.setDuration(this.duration * 1e3);
    }}>
              ${ee.map((e) => u`<option value=${e} ?selected=${e === this.duration}>${e} s</option>`)}
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
  busy: { state: !0 }
}, j.styles = _t`
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
let W = j;
customElements.get("al-sim-panel") || customElements.define("al-sim-panel", W);
export {
  W as AlSimPanel
};
