# p5.keyed

Keyframe animation for p5.js. Set a value at a few points in time, and p5.keyed blends everything in between, with easing, paths, effects and events. p5.keyed is the p5.js version of [Keyed for Processing](https://github.com/domizai/Keyed). 

👉 [Documentation and Tutorial](https://domizai.github.io/p5.keyed/) <br>
👉 [Try it in the p5.js Editor](https://editor.p5js.org/domizai/collections/9mOq-pRz6)

```js
let x;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(2);

    x = Keyed.ofFloat()
        .key(0, 50)
        .key(1, 350)
        .key(2, 50);
}

function draw() {
    background(255);
    circle(x.value(), height / 2, 40);
}
```

## Features

- **Any type:** numbers, colors, `p5.Vector`, strings, booleans, quaternions, shapes, or your own classes and plain objects.
- **Easing:** After Effects style influence, the usual presets, CSS-like `cubicBezier()`, steps, or any function.
- **Timelines:** loop, play once, pause, scrub, change speed, play backwards, or run several clocks side by side.
- **Pins:** retime many keys at once by moving a single point in time.
- **Events:** markers and loop/finish callbacks.
- **Binding:** let Keyed write animated values straight into your objects.
- **Paths:** move along Béziers, splines and chained curves, in 2D or 3D.
- **Effects:** wiggle, orbit, spring, lag, stop motion, grid snap, motion trails, or your own.
- **Composition:** reusable, self-contained animations on their own timeline.
- **Export:** frame-exact timing for `saveGif()` and `saveCanvas()`.

## Installation

p5.keyed is an add-on for p5.js 2.x. Load it from the CDN after p5.js:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2/lib/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.keyed@1/lib/p5.keyed.min.js"></script>
<script src="sketch.js"></script>
```

Or install it with npm and load `node_modules/p5.keyed/lib/p5.keyed.js`, or import the ES module in a bundler:

```sh
npm install p5.keyed
```

```js
import p5 from 'p5';
import { keyedAddon, Keyed } from 'p5.keyed';

p5.registerAddon(keyedAddon);
```

See the [installation page](https://domizai.github.io/p5.keyed/installation.html) for instance mode, global mode with a bundler and editor types.

## Examples

The library comes with examples in the `examples` folder, grouped like the chapters of the [tutorial](https://domizai.github.io/p5.keyed/). Build the library first, then serve the folder and open an example, e.g. `examples/01_Basics/FirstKey/index.html`:

```bash
npm install
npm run build
python3 -m http.server 8000
```

## Development

Needs Node.js. The library is written in TypeScript (`src/`), the compiled files land in `lib/`.

```bash
npm install
npm run build        # lib/p5.keyed.js (script tag), .min.js, .esm.js and lib/types
npm run watch        # rebuild lib/p5.keyed.js on every change
npm test             # unit tests (vitest)
npm run typecheck
```

The documentation is built with MkDocs Material (`mkdocs.yml`, sources in `mkdocs/`). The sketches in it are live: they run the files in `examples/`.

```bash
uv sync
uv run mkdocs serve  # or: uv run mkdocs build
```

* * *

Tested with p5.js 2.0.0 to 2.3.4 and Node 20 and 24.

AI coding assistants were used to port [Keyed](https://github.com/domizai/Keyed) to p5.js, including the tests, examples and documentation.
