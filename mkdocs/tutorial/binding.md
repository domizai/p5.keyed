# 5. Binding

Calling `value()` everywhere gets tedious, especially with objects that draw themselves. **Binding** lets Keyed write the animated value into a property or setter before every `draw()`, so your code just uses plain variables.

## Field binding

<div class="sketch" data-sketch="05_Binding/FieldBinding"></div>

`Keyed.bind(object, 'property')` animates a property by name. The property's current value becomes the default. For top-level globals in p5's global mode, that means using `var`, because `let` and `const` are not properties of `window`.

```js
var x = 60;
var diameter = 20;

function setup() {
    Keyed.init().setDuration(3);

    Keyed.bind(window, 'x')
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(1.5).setEasing(1 / 3), 340)
        .key(Key.at(3).setEasing(1 / 3), 60);

    Keyed.bind(window, 'diameter')
        .key(0, 20)
        .key(1.5, 80)
        .key(3, 20);
}

function draw() {
    background(255);
    circle(x, 180, diameter);
}
```

No `value()` calls: `x` and `diameter` are plain numbers, already up to date.

??? example "Full sketch: FieldBinding"
    ```js
    --8<-- "05_Binding/FieldBinding/sketch.js"
    ```

## Setter binding

<div class="sketch" data-sketch="05_Binding/SetterBinding"></div>

For any other type, bind a **setter**: a function that receives the animated value. Pass a `Lerp` (how to blend, see [Types](types.md)), a default value and the setter:

```js
Keyed.bind(new ColorLerp(), color(255), (c) => (bg = c))
    .key(0, color(255, 235, 215))
    .key(2, color(215, 230, 255))
    .key(4, color(255, 235, 215));
```

Or call `bind()` on an existing `Keyed`. The setter can convert the value, here from an integer to a line of text:

```js
score = Keyed.ofInt()
    .key(0, 0)
    .key(4, 100)
    .bind(showScore);

function showScore(v) {
    label = `score ${v}`;
}
```

- `unbind()` stops the updates, so the target keeps its last value. In the sketch the score freezes for a moment.
- `apply()` writes the value right away, without waiting for `draw()`, e.g. to use it in `setup()`.

??? example "Full sketch: SetterBinding"
    ```js
    --8<-- "05_Binding/SetterBinding/sketch.js"
    ```

## Binding objects

<div class="sketch" data-sketch="05_Binding/ObjectBinding"></div>

Binding shines with objects. Each `Ball` gets its `y` property bound by name, and its color through a setter method. Delaying the keys of each ball a little creates a wave:

```js
for (let i = 0; i < 7; i++) {
    const b = new Ball(60 + i * 47, 300);
    balls.push(b);
    const delay = i * 0.1;

    Keyed.bind(b, 'y')
        .key(Key.at(delay).setEasing(1 / 3), 300)
        .key(Key.at(delay + 0.5).setEasing(1 / 3), 120)
        .key(Key.at(delay + 1).setEasing(1 / 3), 300);

    Keyed.bind(new ColorLerp(), color(0), (c) => b.setColor(c))
        .key(delay, color(0))
        .key(delay + 0.5, color(230, 60, 60))
        .key(delay + 1, color(0));
}
```

The balls are always up to date and simply draw themselves.

??? example "Full sketch: ObjectBinding"
    ```js
    --8<-- "05_Binding/ObjectBinding/sketch.js"
    ```

Next: [Paths](paths.md).
