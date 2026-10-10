// @vitest-environment happy-dom
import p5 from 'p5';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Keyed, Quaternion, ShapeMorph, Unit, settings } from '../src/core';
import { env } from '../src/core/env';

beforeAll(() => {
    env.p5 = p5 as never;
});

beforeEach(() => {
    Object.assign(settings, { unit: Unit.SECOND, synced: true, autoplay: true, frameRate: 60 });
    env.claim = undefined;
    env.sketch = undefined;
    Keyed.init();
});

const V = (x: number, y: number, z?: number) => (z === undefined ? new p5.Vector(x, y) : new p5.Vector(x, y, z));
const near = (a: number, b: number, digits = 6) => expect(a).toBeCloseTo(b, digits);

// Rotates a point with a quaternion, as an independent reference: q * v * q^-1.
const rotate = (q: Quaternion, v: [number, number, number]): number[] => {
    const [x, y, z] = v;
    const { w, x: qx, y: qy, z: qz } = q;
    // v' = v + 2w (u × v) + 2 u × (u × v), with u = (qx, qy, qz)
    const cx = qy * z - qz * y, cy = qz * x - qx * z, cz = qx * y - qy * x;
    const dx = qy * cz - qz * cy, dy = qz * cx - qx * cz, dz = qx * cy - qy * cx;
    return [x + 2 * (w * cx + dx), y + 2 * (w * cy + dy), z + 2 * (w * cz + dz)];
};
const expectVec = (a: number[], b: number[]) => a.forEach((v, i) => near(v, b[i]!, 6));

describe('Quaternion', () => {
    it('is normalized and rejects a zero or non-finite length', () => {
        const q = new Quaternion(2, 0, 0, 0);
        expect([q.w, q.x, q.y, q.z]).toEqual([1, 0, 0, 0]);
        const n = new Quaternion(1, 2, 3, 4);
        near(Math.hypot(n.w, n.x, n.y, n.z), 1);
        expect(() => new Quaternion(0, 0, 0, 0)).toThrow(RangeError);
        expect(() => new Quaternion(NaN, 0, 0, 0)).toThrow(RangeError);
        expect(() => new Quaternion(Infinity, 0, 0, 0)).toThrow(RangeError);
    });

    it('rotates counterclockwise around an axis, like p5 rotate(angle, axis)', () => {
        const q = Quaternion.fromAxisAngle(V(0, 0, 1), Math.PI / 2);
        expectVec(rotate(q, [1, 0, 0]), [0, 1, 0]);
        const r = Quaternion.fromAxisAngle([1, 0, 0], Math.PI / 2);
        expectVec(rotate(r, [0, 1, 0]), [0, 0, 1]);
        const s = Quaternion.fromAxisAngle(V(2, 0, 0), Math.PI / 2);
        expectVec(rotate(s, [0, 1, 0]), [0, 0, 1]);
    });

    it('does not touch the axis vector and rejects a zero axis', () => {
        const axis = V(0, 0, 5);
        Quaternion.fromAxisAngle(axis, 1);
        expect(axis.z).toBe(5);
        expect(() => Quaternion.fromAxisAngle(V(0, 0, 0), 1)).toThrow(RangeError);
        expect(() => Quaternion.fromAxisAngle([0, 0, 0], 1)).toThrow(RangeError);
    });

    it('applies o first, then this, when combined with mult()', () => {
        const rx = Quaternion.fromAxisAngle([1, 0, 0], Math.PI / 2);
        const rz = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
        // this = rz, o = rx: rotate by x first, then by z.
        const v: [number, number, number] = [0, 1, 0];
        expectVec(rotate(rz.mult(rx), v), rotate(rz, rotate(rx, v) as [number, number, number]));
        expectVec(rotate(rx.mult(rz), v), rotate(rx, rotate(rz, v) as [number, number, number]));
        expect(rotate(rz.mult(rx), v)).not.toEqual(rotate(rx.mult(rz), v));
    });

    it('reports its angle and axis', () => {
        const q = Quaternion.fromAxisAngle([0, 3, 0], 1.2);
        near(q.angle(), 1.2);
        expectVec(q.axis(), [0, 1, 0]);
        expect(Quaternion.identity().angle()).toBe(0);
        expect(Quaternion.identity().axis()).toEqual([1, 0, 0]);
    });

    it('slerps along the shortest arc at constant speed', () => {
        const a = Quaternion.identity();
        const b = Quaternion.fromAxisAngle([0, 1, 0], 1);
        for (const d of [0, 0.25, 0.5, 1]) near(a.lerp(b, d).angle(), d, 6);
        expectVec(a.lerp(b, 0.5).axis(), [0, 1, 0]);
        expect(a.lerp(b, 0)).toMatchObject({ w: 1, x: 0, y: 0, z: 0 });
    });

    it('takes the short way round when the other quaternion is on the far side', () => {
        const a = Quaternion.fromAxisAngle([0, 0, 1], 0.1);
        const b = Quaternion.fromAxisAngle([0, 0, 1], 0.1 + 2 * Math.PI - 0.2); // same rotation as -0.1
        const mid = a.lerp(b, 0.5);
        expectVec(rotate(mid, [1, 0, 0]), [1, 0, 0]);
    });

    it('stays normalized and finite for equal, near-equal and opposite rotations', () => {
        const q = Quaternion.fromAxisAngle([1, 2, 3], 0.7);
        const neg = new Quaternion(-q.w, -q.x, -q.y, -q.z);
        for (const other of [q, neg, Quaternion.fromAxisAngle([1, 2, 3], 0.7001), Quaternion.fromAxisAngle([1, 2, 3], Math.PI + 0.7)]) {
            for (const d of [0, 0.3, 1]) {
                const r = q.lerp(other, d);
                near(Math.hypot(r.w, r.x, r.y, r.z), 1);
                expect([r.w, r.x, r.y, r.z].every(Number.isFinite)).toBe(true);
            }
        }
    });

    it('works as a Keyed value without a lerp', () => {
        const k = Keyed.of(Quaternion.identity()).key(0, Quaternion.identity()).key(2, Quaternion.fromAxisAngle([0, 1, 0], 1));
        near(k.value(1).angle(), 0.5);
        near(k.value(2).angle(), 1);
    });

    it('apply() rotates the matrix of the given target, or of the sketch', () => {
        const calls: unknown[][] = [];
        const g = { rotate: (...args: unknown[]) => calls.push(args) };
        const q = Quaternion.fromAxisAngle([0, 0, 2], 0.5);
        q.apply(g);
        expect(calls).toHaveLength(1);
        near(calls[0]![0] as number, 0.5);
        expectVec(calls[0]![1] as number[], [0, 0, 1]);
        expect(() => q.apply()).toThrow(/no sketch/);
        env.sketch = () => g;
        q.apply();
        expect(calls).toHaveLength(2);
    });

    it('toString() lists the components', () => {
        expect(Quaternion.identity().toString()).toBe('[ 1, 0, 0, 0 ]');
    });
});

describe('ShapeMorph', () => {
    const square = () => new ShapeMorph([V(0, 0), V(10, 0), V(10, 10), V(0, 10)]);
    const triangle = () => new ShapeMorph([V(0, 0), V(10, 0), V(5, 10)]);
    const xy = (s: ShapeMorph) => s.points.map((p) => [p.x, p.y]);

    it('copies the points it is made of and the points it returns', () => {
        const pts = [V(0, 0), V(1, 0), V(1, 1)];
        const s = new ShapeMorph(pts);
        pts[0]!.x = 99;
        pts.pop();
        expect(s.points).toHaveLength(3);
        expect(s.points[0]!.x).toBe(0);
        const r = s.lerp(s, 0.5);
        r.points[0]!.x = 77;
        expect(s.points[0]!.x).toBe(0);
    });

    it('blends point by point and returns the end shapes at 0 and 1', () => {
        const a = square();
        const b = new ShapeMorph([V(0, 0), V(20, 0), V(20, 20), V(0, 20)]);
        expect(xy(a.lerp(b, 0))).toEqual(xy(a));
        expect(xy(a.lerp(b, 1))).toEqual(xy(b));
        expect(xy(a.lerp(b, 0.5))).toEqual([[0, 0], [15, 0], [15, 15], [0, 15]]);
    });

    it('gives the shape with fewer points extra points on its longest edges, keeping the outline', () => {
        const t = triangle();
        const r = t.lerp(square(), 0);
        expect(r.points).toHaveLength(4);
        // The longest triangle edges are (10,0)->(5,10) and (5,10)->(0,0), both 11.18 > 10; the first one is split.
        expect(xy(r)).toEqual([[0, 0], [10, 0], [7.5, 5], [5, 10]]);
        // Every point still lies on the original outline.
        const onEdge = (p: p5.Vector, a: p5.Vector, b: p5.Vector) => Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) < 1e-9;
        const [p0, p1, p2] = t.points as [p5.Vector, p5.Vector, p5.Vector];
        expect(onEdge(r.points[2]!, p1, p2)).toBe(true);
        expect(r.points[0]!.x).toBe(p0.x);
    });

    it('is symmetric in point count: the longer shape decides', () => {
        expect(triangle().lerp(square(), 0.5).points).toHaveLength(4);
        expect(square().lerp(triangle(), 0.5).points).toHaveLength(4);
        const many = new ShapeMorph(Array.from({ length: 12 }, (_, i) => V(Math.cos(i), Math.sin(i))));
        expect(triangle().lerp(many, 0.5).points).toHaveLength(12);
    });

    it('uses an empty shape as the other shape', () => {
        const e = new ShapeMorph([]);
        expect(xy(e.lerp(square(), 0.3))).toEqual(xy(square()));
        expect(xy(square().lerp(e, 0.3))).toEqual(xy(square()));
        expect(e.lerp(e, 0.5).points).toHaveLength(0);
    });

    it('morphs in 3D, and keeps 2D shapes 2D', () => {
        const flat = new ShapeMorph([V(0, 0), V(10, 0), V(10, 10)]);
        expect(flat.lerp(flat, 0.5).points.every((p) => p.dimensions === 2)).toBe(true);
        const up = new ShapeMorph([V(0, 0, 10), V(10, 0, 10), V(10, 10, 10)]);
        const mid = flat.lerp(up, 0.5);
        expect(mid.points.map((p) => p.z)).toEqual([5, 5, 5]);
        expect(up.lerp(flat, 0.5).points.every((p) => p.dimensions === 3)).toBe(true);
    });

    it('measures edges in 3D when a shape mixes 2D and 3D points', () => {
        // The edge (0,0) -> (1,0,100) is the longest only because of z.
        const mixed = new ShapeMorph([V(0, 0), V(1, 0, 100), V(2, 0, 100), V(3, 0)]);
        const four = new ShapeMorph([V(0, 0), V(1, 0), V(2, 0), V(3, 0), V(4, 0)]);
        const r = mixed.lerp(four, 0);
        expect(r.points).toHaveLength(5);
        expect(r.points[1]!.z).toBeCloseTo(50);
    });

    it('works as a Keyed value without a lerp', () => {
        const k = Keyed.of(triangle()).key(0, triangle()).key(2, square());
        expect(k.value(1).points).toHaveLength(4);
        // Inside the keys the shapes are always blended, so the triangle already has the square's point count.
        expect(xy(k.value(0))).toEqual([[0, 0], [10, 0], [7.5, 5], [5, 10]]);
        expect(xy(k.value(2))).toEqual(xy(square()));
    });

    it('vertices() emits one vertex() per point, with z only for 3D points', () => {
        const calls: number[][] = [];
        const g = { vertex: (...args: number[]) => calls.push(args) };
        square().vertices(g);
        expect(calls).toEqual([[0, 0], [10, 0], [10, 10], [0, 10]]);
        calls.length = 0;
        new ShapeMorph([V(1, 2, 3)]).vertices(g);
        expect(calls).toEqual([[1, 2, 3]]);
        expect(() => square().vertices()).toThrow(/no sketch/);
        env.sketch = () => g;
        calls.length = 0;
        square().vertices();
        expect(calls).toHaveLength(4);
    });
});
