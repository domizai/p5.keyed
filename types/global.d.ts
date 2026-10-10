// Types for sketches that use p5.keyed as globals (script tag, or exposeGlobals()). Add it to the types of the
// project next to p5's own, e.g. in jsconfig.json / tsconfig.json:
//   "compilerOptions": { "types": ["p5/global", "p5.keyed/global"] }
// The names in this file must be the ones exposeGlobals() sets: test/global-types.test.ts checks that.
import type * as K from './p5.keyed.js';

declare global {
    var AngleLerp: typeof K.AngleLerp;
    var BooleanLerp: typeof K.BooleanLerp;
    var ColorLerp: typeof K.ColorLerp;
    var Composition: typeof K.Composition;
    var CubicBezier: typeof K.CubicBezier;
    var Curve: typeof K.Curve;
    var Easing: typeof K.Easing;
    var Effect: typeof K.Effect;
    var FloatLerp: typeof K.FloatLerp;
    var GridSnap: typeof K.GridSnap;
    var IntLerp: typeof K.IntLerp;
    var Key: typeof K.Key;
    var Keyed: typeof K.Keyed;
    var Lag: typeof K.Lag;
    var Marker: typeof K.Marker;
    var Orbit: typeof K.Orbit;
    var Path: typeof K.Path;
    var Pin: typeof K.Pin;
    var QuadraticBezier: typeof K.QuadraticBezier;
    var Quaternion: typeof K.Quaternion;
    var ShapeMorph: typeof K.ShapeMorph;
    var Spline: typeof K.Spline;
    var Spring: typeof K.Spring;
    var StepLerp: typeof K.StepLerp;
    var StopMotion: typeof K.StopMotion;
    var StringLerp: typeof K.StringLerp;
    var Timeline: typeof K.Timeline;
    var Tween: typeof K.Tween;
    var TweenAt: typeof K.TweenAt;
    var VectorLerp: typeof K.VectorLerp;
    var Wiggle: typeof K.Wiggle;

    // The same names as types, for annotations like /** @type {Keyed<number>} */.
    type AngleLerp = K.AngleLerp;
    type BooleanLerp = K.BooleanLerp;
    type ColorLerp = K.ColorLerp;
    type Composition = K.Composition;
    type CubicBezier = K.CubicBezier;
    type Curve = K.Curve;
    type Easing = K.Easing;
    type FloatLerp = K.FloatLerp;
    type GridSnap = K.GridSnap;
    type IntLerp = K.IntLerp;
    type Key = K.Key;
    type Keyed<A> = K.Keyed<A>;
    type Lag<T> = K.Lag<T>;
    type Marker = K.Marker;
    type Orbit = K.Orbit;
    type Path = K.Path;
    type Pin = K.Pin;
    type QuadraticBezier = K.QuadraticBezier;
    type Quaternion = K.Quaternion;
    type ShapeMorph = K.ShapeMorph;
    type Spline = K.Spline;
    type Spring<T> = K.Spring<T>;
    type StepLerp<T> = K.StepLerp<T>;
    type StopMotion<T> = K.StopMotion<T>;
    type StringLerp = K.StringLerp;
    type Timeline = K.Timeline;
    type Tween<T> = K.Tween<T>;
    type TweenAt<T> = K.TweenAt<T>;
    type VectorLerp = K.VectorLerp;
    type Wiggle = K.Wiggle;
    type Lerp<T> = K.Lerp<T>;
    type Lerpable<T extends Lerpable<T>> = K.Lerpable<T>;
    type TimeEffect<T> = K.TimeEffect<T>;
}

export {};
