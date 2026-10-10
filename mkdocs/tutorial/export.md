# 10. Export

To turn a sketch into a GIF or a frame sequence, the timeline has to advance by exactly the same amount every `draw()`. Saving is slow, and a timeline that follows the real clock skips ahead to stay on time. The frames end up unevenly timed, and the export plays at the wrong speed.

## Save frames

<div class="sketch" data-sketch="10_Export/SaveFrames"></div>

`setFixedStep()` makes every `draw()` advance the timeline by exactly the same amount, however long it takes:

```js
const fps = 30;

function setup() {
    frameRate(fps);
    tm = Keyed.init().setDuration(duration);
    tm.setFixedStep(1 / fps);
}
```

To do the same for all timelines, set it globally before creating them:

```js
Keyed.setFrameRate(fps);
Keyed.sync(false);
Keyed.init();
```

To record exactly one loop, start recording in `onLoop()`:

```js
tm.onLoop(async () => {
    if (requested) {
        requested = false;
        recording = true;
        await saveGif('SaveFrames', duration);
        recording = false;
    }
});
```

With fixed-step playback, `saveGif()` stops the sketch and redraws once per frame, so it saves exactly one loop of the timeline.

To save a numbered PNG sequence instead, call `saveCanvas(nf(frame, 4), 'png')` at the end of `draw()` while recording, and count the frames yourself.

!!! info
    The GIF on this page was made this way: the sketch runs with `setFixedStep(1 / fps)`, and `saveGif()` redraws one frame per step.

??? example "Full sketch: SaveFrames"
    ```js
    --8<-- "10_Export/SaveFrames/sketch.js"
    ```

That's the end of the tutorial. For a compact summary of everything, see the [API Overview](../api.md).
