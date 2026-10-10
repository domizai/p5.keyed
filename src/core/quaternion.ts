import type p5 from 'p5';
import { drawTarget } from './env';
import type { Lerpable } from './lerpable';

type Axis = p5.Vector | readonly [number, number, number];

/** An immutable 3D rotation. Blends with slerp along the shortest arc, without gimbal lock. */
export class Quaternion implements Lerpable<Quaternion> {
    readonly w: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;

    /** Normalized to unit length. */
    constructor(w: number, x: number, y: number, z: number) {
        const m = Math.hypot(w, x, y, z);
        if (!(m > 0) || !Number.isFinite(m)) throw new RangeError(`a quaternion needs a non-zero, finite length, was [${w}, ${x}, ${y}, ${z}]`);
        this.w = w / m;
        this.x = x / m;
        this.y = y / m;
        this.z = z / m;
    }

    /** No rotation. */
    static identity(): Quaternion {
        return new Quaternion(1, 0, 0, 0);
    }

    /** Angle in radians, counterclockwise around axis (a p5.Vector or [x, y, z]) like p5's rotate(angle, axis). */
    static fromAxisAngle(axis: Axis, angle: number): Quaternion {
        const [ax, ay, az] = Array.isArray(axis) ? axis : [(axis as p5.Vector).x, (axis as p5.Vector).y, (axis as p5.Vector).z];
        const m = Math.hypot(ax, ay, az);
        if (!(m > 0) || !Number.isFinite(m)) throw new RangeError('the axis must not be a zero vector');
        const s = Math.sin(angle / 2) / m;
        return new Quaternion(Math.cos(angle / 2), ax * s, ay * s, az * s);
    }

    /** Combines rotations: applies o first, then this. */
    mult(o: Quaternion): Quaternion {
        return new Quaternion(
            this.w * o.w - this.x * o.x - this.y * o.y - this.z * o.z,
            this.w * o.x + this.x * o.w + this.y * o.z - this.z * o.y,
            this.w * o.y - this.x * o.z + this.y * o.w + this.z * o.x,
            this.w * o.z + this.x * o.y - this.y * o.x + this.z * o.w,
        );
    }

    /** Rotation angle in radians, in [0, 2π]. */
    angle(): number {
        return 2 * Math.acos(Math.max(-1, Math.min(1, this.w)));
    }

    /** Unit rotation axis as [x, y, z]; the x axis when there is no rotation. */
    axis(): [number, number, number] {
        const s = Math.sqrt(Math.max(0, 1 - this.w * this.w));
        return s < 1e-9 ? [1, 0, 0] : [this.x / s, this.y / s, this.z / s];
    }

    /** Rotates the matrix of g by this rotation, like rotate(angle, axis); g is a p5 instance or p5.Graphics, default the sketch. Needs WEBGL. */
    apply(g?: unknown): void {
        drawTarget(g).rotate!(this.angle(), this.axis());
    }

    lerp(b: Quaternion, d: number): Quaternion {
        let dot = this.w * b.w + this.x * b.x + this.y * b.y + this.z * b.z;
        // q and -q are the same rotation; flipping one takes the shorter way.
        const s = dot < 0 ? -1 : 1;
        dot *= s;

        let ka: number;
        let kb: number;
        if (dot > 0.9995) {
            ka = 1 - d;
            kb = d;
        } else {
            const theta = Math.acos(dot);
            const sin = Math.sin(theta);
            ka = Math.sin((1 - d) * theta) / sin;
            kb = Math.sin(d * theta) / sin;
        }
        kb *= s;
        return new Quaternion(
            ka * this.w + kb * b.w,
            ka * this.x + kb * b.x,
            ka * this.y + kb * b.y,
            ka * this.z + kb * b.z,
        );
    }

    toString(): string {
        return `[ ${this.w}, ${this.x}, ${this.y}, ${this.z} ]`;
    }
}
