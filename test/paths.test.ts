// @vitest-environment happy-dom
import p5 from 'p5';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CubicBezier, Curve, Easing, Key, Keyed, Path, QuadraticBezier, Spline, Tween, TweenAt } from '../src/core';
import { env } from '../src/core/env';

beforeAll(() => {
    env.p5 = p5 as never;
});

const V = (x: number, y: number, z?: number) => (z === undefined ? new p5.Vector(x, y) : new p5.Vector(x, y, z));
const dist = (a: p5.Vector, b: p5.Vector) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const xy = (v: p5.Vector) => [v.x, v.y].map((n) => +n.toFixed(6));
const range = (n: number) => Array.from({ length: n + 1 }, (_, i) => i / n);

// Independent reference: arc length of a parametric function by dense sampling.
const referenceLength = (f: (t: number) => [number, number, number], steps = 20000) => {
    let total = 0;
    let prev = f(0);
    for (let i = 1; i <= steps; i++) {
        const p = f(i / steps);
        total += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
        prev = p;
    }
    return total;
};
const cubicAt = (p: p5.Vector[], t: number): [number, number, number] => {
    const u = 1 - t;
    const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    return [0, 1, 2].map((k) => p.reduce((s, q, i) => s + b[i]! * [q.x, q.y, q.z][k]!, 0)) as [number, number, number];
};

const unevenCubic = () => [V(0, 0), V(300, 0), V(0, 100), V(100, 100)] as const;

describe('constant speed', () => {
    // Position at a fraction of the arc length, from a dense table (independent of the library's own 50-step table).
    const referencePoint = (f: (t: number) => [number, number, number], fraction: number, steps = 20000) => {
        const table = [0];
        let prev = f(0);
        for (let i = 1; i <= steps; i++) {
            const p = f(i / steps);
            table.push(table[i - 1]! + Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]));
            prev = p;
        }
        const target = fraction * table[steps]!;
        let i = 1;
        while (i < steps && table[i]! < target) i++;
        const t = (i - 1 + (target - table[i - 1]!) / (table[i]! - table[i - 1]!)) / steps;
        return f(t);
    };

    it('travels a cubic Bézier at even speed, though its parameter does not', () => {
        // Steep S-curve: the curve parameter would crawl through the bends and race along the straights.
        const pts = unevenCubic();
        const path = new CubicBezier(...pts);
        const length = path.length();
        for (const d of range(40)) {
            const [rx, ry] = referencePoint((t) => cubicAt([...pts], t), d);
            const p = path.value(d);
            expect(Math.hypot(p.x - rx, p.y - ry) / length).toBeLessThan(0.01);
        }
        // Evenly spaced d gives evenly spaced points on a gentle curve.
        const gentle = new CubicBezier(V(0, 0), V(100, 0), V(200, 100), V(300, 100));
        const samples = range(40).map((d) => gentle.value(d));
        const steps = samples.slice(1).map((q, i) => dist(q, samples[i]!));
        const mean = steps.reduce((sum, v) => sum + v, 0) / steps.length;
        for (const step of steps) expect(Math.abs(step - mean) / mean).toBeLessThan(0.01);
    });

    it('starts at p0 and ends at p3, and clamps d outside 0..1', () => {
        const [a, b, c, d] = unevenCubic();
        const path = new CubicBezier(a, b, c, d);
        expect(xy(path.value(0))).toEqual([0, 0]);
        expect(xy(path.value(1))).toEqual([100, 100]);
        expect(xy(path.value(-1))).toEqual([0, 0]);
        expect(xy(path.value(2))).toEqual([100, 100]);
    });

    it('has the length of the curve', () => {
        const pts = unevenCubic();
        const path = new CubicBezier(...pts);
        expect(path.length() / referenceLength((t) => cubicAt([...pts], t))).toBeCloseTo(1, 2);

        const q = new QuadraticBezier(V(0, 0), V(100, 0), V(100, 100));
        const quadAt = (t: number): [number, number, number] => [2 * (1 - t) * t * 100 + t * t * 100, t * t * 100, 0];
        expect(q.length() / referenceLength(quadAt)).toBeCloseTo(1, 2);
    });

    it('is the straight distance when the control points lie on the line', () => {
        const q = new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0));
        expect(q.length()).toBeCloseTo(100, 6);
        expect(xy(q.value(0.5))).toEqual([50, 0]);
        expect(xy(q.value(0.25))).toEqual([25, 0]);
    });

    it('does not divide by zero when all points coincide', () => {
        const same = new CubicBezier(V(5, 5), V(5, 5), V(5, 5), V(5, 5));
        // Not exactly 0: the Bernstein weights only sum to 1 up to rounding.
        expect(same.length()).toBeCloseTo(0, 9);
        expect(xy(same.value(0.5))).toEqual([5, 5]);
        expect(xy(same.value(0))).toEqual([5, 5]);
    });
});

describe('setters', () => {
    it('rebuild the table, so length and points follow', () => {
        const q = new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0));
        expect(q.length()).toBeCloseTo(100, 6);
        q.setP2(V(200, 0)).setP1(V(100, 0));
        expect(q.length()).toBeCloseTo(200, 6);
        expect(xy(q.value(1))).toEqual([200, 0]);
        q.setP0(V(100, 0));
        expect(q.length()).toBeCloseTo(100, 6);
        q.setCurve(V(0, 0), V(0, 0), V(0, 300));
        expect(q.length()).toBeCloseTo(300, 6);

        const c = new CubicBezier(V(0, 0), V(0, 0), V(100, 0), V(100, 0));
        const before = c.length();
        c.setP1(V(0, 500));
        expect(c.length()).toBeGreaterThan(before);
        c.setCurve(V(0, 0), V(30, 0), V(60, 0), V(90, 0)).setP3(V(120, 0));
        expect(c.length()).toBeCloseTo(120, 6);
    });

    it('validate their points', () => {
        expect(() => new CubicBezier(V(0, 0), V(0, 0), V(0, 0), undefined as never)).toThrow(TypeError);
        expect(() => new QuadraticBezier(V(0, 0), [1, 2] as never, V(0, 0))).toThrow(TypeError);
        expect(() => new QuadraticBezier(V(0, 0), V(0, 0), V(0, 0)).setP1(null as never)).toThrow(TypeError);
    });
});

describe('slice', () => {
    const path = () => new CubicBezier(...unevenCubic());

    it('is the part between two normalized distances', () => {
        const full = path();
        const part = full.slice(0.25, 0.75);
        expect(xy(part.value(0))).toEqual(xy(full.value(0.25)));
        expect(xy(part.value(1))).toEqual(xy(full.value(0.75)));
        expect(xy(part.value(0.5))).toEqual(xy(full.value(0.5)));
        expect(part.length()).toBeCloseTo(full.length() / 2, 6);
    });

    it('runs backwards when t1 < t0', () => {
        const full = path();
        const back = full.slice(1, 0);
        expect(xy(back.value(0))).toEqual(xy(full.value(1)));
        expect(xy(back.value(1))).toEqual(xy(full.value(0)));
        expect(xy(back.value(0.3))).toEqual(xy(full.value(0.7)));
        expect(back.length()).toBeCloseTo(full.length(), 6);
    });

    it('clamps to 0..1 and leaves the original alone', () => {
        const full = path();
        const part = full.slice(-1, 2);
        expect(xy(part.value(0))).toEqual(xy(full.value(0)));
        expect(xy(part.value(1))).toEqual(xy(full.value(1)));
        full.slice(0.2, 0.4);
        expect(xy(full.value(1))).toEqual([100, 100]);
    });

    it('always refers to the whole path, not to the slice it is called on', () => {
        const full = path();
        expect(xy(full.slice(0.2, 0.8).slice(0, 0.5).value(1))).toEqual(xy(full.slice(0, 0.5).value(1)));
    });

    it('keeps working after the original changed', () => {
        const q = new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0));
        const half = q.slice(0, 0.5);
        q.setP2(V(400, 0));
        expect(xy(half.value(1))).toEqual([50, 0]);
    });
});

describe('Spline', () => {
    const square = [V(0, 100), V(0, 0), V(100, 0), V(100, 100), V(0, 100), V(0, 0)];

    it('passes through every point except the first and last', () => {
        const spline = new Spline(...square);
        // The curve starts at the second point and ends at the second to last.
        expect(xy(spline.value(0))).toEqual([0, 0]);
        expect(xy(spline.value(1))).toEqual([0, 100]);
        const sampled = range(2000).map((t) => spline.value(t));
        for (const p of square.slice(1, -1)) {
            expect(Math.min(...sampled.map((s) => dist(s, p)))).toBeLessThan(0.5);
        }
    });

    it('takes the points as an array too', () => {
        expect(xy(new Spline(square).value(0.3))).toEqual(xy(new Spline(...square).value(0.3)));
        expect(xy(new Spline(square.slice(0, 4)).setPoints(square).value(0.3))).toEqual(xy(new Spline(...square).value(0.3)));
    });

    it('needs at least 4 points that are points', () => {
        expect(() => new Spline(V(0, 0), V(1, 1), V(2, 2))).toThrow(RangeError);
        expect(() => new Spline([])).toThrow(RangeError);
        expect(() => new Spline(V(0, 0), V(1, 1), V(2, 2), 5 as never)).toThrow(TypeError);
    });

    it('goes straight between the points with tightness 1', () => {
        const spline = new Spline(...square).setTightness(1);
        const inner = square.slice(1, -1);
        const polyline = inner.slice(1).reduce((s, p, i) => s + dist(p, inner[i]!), 0);
        expect(spline.length()).toBeCloseTo(polyline, 6);
        // Halfway along the first side of the polyline.
        expect(xy(spline.value(50 / polyline))).toEqual([50, 0]);
    });

    it('is rounder, and longer, with tightness 0 than 1', () => {
        const round = new Spline(...square);
        const tight = new Spline(...square).setTightness(1);
        expect(round.length()).toBeGreaterThan(tight.length());
    });

    it('slices, keeping its tightness', () => {
        const spline = new Spline(...square).setTightness(0.5);
        const part = spline.slice(0, 0.5);
        expect(xy(part.value(1))).toEqual(xy(spline.value(0.5)));
        expect(xy(part.value(0.4))).toEqual(xy(spline.value(0.2)));
    });
});

describe('Spline edge cases', () => {
    it('does not throw for a zero-length spline or d outside 0..1', () => {
        const same = new Spline(V(0, 0), V(0, 0), V(0, 0), V(0, 0));
        expect(xy(same.value(0.5))).toEqual([0, 0]);
        expect(xy(same.value(-0.5))).toEqual([0, 0]);
        expect(xy(same.value(-3))).toEqual([0, 0]);
        expect(xy(same.value(7))).toEqual([0, 0]);
        expect(() => same.value(NaN)).not.toThrow();
    });

    it('notices when a referenced point gains a z coordinate', () => {
        const pts: Array<{ x: number; y: number; z?: number }> = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 30, y: 0 },
        ];
        const spline = new Spline(pts);
        expect(spline.value(0.5).dimensions).toBe(2);
        pts[2]!.z = 10;
        expect(spline.value(0.5).dimensions).toBe(3);
    });
});

describe('Curve', () => {
    const a = () => new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0)); // length 100
    const b = () => new QuadraticBezier(V(100, 0), V(100, 150), V(100, 300)); // length 300

    it('plays its paths one after another at even speed', () => {
        const curve = new Curve(a(), b());
        expect(curve.length()).toBeCloseTo(400, 6);
        expect(xy(curve.value(0))).toEqual([0, 0]);
        expect(xy(curve.value(0.125))).toEqual([50, 0]);
        expect(xy(curve.value(0.25))).toEqual([100, 0]);
        expect(xy(curve.value(0.5))).toEqual([100, 100]);
        expect(xy(curve.value(1))).toEqual([100, 300]);
    });

    it('jumps gaps between the end of a path and the start of the next', () => {
        const far = new QuadraticBezier(V(500, 500), V(500, 600), V(500, 700));
        const curve = new Curve(a(), far);
        expect(curve.length()).toBeCloseTo(300, 6);
        expect(xy(curve.value(0.25))).toEqual([75, 0]);
        // Halfway is 150 along the 300: 50 into the second path.
        expect(xy(curve.value(0.5))).toEqual([500, 550]);
    });

    it('is built with add() and add() returns a new curve', () => {
        const first = a().add(b());
        const third = new QuadraticBezier(V(100, 300), V(100, 350), V(100, 400));
        const longer = first.add(third);
        expect(first.length()).toBeCloseTo(400, 6);
        expect(longer.length()).toBeCloseTo(500, 6);
        expect(xy(longer.value(1))).toEqual([100, 400]);
        expect(xy(first.value(1))).toEqual([100, 300]);
    });

    it('nests when a slice is extended', () => {
        const half = new Curve(a(), b()).slice(0, 0.5);
        const more = half.add(a());
        expect(more.length()).toBeCloseTo(200 + 100, 6);
        expect(xy(more.value(0))).toEqual([0, 0]);
        expect(xy(more.value(1))).toEqual([100, 0]);
    });

    it('slices and reverses', () => {
        const curve = new Curve(a(), b());
        const back = curve.slice(1, 0);
        expect(xy(back.value(0))).toEqual(xy(curve.value(1)));
        expect(xy(back.value(1))).toEqual(xy(curve.value(0)));
        expect(xy(curve.slice(0.25, 0.5).value(0.5))).toEqual(xy(curve.value(0.375)));
        expect(curve.slice(0.25, 0.5).length()).toBeCloseTo(100, 6);
    });

    it('follows paths that change after it was made', () => {
        const first = a();
        const curve = new Curve(first, b());
        first.setP2(V(300, 0)).setP1(V(150, 0));
        expect(curve.length()).toBeCloseTo(600, 6);
        expect(xy(curve.value(0.25))).toEqual([150, 0]);
    });

    it('needs at least one Path', () => {
        expect(() => new Curve()).toThrow(RangeError);
        expect(() => new Curve(a(), 'nope' as never)).toThrow(TypeError);
    });

    it('chains any Path, also a custom one', () => {
        class Line extends Path {
            constructor(
                readonly from: number,
                readonly to: number,
            ) {
                super();
            }
            value(d: number) {
                return V(this.from + (this.to - this.from) * d, 0);
            }
            length() {
                return Math.abs(this.to - this.from);
            }
            slice(t0: number, t1: number) {
                return new Line(this.value(t0).x, this.value(t1).x);
            }
        }
        const curve = new Line(0, 10).add(new Line(10, 40));
        expect(curve.length()).toBe(40);
        expect(curve.value(0.5).x).toBe(20);
    });
});

describe('2D and 3D', () => {
    it('gives 2D vectors for 2D points and 3D vectors if any point is 3D', () => {
        const flat = new QuadraticBezier(V(0, 0), V(5, 5), V(10, 0)).value(0.5);
        expect([flat.dimensions, flat.z]).toEqual([2, 0]);
        const deep = new QuadraticBezier(V(0, 0), V(5, 5, 5), V(10, 0)).value(0.5);
        expect(deep.dimensions).toBe(3);
        expect(deep.z).toBeGreaterThan(0);
        expect(new Spline(V(0, 0, 0), V(1, 1, 1), V(2, 2, 2), V(3, 3, 3)).value(0.5).dimensions).toBe(3);
        expect(new CubicBezier(V(0, 0), V(1, 1), V(2, 2), V(3, 3, 3)).value(0.5).dimensions).toBe(3);
    });

    it('measures and interpolates z too', () => {
        const line = new CubicBezier(V(0, 0, 0), V(0, 0, 10), V(0, 0, 20), V(0, 0, 30));
        expect(line.length()).toBeCloseTo(30, 6);
        expect(line.value(0.5).z).toBeCloseTo(15, 6);
        expect(line.z()(0.5)).toBeCloseTo(15, 6);
    });

    it('accepts plain objects as points', () => {
        const flat = new QuadraticBezier({ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }).value(0.5);
        expect([flat.x, flat.dimensions]).toEqual([5, 2]);
        const deep = new QuadraticBezier({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: 10 }).value(0.5);
        expect([deep.z, deep.dimensions]).toEqual([5, 3]);
    });

    it('returns a new vector every time', () => {
        const path = new QuadraticBezier(V(0, 0), V(5, 0), V(10, 0));
        const v = path.value(0.5);
        v.x = 99;
        expect(path.value(0.5).x).toBe(5);
    });
});

describe('Tween helpers', () => {
    const path = () => new QuadraticBezier(V(0, 0), V(50, 0), V(100, 100));

    it('x(), y(), map() and at() on a path', () => {
        const p = path();
        expect(p.x()(0.5)).toBe(p.value(0.5).x);
        expect(p.y()(1)).toBe(100);
        expect(p.map((v) => v.x + v.y)(1)).toBe(200);
        const at = p.at(0.25);
        expect(at).toBeInstanceOf(TweenAt);
        expect(at.positionOr(0.5)).toBe(0.25);
        expect(xy(at.tween()(0.25))).toEqual(xy(p.value(0.25)));
    });

    it('is the same function every time, so keys can share a path', () => {
        const p = path();
        expect(p.tween()).toBe(p.tween());
        expect(p.at(0).tween()).toBe(p.at(1).tween());
        expect(xy(p.tween()(0.3))).toEqual(xy(p.value(0.3)));
    });

    it('Tween.map() and Tween.at() on plain functions', () => {
        const half = (d: number) => d / 2;
        expect(Tween.map(half, (v) => v * 10)(1)).toBe(5);
        const at = Tween.at(half, 0.4);
        expect(at.positionOr(0)).toBe(0.4);
        expect(at.tween()).toBe(half);
    });
});

describe('Keyed following paths', () => {
    it('travels all of a path between two keys on it', () => {
        const cubic = new CubicBezier(...unevenCubic());
        const a = Keyed.ofVector().key(0, cubic).key(3, cubic);
        expect(xy(a.value(0))).toEqual([0, 0]);
        expect(xy(a.value(1.5))).toEqual(xy(cubic.value(0.5)));
        expect(xy(a.value(3))).toEqual([100, 100]);
        expect(xy(a.value(9))).toEqual([100, 100]);
    });

    it('samples a path shared by two keys once, at the eased position', () => {
        const path = new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0));
        const spy = vi.spyOn(path, 'value');
        Keyed.ofVector().key(0, path).key(2, path).value(0.5);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(0.25);
    });

    it('goes there and back with at(), shaped by easing', () => {
        const quad = new QuadraticBezier(V(60, 340), V(200, 190), V(340, 340));
        const b = Keyed.ofVector()
            .key(Key.at(0).setEasing(1 / 3), quad.at(0))
            .key(Key.at(1.5).setEasing(1 / 3), quad.at(1))
            .key(Key.at(3).setEasing(1 / 3), quad.at(0));
        expect(xy(b.value(0))).toEqual([60, 340]);
        expect(xy(b.value(1.5))).toEqual([340, 340]);
        expect(xy(b.value(3))).toEqual([60, 340]);
        const ease = Easing.cubicBezier(1 / 3, 0, 2 / 3, 1)(0.25);
        expect(xy(b.value(0.375))).toEqual(xy(quad.value(ease)));
        // The way back mirrors the way there: the same eased position, traveled in reverse.
        expect(xy(b.value(2.625))).toEqual(xy(quad.value(ease)));
    });

    it('follows a path from a single key at its position', () => {
        const path = new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0));
        expect(xy(Keyed.ofVector().key(0, path).value(0))).toEqual([0, 0]);
        expect(xy(Keyed.ofVector().key(0, path.at(0.5)).value(0))).toEqual([50, 0]);
    });

    it('follows tweens made from a path: coordinates, mapped points', () => {
        const hop = new QuadraticBezier(V(0, 100), V(100, 0), V(200, 100));
        const x = Keyed.ofFloat().key(0, hop.x()).key(2, hop.x());
        expect(x.value(0)).toBe(0);
        expect(x.value(1)).toBeCloseTo(100, 6);
        expect(x.value(2)).toBe(200);

        const shadow = hop.map((p) => V(p.x, 400));
        const s = Keyed.ofVector().key(0, shadow).key(2, shadow);
        expect(xy(s.value(1))).toEqual([100, 400]);

        const width = Keyed.ofFloat().key(0, hop.map((p) => 100 - p.y)).key(2, hop.map((p) => 100 - p.y));
        expect(width.value(1)).toBeCloseTo(50, 6);
    });

    it('closes a loop with a spline of wrapped points', () => {
        const pts = [V(0, 0), V(100, 0), V(100, 100), V(0, 100)];
        const spline = new Spline(pts[3]!, pts[0]!, pts[1]!, pts[2]!, pts[3]!, pts[0]!, pts[1]!);
        const pos = Keyed.ofVector().key(0, spline).key(5, spline);
        expect(xy(pos.value(0))).toEqual(xy(pos.value(5)));
        expect(xy(pos.value(0))).toEqual([0, 0]);
    });

    it('hands out new vectors, so a key cannot be changed through a value', () => {
        const path = new QuadraticBezier(V(0, 0), V(50, 0), V(100, 0));
        const k = Keyed.ofVector().key(0, path).key(1, path);
        const v = k.value(0.5);
        v.x = 999;
        expect(k.value(0.5).x).toBe(50);
    });
});
