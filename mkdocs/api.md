# API Overview

A compact summary of the library. Each section links to the tutorial chapter that explains it with examples.

## Setup and the clock

- **`Keyed.init()`**, called in `setup()`, hooks Keyed into p5 and returns the **default timeline**, used by every value that isn't given a timeline. In instance mode, call **`Keyed.init(p)`**.
- **Global settings**, set before creating timelines:
    - `Keyed.setUnit(Keyed.SECOND | Keyed.FRAME)` measures times in seconds or frames.
    - `Keyed.setFrameRate(fps)` sets the frame rate used to convert between frames and seconds.
    - `Keyed.sync(bool)`: `true` follows real time; `false` advances exactly one frame per `draw()`, for repeatable exports.
    - `Keyed.autoplay(bool)` turns automatic advancing on or off.
- Read them back with `Keyed.unit()`, `Keyed.frameRate()`, `Keyed.isSynced()`, `Keyed.isAutoplay()`.
- `Keyed.defaultTimeline()` returns the current default timeline.

See [Getting Started](tutorial/basics.md) and [Timelines](tutorial/timeline.md#frames-instead-of-seconds).

## Animated values: `Keyed<A>`

- **Built-in types:** `Keyed.ofFloat()`, `ofInt()`, `ofColor()`, `ofBoolean()`, `ofString()`, `ofVector()`, each optionally with a default value used while there are no keys.
- **Shorthand:** `Keyed.of(value)` picks the type from a number, string, boolean, `p5.Vector`, `p5.Color` or any object with `lerp(b, d)`.
- **Any type:** `new Keyed(lerp, defaultValue)` (the default is optional; without one `value()` is `undefined` until the first key), where `lerp` is a function `(a, b, d) => value` or an object with `lerp(a, b, d)`.
- **Keys:** `key(tOrPinOrKey, value)`, `removeKey(keyOrPin)`, `clearKeys()`, `keys()`.
- **Reading:** `value()` is the value now; `value(t)` the value at any time.
- **`echo(samples, delay)`** returns an array of the value at now, now - delay, now - 2 * delay, ...
- **`setTimeline(tm)`** attaches the value to a timeline other than the default; `timeline()` reads it back.

See [Getting Started](tutorial/basics.md).

## Keys, pins and easing

- **`Key.at(tOrPin)`** creates a key with its own easing:
    - Influence, After Effects style: `setEasing(1 / 3)`, `setEasingIn(...)`, `setEasingOut(...)`.
    - Curves: `setEasing(Easing.CUBIC_IN_OUT)` and other `QUAD`/`CUBIC`/`QUART`/`QUINT` presets, `SMOOTHSTEP`, `HOLD`.
    - `hold()` keeps the value until the next key.
- **Custom easing:** `Easing.cubicBezier(...)`, `quadraticBezier(...)`, `smoothstep(...)`, `steps(n)`, `powerIn`/`powerOut`/`powerInOut(p)`, or any function `d => ...`.
- Every easing is a plain function: call `Easing.CUBIC_IN(d)`, not `.apply(d)`.
- **`Pin.at(t)`** is a point in time shared by keys and markers. `pin.to(t)` moves all of them; `addListener()` reports moves.

See [Easing](tutorial/easing.md) and [Pins](tutorial/timeline.md#pins).

## Timeline

- **Creating:** `new Timeline()`, then `value.setTimeline(tm)`. Several timelines are independent clocks. `new Timeline(null)` only moves via `step()` or `to()`.
- **Duration:** `setDuration(d)` loops; `setDuration(d, false)` plays once. `loop(bool)`, `isLooping()`, `isFinished()`.
- **Playback:** `play(bool)`, `isPlaying()`, `setSpeed(s)` (negative plays backwards), `to(t)` to jump, `to(t, true)` to jump and fire markers on the way, `step()` to advance automatically or `step(amount)` by a chosen amount.
- **Timing:** `t()` is the current time, `t(offset)` a time relative to it. `sync(bool)`, `autoplay(bool)` and `setFixedStep(dt)` control how it advances.
- Read them back with `duration()`, `speed()`, `fixedStep()`, `isSynced()`, `isAutoplay()` and `unit()`.
- **`dispose()`** stops a timeline you no longer need.

See [Timelines](tutorial/timeline.md).

## Events

- **Markers:** `addMarker(tOrPin, callback)` or `addMarker(name, tOrPin, callback)`, `marker(name)`, `markers()`, `removeMarker(m)`.
- **Listeners:** `onLoop(callback)`, `onFinish(callback)`, `removeListener(callback)`.
- Markers fire on playback in either direction, also when a loop wraps around. A plain `to(t)` fires nothing.

See [Events](tutorial/events.md).

## Binding

- **`Keyed.bind(obj, 'prop')`** binds by property name and picks the type from the property's current value.
- **`Keyed.bind(lerp, defaultValue, setter)`** creates and binds a value in one call.
- **`keyed.bind(setter)`** or **`keyed.bind(obj, 'prop')`** binds an existing value.
- **`unbind()`** stops updating; **`apply()`** writes the current value immediately.
- Binding runs after the timelines, so bound values are as current as `value()` inside `draw()`.

See [Binding](tutorial/binding.md).

## Tweens and paths

- **`Tween<T>`** is a plain function of `d` from 0 to 1. A key can follow a tween instead of a fixed value; `Tween.at(tween, d)` fixes a key to one position.
- `Tween.map(tween, f)` converts a tween's values.
- **Paths:** `QuadraticBezier`, `CubicBezier` (both at constant speed), `Spline` (like `curveVertex()`, with `setTightness()`), and `Curve` to chain them with `add()`.
- A `Path` has `value(d)`, `length()`, `slice(t0, t1)`, `at(d)`, `map(f)`, `x()`, `y()`, `z()` and `tween()`.
- `slice(t0, t1)` is part of a path; swapping the ends reverses it.

See [Paths](tutorial/paths.md).

## Effects

Added with `addEffect(effect)`, applied in the order added.

- Effects are either functions `(source, t) => value` or objects with `apply(source, t)`.
- **Value effects:** `Wiggle`, `Orbit`, `GridSnap`.
- **Time effects:** `Spring`, `Lag`, `StopMotion`.
- **Shortcuts for `p5.Vector`s:** `Effect.wiggle(...)`, `orbit(...)`, `gridSnap(...)`, `spring(...)`, `lag(...)`.
- **Custom:** write your own `(source, t) => ...`, or a class with `apply(source, t)`.
- `new Spring(lerp, frequency, damping)` and `new Lag(lerp, duration, samples)` work for any type with a suitable lerp.

See [Effects](tutorial/effects.md) and [Echo](tutorial/effects.md#echo).

## Lerps and types

- **Lerps:** `FloatLerp`, `IntLerp`, `VectorLerp`, `ColorLerp`, `AngleLerp`, `StringLerp`, `BooleanLerp`, `StepLerp`, or any function `(a, b, d) => ...`.
- **`Lerpable`** means an object has `lerp(b, d)` and returns a new value.
- **`Quaternion`:** immutable 3D rotation without gimbal lock; `identity()`, `fromAxisAngle(axis, angle)`, `mult()`, `axis()`, `angle()`, `apply()`.
- **`ShapeMorph`:** morphs between polygons with different point counts, in 2D or 3D; `vertices()` emits `vertex()` calls.

See [Types](tutorial/types.md).

## Composition

- Subclass `Composition` for a reusable animation on its own one-shot timeline. Key times are local.
- Inside the subclass, create values with `this.keyed(lerp, default)` or `this.add(keyed)`.
- `timeline()`, `play()`, `isFinished()`, `dispose()`.

See [Composition](tutorial/composition.md) and [Export](tutorial/export.md).
