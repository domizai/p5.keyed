import type p5 from 'p5';
import type { Lerpable } from './lerpable.js';
type Axis = p5.Vector | readonly [number, number, number];
/** An immutable 3D rotation. Blends with slerp along the shortest arc, without gimbal lock. */
export declare class Quaternion implements Lerpable<Quaternion> {
    readonly w: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
    /** Normalized to unit length. */
    constructor(w: number, x: number, y: number, z: number);
    /** No rotation. */
    static identity(): Quaternion;
    /** Angle in radians, counterclockwise around axis (a p5.Vector or [x, y, z]) like p5's rotate(angle, axis). */
    static fromAxisAngle(axis: Axis, angle: number): Quaternion;
    /** Combines rotations: applies o first, then this. */
    mult(o: Quaternion): Quaternion;
    /** Rotation angle in radians, in [0, 2π]. */
    angle(): number;
    /** Unit rotation axis as [x, y, z]; the x axis when there is no rotation. */
    axis(): [number, number, number];
    /** Rotates the matrix of g by this rotation, like rotate(angle, axis); g is a p5 instance or p5.Graphics, default the sketch. Needs WEBGL. */
    apply(g?: unknown): void;
    lerp(b: Quaternion, d: number): Quaternion;
    toString(): string;
}
export {};
