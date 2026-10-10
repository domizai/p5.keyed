import type p5 from 'p5';
import { drawTarget } from './env';
import type { Lerpable } from './lerpable';
import { VectorLerp } from './lerps';

const vectorLerp = new VectorLerp();

/**
 * A closed polygon that morphs point by point. The shape with fewer points gets extra points on its longest edges,
 * so its outline stays the same and corners stay sharp. Start both shapes at the same angle to avoid twisting.
 */
export class ShapeMorph implements Lerpable<ShapeMorph> {
    readonly points: readonly p5.Vector[];

    /** Copies the points, so changing the array afterwards doesn't change this shape. */
    constructor(points: readonly p5.Vector[]) {
        this.points = copy(points);
    }

    lerp(b: ShapeMorph, d: number): ShapeMorph {
        if (this.points.length === 0) return new ShapeMorph(b.points);
        if (b.points.length === 0) return new ShapeMorph(this.points);

        const n = Math.max(this.points.length, b.points.length);
        const from = subdivide(this.points, n);
        const to = subdivide(b.points, n);
        return new ShapeMorph(from.map((p, i) => vectorLerp.lerp(p, to[i]!, d)));
    }

    /**
     * Emits the points as vertex() calls on g (a p5 instance or p5.Graphics, default the sketch); wrap in
     * beginShape() / endShape(CLOSE). Points that are 3D are emitted with z, which a WEBGL canvas uses.
     */
    vertices(g?: unknown): void {
        const target = drawTarget(g);
        for (const p of this.points) {
            if (p.dimensions > 2) target.vertex!(p.x, p.y, p.z);
            else target.vertex!(p.x, p.y);
        }
    }
}

function subdivide(shape: readonly p5.Vector[], n: number): p5.Vector[] {
    const pts = copy(shape);
    while (pts.length < n) {
        let longest = 0;
        let max = -1;
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i]!;
            const b = pts[(i + 1) % pts.length]!;
            // p5.Vector.dist() ignores z when either vector is 2D.
            const len = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
            if (len > max) {
                max = len;
                longest = i;
            }
        }
        const mid = vectorLerp.lerp(pts[longest]!, pts[(longest + 1) % pts.length]!, 0.5);
        pts.splice(longest + 1, 0, mid);
    }
    return pts;
}

function copy(shape: readonly p5.Vector[]): p5.Vector[] {
    return shape.map((p) => p.copy());
}
