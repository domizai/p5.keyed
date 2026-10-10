# 2. Easing

Without easing, values move at constant speed and stop abruptly at each key. Easing changes the speed between keys, so motion feels natural. In Keyed, easing is set on a key with `Key.at(t)` instead of a plain time.

## Influence

<div class="sketch" data-sketch="02_Easing/Influence"></div>

Inspired by After Effects, easing is an **influence** between 0 and 1 that slows the motion near a key.

```js
easy = Keyed.ofFloat()
    .key(Key.at(0).setEasing(1 / 3), x0)
    .key(Key.at(1.5).setEasing(1 / 3), x1)
    .key(Key.at(3).setEasing(1 / 3), x0);
```

- `setEasing(1 / 3)` is similar to After Effects' *Easy Ease*.
- Higher influence, like `setEasing(1)`, is slower near the keys and faster in between.
- `setEasingOut()` only eases **leaving** a key: soft start, hard stop.
- `setEasingIn()` only eases **arriving** at a key: hard start, soft stop.

??? example "Full sketch: Influence"
    ```js
    --8<-- "02_Easing/Influence/sketch.js"
    ```

## Presets

<div class="sketch" data-sketch="02_Easing/Presets"></div>

`setEasing()` also accepts an `Easing` curve. Keyed has the usual presets:

- `QUAD`, `CUBIC`, `QUART` and `QUINT`, each with `_IN`, `_OUT` and `_IN_OUT`, e.g. `Easing.CUBIC_IN_OUT`
- `Easing.SMOOTHSTEP` and `Easing.HOLD`

An `Easing` shapes the whole segment from its key to the next one, so the last key doesn't need one:

```js
Keyed.ofFloat()
    .key(Key.at(0).setEasing(Easing.CUBIC_IN_OUT), x0)
    .key(Key.at(1.5).setEasing(Easing.CUBIC_IN_OUT), x1)
    .key(3, x0);
```

An `Easing` is just a function from linear progress to eased progress, both from 0 to 1. Call it like `e(d)` to use it yourself, for example to draw the little graphs in the sketch. The presets also exist as plain functions, like `Easing.quadIn(d)`.

??? example "Full sketch: Presets"
    ```js
    --8<-- "02_Easing/Presets/sketch.js"
    ```

## Custom curves

<div class="sketch" data-sketch="02_Easing/CustomBezier"></div>

When the presets aren't enough, build your own:

```js
// Same as CSS cubic-bezier(); this one is CSS "ease".
Easing.cubicBezier(0.25, 0.1, 0.25, 1)
// y values above 1 overshoot the target...
Easing.cubicBezier(0.34, 1.56, 0.64, 1)
// ...and below 0 pull back before moving.
Easing.cubicBezier(0.36, 0, 0.66, -0.56)
// Starts at 0, ends at 1, pulled towards the middle value.
Easing.quadraticBezier(0, 1.4, 1)
// Waits until 0.3, moves smoothly, arrives at 0.7.
Easing.smoothstep(0.3, 0.7)
// Jumps in 4 equal steps, like CSS steps().
Easing.steps(4)
```

`Easing` is just a function type, so any function of `d` works too. This one bounces:

```js
const bounce = (d) => 1 - abs(cos(d * 2.5 * PI)) * (1 - d);
```

There are also `Easing.powerIn(p)`, `powerOut(p)` and `powerInOut(p)` for any power.

??? example "Full sketch: CustomBezier"
    ```js
    --8<-- "02_Easing/CustomBezier/sketch.js"
    ```

## Hold

<div class="sketch" data-sketch="02_Easing/Hold"></div>

Sometimes values should jump instead of blend. There are two ways:

- **Even jumps:** `Easing.steps(n)` on a single segment. The clock hand makes one full turn in 8 equal steps.
- **Uneven timing:** `hold()` keeps a key's value until the next key. The traffic light is green for 2 seconds, yellow for 0.5 and red for 1.5.

```js
hand = Keyed.ofFloat()
    .key(Key.at(0).setEasing(Easing.steps(8)), 0)
    .key(4, TWO_PI);

lamp = Keyed.ofInt()
    .key(Key.at(0).hold(), 2)
    .key(Key.at(2).hold(), 1)
    .key(2.5, 0);
```

Without `hold()`, the lamp index would be blended and rounded, switching halfway between keys.

??? example "Full sketch: Hold"
    ```js
    --8<-- "02_Easing/Hold/sketch.js"
    ```

Next: [Timelines](timeline.md).
