/*! p5.keyed v1.0.0 | LGPL-2.1 | https://github.com/domizai/p5.keyed */
"use strict";
var p5keyed = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });

  // src/p5.keyed.ts
  var p5_keyed_exports = {};
  __export(p5_keyed_exports, {
    AngleLerp: () => AngleLerp,
    BooleanLerp: () => BooleanLerp,
    ColorLerp: () => ColorLerp,
    Composition: () => Composition,
    CubicBezier: () => CubicBezier,
    Curve: () => Curve,
    Easing: () => Easing,
    Effect: () => Effect,
    FloatLerp: () => FloatLerp,
    GridSnap: () => GridSnap,
    IntLerp: () => IntLerp,
    Key: () => Key,
    Keyed: () => Keyed,
    Lag: () => Lag,
    Marker: () => Marker,
    Orbit: () => Orbit,
    Path: () => Path,
    Pin: () => Pin,
    QuadraticBezier: () => QuadraticBezier,
    Quaternion: () => Quaternion,
    ShapeMorph: () => ShapeMorph,
    Spline: () => Spline,
    Spring: () => Spring,
    StepLerp: () => StepLerp,
    StopMotion: () => StopMotion,
    StringLerp: () => StringLerp,
    Ticker: () => Ticker,
    Timeline: () => Timeline,
    Tween: () => Tween,
    TweenAt: () => TweenAt,
    Unit: () => Unit,
    VectorLerp: () => VectorLerp,
    Wiggle: () => Wiggle,
    keyedAddon: () => keyedAddon,
    settings: () => settings,
    ticker: () => ticker
  });

  // src/core/ticker.ts
  var _items, _late;
  var Ticker = class {
    constructor() {
      __privateAdd(this, _items, /* @__PURE__ */ new Set());
      __privateAdd(this, _late, /* @__PURE__ */ new Set());
    }
    add(item) {
      __privateGet(this, _items).add(item);
    }
    /** Like add(), but ticked after all regular items, e.g. to write values after the timelines have advanced. */
    addLate(item) {
      __privateGet(this, _late).add(item);
    }
    remove(item) {
      __privateGet(this, _items).delete(item);
      __privateGet(this, _late).delete(item);
    }
    clear() {
      __privateGet(this, _items).clear();
      __privateGet(this, _late).clear();
    }
    /** Calls pre() on a copy, so items may add or remove themselves while ticking. */
    tick() {
      for (const item of [...__privateGet(this, _items), ...__privateGet(this, _late)]) {
        item.pre();
      }
    }
  };
  _items = new WeakMap();
  _late = new WeakMap();
  var ticker = new Ticker();

  // src/core/binder.ts
  var _bound;
  var Binder = class {
    constructor() {
      __privateAdd(this, _bound, /* @__PURE__ */ new Set());
    }
    add(keyed) {
      __privateGet(this, _bound).add(keyed);
      ticker.addLate(this);
    }
    remove(keyed) {
      __privateGet(this, _bound).delete(keyed);
    }
    clear() {
      __privateGet(this, _bound).clear();
    }
    /** Applies all bound values; copies the set so setters may bind or unbind while applying. */
    pre() {
      for (const keyed of [...__privateGet(this, _bound)]) {
        keyed.apply();
      }
    }
  };
  _bound = new WeakMap();
  var binder = new Binder();
  var describe = (target) => typeof window !== "undefined" && target === window ? "window" : target.constructor?.name ?? "the object";
  function propertySetter(target, property) {
    if (target === null || typeof target !== "object" && typeof target !== "function" || typeof property !== "string") {
      throw new TypeError("bind() needs an object and the name of its property, e.g. Keyed.bind(obj, 'x')");
    }
    let owner2 = target;
    let descriptor;
    while (owner2 && !(descriptor = Object.getOwnPropertyDescriptor(owner2, property))) {
      owner2 = Object.getPrototypeOf(owner2);
    }
    if (!descriptor) {
      const hint = typeof window !== "undefined" && target === window ? " Top-level let and const variables are not properties of window; declare it with var, or bind a setter instead." : "";
      throw new TypeError(`No property '${property}' on ${describe(target)}.${hint}`);
    }
    if (descriptor.get || descriptor.set ? !descriptor.set : !descriptor.writable) {
      throw new TypeError(`Property '${property}' of ${describe(target)} is read-only`);
    }
    return (value) => {
      target[property] = value;
    };
  }

  // src/core/env.ts
  var env = { p5: void 0, claim: void 0, sketch: void 0 };
  function p5Runtime() {
    if (!env.p5) {
      throw new Error("p5.js was not found: load p5.js before p5.keyed.js, or register keyedAddon with p5.registerAddon()");
    }
    return env.p5;
  }
  function drawTarget(g) {
    const target = g ?? env.sketch?.();
    if (!target) {
      throw new Error("no sketch to draw on: pass the p5 instance or a p5.Graphics, or call Keyed.init() in setup()");
    }
    return target;
  }

  // src/core/lerps.ts
  function toLerpFunction(lerp) {
    if (typeof lerp === "function") return lerp;
    if (lerp && typeof lerp.lerp === "function") return (a, b, d) => lerp.lerp(a, b, d);
    throw new TypeError("expected a lerp: a function (a, b, d) => value, or an object with lerp(a, b, d)");
  }
  var constrain = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  var FloatLerp = class {
    lerp(a, b, d) {
      return a + (b - a) * d;
    }
  };
  var IntLerp = class {
    /** Rounds to the nearest integer; pass round (e.g. Math.floor or Math.ceil) to convert the unrounded blend differently. */
    lerp(a, b, d, round = Math.round) {
      return round(a + (b - a) * d);
    }
  };
  var AngleLerp = class {
    lerp(a, b, t) {
      const twoPi = 2 * Math.PI;
      const diff = ((b - a) % twoPi + twoPi + Math.PI) % twoPi - Math.PI;
      return a + diff * t;
    }
  };
  var _threshold;
  var StepLerp = class {
    /** Switches exactly at the next key by default; e.g. 0.5 switches halfway between keys (easing shifts when that happens). */
    constructor(threshold = 1) {
      __privateAdd(this, _threshold);
      __privateSet(this, _threshold, threshold);
    }
    lerp(a, b, t) {
      return t >= __privateGet(this, _threshold) ? b : a;
    }
  };
  _threshold = new WeakMap();
  var BooleanLerp = class extends StepLerp {
  };
  var VectorLerp = class {
    lerp(a, b, d) {
      const { Vector } = p5Runtime();
      const x = a.x + (b.x - a.x) * d;
      const y = a.y + (b.y - a.y) * d;
      if (Math.max(a.dimensions, b.dimensions) > 2) {
        return new Vector(x, y, a.z + (b.z - a.z) * d);
      }
      return new Vector(x, y);
    }
  };
  var ColorLerp = class {
    lerp(a, b, d) {
      return a.lerp(b, constrain(d, 0, 1));
    }
  };
  var MAX_CACHED_PAIRS = 32;
  var KEEP = 0;
  var SUB = 1;
  var INS = 2;
  var DEL = 3;
  var _scripts, _StringLerp_instances, script_fn;
  var StringLerp = class {
    constructor() {
      __privateAdd(this, _StringLerp_instances);
      // Edit scripts of recent pairs; lerp is called every frame with the same keys.
      __privateAdd(this, _scripts, /* @__PURE__ */ new Map());
    }
    lerp(a, b, t) {
      const { ops, from, to, edits } = __privateMethod(this, _StringLerp_instances, script_fn).call(this, a, b);
      const applied = Math.round(constrain(t, 0, 1) * edits);
      let out = "";
      let done = 0;
      for (let i = 0; i < ops.length; i++) {
        if (ops[i] === KEEP) {
          out += from[i];
          continue;
        }
        const apply = done++ < applied;
        if (ops[i] === SUB) {
          out += apply ? to[i] : from[i];
        } else if (ops[i] === INS) {
          if (apply) out += to[i];
        } else if (!apply) {
          out += from[i];
        }
      }
      return out;
    }
  };
  _scripts = new WeakMap();
  _StringLerp_instances = new WeakSet();
  script_fn = function(a, b) {
    const id = `${a.length}:${a}${b}`;
    let script = __privateGet(this, _scripts).get(id);
    if (!script) {
      script = build(a, b);
      if (__privateGet(this, _scripts).size >= MAX_CACHED_PAIRS) {
        __privateGet(this, _scripts).delete(__privateGet(this, _scripts).keys().next().value);
      }
      __privateGet(this, _scripts).set(id, script);
    }
    return script;
  };
  function build(aText, bText) {
    const a = Array.from(aText);
    const b = Array.from(bText);
    const n = a.length;
    const m = b.length;
    const d = Array.from({ length: n + 1 }, (_, i2) => {
      const row = new Array(m + 1).fill(0);
      row[0] = i2;
      return row;
    });
    for (let j2 = 0; j2 <= m; j2++) d[0][j2] = j2;
    for (let i2 = 1; i2 <= n; i2++) {
      for (let j2 = 1; j2 <= m; j2++) {
        const cost = a[i2 - 1] === b[j2 - 1] ? 0 : 1;
        d[i2][j2] = Math.min(d[i2 - 1][j2 - 1] + cost, Math.min(d[i2 - 1][j2], d[i2][j2 - 1]) + 1);
      }
    }
    const len = n + m;
    const ops = new Uint8Array(len);
    const from = new Array(len).fill("");
    const to = new Array(len).fill("");
    let k = len;
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
      k--;
      if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
        ops[k] = a[i - 1] === b[j - 1] ? KEEP : SUB;
        from[k] = a[--i];
        to[k] = b[--j];
      } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
        ops[k] = DEL;
        from[k] = a[--i];
      } else {
        ops[k] = INS;
        to[k] = b[--j];
      }
    }
    return { ops: ops.slice(k), from: from.slice(k), to: to.slice(k), edits: d[n][m] };
  }

  // src/core/effects.ts
  function toTimeEffect(effect) {
    if (typeof effect === "function") return effect;
    if (effect && typeof effect.apply === "function") return (source, t) => effect.apply(source, t);
    throw new TypeError("expected an effect: a function (source, t) => value, or an object with apply(source, t)");
  }
  function vector(x, y, z, is3D2) {
    const { Vector } = p5Runtime();
    return is3D2 ? new Vector(x, y, z) : new Vector(x, y);
  }
  var _sizeX, _sizeY;
  var GridSnap = class {
    constructor(sizeX, sizeY = sizeX) {
      __privateAdd(this, _sizeX);
      __privateAdd(this, _sizeY);
      const single = arguments.length < 2;
      const valid = (s) => single ? s > 0 : s >= 0;
      if (!valid(sizeX) || !valid(sizeY) || !Number.isFinite(sizeX) || !Number.isFinite(sizeY)) {
        throw new RangeError(`grid sizes must be ${single ? "> 0" : ">= 0"} and finite, were ${sizeX} and ${sizeY}`);
      }
      if (sizeX === 0 && sizeY === 0) throw new RangeError("at least one size must be > 0");
      __privateSet(this, _sizeX, sizeX);
      __privateSet(this, _sizeY, sizeY);
    }
    apply(source, t) {
      const p = source(t);
      return vector(snap(p.x, __privateGet(this, _sizeX)), snap(p.y, __privateGet(this, _sizeY)), p.z, p.dimensions > 2);
    }
  };
  _sizeX = new WeakMap();
  _sizeY = new WeakMap();
  function snap(v, size) {
    return size > 0 ? Math.floor(v / size + 0.5) * size : v;
  }
  var _radius, _frequency, _u, _v;
  var Orbit = class {
    /** Orbits in the XY plane, or in the plane perpendicular to axis, turning by the right-hand rule. frequency is in cycles per second. */
    constructor(radius, frequency, axis) {
      __privateAdd(this, _radius);
      __privateAdd(this, _frequency);
      // Orthonormal basis of the orbit plane.
      __privateAdd(this, _u);
      __privateAdd(this, _v);
      __privateSet(this, _radius, radius);
      __privateSet(this, _frequency, frequency);
      const [nx, ny, nz] = normalize(axis ? [axis.x, axis.y, axis.z] : [0, 0, 1]);
      const ref = Math.abs(ny) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      __privateSet(this, _u, normalize(cross(ref, [nx, ny, nz])));
      __privateSet(this, _v, cross([nx, ny, nz], __privateGet(this, _u)));
    }
    apply(source, t) {
      const p = source(t);
      const a = t * __privateGet(this, _frequency) * 2 * Math.PI;
      const c = Math.cos(a) * __privateGet(this, _radius);
      const s = Math.sin(a) * __privateGet(this, _radius);
      const [u, v] = [__privateGet(this, _u), __privateGet(this, _v)];
      return vector(
        p.x + u[0] * c + v[0] * s,
        p.y + u[1] * c + v[1] * s,
        p.z + u[2] * c + v[2] * s,
        p.dimensions > 2 || u[2] !== 0 || v[2] !== 0
      );
    }
  };
  _radius = new WeakMap();
  _frequency = new WeakMap();
  _u = new WeakMap();
  _v = new WeakMap();
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function normalize(a) {
    const m = Math.hypot(a[0], a[1], a[2]);
    if (!(m > 0) || !Number.isFinite(m)) throw new RangeError("the axis must not be a zero vector");
    return [a[0] / m, a[1] / m, a[2] / m];
  }
  var nextSeed = 1;
  var _amplitude, _frequency2, _seed, _Wiggle_instances, noise_fn, gradient_fn;
  var Wiggle = class {
    /**
     * amplitude is a number for x and y, or a vector per axis (set z to wiggle in 3D). frequency is in wiggles per second.
     * The same seed and settings always give the same motion; without a seed, each Wiggle gets its own.
     */
    constructor(amplitude, frequency, seed = nextSeed++) {
      __privateAdd(this, _Wiggle_instances);
      __privateAdd(this, _amplitude);
      __privateAdd(this, _frequency2);
      __privateAdd(this, _seed);
      __privateSet(this, _amplitude, typeof amplitude === "number" ? [amplitude, amplitude, 0] : [amplitude.x, amplitude.y, amplitude.z]);
      __privateSet(this, _frequency2, frequency);
      __privateSet(this, _seed, seed | 0);
    }
    apply(source, t) {
      const p = source(t);
      const s = t * __privateGet(this, _frequency2);
      const a = __privateGet(this, _amplitude);
      return vector(
        p.x + __privateMethod(this, _Wiggle_instances, noise_fn).call(this, s, 0) * a[0],
        p.y + __privateMethod(this, _Wiggle_instances, noise_fn).call(this, s, 1) * a[1],
        p.z + __privateMethod(this, _Wiggle_instances, noise_fn).call(this, s, 2) * a[2],
        p.dimensions > 2 || a[2] !== 0
      );
    }
  };
  _amplitude = new WeakMap();
  _frequency2 = new WeakMap();
  _seed = new WeakMap();
  _Wiggle_instances = new WeakSet();
  // 1D gradient noise in [-1, 1].
  noise_fn = function(x, axis) {
    const i = Math.floor(x);
    const f = x - i;
    const g0 = __privateMethod(this, _Wiggle_instances, gradient_fn).call(this, i, axis) * f;
    const g1 = __privateMethod(this, _Wiggle_instances, gradient_fn).call(this, i + 1, axis) * (f - 1);
    const u = f * f * f * (f * (f * 6 - 15) + 10);
    return 2 * (g0 + u * (g1 - g0));
  };
  // Pseudo-random slope in [-1, 1) for lattice point i, hashed with a 32-bit integer mixer.
  gradient_fn = function(i, axis) {
    let h = Math.imul(i | 0, 2654435769) + Math.imul(__privateGet(this, _seed), 2146121005) + Math.imul(axis + 1, 2221713035) | 0;
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    h ^= h >>> 16;
    return (h >>> 8) / (1 << 23) - 1;
  };
  var _step;
  var StopMotion = class {
    constructor(step) {
      __privateAdd(this, _step);
      if (!(step > 0)) throw new RangeError(`step must be > 0, was ${step}`);
      __privateSet(this, _step, step);
    }
    apply(source, t) {
      return source(Math.floor(t / __privateGet(this, _step)) * __privateGet(this, _step));
    }
  };
  _step = new WeakMap();
  var _lerp, _duration, _samples, _Lag_instances, average_fn;
  var Lag = class {
    /** duration is in seconds; more samples is smoother but costs one source evaluation each. */
    constructor(lerp, duration, samples) {
      __privateAdd(this, _Lag_instances);
      __privateAdd(this, _lerp);
      __privateAdd(this, _duration);
      __privateAdd(this, _samples);
      if (!(duration > 0) || !Number.isFinite(duration)) throw new RangeError(`duration must be > 0, was ${duration}`);
      if (!Number.isInteger(samples) || samples < 1) throw new RangeError(`samples must be a whole number >= 1, was ${samples}`);
      __privateSet(this, _lerp, toLerpFunction(lerp));
      __privateSet(this, _duration, duration);
      __privateSet(this, _samples, samples);
    }
    // Samples sit on a fixed grid of times and the output blends the averages at the grid points
    // before and after t, so it moves smoothly even when the source jumps (e.g. hold keys).
    apply(source, t) {
      const n = __privateGet(this, _samples);
      const step = __privateGet(this, _duration) / n;
      const g = Math.floor(t / step);
      const f = t / step - g;
      const values = [];
      for (let k = 0; k <= n; k++) values.push(source((g - k) * step));
      return __privateGet(this, _lerp).call(this, __privateMethod(this, _Lag_instances, average_fn).call(this, values, 1), __privateMethod(this, _Lag_instances, average_fn).call(this, values, 0), f);
    }
  };
  _lerp = new WeakMap();
  _duration = new WeakMap();
  _samples = new WeakMap();
  _Lag_instances = new WeakSet();
  // Average of samples values, starting offset grid steps back.
  average_fn = function(values, offset) {
    let r = values[offset];
    for (let i = 1; i < __privateGet(this, _samples); i++) {
      r = __privateGet(this, _lerp).call(this, r, values[i + offset], 1 / (i + 1));
    }
    return r;
  };
  var SAMPLES_PER_PERIOD = 16;
  var CUTOFF = 1e-3;
  var _lerp2, _dt, _weights, _Spring_instances, respond_fn;
  var Spring = class {
    /**
     * frequency: oscillations per second; keep it below half the frame rate or the wobble can't be seen.
     * damping: ratio in (0, 1); lower wobbles longer and costs more samples.
     */
    constructor(lerp, frequency, damping) {
      __privateAdd(this, _Spring_instances);
      __privateAdd(this, _lerp2);
      __privateAdd(this, _dt);
      __privateAdd(this, _weights);
      if (!(frequency > 0) || !Number.isFinite(frequency)) throw new RangeError(`frequency must be > 0, was ${frequency}`);
      if (!(damping > 0 && damping < 1)) throw new RangeError(`damping must be in (0, 1), was ${damping}`);
      __privateSet(this, _lerp2, toLerpFunction(lerp));
      const w = 2 * Math.PI * frequency;
      const wd = w * Math.sqrt(1 - damping * damping);
      const dt = 2 * Math.PI / wd / SAMPLES_PER_PERIOD;
      const n = Math.ceil(Math.log(1 / CUTOFF) / (damping * w) / dt);
      const h = [];
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const tau = (i + 0.5) * dt;
        const v = Math.exp(-damping * w * tau) * Math.sin(wd * tau);
        h.push(v);
        sum += v;
      }
      __privateSet(this, _dt, dt);
      __privateSet(this, _weights, h.map((v) => v / sum));
    }
    // Sampling at fixed delays from t would make the output jump whenever a sample crosses a jump in
    // the source (e.g. hold keys), visibly stepping for slow springs. Instead the samples sit on a
    // fixed grid of times, and the output blends the responses at the grid points before and after t.
    // The newest sample is at or before t, so the spring never reacts before the source moves.
    apply(source, t) {
      const n = __privateGet(this, _weights).length;
      const g = Math.floor(t / __privateGet(this, _dt));
      const f = t / __privateGet(this, _dt) - g;
      const samples = [];
      for (let k = 0; k <= n; k++) samples.push(source((g - k) * __privateGet(this, _dt)));
      return __privateGet(this, _lerp2).call(this, __privateMethod(this, _Spring_instances, respond_fn).call(this, samples, 1), __privateMethod(this, _Spring_instances, respond_fn).call(this, samples, 0), f);
    }
  };
  _lerp2 = new WeakMap();
  _dt = new WeakMap();
  _weights = new WeakMap();
  _Spring_instances = new WeakSet();
  // Weighted blend of the samples, starting offset grid steps back.
  respond_fn = function(samples, offset) {
    const weights = __privateGet(this, _weights);
    let r = samples[offset];
    let total = weights[0];
    for (let i = 1; i < weights.length; i++) {
      total += weights[i];
      r = __privateGet(this, _lerp2).call(this, r, samples[i + offset], weights[i] / total);
    }
    return r;
  };
  var Effect = {
    /** Smooth random offset in x and y within ±amplitude; frequency in wiggles per second. */
    wiggle(amplitude, frequency, seed) {
      return new Wiggle(amplitude, frequency, seed);
    },
    /** Circles in the XY plane, or around axis; frequency in cycles per second. */
    orbit(radius, frequency, axis) {
      return new Orbit(radius, frequency, axis);
    },
    /** Snaps x and y to multiples of sizeX and sizeY (size alone: both); 0 leaves that axis untouched. */
    gridSnap(sizeX, sizeY) {
      return sizeY === void 0 ? new GridSnap(sizeX) : new GridSnap(sizeX, sizeY);
    },
    /** Damped spring; frequency in oscillations per second, damping in (0, 1). */
    spring(frequency, damping) {
      return new Spring(new VectorLerp(), frequency, damping);
    },
    /** Averages over the last duration seconds from samples evaluations. */
    lag(duration, samples) {
      return new Lag(new VectorLerp(), duration, samples);
    }
  };

  // src/core/easing.ts
  var constrain2 = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  function powerIn(p) {
    return (d) => Math.pow(d, p);
  }
  function powerOut(p) {
    return (d) => 1 - Math.pow(1 - d, p);
  }
  function powerInOut(p) {
    return (d) => d < 0.5 ? 0.5 * Math.pow(2 * d, p) : 1 - 0.5 * Math.pow(2 - 2 * d, p);
  }
  function smoothstep(edge0, edge1) {
    return (d) => {
      const x = constrain2((d - edge0) / (edge1 - edge0), 0, 1);
      return x * x * x * (x * (6 * x - 15) + 10);
    };
  }
  function steps(n) {
    if (!(n >= 1)) {
      throw new RangeError(`steps must be >= 1, was ${n}`);
    }
    return (d) => Math.floor(d * n) / n;
  }
  function cubicBezier(x1, y1, x2, y2) {
    if (!(x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1)) {
      throw new RangeError(`x1 and x2 must be in [0, 1], were ${x1}, ${x2}`);
    }
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    return (d) => {
      const s = solveBezierX(d, ax, bx, cx);
      return ((ay * s + by) * s + cy) * s;
    };
  }
  function solveBezierX(x, ax, bx, cx) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) {
      const err = ((ax * s + bx) * s + cx) * s - x;
      if (Math.abs(err) < 1e-6) return s;
      const slope = (3 * ax * s + 2 * bx) * s + cx;
      if (Math.abs(slope) < 1e-6) break;
      s -= err / slope;
      if (s < 0 || s > 1) break;
    }
    let lo = 0;
    let hi = 1;
    s = x;
    for (let i = 0; i < 40; i++) {
      const xs = ((ax * s + bx) * s + cx) * s;
      if (Math.abs(xs - x) < 1e-6) break;
      if (xs < x) {
        lo = s;
      } else {
        hi = s;
      }
      s = (lo + hi) / 2;
    }
    return s;
  }
  function quadraticBezier(p0, p1, p2) {
    return (d) => {
      const a = 1 - d;
      return a * a * p0 + 2 * a * d * p1 + d * d * p2;
    };
  }
  var QUAD_IN = powerIn(2);
  var QUAD_OUT = powerOut(2);
  var QUAD_IN_OUT = powerInOut(2);
  var Easing = {
    QUADRATIC_BEZIER: quadraticBezier(0, 0, 1),
    CUBIC_BEZIER: cubicBezier(0, 0, 1, 1),
    SMOOTHSTEP: smoothstep(0, 1),
    /** Stays at the start value until the next key, then jumps. */
    HOLD: ((d) => d < 1 ? 0 : 1),
    QUAD_IN,
    QUAD_OUT,
    QUAD_IN_OUT,
    CUBIC_IN: powerIn(3),
    CUBIC_OUT: powerOut(3),
    CUBIC_IN_OUT: powerInOut(3),
    QUART_IN: powerIn(4),
    QUART_OUT: powerOut(4),
    QUART_IN_OUT: powerInOut(4),
    QUINT_IN: powerIn(5),
    QUINT_OUT: powerOut(5),
    QUINT_IN_OUT: powerInOut(5),
    powerIn,
    powerOut,
    powerInOut,
    smoothstep,
    steps,
    cubicBezier,
    quadraticBezier,
    /** Applies QUAD_IN to a plain number, e.g. alpha = Easing.quadIn(t); for other powers use powerIn(p)(d). */
    quadIn: (d) => QUAD_IN(d),
    /** Applies QUAD_OUT to a plain number. */
    quadOut: (d) => QUAD_OUT(d),
    /** Applies QUAD_IN_OUT to a plain number. */
    quadInOut: (d) => QUAD_IN_OUT(d)
  };

  // src/core/pin.ts
  var checkTime = (t) => {
    if (typeof t !== "number" || Number.isNaN(t)) {
      throw new TypeError(`time must be a number, was ${String(t)}`);
    }
    return t;
  };
  var _t, _listeners;
  var _Pin = class _Pin {
    /** Pin at time t, 0 by default. */
    constructor(t = 0) {
      __privateAdd(this, _t);
      __privateAdd(this, _listeners, null);
      __privateSet(this, _t, checkTime(t));
    }
    /** Pin at time t. */
    static at(t) {
      return new _Pin(t);
    }
    /** Current time. */
    t() {
      return __privateGet(this, _t);
    }
    /** Moves to time t and notifies listeners. */
    to(t) {
      __privateSet(this, _t, checkTime(t));
      if (__privateGet(this, _listeners)) {
        for (const listener of [...__privateGet(this, _listeners)]) {
          listener(this);
        }
      }
      return this;
    }
    /** Adds a listener called after every to(), including moves made through a Key. */
    addListener(listener) {
      (__privateGet(this, _listeners) ?? __privateSet(this, _listeners, [])).push(listener);
      return this;
    }
    /** Removes a listener added with addListener(). */
    removeListener(listener) {
      const i = __privateGet(this, _listeners)?.indexOf(listener) ?? -1;
      if (i >= 0) __privateGet(this, _listeners).splice(i, 1);
      return this;
    }
    compareTo(o) {
      return __privateGet(this, _t) < __privateGet(o, _t) ? -1 : __privateGet(this, _t) > __privateGet(o, _t) ? 1 : 0;
    }
  };
  _t = new WeakMap();
  _listeners = new WeakMap();
  var Pin = _Pin;

  // src/core/key.ts
  var checkInfluence = (influence) => {
    if (!(influence >= 0 && influence <= 1)) {
      throw new RangeError(`easing must be in [0, 1], was ${influence}`);
    }
    return influence;
  };
  var _pin, _easingIn, _easingOut, _easing;
  var _Key = class _Key {
    /** Key on a shared pin, or at time t with its own pin. */
    constructor(at) {
      __privateAdd(this, _pin);
      // Handle influence in [0, 1] as a fraction of the segment, with zero speed at the key; 0 is linear, 1/3 is AE's Easy Ease.
      __privateAdd(this, _easingIn, 0);
      __privateAdd(this, _easingOut, 0);
      // Replaces the influence curve on the segment leaving this key when set.
      __privateAdd(this, _easing, null);
      __privateSet(this, _pin, at instanceof Pin ? at : new Pin(at));
    }
    /** Key on a shared pin, or at time t with its own pin. */
    static at(at) {
      return new _Key(at);
    }
    /** Moves the pin, so every key sharing it moves too. */
    to(t) {
      __privateGet(this, _pin).to(t);
      return this;
    }
    /** Pin holding this key's time. */
    pin() {
      return __privateGet(this, _pin);
    }
    /** Time of this key's pin. */
    t() {
      return __privateGet(this, _pin).t();
    }
    /**
     * Number: sets both easingIn and easingOut influence, in [0, 1]; 1 / 3 is After Effects' Easy Ease.
     * Easing: curve for the whole segment from this key to the next, e.g. Easing.QUAD_OUT; ignores the next key's easingIn.
     */
    setEasing(easing) {
      if (typeof easing === "function") {
        __privateSet(this, _easing, easing);
        return this;
      }
      if (typeof easing !== "number") {
        throw new TypeError("setEasing() needs an influence in [0, 1] or an Easing function");
      }
      return this.setEasingIn(easing).setEasingOut(easing);
    }
    /** Keeps this key's value until the next key, for stepped or stop-motion animation. */
    hold() {
      return this.setEasing(Easing.HOLD);
    }
    /** Shapes the segment arriving at this key; influence in [0, 1]. */
    setEasingIn(influence) {
      __privateSet(this, _easingIn, checkInfluence(influence));
      return this;
    }
    /** Shapes the segment leaving this key; clears an Easing set with setEasing(Easing). */
    setEasingOut(influence) {
      __privateSet(this, _easingOut, checkInfluence(influence));
      __privateSet(this, _easing, null);
      return this;
    }
    /** Influence of the arriving segment, in [0, 1]. */
    easingIn() {
      return __privateGet(this, _easingIn);
    }
    /** Influence of the leaving segment, in [0, 1]. */
    easingOut() {
      return __privateGet(this, _easingOut);
    }
    /** Curve of the leaving segment; null when it uses the easingOut/easingIn influence curve. */
    easing() {
      return __privateGet(this, _easing);
    }
    compareTo(o) {
      return __privateGet(this, _pin).compareTo(__privateGet(o, _pin));
    }
  };
  _pin = new WeakMap();
  _easingIn = new WeakMap();
  _easingOut = new WeakMap();
  _easing = new WeakMap();
  var Key = _Key;
  var LINEAR = (d) => d;
  function segmentEasing(from, to) {
    const easing = from.easing();
    if (easing) return easing;
    if (from.easingOut() === 0 && to.easingIn() === 0) return LINEAR;
    return Easing.cubicBezier(from.easingOut(), 0, 1 - to.easingIn(), 1);
  }

  // src/core/tween.ts
  var _tween, _position;
  var TweenAt = class {
    /** Without a position the key samples the tween at 0 leaving it and at 1 arriving at it. */
    constructor(tween, position) {
      __privateAdd(this, _tween);
      __privateAdd(this, _position);
      __privateSet(this, _tween, tween);
      __privateSet(this, _position, position ?? null);
    }
    /** The wrapped tween. */
    tween() {
      return __privateGet(this, _tween);
    }
    /** The fixed position, or fallback if none. */
    positionOr(fallback) {
      return __privateGet(this, _position) ?? fallback;
    }
  };
  _tween = new WeakMap();
  _position = new WeakMap();
  var Tween = {
    /** Wraps tween so a key samples it at a fixed position. */
    at(tween, position) {
      return new TweenAt(tween, position);
    },
    /** Applies f to each value. */
    map(tween, f) {
      return (d) => f(tween(d));
    }
  };

  // src/core/paths.ts
  var LUT_STEPS = 50;
  var constrain3 = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  var checkPoint = (p, name) => {
    if (!p || typeof p.x !== "number" || typeof p.y !== "number") {
      throw new TypeError(`${name} must be a point with x and y, e.g. createVector(10, 20), was ${String(p)}`);
    }
    return p;
  };
  var is3D = (p) => (p.dimensions ?? (p.z === void 0 ? 2 : 3)) > 2;
  var _tween2;
  var Path = class {
    constructor() {
      __privateAdd(this, _tween2);
    }
    /** Curve playing this path, then next. */
    add(next) {
      return new Curve(this, next);
    }
    /** Wraps this path so a key samples it at a fixed position: 0 is the start, 1 the end. */
    at(position) {
      return new TweenAt(this.tween(), position);
    }
    /** Applies f to each point. */
    map(f) {
      return Tween.map(this.tween(), f);
    }
    /** The x coordinate as a tween. */
    x() {
      return this.map((p) => p.x);
    }
    /** The y coordinate as a tween. */
    y() {
      return this.map((p) => p.y);
    }
    /** The z coordinate as a tween. */
    z() {
      return this.map((p) => p.z);
    }
    /** This path as a function of d. The same function every time, so keys sharing a path are recognized as one. */
    tween() {
      return __privateGet(this, _tween2) ?? __privateSet(this, _tween2, (d) => this.value(d));
    }
  };
  _tween2 = new WeakMap();
  var _t0, _t1, _lut, _SampledPath_instances, table_fn, distToU_fn;
  var SampledPath = class extends Path {
    constructor() {
      super(...arguments);
      __privateAdd(this, _SampledPath_instances);
      __privateAdd(this, _t0, 0);
      __privateAdd(this, _t1, 1);
      // Rebuilt lazily after setters; mutating the points directly won't invalidate it.
      __privateAdd(this, _lut, null);
    }
    invalidate() {
      __privateSet(this, _lut, null);
    }
    // Makes this the part of source between t0 and t1.
    windowOf(source, t0, t1) {
      __privateSet(this, _t0, constrain3(t0, 0, 1));
      __privateSet(this, _t1, constrain3(t1, 0, 1));
      __privateSet(this, _lut, __privateGet(source, _lut));
      return this;
    }
    length() {
      const l = __privateMethod(this, _SampledPath_instances, table_fn).call(this);
      return l[l.length - 1] * Math.abs(__privateGet(this, _t1) - __privateGet(this, _t0));
    }
    value(d) {
      const [x, y, z] = this.coords(__privateMethod(this, _SampledPath_instances, distToU_fn).call(this, __privateGet(this, _t0) + d * (__privateGet(this, _t1) - __privateGet(this, _t0))));
      const { Vector } = p5Runtime();
      return this.is3D() ? new Vector(x, y, z) : new Vector(x, y);
    }
  };
  _t0 = new WeakMap();
  _t1 = new WeakMap();
  _lut = new WeakMap();
  _SampledPath_instances = new WeakSet();
  // Cumulative distances between samples of u, LUT_STEPS per unit.
  table_fn = function() {
    if (!__privateGet(this, _lut)) {
      const n = this.units() * LUT_STEPS;
      const l = new Array(n + 1).fill(0);
      let [px, py, pz] = this.coords(0);
      for (let i = 1; i <= n; i++) {
        const [x, y, z] = this.coords(i / LUT_STEPS);
        l[i] = l[i - 1] + Math.sqrt((x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2);
        [px, py, pz] = [x, y, z];
      }
      __privateSet(this, _lut, l);
    }
    return __privateGet(this, _lut);
  };
  // Curve parameter u for a normalized distance (0..1) along the path.
  distToU_fn = function(distance) {
    const l = __privateMethod(this, _SampledPath_instances, table_fn).call(this);
    const n = l.length - 1;
    const total = l[n];
    if (total === 0) {
      return distance * this.units();
    }
    const dist = constrain3(distance * total, 0, total);
    let lo = 1;
    let hi = n;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (l[mid] < dist) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    const d0 = l[lo - 1];
    const d1 = l[lo];
    const ua = (lo - 1) / LUT_STEPS;
    const ub = lo / LUT_STEPS;
    return d1 > d0 ? ua + (dist - d0) * (ub - ua) / (d1 - d0) : ua;
  };
  var _p0, _p1, _p2;
  var _QuadraticBezier = class _QuadraticBezier extends SampledPath {
    /** From p0 to p2 with control point p1. */
    constructor(p0, p1, p2) {
      super();
      __privateAdd(this, _p0);
      __privateAdd(this, _p1);
      __privateAdd(this, _p2);
      __privateSet(this, _p0, checkPoint(p0, "p0"));
      __privateSet(this, _p1, checkPoint(p1, "p1"));
      __privateSet(this, _p2, checkPoint(p2, "p2"));
    }
    /** Sets the start point. */
    setP0(p0) {
      __privateSet(this, _p0, checkPoint(p0, "p0"));
      this.invalidate();
      return this;
    }
    /** Sets the control point. */
    setP1(p1) {
      __privateSet(this, _p1, checkPoint(p1, "p1"));
      this.invalidate();
      return this;
    }
    /** Sets the end point. */
    setP2(p2) {
      __privateSet(this, _p2, checkPoint(p2, "p2"));
      this.invalidate();
      return this;
    }
    /** Sets all three points. */
    setCurve(p0, p1, p2) {
      __privateSet(this, _p0, checkPoint(p0, "p0"));
      __privateSet(this, _p1, checkPoint(p1, "p1"));
      __privateSet(this, _p2, checkPoint(p2, "p2"));
      this.invalidate();
      return this;
    }
    slice(t0, t1) {
      return new _QuadraticBezier(__privateGet(this, _p0), __privateGet(this, _p1), __privateGet(this, _p2)).windowOf(this, t0, t1);
    }
    units() {
      return 1;
    }
    is3D() {
      return is3D(__privateGet(this, _p0)) || is3D(__privateGet(this, _p1)) || is3D(__privateGet(this, _p2));
    }
    coords(t) {
      const u = 1 - t;
      const b0 = u * u;
      const b1 = 2 * u * t;
      const b2 = t * t;
      const [a, b, c] = [__privateGet(this, _p0), __privateGet(this, _p1), __privateGet(this, _p2)];
      return [
        b0 * a.x + b1 * b.x + b2 * c.x,
        b0 * a.y + b1 * b.y + b2 * c.y,
        b0 * (a.z ?? 0) + b1 * (b.z ?? 0) + b2 * (c.z ?? 0)
      ];
    }
  };
  _p0 = new WeakMap();
  _p1 = new WeakMap();
  _p2 = new WeakMap();
  var QuadraticBezier = _QuadraticBezier;
  var _p02, _p12, _p22, _p3;
  var _CubicBezier = class _CubicBezier extends SampledPath {
    /** From p0 to p3 with control points p1 and p2, like p5's bezier(). */
    constructor(p0, p1, p2, p3) {
      super();
      __privateAdd(this, _p02);
      __privateAdd(this, _p12);
      __privateAdd(this, _p22);
      __privateAdd(this, _p3);
      __privateSet(this, _p02, checkPoint(p0, "p0"));
      __privateSet(this, _p12, checkPoint(p1, "p1"));
      __privateSet(this, _p22, checkPoint(p2, "p2"));
      __privateSet(this, _p3, checkPoint(p3, "p3"));
    }
    /** Sets the start point. */
    setP0(p0) {
      __privateSet(this, _p02, checkPoint(p0, "p0"));
      this.invalidate();
      return this;
    }
    /** Sets the first control point. */
    setP1(p1) {
      __privateSet(this, _p12, checkPoint(p1, "p1"));
      this.invalidate();
      return this;
    }
    /** Sets the second control point. */
    setP2(p2) {
      __privateSet(this, _p22, checkPoint(p2, "p2"));
      this.invalidate();
      return this;
    }
    /** Sets the end point. */
    setP3(p3) {
      __privateSet(this, _p3, checkPoint(p3, "p3"));
      this.invalidate();
      return this;
    }
    /** Sets all four points. */
    setCurve(p0, p1, p2, p3) {
      __privateSet(this, _p02, checkPoint(p0, "p0"));
      __privateSet(this, _p12, checkPoint(p1, "p1"));
      __privateSet(this, _p22, checkPoint(p2, "p2"));
      __privateSet(this, _p3, checkPoint(p3, "p3"));
      this.invalidate();
      return this;
    }
    slice(t0, t1) {
      return new _CubicBezier(__privateGet(this, _p02), __privateGet(this, _p12), __privateGet(this, _p22), __privateGet(this, _p3)).windowOf(this, t0, t1);
    }
    units() {
      return 1;
    }
    is3D() {
      return is3D(__privateGet(this, _p02)) || is3D(__privateGet(this, _p12)) || is3D(__privateGet(this, _p22)) || is3D(__privateGet(this, _p3));
    }
    coords(t) {
      const u = 1 - t;
      const b0 = u * u * u;
      const b1 = 3 * u * u * t;
      const b2 = 3 * u * t * t;
      const b3 = t * t * t;
      const [a, b, c, d] = [__privateGet(this, _p02), __privateGet(this, _p12), __privateGet(this, _p22), __privateGet(this, _p3)];
      return [
        b0 * a.x + b1 * b.x + b2 * c.x + b3 * d.x,
        b0 * a.y + b1 * b.y + b2 * c.y + b3 * d.y,
        b0 * (a.z ?? 0) + b1 * (b.z ?? 0) + b2 * (c.z ?? 0) + b3 * (d.z ?? 0)
      ];
    }
  };
  _p02 = new WeakMap();
  _p12 = new WeakMap();
  _p22 = new WeakMap();
  _p3 = new WeakMap();
  var CubicBezier = _CubicBezier;
  var _points, _tightness;
  var _Spline = class _Spline extends SampledPath {
    /** Needs at least 4 points, as arguments or as an array. */
    constructor(...points) {
      super();
      __privateAdd(this, _points, []);
      __privateAdd(this, _tightness, 0);
      this.setPoints(...points);
    }
    /** Replaces the points; needs at least 4, as arguments or as an array. */
    setPoints(...points) {
      const list = Array.isArray(points[0]) ? points[0] : points;
      if (list.length < 4) {
        throw new RangeError(`a spline needs at least 4 points, got ${list.length}`);
      }
      list.forEach((p, i) => checkPoint(p, `point ${i}`));
      __privateSet(this, _points, [...list]);
      this.invalidate();
      return this;
    }
    /** Same as p5's curveTightness(): 0 is Catmull-Rom, 1 gives straight lines. */
    setTightness(tightness) {
      __privateSet(this, _tightness, tightness);
      this.invalidate();
      return this;
    }
    slice(t0, t1) {
      return new _Spline(__privateGet(this, _points)).setTightness(__privateGet(this, _tightness)).windowOf(this, t0, t1);
    }
    units() {
      return __privateGet(this, _points).length - 3;
    }
    is3D() {
      return __privateGet(this, _points).some(is3D);
    }
    // u in [0, units()]; the integer part picks the segment.
    coords(u) {
      const i = Math.max(0, Math.min(Math.trunc(u) || 0, this.units() - 1));
      const t = u - i;
      const [p0, p1, p2, p3] = [__privateGet(this, _points)[i], __privateGet(this, _points)[i + 1], __privateGet(this, _points)[i + 2], __privateGet(this, _points)[i + 3]];
      const k = (1 - __privateGet(this, _tightness)) / 2;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      const axis = (a, b, c, d) => h00 * b + h10 * k * (c - a) + h01 * c + h11 * k * (d - b);
      return [
        axis(p0.x, p1.x, p2.x, p3.x),
        axis(p0.y, p1.y, p2.y, p3.y),
        axis(p0.z ?? 0, p1.z ?? 0, p2.z ?? 0, p3.z ?? 0)
      ];
    }
  };
  _points = new WeakMap();
  _tightness = new WeakMap();
  var Spline = _Spline;
  var _paths, _t02, _t12, _Curve_instances, fullLength_fn;
  var _Curve = class _Curve extends Path {
    /** Plays paths in order; needs at least one. */
    constructor(...paths) {
      super();
      __privateAdd(this, _Curve_instances);
      __privateAdd(this, _paths);
      __privateAdd(this, _t02, 0);
      __privateAdd(this, _t12, 1);
      if (paths.length === 0) {
        throw new RangeError("a curve needs at least one path");
      }
      paths.forEach((p, i) => {
        if (!(p instanceof Path)) throw new TypeError(`path ${i} is not a Path, was ${String(p)}`);
      });
      __privateSet(this, _paths, [...paths]);
    }
    /** Returns a new curve; this one is unchanged. */
    add(next) {
      if (__privateGet(this, _t02) !== 0 || __privateGet(this, _t12) !== 1) {
        return new _Curve(this, next);
      }
      return new _Curve(...__privateGet(this, _paths), next);
    }
    slice(t0, t1) {
      const c = new _Curve(...__privateGet(this, _paths));
      __privateSet(c, _t02, constrain3(t0, 0, 1));
      __privateSet(c, _t12, constrain3(t1, 0, 1));
      return c;
    }
    length() {
      return __privateMethod(this, _Curve_instances, fullLength_fn).call(this) * Math.abs(__privateGet(this, _t12) - __privateGet(this, _t02));
    }
    value(d) {
      let dist = constrain3(__privateGet(this, _t02) + d * (__privateGet(this, _t12) - __privateGet(this, _t02)), 0, 1) * __privateMethod(this, _Curve_instances, fullLength_fn).call(this);
      const last = __privateGet(this, _paths).length - 1;
      for (let i = 0; i < last; i++) {
        const path2 = __privateGet(this, _paths)[i];
        const len2 = path2.length();
        if (dist <= len2) {
          return path2.value(len2 > 0 ? dist / len2 : 0);
        }
        dist -= len2;
      }
      const path = __privateGet(this, _paths)[last];
      const len = path.length();
      return path.value(len > 0 ? constrain3(dist / len, 0, 1) : 0);
    }
  };
  _paths = new WeakMap();
  _t02 = new WeakMap();
  _t12 = new WeakMap();
  _Curve_instances = new WeakSet();
  fullLength_fn = function() {
    return __privateGet(this, _paths).reduce((total, p) => total + p.length(), 0);
  };
  var Curve = _Curve;

  // src/core/unit.ts
  var Unit = {
    /** Real time, or the fixed step if set. */
    SECOND: "second",
    /** Advances 1 per draw(), independent of real time. */
    FRAME: "frame"
  };

  // src/core/settings.ts
  var settings = {
    unit: Unit.SECOND,
    synced: true,
    autoplay: true,
    /** Converts between frames and seconds. */
    frameRate: 60,
    /** Real time in milliseconds; replaced in tests. */
    now: () => performance.now()
  };

  // src/core/marker.ts
  var _timeline, _name, _pin2, _callback;
  var Marker = class {
    constructor(timeline, name, pin, callback) {
      __privateAdd(this, _timeline);
      __privateAdd(this, _name);
      __privateAdd(this, _pin2);
      __privateAdd(this, _callback);
      __privateSet(this, _timeline, timeline);
      __privateSet(this, _name, name);
      __privateSet(this, _pin2, pin);
      __privateSet(this, _callback, callback);
    }
    /** Marker name; null if unnamed. */
    name() {
      return __privateGet(this, _name);
    }
    /** Marker time; follows the pin, so moving the pin moves the marker. */
    t() {
      return __privateGet(this, _pin2).t();
    }
    /** Pin holding this marker's time. */
    pin() {
      return __privateGet(this, _pin2);
    }
    /** Timeline this marker belongs to. */
    timeline() {
      return __privateGet(this, _timeline);
    }
    /** @internal Called by the timeline when playback crosses this marker. */
    fire() {
      __privateGet(this, _callback).call(this, this);
    }
  };
  _timeline = new WeakMap();
  _name = new WeakMap();
  _pin2 = new WeakMap();
  _callback = new WeakMap();

  // src/core/timeline.ts
  var MAX_WRAPS = 100;
  var BY_TIME = (a, b) => a.t() - b.t();
  var constrain4 = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  var remEuclid = (a, b) => (a % b + b) % b;
  var _unit, _synced, _autoplay, _loop, _duration2, _t2, _speed, _fixedStep, _playing, _lastMs, _started, _ticker, _markers, _loopListeners, _finishListeners, _arrivedSilently, _moveId, _Timeline_instances, stepExact_fn, fit_fn, move_fn, crossMarkers_fn, fireMarkers_fn, callListeners_fn;
  var Timeline = class {
    /** Advances before every draw(); null only moves via step() or to(). */
    constructor(driver = ticker) {
      __privateAdd(this, _Timeline_instances);
      __privateAdd(this, _unit, settings.unit);
      __privateAdd(this, _synced, settings.synced);
      __privateAdd(this, _autoplay, settings.autoplay);
      __privateAdd(this, _loop, true);
      __privateAdd(this, _duration2, 0);
      __privateAdd(this, _t2, 0);
      __privateAdd(this, _speed, 1);
      __privateAdd(this, _fixedStep, 0);
      __privateAdd(this, _playing, true);
      __privateAdd(this, _lastMs, -1);
      __privateAdd(this, _started, false);
      __privateAdd(this, _ticker);
      __privateAdd(this, _markers, []);
      __privateAdd(this, _loopListeners, []);
      __privateAdd(this, _finishListeners, []);
      // Set by moves that fire nothing, so a marker exactly at the new t still fires on the next step.
      __privateAdd(this, _arrivedSilently, true);
      // Bumped on every move; a change during a callback means it moved the timeline, so the rest is skipped.
      __privateAdd(this, _moveId, 0);
      __privateSet(this, _ticker, driver);
      driver?.add(this);
    }
    /** Called by the ticker before each draw(). The first frame shows t = 0. */
    pre() {
      if (!__privateGet(this, _autoplay)) {
        __privateSet(this, _started, false);
        return;
      }
      if (__privateGet(this, _started)) {
        this.step();
      } else {
        __privateSet(this, _started, true);
        __privateSet(this, _lastMs, settings.now());
      }
    }
    /**
     * Without amount: advances by the fixed step if set; otherwise by real time when synced, or by one frame when not; times speed.
     * With amount: advances by it while playing, firing markers, onLoop and onFinish callbacks passed on the way.
     */
    step(amount) {
      if (amount !== void 0) {
        if (__privateGet(this, _playing)) __privateMethod(this, _Timeline_instances, move_fn).call(this, __privateGet(this, _t2) + amount, true);
        return this;
      }
      const now = settings.now();
      const fps = settings.frameRate;
      const exact = __privateGet(this, _fixedStep) > 0 || !__privateGet(this, _synced);
      let dt;
      if (__privateGet(this, _fixedStep) > 0) {
        dt = __privateGet(this, _fixedStep);
      } else if (__privateGet(this, _synced)) {
        const seconds = __privateGet(this, _lastMs) < 0 ? 0 : (now - __privateGet(this, _lastMs)) / 1e3;
        dt = __privateGet(this, _unit) === "frame" ? seconds * fps : seconds;
      } else {
        dt = __privateGet(this, _unit) === "frame" ? 1 : 1 / fps;
      }
      __privateSet(this, _lastMs, now);
      return exact ? __privateMethod(this, _Timeline_instances, stepExact_fn).call(this, dt * __privateGet(this, _speed)) : this.step(dt * __privateGet(this, _speed));
    }
    /** Whether the timeline is playing; see play(). */
    isPlaying() {
      return __privateGet(this, _playing);
    }
    /** Resumes or pauses; while paused step() does nothing. */
    play(playing = true) {
      if (playing && !__privateGet(this, _playing)) {
        __privateSet(this, _lastMs, -1);
      }
      __privateSet(this, _playing, playing);
      return this;
    }
    /** Current time, or the time at offset from now (negative = past), wrapped or clamped like the timeline itself. */
    t(offset) {
      return offset === void 0 ? __privateGet(this, _t2) : __privateMethod(this, _Timeline_instances, fit_fn).call(this, __privateGet(this, _t2) + offset);
    }
    /** Unit of t, duration and step amounts. */
    unit() {
      return __privateGet(this, _unit);
    }
    /** Only changes how step() advances; t, keys and duration are not converted. */
    setUnit(unit) {
      __privateSet(this, _unit, unit);
      return this;
    }
    /** Whether step() follows the real clock; see sync(). */
    isSynced() {
      return __privateGet(this, _synced);
    }
    /** true follows the real clock; false advances exactly one frame (see Keyed.setFrameRate()) per step(), for deterministic exports. */
    sync(sync = true) {
      __privateSet(this, _synced, sync);
      return this;
    }
    /** Whether step() runs automatically before each draw(); see autoplay(). */
    isAutoplay() {
      return __privateGet(this, _autoplay);
    }
    /** false stops the automatic step() before each draw(), so step() can be called manually; sync still applies. */
    autoplay(autoplay = true) {
      __privateSet(this, _autoplay, autoplay);
      return this;
    }
    /** Duration; 0 means unbounded. */
    duration() {
      return __privateGet(this, _duration2);
    }
    /** Multiplier for step(); see setSpeed(). */
    speed() {
      return __privateGet(this, _speed);
    }
    /** Multiplier for step(); negative plays backwards. */
    setSpeed(speed) {
      __privateSet(this, _speed, speed);
      return this;
    }
    /** Units per step() set with setFixedStep(); 0 when disabled. */
    fixedStep() {
      return __privateGet(this, _fixedStep);
    }
    /** Units per step() regardless of real time, e.g. 1 / 30 seconds for frame-exact exports; 0 disables it. */
    setFixedStep(amount) {
      if (!(amount >= 0)) {
        throw new RangeError(`fixed step must be >= 0, was ${amount}`);
      }
      __privateSet(this, _fixedStep, amount);
      return this;
    }
    /** Jumps to t; fire = true treats the jump like playback, e.g. when scrubbing with the mouse. By default nothing fires. */
    to(t, fire = false) {
      __privateMethod(this, _Timeline_instances, move_fn).call(this, t, fire);
      return this;
    }
    addMarker(a, b, c) {
      const named = c !== void 0;
      const name = named ? a : null;
      const at = named ? b : a;
      const callback = named ? c : b;
      if (typeof callback !== "function") {
        throw new TypeError("addMarker() needs a callback function");
      }
      const marker = new Marker(this, name, at instanceof Pin ? at : Pin.at(at), callback);
      __privateGet(this, _markers).push(marker);
      return marker;
    }
    /** Removes a marker; safe to call from a marker callback. */
    removeMarker(marker) {
      const i = __privateGet(this, _markers).indexOf(marker);
      if (i >= 0) __privateGet(this, _markers).splice(i, 1);
      return this;
    }
    /** First marker with this name, or null. */
    marker(name) {
      return __privateGet(this, _markers).find((m) => m.name() === name) ?? null;
    }
    /** Markers sorted by time. */
    markers() {
      return [...__privateGet(this, _markers)].sort(BY_TIME);
    }
    /** Called each time a looping timeline wraps around, in either direction. */
    onLoop(callback) {
      __privateGet(this, _loopListeners).push(callback);
      return this;
    }
    /** Called once when a non-looping timeline reaches its duration. */
    onFinish(callback) {
      __privateGet(this, _finishListeners).push(callback);
      return this;
    }
    /** Removes a callback added with onLoop() or onFinish(). */
    removeListener(callback) {
      for (const listeners of [__privateGet(this, _loopListeners), __privateGet(this, _finishListeners)]) {
        const i = listeners.indexOf(callback);
        if (i >= 0) listeners.splice(i, 1);
      }
      return this;
    }
    /** Sets the duration (0 = unbounded) and whether it loops; t is wrapped or clamped to fit. */
    setDuration(duration, loop = true) {
      __privateSet(this, _duration2, duration);
      __privateSet(this, _loop, loop);
      __privateSet(this, _t2, __privateMethod(this, _Timeline_instances, fit_fn).call(this, __privateGet(this, _t2)));
      return this;
    }
    /** Whether the timeline wraps at its duration; see loop(). */
    isLooping() {
      return __privateGet(this, _loop);
    }
    /** true wraps at the duration; false stops there. */
    loop(loop = true) {
      __privateSet(this, _loop, loop);
      return this;
    }
    /** True once a non-looping timeline has reached its duration. */
    isFinished() {
      return !__privateGet(this, _loop) && __privateGet(this, _duration2) > 0 && __privateGet(this, _t2) >= __privateGet(this, _duration2);
    }
    /** Stops advancing with the sketch; call when the timeline is no longer needed so it can be garbage collected. */
    dispose() {
      __privateGet(this, _ticker)?.remove(this);
      __privateSet(this, _ticker, null);
    }
  };
  _unit = new WeakMap();
  _synced = new WeakMap();
  _autoplay = new WeakMap();
  _loop = new WeakMap();
  _duration2 = new WeakMap();
  _t2 = new WeakMap();
  _speed = new WeakMap();
  _fixedStep = new WeakMap();
  _playing = new WeakMap();
  _lastMs = new WeakMap();
  _started = new WeakMap();
  _ticker = new WeakMap();
  _markers = new WeakMap();
  _loopListeners = new WeakMap();
  _finishListeners = new WeakMap();
  _arrivedSilently = new WeakMap();
  _moveId = new WeakMap();
  _Timeline_instances = new WeakSet();
  // Adding a step like 1/30 again and again drifts (90 steps don't give exactly 3), so a loop would wrap
  // one step late; snapping back onto the step grid and the loop boundaries keeps t exact.
  stepExact_fn = function(amount) {
    if (!__privateGet(this, _playing) || amount === 0) {
      return this.step(amount);
    }
    const grid = Math.abs(amount);
    let target = __privateGet(this, _t2) + amount;
    const tolerance = grid * 1e-3;
    const k = Math.round(target / grid);
    if (Math.abs(target - k * grid) < tolerance) {
      target = k * grid;
    }
    if (__privateGet(this, _duration2) > 0) {
      const m = Math.round(target / __privateGet(this, _duration2));
      if (Math.abs(target - m * __privateGet(this, _duration2)) < tolerance) {
        target = m * __privateGet(this, _duration2);
      }
    }
    __privateMethod(this, _Timeline_instances, move_fn).call(this, target, true);
    return this;
  };
  fit_fn = function(t) {
    if (__privateGet(this, _duration2) <= 0) return t;
    return __privateGet(this, _loop) ? remEuclid(t, __privateGet(this, _duration2)) : constrain4(t, 0, __privateGet(this, _duration2));
  };
  move_fn = function(target, fire) {
    const id = ++__privateWrapper(this, _moveId)._;
    const from = __privateGet(this, _t2);
    const wasFinished = this.isFinished();
    const includeStart = __privateGet(this, _arrivedSilently);
    __privateSet(this, _t2, __privateMethod(this, _Timeline_instances, fit_fn).call(this, target));
    __privateSet(this, _arrivedSilently, !fire);
    if (!fire) return;
    if (!__privateMethod(this, _Timeline_instances, crossMarkers_fn).call(this, from, target - from, includeStart, id)) return;
    if (!wasFinished && this.isFinished()) {
      __privateMethod(this, _Timeline_instances, callListeners_fn).call(this, __privateGet(this, _finishListeners), id);
    }
  };
  // Walks from `from` by delta, wrapping like fit(); false if a callback moved the timeline.
  crossMarkers_fn = function(from, delta, includeStart, id) {
    const duration = __privateGet(this, _duration2);
    const wraps = __privateGet(this, _loop) && duration > 0;
    const forward = delta >= 0;
    let pos = from;
    let remaining = Math.abs(delta);
    let inclusive = includeStart;
    for (let i = 0; i <= MAX_WRAPS; i++) {
      if (forward) {
        const end = pos + remaining;
        if (!wraps || end < duration) {
          return __privateMethod(this, _Timeline_instances, fireMarkers_fn).call(this, pos, wraps ? end : __privateGet(this, _t2), inclusive, true, true, id);
        }
        if (!__privateMethod(this, _Timeline_instances, fireMarkers_fn).call(this, pos, duration, inclusive, true, true, id)) return false;
        remaining = end - duration;
        pos = 0;
      } else {
        const end = pos - remaining;
        if (!wraps || end >= 0) {
          return __privateMethod(this, _Timeline_instances, fireMarkers_fn).call(this, wraps ? end : __privateGet(this, _t2), pos, true, inclusive, false, id);
        }
        if (!__privateMethod(this, _Timeline_instances, fireMarkers_fn).call(this, 0, pos, true, inclusive, false, id)) return false;
        remaining = -end;
        pos = duration;
      }
      inclusive = true;
      if (!__privateMethod(this, _Timeline_instances, callListeners_fn).call(this, __privateGet(this, _loopListeners), id)) return false;
    }
    return true;
  };
  // Fires markers in [lo, hi] (ends included as given) in playback order.
  fireMarkers_fn = function(lo, hi, includeLo, includeHi, forward, id) {
    const crossed = __privateGet(this, _markers).filter((m) => {
      const mt = m.t();
      return (mt > lo || includeLo && mt === lo) && (mt < hi || includeHi && mt === hi);
    });
    crossed.sort(forward ? BY_TIME : (a, b) => BY_TIME(b, a));
    for (const m of crossed) {
      if (!__privateGet(this, _markers).includes(m)) continue;
      m.fire();
      if (__privateGet(this, _moveId) !== id) return false;
    }
    return true;
  };
  callListeners_fn = function(listeners, id) {
    for (const listener of [...listeners]) {
      listener(this);
      if (__privateGet(this, _moveId) !== id) return false;
    }
    return true;
  };

  // src/core/keyed.ts
  var constrain5 = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  var _defaultTimeline, _lerp3, _defaultValue, _keys, _tm, _output, _target, _Keyed_instances, wrap_fn, raw_fn, constant_fn, copy_fn, sortKeys_fn;
  var _Keyed = class _Keyed {
    /**
     * Blends keys with lerp, a function (a, b, d) => value or an object with lerp(a, b, d).
     * defaultValue is used while there are no keys; without one, value() is undefined until the first key.
     */
    constructor(lerp, defaultValue) {
      __privateAdd(this, _Keyed_instances);
      __privateAdd(this, _lerp3);
      __privateAdd(this, _defaultValue);
      __privateAdd(this, _keys, []);
      // null means defaultTimeline(), looked up on use so values created before init() still pick it up.
      __privateAdd(this, _tm, null);
      // raw() wrapped by each added effect in order; the outermost wrapper is the final value.
      __privateAdd(this, _output, (t) => __privateMethod(this, _Keyed_instances, raw_fn).call(this, t));
      __privateAdd(this, _target, null);
      __privateSet(this, _lerp3, toLerpFunction(lerp));
      __privateSet(this, _defaultValue, defaultValue === void 0 ? void 0 : __privateMethod(this, _Keyed_instances, copy_fn).call(this, defaultValue));
    }
    /**
     * Call in setup() to start from a fresh default timeline, which every value without its own timeline follows.
     * Optional in global mode, where the library is hooked into p5 automatically; in instance mode pass the sketch.
     */
    static init(sketch) {
      env.claim?.(sketch);
      __privateGet(_Keyed, _defaultTimeline).dispose();
      __privateSet(_Keyed, _defaultTimeline, new Timeline());
      return __privateGet(_Keyed, _defaultTimeline);
    }
    /** Unit for the default timeline and new timelines. */
    static unit() {
      return settings.unit;
    }
    /** Sets the unit of the default timeline and of timelines created afterwards. */
    static setUnit(unit) {
      if (unit !== Unit.SECOND && unit !== Unit.FRAME) {
        throw new RangeError(`unit must be Keyed.SECOND or Keyed.FRAME, was ${String(unit)}`);
      }
      settings.unit = unit;
      __privateGet(_Keyed, _defaultTimeline).setUnit(unit);
    }
    /** Sync setting for new timelines. */
    static isSynced() {
      return settings.synced;
    }
    /** Sets sync for the default timeline and timelines created afterwards; see Timeline.sync(). */
    static sync(sync = true) {
      settings.synced = sync;
      __privateGet(_Keyed, _defaultTimeline).sync(sync);
    }
    /** Autoplay setting for new timelines. */
    static isAutoplay() {
      return settings.autoplay;
    }
    /** Sets autoplay for the default timeline and timelines created afterwards; see Timeline.autoplay(). */
    static autoplay(autoplay = true) {
      settings.autoplay = autoplay;
      __privateGet(_Keyed, _defaultTimeline).autoplay(autoplay);
    }
    /** Frame rate used to convert between frames and seconds. */
    static frameRate() {
      return settings.frameRate;
    }
    /** Must be > 0; pass the same value as p5's frameRate(). */
    static setFrameRate(fps) {
      if (!(fps > 0)) {
        throw new RangeError(`frame rate must be > 0, was ${fps}`);
      }
      settings.frameRate = fps;
    }
    /** Used by Keyed values without their own timeline. */
    static defaultTimeline() {
      return __privateGet(_Keyed, _defaultTimeline);
    }
    // Keyed<A> is invariant in A, so the implementation can't name one result type; the overloads above are the API.
    static of(value) {
      switch (typeof value) {
        case "number":
          return _Keyed.ofFloat(value);
        case "string":
          return _Keyed.ofString(value);
        case "boolean":
          return _Keyed.ofBoolean(value);
      }
      if (typeof value === "object" && value !== null) {
        const v = value;
        if (v.isColor === true) return _Keyed.ofColor(value);
        if (v.isVector === true) return _Keyed.ofVector(value);
        if (typeof v.lerp === "function") {
          return new _Keyed((a, b, d) => a.lerp(b, d), value);
        }
      }
      throw new TypeError(
        "Keyed.of() needs a number, string, boolean, p5.Vector, p5.Color or an object with lerp(b, d); use new Keyed(lerp, defaultValue) for anything else"
      );
    }
    // Named factories: the type is in the name, and the default value is only used while there are no keys.
    /** Animated number, 0 while there are no keys. */
    static ofFloat(defaultValue = 0) {
      return new _Keyed(new FloatLerp(), defaultValue);
    }
    /** Animated integer, rounded to the nearest one, 0 while there are no keys. */
    static ofInt(defaultValue = 0) {
      return new _Keyed(new IntLerp(), defaultValue);
    }
    /** Animated p5.Color, opaque black while there are no keys. See ColorLerp for how colors blend. */
    static ofColor(defaultValue) {
      return new _Keyed(new ColorLerp(), defaultValue ?? new (p5Runtime()).Color([0, 0, 0, 1], "rgb"));
    }
    /** Animated boolean, false while there are no keys. */
    static ofBoolean(defaultValue = false) {
      return new _Keyed(new BooleanLerp(), defaultValue);
    }
    /** Animated string, empty while there are no keys. */
    static ofString(defaultValue = "") {
      return new _Keyed(new StringLerp(), defaultValue);
    }
    /** Animated p5.Vector, (0, 0, 0) while there are no keys. */
    static ofVector(defaultValue) {
      return new _Keyed(new VectorLerp(), defaultValue ?? new (p5Runtime()).Vector(0, 0, 0));
    }
    static bind(...args) {
      if (args.length >= 3) {
        const [lerp, defaultValue, setter2] = args;
        return new _Keyed(lerp, defaultValue).bind(setter2);
      }
      const [target, property] = args;
      const setter = propertySetter(target, property);
      let keyed;
      try {
        keyed = _Keyed.of(target[property]);
      } catch {
        throw new TypeError(
          `Property '${property}' can't be bound by name: its value must be a number, string, boolean, p5.Vector, p5.Color or have lerp(b, d). Bind a setter instead.`
        );
      }
      return keyed.bind(setter);
    }
    key(at, v) {
      const key = at instanceof Key ? at : Key.at(at);
      const tween = v instanceof TweenAt ? v : v instanceof Path ? new TweenAt(v.tween()) : typeof v === "function" ? new TweenAt(v) : __privateMethod(this, _Keyed_instances, constant_fn).call(this, v);
      const existing = __privateGet(this, _keys).find((e) => e.key === key);
      if (existing) {
        existing.tween = tween;
      } else {
        __privateGet(this, _keys).push({ key, tween });
      }
      return this;
    }
    bind(a, property) {
      if (typeof a === "function") {
        __privateSet(this, _target, a);
      } else if (property !== void 0) {
        __privateSet(this, _target, propertySetter(a, property));
      } else {
        throw new TypeError("bind() needs a setter function, or an object and the name of its property");
      }
      binder.add(this);
      return this;
    }
    /** Stops updating the bound target, which keeps its last value. */
    unbind() {
      __privateSet(this, _target, null);
      binder.remove(this);
      return this;
    }
    /** Writes value() to the bound target now, e.g. in setup() before the first draw(). */
    apply() {
      var _a;
      (_a = __privateGet(this, _target)) == null ? void 0 : _a.call(this, this.value());
      return this;
    }
    /** Removes a key, or every key placed on a pin. */
    removeKey(at) {
      __privateSet(this, _keys, __privateGet(this, _keys).filter((e) => at instanceof Key ? e.key !== at : e.key.pin() !== at));
      return this;
    }
    /** Removes all keys. */
    clearKeys() {
      __privateSet(this, _keys, []);
      return this;
    }
    /** Follows tm instead of the default timeline; null reverts to the default. */
    setTimeline(tm) {
      __privateSet(this, _tm, tm);
      return this;
    }
    /** Value at time t, or at the timeline's current time, with effects applied. */
    value(t) {
      return __privateGet(this, _output).call(this, t ?? this.timeline().t());
    }
    /** Keys sorted by time. */
    keys() {
      __privateMethod(this, _Keyed_instances, sortKeys_fn).call(this);
      return __privateGet(this, _keys).map((e) => e.key);
    }
    /** Timeline set with setTimeline(), otherwise the default timeline. */
    timeline() {
      return __privateGet(this, _tm) ?? __privateGet(_Keyed, _defaultTimeline);
    }
    /**
     * Wraps the current output; effects apply in the order added. On a looping timeline, times they sample outside the
     * duration wrap around. Takes a function (source, t) => value or an object with apply(source, t), like Wiggle.
     */
    addEffect(effect) {
      const apply = toTimeEffect(effect);
      const source = __privateGet(this, _output);
      const wrapped = (s) => source(__privateMethod(this, _Keyed_instances, wrap_fn).call(this, s));
      __privateSet(this, _output, (s) => apply(wrapped, s));
      return this;
    }
    /** Values at now, now - delay, now - 2 * delay, ...; a negative delay samples the future. */
    echo(samples, delay) {
      if (!Number.isInteger(samples) || samples < 0) throw new RangeError(`samples must be a whole number >= 0, was ${samples}`);
      const tm = this.timeline();
      const values = [];
      for (let i = 0; i < samples; i++) values.push(this.value(tm.t(-delay * i)));
      return values;
    }
  };
  _defaultTimeline = new WeakMap();
  _lerp3 = new WeakMap();
  _defaultValue = new WeakMap();
  _keys = new WeakMap();
  _tm = new WeakMap();
  _output = new WeakMap();
  _target = new WeakMap();
  _Keyed_instances = new WeakSet();
  // On a looping timeline, times an effect samples outside [0, duration] wrap around like playback,
  // so effects looking into the past (Spring, Lag) continue seamlessly across the loop.
  wrap_fn = function(s) {
    const tm = this.timeline();
    const d = tm.duration();
    if (!tm.isLooping() || d <= 0 || s >= 0 && s <= d) return s;
    return (s % d + d) % d;
  };
  raw_fn = function(t) {
    __privateMethod(this, _Keyed_instances, sortKeys_fn).call(this);
    const keys = __privateGet(this, _keys);
    const n = keys.length;
    if (n === 0) {
      return __privateGet(this, _defaultValue) === void 0 ? void 0 : __privateMethod(this, _Keyed_instances, copy_fn).call(this, __privateGet(this, _defaultValue));
    }
    if (n === 1) {
      const k = keys[0].tween;
      return __privateMethod(this, _Keyed_instances, copy_fn).call(this, k.tween()(k.positionOr(0)));
    }
    let lo = 1;
    let hi = n - 1;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (t < keys[mid].key.t()) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    const e1 = keys[lo - 1];
    const e2 = keys[lo];
    const from = e1.key.t();
    const to = e2.key.t();
    const d = to > from ? (constrain5(t, from, to) - from) / (to - from) : t < to ? 0 : 1;
    const ease = segmentEasing(e1.key, e2.key)(d);
    const p1 = e1.tween.positionOr(0);
    const position = p1 + (e2.tween.positionOr(1) - p1) * ease;
    const w0 = e1.tween.tween();
    const w1 = e2.tween.tween();
    const v0 = w0(position);
    return w0 === w1 ? __privateMethod(this, _Keyed_instances, copy_fn).call(this, v0) : __privateGet(this, _lerp3).call(this, v0, w1(position), ease);
  };
  // A key holding a copy of value, so changing the original afterwards doesn't change the key.
  constant_fn = function(value) {
    const v = __privateMethod(this, _Keyed_instances, copy_fn).call(this, value);
    return new TweenAt(() => v);
  };
  // lerp(v, v, 0) returns a new value, so callers can't mutate stored keys through it.
  copy_fn = function(value) {
    return __privateGet(this, _lerp3).call(this, value, value, 0);
  };
  // Keys are mutable (Key.to, shared Pins), so order is restored on read; stable for equal times.
  sortKeys_fn = function() {
    __privateGet(this, _keys).sort((a, b) => a.key.compareTo(b.key));
  };
  __publicField(_Keyed, "SECOND", Unit.SECOND);
  __publicField(_Keyed, "FRAME", Unit.FRAME);
  __privateAdd(_Keyed, _defaultTimeline, new Timeline());
  var Keyed = _Keyed;

  // src/core/composition.ts
  var _timeline2, _keyeds;
  var Composition = class {
    /** Composition lasting duration, in the timeline's unit. */
    constructor(duration) {
      __privateAdd(this, _timeline2);
      __privateAdd(this, _keyeds, []);
      __privateSet(this, _timeline2, new Timeline().setDuration(duration, false));
    }
    /** Creates a Keyed value on this composition's timeline. */
    keyed(lerp, defaultValue) {
      return this.add(new Keyed(lerp, defaultValue));
    }
    /** Moves the keyed value onto this composition's timeline and unbinds it on dispose(). */
    add(keyed) {
      keyed.setTimeline(__privateGet(this, _timeline2));
      __privateGet(this, _keyeds).push(keyed);
      return keyed;
    }
    /** This composition's own timeline. */
    timeline() {
      return __privateGet(this, _timeline2);
    }
    /** Restarts from the beginning. */
    play() {
      __privateGet(this, _timeline2).to(0).play(true);
      return this;
    }
    /** Whether playback reached the end. */
    isFinished() {
      return __privateGet(this, _timeline2).isFinished();
    }
    /** Disposes the timeline and unbinds all keyed values. */
    dispose() {
      __privateGet(this, _timeline2).dispose();
      for (const k of __privateGet(this, _keyeds)) k.unbind();
      __privateGet(this, _keyeds).length = 0;
    }
  };
  _timeline2 = new WeakMap();
  _keyeds = new WeakMap();

  // src/core/quaternion.ts
  var Quaternion = class _Quaternion {
    /** Normalized to unit length. */
    constructor(w, x, y, z) {
      __publicField(this, "w");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "z");
      const m = Math.hypot(w, x, y, z);
      if (!(m > 0) || !Number.isFinite(m)) throw new RangeError(`a quaternion needs a non-zero, finite length, was [${w}, ${x}, ${y}, ${z}]`);
      this.w = w / m;
      this.x = x / m;
      this.y = y / m;
      this.z = z / m;
    }
    /** No rotation. */
    static identity() {
      return new _Quaternion(1, 0, 0, 0);
    }
    /** Angle in radians, counterclockwise around axis (a p5.Vector or [x, y, z]) like p5's rotate(angle, axis). */
    static fromAxisAngle(axis, angle) {
      const [ax, ay, az] = Array.isArray(axis) ? axis : [axis.x, axis.y, axis.z];
      const m = Math.hypot(ax, ay, az);
      if (!(m > 0) || !Number.isFinite(m)) throw new RangeError("the axis must not be a zero vector");
      const s = Math.sin(angle / 2) / m;
      return new _Quaternion(Math.cos(angle / 2), ax * s, ay * s, az * s);
    }
    /** Combines rotations: applies o first, then this. */
    mult(o) {
      return new _Quaternion(
        this.w * o.w - this.x * o.x - this.y * o.y - this.z * o.z,
        this.w * o.x + this.x * o.w + this.y * o.z - this.z * o.y,
        this.w * o.y - this.x * o.z + this.y * o.w + this.z * o.x,
        this.w * o.z + this.x * o.y - this.y * o.x + this.z * o.w
      );
    }
    /** Rotation angle in radians, in [0, 2π]. */
    angle() {
      return 2 * Math.acos(Math.max(-1, Math.min(1, this.w)));
    }
    /** Unit rotation axis as [x, y, z]; the x axis when there is no rotation. */
    axis() {
      const s = Math.sqrt(Math.max(0, 1 - this.w * this.w));
      return s < 1e-9 ? [1, 0, 0] : [this.x / s, this.y / s, this.z / s];
    }
    /** Rotates the matrix of g by this rotation, like rotate(angle, axis); g is a p5 instance or p5.Graphics, default the sketch. Needs WEBGL. */
    apply(g) {
      drawTarget(g).rotate(this.angle(), this.axis());
    }
    lerp(b, d) {
      let dot = this.w * b.w + this.x * b.x + this.y * b.y + this.z * b.z;
      const s = dot < 0 ? -1 : 1;
      dot *= s;
      let ka;
      let kb;
      if (dot > 0.9995) {
        ka = 1 - d;
        kb = d;
      } else {
        const theta = Math.acos(dot);
        const sin = Math.sin(theta);
        ka = Math.sin((1 - d) * theta) / sin;
        kb = Math.sin(d * theta) / sin;
      }
      kb *= s;
      return new _Quaternion(
        ka * this.w + kb * b.w,
        ka * this.x + kb * b.x,
        ka * this.y + kb * b.y,
        ka * this.z + kb * b.z
      );
    }
    toString() {
      return `[ ${this.w}, ${this.x}, ${this.y}, ${this.z} ]`;
    }
  };

  // src/core/shapemorph.ts
  var vectorLerp = new VectorLerp();
  var ShapeMorph = class _ShapeMorph {
    /** Copies the points, so changing the array afterwards doesn't change this shape. */
    constructor(points) {
      __publicField(this, "points");
      this.points = copy(points);
    }
    lerp(b, d) {
      if (this.points.length === 0) return new _ShapeMorph(b.points);
      if (b.points.length === 0) return new _ShapeMorph(this.points);
      const n = Math.max(this.points.length, b.points.length);
      const from = subdivide(this.points, n);
      const to = subdivide(b.points, n);
      return new _ShapeMorph(from.map((p, i) => vectorLerp.lerp(p, to[i], d)));
    }
    /**
     * Emits the points as vertex() calls on g (a p5 instance or p5.Graphics, default the sketch); wrap in
     * beginShape() / endShape(CLOSE). Points that are 3D are emitted with z, which a WEBGL canvas uses.
     */
    vertices(g) {
      const target = drawTarget(g);
      for (const p of this.points) {
        if (p.dimensions > 2) target.vertex(p.x, p.y, p.z);
        else target.vertex(p.x, p.y);
      }
    }
  };
  function subdivide(shape, n) {
    const pts = copy(shape);
    while (pts.length < n) {
      let longest = 0;
      let max = -1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const len = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (len > max) {
          max = len;
          longest = i;
        }
      }
      const mid = vectorLerp.lerp(pts[longest], pts[(longest + 1) % pts.length], 0.5);
      pts.splice(longest + 1, 0, mid);
    }
    return pts;
  }
  function copy(shape) {
    return shape.map((p) => p.copy());
  }

  // src/p5.keyed.ts
  var owner = null;
  function keyedAddon(p52, _fn, lifecycles) {
    env.p5 = p52;
    env.claim = (sketch) => {
      if (sketch) owner = sketch;
    };
    env.sketch = () => owner;
    lifecycles.presetup = function() {
      owner ?? (owner = this);
    };
    lifecycles.predraw = function() {
      if (this === owner) ticker.tick();
    };
    lifecycles.remove = function() {
      if (this === owner) {
        owner = null;
        binder.clear();
        ticker.clear();
        Keyed.init();
      }
    };
  }
  var globals = {
    AngleLerp,
    BooleanLerp,
    ColorLerp,
    Composition,
    CubicBezier,
    Curve,
    Easing,
    Effect,
    FloatLerp,
    GridSnap,
    IntLerp,
    Key,
    Keyed,
    Lag,
    Marker,
    Orbit,
    Path,
    Pin,
    QuadraticBezier,
    Quaternion,
    ShapeMorph,
    Spline,
    Spring,
    StepLerp,
    StopMotion,
    StringLerp,
    Timeline,
    Tween,
    TweenAt,
    VectorLerp,
    Wiggle
  };
  if (typeof window !== "undefined") {
    Object.assign(window, globals);
  }
  if (typeof p5 !== "undefined" && typeof p5.registerAddon === "function") {
    p5.registerAddon(keyedAddon);
  }
  return __toCommonJS(p5_keyed_exports);
})();
