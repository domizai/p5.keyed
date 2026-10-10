import type p5 from 'p5';
import type { Lerpable } from './lerpable.js';
/**
 * A closed polygon that morphs point by point. The shape with fewer points gets extra points on its longest edges,
 * so its outline stays the same and corners stay sharp. Start both shapes at the same angle to avoid twisting.
 */
export declare class ShapeMorph implements Lerpable<ShapeMorph> {
    readonly points: readonly p5.Vector[];
    /** Copies the points, so changing the array afterwards doesn't change this shape. */
    constructor(points: readonly p5.Vector[]);
    lerp(b: ShapeMorph, d: number): ShapeMorph;
    /**
     * Emits the points as vertex() calls on g (a p5 instance or p5.Graphics, default the sketch); wrap in
     * beginShape() / endShape(CLOSE). Points that are 3D are emitted with z, which a WEBGL canvas uses.
     */
    vertices(g?: unknown): void;
}
