# 7. Effects

Effects change a value **on top of** its keys: shake it, circle it, snap it to a grid, or let it spring after the keyed motion. Add them with `addEffect()`.

## Wiggle

<div class="sketch" data-sketch="07_Effects/WiggleEffect"></div>

`Wiggle(amplitude, frequency)` adds a smooth random offset of up to ±`amplitude`, changing direction about `frequency` times per second, inspired by After Effects' `wiggle()`. Effects work even without keys: the value is just its default, and the effect still moves it.

```js
gentle = Keyed.ofVector(createVector(300, 80))
    .addEffect(new Wiggle(10, 1));

// An amplitude per axis: this one only moves up and down.
vertical = Keyed.ofVector(createVector(300, 320))
    .addEffect(new Wiggle(createVector(0, 30), 2));
```

Every `Wiggle` moves differently. Pass a seed as a third argument, and wiggles with the same seed and settings move the same way. On a looping timeline, `Wiggle` loops seamlessly when duration × frequency is a whole number.

??? example "Full sketch: WiggleEffect"
    ```js
    --8<-- "07_Effects/WiggleEffect/sketch.js"
    ```

## Orbit

<div class="sketch" data-sketch="07_Effects/OrbitEffect"></div>

`Orbit(radius, frequency)` circles around the value, `frequency` times per second. `Orbit(radius, frequency, axis)` circles around any 3D axis instead.

```js
ball = motion().addEffect(new Orbit(30, 2));
```

2 circles per second in a 4 second loop is a whole number of circles, so the loop is seamless. The trail comes from `echo()`, see [Echo](#echo) at the end of this chapter.

??? example "Full sketch: OrbitEffect"
    ```js
    --8<-- "07_Effects/OrbitEffect/sketch.js"
    ```

## Grid snap

<div class="sketch" data-sketch="07_Effects/GridSnapEffect"></div>

`GridSnap(size)` rounds x and y to multiples of `size`, so the motion jumps from cell to cell. `GridSnap(sizeX, sizeY)` uses a size per axis, and 0 leaves that axis alone:

```js
snapped = motion().addEffect(new GridSnap(grid));
snappedX = motion().addEffect(new GridSnap(grid, 0));
```

??? example "Full sketch: GridSnapEffect"
    ```js
    --8<-- "07_Effects/GridSnapEffect/sketch.js"
    ```

## Spring

<div class="sketch" data-sketch="07_Effects/SpringEffect"></div>

`Spring(lerp, frequency, damping)` follows the value like a spring: it lags behind, overshoots and settles. `frequency` is in wobbles per second; `damping` goes from 0 (wobbles forever) to 1 (no wobble).

```js
stiff = jump().addEffect(new Spring(new FloatLerp(), 4, 0.6));
wobbly = jump().addEffect(new Spring(new FloatLerp(), 2, 0.4));
```

Spring needs a `Lerp` to work with any type. For `p5.Vector`s there is a shortcut: `Effect.spring(2, 0.4)`.

??? example "Full sketch: SpringEffect"
    ```js
    --8<-- "07_Effects/SpringEffect/sketch.js"
    ```

## Lag

<div class="sketch" data-sketch="07_Effects/LagEffect"></div>

`Lag` averages the value over the last `duration` seconds: it trails behind and rounds off sharp corners, without overshooting. More samples is smoother, but each one costs an evaluation.

```js
shortLag = squareMotion().addEffect(Effect.lag(0.3, 10));
longLag = squareMotion().addEffect(Effect.lag(1, 30));
```

`Effect.lag()` is the shortcut for `p5.Vector`s; other types use `new Lag(lerp, duration, samples)`.

??? example "Full sketch: LagEffect"
    ```js
    --8<-- "07_Effects/LagEffect/sketch.js"
    ```

## Stop motion

<div class="sketch" data-sketch="07_Effects/StopMotionEffect"></div>

`StopMotion(step)` holds each pose for `step` seconds, whatever the keys. `2 / 24` is "on twos" at 24 fps, common in hand-drawn animation.

```js
onTwos = sweep().addEffect(new StopMotion(2 / 24));
choppy = sweep().addEffect(new StopMotion(0.25));
```

Unlike `Key.hold()`, which holds single keys, `StopMotion` samples the whole animation at a fixed rate.

??? example "Full sketch: StopMotionEffect"
    ```js
    --8<-- "07_Effects/StopMotionEffect/sketch.js"
    ```

## Stacking effects

<div class="sketch" data-sketch="07_Effects/Stacking"></div>

`addEffect()` can be called several times. Effects apply in the order they are added, each one to the result of the one before, so the order matters:

```js
// Orbit, then GridSnap: the whole circle snaps to the grid.
snapLast = motion(130)
    .addEffect(new Orbit(40, 1))
    .addEffect(new GridSnap(grid));

// GridSnap, then Orbit: only the center snaps, the circle stays smooth.
snapFirst = motion(290)
    .addEffect(new GridSnap(grid))
    .addEffect(new Orbit(40, 1));
```

??? example "Full sketch: Stacking"
    ```js
    --8<-- "07_Effects/Stacking/sketch.js"
    ```

## Custom effects

<div class="sketch" data-sketch="07_Effects/CustomEffect"></div>

Writing your own effect takes one line. In p5.keyed, a custom effect always gets the animation itself as `source` and the time `t`, so it can either read the current value with `source(t)` or sample any other time. Spring and Lag use the same idea.

```js
// Bobs up and down twice per second.
const bob = (source, t) => {
    const p = source(t);
    return createVector(p.x, p.y + 15 * sin(t * TWO_PI * 2));
};
bobbing = sweep(210).addEffect(bob);

// Plays the animation half a second late.
const late = (source, t) => source(t - 0.5);
delayed = sweep(330).addEffect(late);
```

Effects can also be classes with an `apply(source, t)` method.

??? example "Full sketch: CustomEffect"
    ```js
    --8<-- "07_Effects/CustomEffect/sketch.js"
    ```

## Avoid (a custom effect)

<div class="sketch" data-sketch="07_Effects/Avoid"></div>

A custom effect can also take parameters: write a function that returns it. This one keeps a path out of a circle. Points inside are pushed onto its edge, so the motion walks around the obstacle instead of passing through it:

```js
function avoid(center, r, soft) {
    return (source, t) => {
        const p = source(t);
        const away = p5.Vector.sub(p, center);
        const d = away.mag();
        if (d >= r + soft || d === 0) return p;
        const h = max(soft - abs(d - r), 0) / soft;
        const target = max(d, r) + h * h * soft / 4;
        return p5.Vector.add(center, away.setMag(target));
    };
}

pos.addEffect(avoid(obstacle, radius, softness));
```

`target` is a smooth `max(d, r)`: the distance never drops below `r`, and `soft` rounds off the corners where the path meets the circle. The effect keeps a reference to `obstacle`, so changing it with `obstacle.set()` moves the obstacle. If the path runs right through the center, the motion swaps sides quickly there.

??? example "Full sketch: Avoid"
    ```js
    --8<-- "07_Effects/Avoid/sketch.js"
    ```

## Echo (motion trails) { #echo }

<div class="sketch" data-sketch="07_Effects/Echo"></div>

Not an effect per se, but a related tool: `echo(samples, delay)` returns the value now, `delay` seconds ago, `2 * delay` seconds ago, and so on. That's a ready-made motion trail:

```js
const trail = pos.echo(12, 0.04);

for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i];
    fill(0, map(i, 0, trail.length, 255, 20));
    circle(p.x, p.y, 40 - i * 2);
}
```

Drawing oldest first puts the current position on top. A negative delay samples the future instead.

??? example "Full sketch: Echo"
    ```js
    --8<-- "07_Effects/Echo/sketch.js"
    ```

Next: [Types](types.md).
