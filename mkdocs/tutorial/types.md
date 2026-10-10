# 8. Types

How two values blend is decided by a **Lerp**. `Keyed.ofFloat()`, `ofColor()` and the other factories pick one for you, but you can choose your own, write one as a function, or teach your own classes to blend themselves. Keyed also comes with two types for shapes and 3D rotations.

## Lerps

<div class="sketch" data-sketch="08_Types/Lerps"></div>

Pass a `Lerp` and a default value to the constructor to choose how values blend:

```js
shortWay = new Keyed(new AngleLerp(), 0)
    .key(Key.at(0).setEasing(1 / 3), radians(330))
    .key(Key.at(2).setEasing(1 / 3), radians(30))
    .key(Key.at(4).setEasing(1 / 3), radians(330));
```

The built-in lerps are:

| Lerp | Blends |
|---|---|
| `FloatLerp`, `IntLerp`, `VectorLerp` | numbers and vectors |
| `ColorLerp` | colors in the color space of the colors themselves |
| `AngleLerp` | angles the short way round: from 330° to 30° it turns 60° forward, where `FloatLerp` turns 300° back |
| `StringLerp` | text, one character edit at a time |
| `BooleanLerp` | switches when the next key is reached |
| `StepLerp(threshold)` | any type; switches once the blend passes the threshold |

A `Lerp` can be a function too. This one blends colors in HSB, passing through the hues instead of gray:

```js
colorMode(HSB, 360, 100, 100, 1);
const hsbBlack = color(0, 0, 0);
const hsbRed = color(0, 100, 100);
const hsbCyan = color(180, 100, 100);
colorMode(RGB, 255);
hsb = new Keyed((a, b, d) => a.lerp(b, d, 'hsb'), hsbBlack)
    .key(0, hsbRed)
    .key(2, hsbCyan)
    .key(4, hsbRed);
```

??? example "Full sketch: Lerps"
    ```js
    --8<-- "08_Types/Lerps/sketch.js"
    ```

### Plain objects

<div class="sketch" data-sketch="08_Types/PlainObjects"></div>

A lerp function is all it takes to animate your own data. This one blends plain objects with `x` and `y`, so no class is needed, and the default value is optional:

```js
const pointLerp = (a, b, d) => ({
    x: (1 - d) * a.x + d * b.x,
    y: (1 - d) * a.y + d * b.y,
});

point = new Keyed(pointLerp)
    .key(4, { x: 340, y: 100 })
    .key(1, { x: 60, y: 300 });

point.value(2.5); // { x: 200, y: 200 }
```

Keys can be added in any order. Without a default value, `value()` is `undefined` until the first key. Keys are copied through the lerp, so changing your original objects later doesn't change them.

This sketch has no animation: it draws `value(t)` at a few fixed times, a row of dots between the two keys (red).

??? example "Full sketch: PlainObjects"
    ```js
    --8<-- "08_Types/PlainObjects/sketch.js"
    ```

## Your own types

<div class="sketch" data-sketch="08_Types/CustomType"></div>

Any object with a `lerp(b, d)` method can blend itself, so `Keyed.of()` needs no separate `Lerp`. It should return a new object instead of mutating either input. This `Transform` animates position, rotation and scale together, in one value:

```js
class Transform {
    constructor(x, y, rotation = 0, scale = 1) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scale = scale;
    }

    lerp(b, d) {
        const turn = ((((b.rotation - this.rotation) % TWO_PI) + TWO_PI + PI) % TWO_PI) - PI;
        return new Transform(
            lerp(this.x, b.x, d),
            lerp(this.y, b.y, d),
            this.rotation + turn * d,
            lerp(this.scale, b.scale, d),
        );
    }
}
```

```js
transform = Keyed.of(new Transform(200, 200))
    .key(Key.at(0).setEasing(1 / 3), new Transform(100, 120, 0, 1))
    .key(Key.at(1.3).setEasing(1 / 3), new Transform(300, 120, radians(120), 1.6))
    .key(Key.at(2.6).setEasing(1 / 3), new Transform(200, 290, radians(240), 0.6))
    .key(Key.at(4).setEasing(1 / 3), new Transform(100, 120, 0, 1));
```

!!! tip
    Make your type immutable, like `Transform`. Then `lerp()` can safely return shared instances or fresh ones without stored keys being changed from the outside.

??? example "Full sketch: CustomType"
    === "sketch.js"
        ```js
        --8<-- "08_Types/CustomType/sketch.js"
        ```
    === "transform.js"
        ```js
        --8<-- "08_Types/CustomType/transform.js"
        ```

## Shape morphing

<div class="sketch" data-sketch="08_Types/Morphing"></div>

`ShapeMorph` is a closed polygon that blends point by point. Shapes may have different point counts: the shape with fewer points gets extra points on its longest edges, so outlines and corners stay sharp while it morphs.

```js
shape = Keyed.of(polygon(3, 130))
    .key(Key.at(0).setEasing(0.6), polygon(3, 130))
    .key(Key.at(1).setEasing(0.6), polygon(4, 120))
    .key(Key.at(2).setEasing(0.6), star(5, 140, 60))
    .key(Key.at(3).setEasing(0.6), polygon(40, 120))
    .key(Key.at(4).setEasing(0.6), polygon(3, 130));
```

Create one from a list of `p5.Vector`s with `new ShapeMorph(points)`. To draw it, call `vertices()` between `beginShape()` and `endShape(CLOSE)`:

```js
beginShape();
shape.value().vertices();
endShape(CLOSE);
```

!!! tip
    Start all shapes at the same angle, e.g. at the top, so they don't twist while morphing.

??? example "Full sketch: Morphing"
    ```js
    --8<-- "08_Types/Morphing/sketch.js"
    ```

## Shape morphing in 3D

<div class="sketch" data-sketch="08_Types/Morphing3D"></div>

`ShapeMorph` uses x, y and z, so outlines can morph in 3D too. On a WEBGL canvas, `vertices()` emits z as well. Here a circle turns into a wave, a trefoil knot and a triangle with only 3 points.

??? example "Full sketch: Morphing3D"
    ```js
    --8<-- "08_Types/Morphing3D/sketch.js"
    ```

## 3D rotation

<div class="sketch" data-sketch="08_Types/Rotation3D"></div>

Both boxes turn between the same two orientations. Blending three Euler angles one by one makes the left box tumble along the way. A `Quaternion` is a 3D rotation that blends along the shortest arc, so the right box turns straight there:

```js
quat = Keyed.of(Quaternion.identity())
    .key(Key.at(0).setEasing(1 / 3), Quaternion.identity())
    .key(Key.at(1.5).setEasing(1 / 3), fromEuler(PI, 0, PI))
    .key(Key.at(3).setEasing(1 / 3), Quaternion.identity());
```

Build quaternions with `Quaternion.fromAxisAngle(axis, angle)`, where `axis` can be a `p5.Vector` or `[x, y, z]`, and combine them with `mult()`. `apply()` rotates the sketch's WEBGL matrix, like `rotate(angle, axis)`:

```js
quat.value().apply();
```

??? example "Full sketch: Rotation3D"
    ```js
    --8<-- "08_Types/Rotation3D/sketch.js"
    ```

Next: [Composition](composition.md).
