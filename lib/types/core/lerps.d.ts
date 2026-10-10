import type p5 from 'p5';
/** Blends two values of a type: a at d = 0, b at d = 1. */
export type LerpFunction<T> = (a: T, b: T, d: number) => T;
/** Blends two values of a type with a lerp() method, like the lerp classes below. */
export interface LerpObject<T> {
    lerp(a: T, b: T, d: number): T;
}
/** Anything that blends: a function (a, b, d) => value or an object with lerp(a, b, d). */
export type Lerp<T> = LerpFunction<T> | LerpObject<T>;
/** Linear blend for numbers. */
export declare class FloatLerp implements LerpObject<number> {
    lerp(a: number, b: number, d: number): number;
}
/** Linear blend for integers. */
export declare class IntLerp implements LerpObject<number> {
    /** Rounds to the nearest integer; pass round (e.g. Math.floor or Math.ceil) to convert the unrounded blend differently. */
    lerp(a: number, b: number, d: number, round?: (v: number) => number): number;
}
/** Blends angles in radians the short way round, e.g. 350° to 10° turns 20°, not 340°. */
export declare class AngleLerp implements LerpObject<number> {
    lerp(a: number, b: number, t: number): number;
}
/**
 * Holds a until the blend reaches the threshold, then jumps to b; for values that can't blend.
 * Returns the keys themselves, so only use it with immutable values (strings, numbers, frozen objects, ...).
 */
export declare class StepLerp<T> implements LerpObject<T> {
    #private;
    /** Switches exactly at the next key by default; e.g. 0.5 switches halfway between keys (easing shifts when that happens). */
    constructor(threshold?: number);
    lerp(a: T, b: T, t: number): T;
}
/** A StepLerp for booleans. */
export declare class BooleanLerp extends StepLerp<boolean> {
}
/** Linear blend for p5.Vectors: x, y and z, in 3D if either vector is 3D. Always returns a new vector. */
export declare class VectorLerp implements LerpObject<p5.Vector> {
    lerp(a: p5.Vector, b: p5.Vector, d: number): p5.Vector;
}
/**
 * Blends p5.Colors like p5's lerpColor(): in the color space of the colors themselves, so colors made in RGB blend
 * in RGB and colors made in HSB blend in HSB. The result is in a's color mode. d is clamped to [0, 1].
 */
export declare class ColorLerp implements LerpObject<p5.Color> {
    lerp(a: p5.Color, b: p5.Color, d: number): p5.Color;
}
/** Morphs a into b with the fewest single-character edits (Levenshtein), applied left to right. */
export declare class StringLerp implements LerpObject<string> {
    #private;
    lerp(a: string, b: string, t: number): string;
}
