# 3. Timelines

So far every value followed the default timeline returned by `Keyed.init()`. In this chapter you create timelines of your own, control their playback, scrub through them, run several at once, retime keys with pins, and count in frames instead of seconds.

## Controls

<div class="sketch" data-sketch="03_Timeline/Controls"></div>

A `Timeline` is a clock. Create one with `new Timeline()` and attach values to it with `setTimeline()`:

```js
Keyed.init();

tm = new Timeline().setDuration(3);

x = Keyed.ofFloat()
    .setTimeline(tm)
    .key(Key.at(0).setEasing(1 / 3), 60)
    .key(Key.at(1.5).setEasing(1 / 3), 340)
    .key(Key.at(3).setEasing(1 / 3), 60);
```

!!! note
    Call `Keyed.init()` first: only timelines created after it advance with the sketch.

The timeline can then be controlled while it runs:

| Method | What it does |
|---|---|
| `play(playing = true)` | pauses or resumes; `isPlaying()` tells which |
| `to(t)` | jumps to time `t` |
| `setSpeed(s)` | `2` is twice as fast; negative speeds play backwards |
| `loop(loop = true)` | without looping, the timeline stops at its duration |
| `t()` | the current time |
| `isFinished()` | whether a non-looping timeline reached its end |

In the sketch, ++space++ pauses or resumes, ++left++ and ++right++ change the speed, ++l++ toggles looping, and ++r++ jumps back to the start.

??? example "Full sketch: Controls"
    ```js
    --8<-- "03_Timeline/Controls/sketch.js"
    ```

## Scrubbing

<div class="sketch" data-sketch="03_Timeline/Scrubbing"></div>

Because `to(t)` jumps to any time, a progress bar is easy to make draggable. Pause while dragging, so the timeline doesn't advance on its own:

```js
function draw() {
    if (mouseIsPressed) {
        const t = map(constrain(mouseX, barX0, barX1), barX0, barX1, 0, tm.duration());
        tm.to(t);
    }
    // ...
}

function mousePressed() {
    tm.play(false);
}

function mouseReleased() {
    tm.play(true);
}
```

??? example "Full sketch: Scrubbing"
    ```js
    --8<-- "03_Timeline/Scrubbing/sketch.js"
    ```

## Multiple timelines

<div class="sketch" data-sketch="03_Timeline/Multiple"></div>

Each timeline is an independent clock. Here the spinner loops on the default timeline, while a card slides in on a second timeline that **plays once**. Pass `false` as the second argument of `setDuration()` to turn looping off:

```js
intro = new Timeline().setDuration(1.2, false);

cardY = Keyed.ofFloat()
    .setTimeline(intro)
    .key(Key.at(0).setEasing(Easing.CUBIC_OUT), 420)
    .key(1.2, 180);
```

Clicking calls `intro.to(0)`, which replays the intro without affecting the spinner.

??? example "Full sketch: Multiple"
    ```js
    --8<-- "03_Timeline/Multiple/sketch.js"
    ```

## Pins

<div class="sketch" data-sketch="03_Timeline/Pins"></div>

When several values share a moment, say a ball arriving while it grows and turns red, retiming means editing every key. A `Pin` is a point in time that several keys can share. Pass the pin instead of a time:

```js
arrive = Pin.at(1);

x = Keyed.ofFloat()
    .key(Key.at(0).setEasing(1 / 3), 60)
    .key(Key.at(arrive).setEasing(1 / 3), 340)
    .key(Key.at(duration).setEasing(1 / 3), 60);

ballSize = Keyed.ofFloat()
    .key(0, 20)
    .key(arrive, 80)
    .key(duration, 20);
```

Now `arrive.to(t)` moves the key in all values at once. Drag the pin in the sketch to try it. Use `addListener()` to get notified when a pin moves.

??? example "Full sketch: Pins"
    ```js
    --8<-- "03_Timeline/Pins/sketch.js"
    ```

## Frames instead of seconds

<div class="sketch" data-sketch="03_Timeline/FrameUnit"></div>

If you think in frames, set the unit before creating timelines. Keyed can't read the sketch's frame rate, so pass the same value:

```js
frameRate(30);
Keyed.setFrameRate(30);
Keyed.setUnit(Keyed.FRAME);
Keyed.init();
```

Key times are then frames: keys at 0, 45 and 90 are 3 seconds at 30 fps.

This sketch also shows the two ways a timeline can advance:

- `sync(true)`, the default, follows the real clock. If `draw()` is slow, it **skips ahead** to stay on time.
- `sync(false)` advances exactly one frame per `draw()`. If `draw()` is slow, it **slows down**, but never skips a frame.

In the sketch, `draw()` is slowed down for a moment while the mouse is held down: the top ball jumps ahead while the bottom one falls behind. `sync(false)` is what you want for [exports](export.md).

??? example "Full sketch: FrameUnit"
    ```js
    --8<-- "03_Timeline/FrameUnit/sketch.js"
    ```

Next: [Events](events.md).
