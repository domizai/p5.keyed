# p5keyed

## Getting Started

Open `index.html` in your web browser and start editing `sketch.js`.

## Running Locally

For projects with media files, use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server extension
# Right-click index.html -> "Open with Live Server"
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

The examples in `examples/` load `lib/p5.keyed.js`, so build first and serve the folder (see above).

## Resources

- [p5.js 2.0](https://beta.p5js.org/)
- [p5.js Reference](https://p5js.org/reference/)
