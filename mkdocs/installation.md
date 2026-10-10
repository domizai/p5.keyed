# Installation

p5.keyed is an add-on for **p5.js 2.x**. Load it after p5.js and it hooks itself into every sketch.

## Script tag

Download `p5.keyed.js` (or the smaller `p5.keyed.min.js`) from the `lib` folder of the library and load it after p5.js in your `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2/lib/p5.min.js"></script>
<script src="p5.keyed.js"></script>
<script src="sketch.js"></script>
```

That's all: the library registers itself with p5 and adds its classes (`Keyed`, `Key`, `Easing`, `Timeline`, ...) as globals.

## p5.js Web Editor

Upload `p5.keyed.js` to your sketch and add it to `index.html` after the p5.js script tag, like above. The editor must use p5.js 2.x.

## ES modules

With a bundler, import p5 and the library, and register the add-on before creating a sketch:

```js
import p5 from 'p5';
import { keyedAddon, Keyed, Key, Easing } from 'p5.keyed';

p5.registerAddon(keyedAddon);

new p5((p) => {
    let x;

    p.setup = () => {
        p.createCanvas(400, 400);
        // In instance mode, pass the sketch.
        Keyed.init(p).setDuration(2);
        x = Keyed.ofFloat().key(0, 50).key(1, 350).key(2, 50);
    };

    p.draw = () => {
        p.background(255);
        p.circle(x.value(), p.height / 2, 40);
    };
});
```

The library comes with TypeScript types.

## Build from source

```bash
npm install
npm run build
```

builds `lib/p5.keyed.js`, `lib/p5.keyed.min.js` and `lib/p5.keyed.esm.js`.

## Usage

Everything is a global in a normal sketch, there is nothing to import:

```js
Keyed.init().setDuration(2);       // in setup()
Keyed.ofFloat().key(0, 0).key(1, 100);
new Wiggle(10, 1);                 // effects
new FloatLerp();                   // lerps
new CubicBezier(a, b, c, d);       // paths
new Quaternion(1, 0, 0, 0);        // types
```

The examples live in the `examples` folder of the library, and every sketch in this tutorial is one of them.

Next: [Getting Started](tutorial/basics.md).
