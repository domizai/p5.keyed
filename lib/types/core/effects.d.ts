import type p5 from 'p5';
import { type Lerp } from './lerps.js';
import type { Tween } from './tween.js';
/**
 * Changes a value on top of its keys. It gets the animation as a function of time and the time itself, so it can read
 * the value at any other time: `(source, t) => source(t - 0.5)` plays the animation half a second late.
 */
export type TimeEffect<T> = (source: Tween<T>, t: number) => T;
/** An effect as an object, like the classes below: anything with an apply(source, t) method. */
export interface TimeEffectObject<T> {
    apply(source: Tween<T>, t: number): T;
}
/** Snaps x and y to a grid. */
export declare class GridSnap implements TimeEffectObject<p5.Vector> {
    #private;
    /** Snaps x and y to multiples of size; z is untouched. With two sizes, 0 leaves that axis untouched. */
    constructor(size: number);
    constructor(sizeX: number, sizeY: number);
    apply(source: Tween<p5.Vector>, t: number): p5.Vector;
}
/** Circular motion around the value. */
export declare class Orbit implements TimeEffectObject<p5.Vector> {
    #private;
    /** Orbits in the XY plane, or in the plane perpendicular to axis, turning by the right-hand rule. frequency is in cycles per second. */
    constructor(radius: number, frequency: number, axis?: p5.Vector);
    apply(source: Tween<p5.Vector>, t: number): p5.Vector;
}
/** Smooth random offset, like After Effects' wiggle(); the offset per axis stays within ±amplitude. */
export declare class Wiggle implements TimeEffectObject<p5.Vector> {
    #private;
    /**
     * amplitude is a number for x and y, or a vector per axis (set z to wiggle in 3D). frequency is in wiggles per second.
     * The same seed and settings always give the same motion; without a seed, each Wiggle gets its own.
     */
    constructor(amplitude: number | p5.Vector, frequency: number, seed?: number);
    apply(source: Tween<p5.Vector>, t: number): p5.Vector;
}
/** Holds each pose for step seconds; 2 / 24 animates "on twos" at 24 fps. */
export declare class StopMotion<T> implements TimeEffectObject<T> {
    #private;
    constructor(step: number);
    apply(source: Tween<T>, t: number): T;
}
/** Averages the value over the last duration seconds: trails behind and smooths out sharp moves, without overshoot. */
export declare class Lag<T> implements TimeEffectObject<T> {
    #private;
    /** duration is in seconds; more samples is smoother but costs one source evaluation each. */
    constructor(lerp: Lerp<T>, duration: number, samples: number);
    apply(source: Tween<T>, t: number): T;
}
/**
 * Damped spring following the value: lags while it moves, overshoots and settles when it stops.
 * Needs a lerp that extrapolates beyond [0, 1] (VectorLerp, FloatLerp); ColorLerp clamps, so there is no overshoot.
 */
export declare class Spring<T> implements TimeEffectObject<T> {
    #private;
    /**
     * frequency: oscillations per second; keep it below half the frame rate or the wobble can't be seen.
     * damping: ratio in (0, 1); lower wobbles longer and costs more samples.
     */
    constructor(lerp: Lerp<T>, frequency: number, damping: number);
    apply(source: Tween<T>, t: number): T;
}
/** Shortcuts for p5.Vector values: the same arguments as the constructors. */
export declare const Effect: {
    /** Smooth random offset in x and y within ±amplitude; frequency in wiggles per second. */
    readonly wiggle: (amplitude: number | p5.Vector, frequency: number, seed?: number) => Wiggle;
    /** Circles in the XY plane, or around axis; frequency in cycles per second. */
    readonly orbit: (radius: number, frequency: number, axis?: p5.Vector) => Orbit;
    /** Snaps x and y to multiples of sizeX and sizeY (size alone: both); 0 leaves that axis untouched. */
    readonly gridSnap: (sizeX: number, sizeY?: number) => GridSnap;
    /** Damped spring; frequency in oscillations per second, damping in (0, 1). */
    readonly spring: (frequency: number, damping: number) => Spring<p5.Vector>;
    /** Averages over the last duration seconds from samples evaluations. */
    readonly lag: (duration: number, samples: number) => Lag<p5.Vector>;
};
