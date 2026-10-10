# Installation

p5.keyed is an add-on for **p5.js 2.x**. Load it after p5.js and it hooks itself into every sketch.

## Script tag

Load p5.keyed from the CDN after p5.js in your `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@2/lib/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.keyed@1/lib/p5.keyed.min.js"></script>
<script src="sketch.js"></script>
```

`@1` takes the newest 1.x release. Use `p5.keyed@1.0.0` to pin one version, and `lib/p5.keyed.js` instead of `lib/p5.keyed.min.js` for the readable file.

That's all: the library registers itself with p5 and adds its classes (`Keyed`, `Key`, `Easing`, `Timeline`, ...) as globals. You can also download the files from the `lib` folder of the [repository](https://github.com/domizai/p5.keyed) and load them from your own folder.

## p5.js Web Editor

Add the CDN line from above to `index.html`, after the p5.js script tag. The editor must use p5.js 2.x.

## npm

```sh
npm install p5.keyed
```

p5 is a peer dependency: install `p5` 2.x next to it. Load `node_modules/p5.keyed/lib/p5.keyed.js` with a script tag, or use it as a module as below.

## ES modules

With a bundler, import p5 and the library, and register the add-on before creating a sketch. In instance mode nothing else is needed, and the module doesn't add anything to the global scope:

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

For p5's **global mode** (functions like `setup()` and `draw()` on `window`), also make the classes global, once, before the sketch starts:

```js
import { keyedAddon, exposeGlobals } from 'p5.keyed';

p5.registerAddon(keyedAddon);
exposeGlobals(); // Keyed, Key, Easing, Timeline, ... like with the script tag
```

The library comes with TypeScript types.

## Editor types

In a plain JavaScript sketch the editor doesn't know the globals and underlines `Keyed`, `Key`, `Easing` and the rest. To get completion and checking, add the types of p5 and p5.keyed to a `jsconfig.json` (or `tsconfig.json`) next to your sketch, after `npm install p5 p5.keyed`:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "checkJs": true,
    "types": ["p5/global", "p5.keyed/global"]
  }
}
```

The class names also work as types in comments, e.g. `/** @type {Keyed<number>} */ let x;`.

## Build from source

```bash
npm install
npm run build
```

builds `lib/p5.keyed.js` and `lib/p5.keyed.min.js` (script tags) and `lib/p5.keyed.esm.js` (module).

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
