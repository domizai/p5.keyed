"use strict";
var p5keyed = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
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
    Easing: () => Easing,
    Key: () => Key,
    Marker: () => Marker,
    Pin: () => Pin,
    Ticker: () => Ticker,
    Timeline: () => Timeline,
    Unit: () => Unit,
    keyedAddon: () => keyedAddon,
    settings: () => settings,
    ticker: () => ticker
  });

  // src/core/easing.ts
  var constrain = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
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
      const x = constrain((d - edge0) / (edge1 - edge0), 0, 1);
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
  var _t, _listeners;
  var _Pin = class _Pin {
    /** Pin at time t, 0 by default. */
    constructor(t = 0) {
      __privateAdd(this, _t);
      __privateAdd(this, _listeners, null);
      __privateSet(this, _t, t);
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
      __privateSet(this, _t, t);
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

  // src/core/ticker.ts
  var _items;
  var Ticker = class {
    constructor() {
      __privateAdd(this, _items, /* @__PURE__ */ new Set());
    }
    add(item) {
      __privateGet(this, _items).add(item);
    }
    remove(item) {
      __privateGet(this, _items).delete(item);
    }
    clear() {
      __privateGet(this, _items).clear();
    }
    /** Calls pre() on a copy, so items may add or remove themselves while ticking. */
    tick() {
      for (const item of [...__privateGet(this, _items)]) {
        item.pre();
      }
    }
  };
  _items = new WeakMap();
  var ticker = new Ticker();

  // src/core/timeline.ts
  var MAX_WRAPS = 100;
  var BY_TIME = (a, b) => a.t() - b.t();
  var constrain2 = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  var remEuclid = (a, b) => (a % b + b) % b;
  var _unit, _synced, _autoplay, _loop, _duration, _t2, _speed, _fixedStep, _playing, _lastMs, _started, _ticker, _markers, _loopListeners, _finishListeners, _arrivedSilently, _moveId, _Timeline_instances, stepExact_fn, fit_fn, move_fn, crossMarkers_fn, fireMarkers_fn, callListeners_fn;
  var Timeline = class {
    /** Advances before every draw(); null only moves via step() or to(). */
    constructor(driver = ticker) {
      __privateAdd(this, _Timeline_instances);
      __privateAdd(this, _unit, settings.unit);
      __privateAdd(this, _synced, settings.synced);
      __privateAdd(this, _autoplay, settings.autoplay);
      __privateAdd(this, _loop, true);
      __privateAdd(this, _duration, 0);
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
    /** @internal Called before each draw(). The first frame shows t = 0. */
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
      return __privateGet(this, _duration);
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
      __privateSet(this, _duration, duration);
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
      return !__privateGet(this, _loop) && __privateGet(this, _duration) > 0 && __privateGet(this, _t2) >= __privateGet(this, _duration);
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
  _duration = new WeakMap();
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
    if (__privateGet(this, _duration) > 0) {
      const m = Math.round(target / __privateGet(this, _duration));
      if (Math.abs(target - m * __privateGet(this, _duration)) < tolerance) {
        target = m * __privateGet(this, _duration);
      }
    }
    __privateMethod(this, _Timeline_instances, move_fn).call(this, target, true);
    return this;
  };
  fit_fn = function(t) {
    if (__privateGet(this, _duration) <= 0) return t;
    return __privateGet(this, _loop) ? remEuclid(t, __privateGet(this, _duration)) : constrain2(t, 0, __privateGet(this, _duration));
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
    const duration = __privateGet(this, _duration);
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

  // src/p5.keyed.ts
  var owner = null;
  function keyedAddon(_p5, _fn, lifecycles) {
    lifecycles.presetup = function() {
      owner ?? (owner = this);
    };
    lifecycles.predraw = function() {
      if (this === owner) ticker.tick();
    };
    lifecycles.remove = function() {
      if (this === owner) {
        owner = null;
        ticker.clear();
      }
    };
  }
  var globals = { Easing, Key, Marker, Pin, Timeline };
  if (typeof window !== "undefined") {
    Object.assign(window, globals);
  }
  if (typeof p5 !== "undefined" && typeof p5.registerAddon === "function") {
    p5.registerAddon(keyedAddon);
  }
  return __toCommonJS(p5_keyed_exports);
})();
