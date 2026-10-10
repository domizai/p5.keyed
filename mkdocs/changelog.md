# Changelog

## 0.1.0

First release: the p5.js port of Keyed.

- Keyed values for numbers, vectors, colors, strings, booleans and custom lerpable objects
- Easing curves, keys, pins and independent timelines
- Events with markers, loop callbacks and finish callbacks
- Binding to properties and setter functions
- Paths, tweens and path slicing
- Effects including wiggle, orbit, grid snap, spring, lag, stop motion and echo
- Extra types including `ShapeMorph` and `Quaternion`
- Reusable `Composition` animations
- Export workflows for fixed-step GIFs and PNG sequences

Differences from the Processing version:

- Uses `p5.Vector` and `p5.Color` values
- Effects are only in `(source, t) => value` form
- The binder runs after the timelines, so there is no one-frame lag
- The library is exposed as globals instead of Java imports
- Export uses `saveGif()` or `saveCanvas()` instead of Processing tools
- `Wiggle` uses a different noise implementation
- Toggle methods default to `true`
