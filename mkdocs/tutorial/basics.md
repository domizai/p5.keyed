# 1. Getting Started

In this chapter you animate your first value, move things around with vectors, meet the other value types, and learn that an animation can be read at any point in time.

All sketches on these pages are live: they run right in the page, and the code below each one is the full sketch.

## Your first key

<div class="sketch" data-sketch="01_Basics/FirstKey"></div>

Every Keyed sketch starts by connecting the library to the sketch in `setup()`:

```js
Keyed.init().setDuration(2);
```

`init()` hooks Keyed into p5, so animations follow real time without you having to advance them. It returns the **default timeline**, which we tell to loop every 2 seconds.

Next, create an animated value. `Keyed.ofFloat()` makes an animated number. Then add **keys**: a time in seconds and the value at that time.

```js
let x;

x = Keyed.ofFloat()
    .key(0, 50)
    .key(1, 350)
    .key(2, 50);
```

At 0 seconds `x` is 50, at 1 second it's 350, and at 2 seconds it's back at 50. In between, Keyed blends the values. In `draw()`, `value()` gives you the value at the current time:

```js
circle(x.value(), height / 2, 40);
```

That's all there is to it. The rest of this tutorial adds to this pattern.

??? example "Full sketch: FirstKey"
    ```js
    --8<-- "01_Basics/FirstKey/sketch.js"
    ```

## Vectors

<div class="sketch" data-sketch="01_Basics/Vectors"></div>

`Keyed.ofVector()` animates a `p5.Vector`, blending x, y and z together. Here the ball visits one corner per second. The last key returns to the first corner, so the loop closes without a jump:

```js
pos = Keyed.ofVector();
for (let i = 0; i <= corners.length; i++) {
    pos.key(i, corners[i % corners.length]);
}
```

Keys store a **copy** of the vector you pass, so changing `corners` later won't move them.

??? example "Full sketch: Vectors"
    ```js
    --8<-- "01_Basics/Vectors/sketch.js"
    ```

## Value types

<div class="sketch" data-sketch="01_Basics/ValueTypes"></div>

Keyed knows how to blend more than numbers:

| Factory | Type | How it blends |
|---|---|---|
| `Keyed.ofFloat()` | number | linearly |
| `Keyed.ofInt()` | number | linearly, rounded to the nearest whole number |
| `Keyed.ofColor()` | `p5.Color` | in the color space of the colors, like `lerpColor()` |
| `Keyed.ofVector()` | `p5.Vector` | x, y and z |
| `Keyed.ofString()` | string | morphs one character edit at a time |
| `Keyed.ofBoolean()` | boolean | switches when the next key is reached |

Each factory also takes a default value, e.g. `Keyed.ofFloat(50)`, used while there are no keys. Without one it's 0, black, `false`, an empty string or `(0, 0)`. `Keyed.of(value)` is a shorthand that picks the type from the value: a number, string, boolean, `p5.Vector` or `p5.Color`. Whole numbers always need `ofInt()`, because a number alone could be either.

```js
col = Keyed.ofColor()
    .key(0, color(230, 60, 60))
    .key(2, color(60, 120, 230))
    .key(4, color(230, 60, 60));

word = Keyed.ofString()
    .key(0, 'keyed')
    .key(2, 'animation')
    .key(4, 'keyed');
```

!!! note
    Colors blend in the color mode they were created in. Colors made while `colorMode(HSB)` is active blend in HSB, passing through the hues.

Want to blend something else? See [Types](types.md).

??? example "Full sketch: ValueTypes"
    ```js
    --8<-- "01_Basics/ValueTypes/sketch.js"
    ```

## Any time

<div class="sketch" data-sketch="01_Basics/AnyTime"></div>

`value()` is the value **now**. `value(t)` is the value at **any** time `t`, past or future. Here it's used to draw the whole animation as a graph, one point per pixel:

```js
beginShape();
for (let x = gx0; x <= gx1; x++) {
    const t = map(x, gx0, gx1, 0, duration);
    vertex(x, ballY.value(t));
}
endShape();
```

`keys()` lists the keys, and each key's `t()` is its time, which is handy for drawing them:

```js
for (const k of ballY.keys()) {
    circle(tx(k.t()), ballY.value(k.t()), 8);
}
```

The current time of the default timeline is `Keyed.defaultTimeline().t()`. Hover over the graph in the sketch to read the value at any other time.

??? example "Full sketch: AnyTime"
    ```js
    --8<-- "01_Basics/AnyTime/sketch.js"
    ```

!!! tip "Text and stroke"
    p5 outlines `text()` with the current stroke, and the stroke stays set from one frame to the next. If a line you drew earlier (like a timeline bar) leaves a stroke on, your text looks doubled or blurry. Call `noStroke()` before drawing text:

    ```js
    noStroke();
    fill(0);
    text(`t = ${nf(tm.t(), 1, 2)}`, 40, 40);
    ```

    Processing's `text()` ignores the stroke, so this is a difference to keep in mind when you port a sketch.

Next: [Easing](easing.md).
