# 9. Composition

So far all animations were set up once in `setup()`. But what if you need the same animation many times, starting at different moments, like a burst on every click? A **`Composition`** is a reusable, self-contained animation on its own timeline. Like any class, it can take parameters, so every instance can look a little different.

## Click burst

<div class="sketch" data-sketch="09_Composition/ClickBurst"></div>

Extend `Composition`, pass its duration to `super()`, and create its values with `this.add()` or `this.keyed()`. Key times are **local**: 0 is when the composition was created.

The constructor parameters customize each burst: `size` scales the keyed values, `col` colors the dots, and `duration` sets how long it plays. The key times are fractions of the duration, so the whole animation stretches with it:

```js
class Burst extends Composition {
    constructor(x, y, size, col, duration) {
        super(duration);
        this.x = x;
        this.y = y;
        this.col = col;
        const d = duration;

        this.ring = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.CUBIC_OUT), 0)
            .key(d, 90 * size));

        this.fade = this.add(Keyed.ofFloat()
            .key(0.4 * d, 255)
            .key(d, 0));
    }
}
```

Each new `Burst` starts playing right away, here with a random size and color. Bigger bursts get a longer duration:

```js
function mousePressed() {
    spawn(mouseX, mouseY);
}

function spawn(x, y) {
    const size = random(0.4, 1.6);
    const col = random(colors);
    const duration = 0.4 + 0.5 * size;
    bursts.push(new Burst(x, y, size, col, duration));
}
```

Once a burst `isFinished()`, `dispose()` stops its timeline so it can be garbage collected:

```js
function draw() {
    background(255);
    for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.draw();
        if (b.isFinished()) {
            b.dispose();
            bursts.splice(i, 1);
        }
    }
}
```

Call `play()` to restart a composition from the beginning, and `timeline()` to control it like any other [timeline](timeline.md).

The sketch also spawns a burst every 0.4 seconds with `onLoop()`, so there is something to see without clicking.

??? example "Full sketch: ClickBurst"
    === "sketch.js"
        ```js
        --8<-- "09_Composition/ClickBurst/sketch.js"
        ```
    === "burst.js"
        ```js
        --8<-- "09_Composition/ClickBurst/burst.js"
        ```

Next: [Export](export.md).
