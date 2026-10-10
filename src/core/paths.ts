import type p5 from 'p5';
import { p5Runtime } from './env';
import { Tween, TweenAt } from './tween';

/** Anything with x and y (and z): a p5.Vector, or a plain object like { x: 10, y: 20 }. */
export interface Point {
    x: number;
    y: number;
    z?: number;
    dimensions?: number;
}

type Coords = [number, number, number];

// Samples per curve parameter unit (per segment for a spline); higher is more accurate.
const LUT_STEPS = 50;

const constrain = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

const checkPoint = (p: Point, name: string): Point => {
    if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') {
        throw new TypeError(`${name} must be a point with x and y, e.g. createVector(10, 20), was ${String(p)}`);
    }
    return p;
};

const is3D = (p: Point): boolean => (p.dimensions ?? (p.z === undefined ? 2 : 3)) > 2;

/**
 * A path in 2D or 3D with a known arc length, so paths can be chained into a Curve at even speed.
 * Keys follow it like any tween: key(0, path).key(3, path); path.tween() is the same as a plain function of d.
 */
export abstract class Path {
    #tween: Tween<p5.Vector> | undefined;

    /** The point at d, from 0 (start) to 1 (end). */
    abstract value(d: number): p5.Vector;

    /** Arc length. */
    abstract length(): number;

    /** New path between normalized distances t0 and t1 (0..1) of the whole path; t1 < t0 reverses it. */
    abstract slice(t0: number, t1: number): Path;

    /** Curve playing this path, then next. */
    add(next: Path): Curve {
        return new Curve(this, next);
    }

    /** Wraps this path so a key samples it at a fixed position: 0 is the start, 1 the end. */
    at(position: number): TweenAt<p5.Vector> {
        return new TweenAt(this.tween(), position);
    }

    /** Applies f to each point. */
    map<R>(f: (point: p5.Vector) => R): Tween<R> {
        return Tween.map(this.tween(), f);
    }

    /** The x coordinate as a tween. */
    x(): Tween<number> {
        return this.map((p) => p.x);
    }

    /** The y coordinate as a tween. */
    y(): Tween<number> {
        return this.map((p) => p.y);
    }

    /** The z coordinate as a tween. */
    z(): Tween<number> {
        return this.map((p) => p.z);
    }

    /** This path as a function of d. The same function every time, so keys sharing a path are recognized as one. */
    tween(): Tween<p5.Vector> {
        return (this.#tween ??= (d) => this.value(d));
    }
}

// Paths traveled at constant speed: a table of cumulative distances between evenly spaced samples of the curve
// parameter u in [0, units()] maps a distance to u.
abstract class SampledPath extends Path {
    #t0 = 0;
    #t1 = 1;
    // Rebuilt lazily after setters; mutating the points directly won't invalidate it.
    #lut: number[] | null = null;

    /** The curve parameter runs from 0 to units(). */
    protected abstract units(): number;

    protected abstract coords(u: number): Coords;

    protected abstract is3D(): boolean;

    protected invalidate(): void {
        this.#lut = null;
    }

    // Makes this the part of source between t0 and t1.
    protected windowOf(source: SampledPath, t0: number, t1: number): this {
        this.#t0 = constrain(t0, 0, 1);
        this.#t1 = constrain(t1, 0, 1);
        this.#lut = source.#lut;
        return this;
    }

    length(): number {
        const l = this.#table();
        return l[l.length - 1]! * Math.abs(this.#t1 - this.#t0);
    }

    value(d: number): p5.Vector {
        const [x, y, z] = this.coords(this.#distToU(this.#t0 + d * (this.#t1 - this.#t0)));
        const { Vector } = p5Runtime();
        return this.is3D() ? new Vector(x, y, z) : new Vector(x, y);
    }

    // Cumulative distances between samples of u, LUT_STEPS per unit.
    #table(): number[] {
        if (!this.#lut) {
            const n = this.units() * LUT_STEPS;
            const l = new Array<number>(n + 1).fill(0);
            let [px, py, pz] = this.coords(0);
            for (let i = 1; i <= n; i++) {
                const [x, y, z] = this.coords(i / LUT_STEPS);
                l[i] = l[i - 1]! + Math.sqrt((x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2);
                [px, py, pz] = [x, y, z];
            }
            this.#lut = l;
        }
        return this.#lut;
    }

    // Curve parameter u for a normalized distance (0..1) along the path.
    #distToU(distance: number): number {
        const l = this.#table();
        const n = l.length - 1;
        const total = l[n]!;
        if (total === 0) {
            return distance * this.units();
        }
        const dist = constrain(distance * total, 0, total);

        let lo = 1;
        let hi = n;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (l[mid]! < dist) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        const d0 = l[lo - 1]!;
        const d1 = l[lo]!;
        const ua = (lo - 1) / LUT_STEPS;
        const ub = lo / LUT_STEPS;
        return d1 > d0 ? ua + ((dist - d0) * (ub - ua)) / (d1 - d0) : ua;
    }
}

/** Quadratic Bézier path, traveled at constant speed. */
export class QuadraticBezier extends SampledPath {
    #p0: Point;
    #p1: Point;
    #p2: Point;

    /** From p0 to p2 with control point p1. */
    constructor(p0: Point, p1: Point, p2: Point) {
        super();
        this.#p0 = checkPoint(p0, 'p0');
        this.#p1 = checkPoint(p1, 'p1');
        this.#p2 = checkPoint(p2, 'p2');
    }

    /** Sets the start point. */
    setP0(p0: Point): this {
        this.#p0 = checkPoint(p0, 'p0');
        this.invalidate();
        return this;
    }

    /** Sets the control point. */
    setP1(p1: Point): this {
        this.#p1 = checkPoint(p1, 'p1');
        this.invalidate();
        return this;
    }

    /** Sets the end point. */
    setP2(p2: Point): this {
        this.#p2 = checkPoint(p2, 'p2');
        this.invalidate();
        return this;
    }

    /** Sets all three points. */
    setCurve(p0: Point, p1: Point, p2: Point): this {
        this.#p0 = checkPoint(p0, 'p0');
        this.#p1 = checkPoint(p1, 'p1');
        this.#p2 = checkPoint(p2, 'p2');
        this.invalidate();
        return this;
    }

    slice(t0: number, t1: number): QuadraticBezier {
        return new QuadraticBezier(this.#p0, this.#p1, this.#p2).windowOf(this, t0, t1);
    }

    protected units(): number {
        return 1;
    }

    protected is3D(): boolean {
        return is3D(this.#p0) || is3D(this.#p1) || is3D(this.#p2);
    }

    protected coords(t: number): Coords {
        const u = 1 - t;
        const b0 = u * u;
        const b1 = 2 * u * t;
        const b2 = t * t;
        const [a, b, c] = [this.#p0, this.#p1, this.#p2];
        return [
            b0 * a.x + b1 * b.x + b2 * c.x,
            b0 * a.y + b1 * b.y + b2 * c.y,
            b0 * (a.z ?? 0) + b1 * (b.z ?? 0) + b2 * (c.z ?? 0),
        ];
    }
}

/** Cubic Bézier path, traveled at constant speed. */
export class CubicBezier extends SampledPath {
    #p0: Point;
    #p1: Point;
    #p2: Point;
    #p3: Point;

    /** From p0 to p3 with control points p1 and p2, like p5's bezier(). */
    constructor(p0: Point, p1: Point, p2: Point, p3: Point) {
        super();
        this.#p0 = checkPoint(p0, 'p0');
        this.#p1 = checkPoint(p1, 'p1');
        this.#p2 = checkPoint(p2, 'p2');
        this.#p3 = checkPoint(p3, 'p3');
    }

    /** Sets the start point. */
    setP0(p0: Point): this {
        this.#p0 = checkPoint(p0, 'p0');
        this.invalidate();
        return this;
    }

    /** Sets the first control point. */
    setP1(p1: Point): this {
        this.#p1 = checkPoint(p1, 'p1');
        this.invalidate();
        return this;
    }

    /** Sets the second control point. */
    setP2(p2: Point): this {
        this.#p2 = checkPoint(p2, 'p2');
        this.invalidate();
        return this;
    }

    /** Sets the end point. */
    setP3(p3: Point): this {
        this.#p3 = checkPoint(p3, 'p3');
        this.invalidate();
        return this;
    }

    /** Sets all four points. */
    setCurve(p0: Point, p1: Point, p2: Point, p3: Point): this {
        this.#p0 = checkPoint(p0, 'p0');
        this.#p1 = checkPoint(p1, 'p1');
        this.#p2 = checkPoint(p2, 'p2');
        this.#p3 = checkPoint(p3, 'p3');
        this.invalidate();
        return this;
    }

    slice(t0: number, t1: number): CubicBezier {
        return new CubicBezier(this.#p0, this.#p1, this.#p2, this.#p3).windowOf(this, t0, t1);
    }

    protected units(): number {
        return 1;
    }

    protected is3D(): boolean {
        return is3D(this.#p0) || is3D(this.#p1) || is3D(this.#p2) || is3D(this.#p3);
    }

    protected coords(t: number): Coords {
        const u = 1 - t;
        const b0 = u * u * u;
        const b1 = 3 * u * u * t;
        const b2 = 3 * u * t * t;
        const b3 = t * t * t;
        const [a, b, c, d] = [this.#p0, this.#p1, this.#p2, this.#p3];
        return [
            b0 * a.x + b1 * b.x + b2 * c.x + b3 * d.x,
            b0 * a.y + b1 * b.y + b2 * c.y + b3 * d.y,
            b0 * (a.z ?? 0) + b1 * (b.z ?? 0) + b2 * (c.z ?? 0) + b3 * (d.z ?? 0),
        ];
    }
}

/** Like p5's curveVertex(): passes through every point except the first and last, which only shape the ends. */
export class Spline extends SampledPath {
    #points: Point[] = [];
    #tightness = 0;

    /** Needs at least 4 points, as arguments or as an array. */
    constructor(...points: Point[] | [Point[]]) {
        super();
        this.setPoints(...points);
    }

    /** Replaces the points; needs at least 4, as arguments or as an array. */
    setPoints(...points: Point[] | [Point[]]): this {
        const list = (Array.isArray(points[0]) ? points[0] : points) as Point[];
        if (list.length < 4) {
            throw new RangeError(`a spline needs at least 4 points, got ${list.length}`);
        }
        list.forEach((p, i) => checkPoint(p, `point ${i}`));
        this.#points = [...list];
        this.invalidate();
        return this;
    }

    /** Same as p5's curveTightness(): 0 is Catmull-Rom, 1 gives straight lines. */
    setTightness(tightness: number): this {
        this.#tightness = tightness;
        this.invalidate();
        return this;
    }

    slice(t0: number, t1: number): Spline {
        return new Spline(this.#points).setTightness(this.#tightness).windowOf(this, t0, t1);
    }

    protected units(): number {
        return this.#points.length - 3;
    }

    protected is3D(): boolean {
        return this.#points.some(is3D);
    }

    // u in [0, units()]; the integer part picks the segment.
    protected coords(u: number): Coords {
        // Truncates like an int cast, so a u outside the spline (zero-length splines) or NaN still picks a segment.
        const i = Math.max(0, Math.min(Math.trunc(u) || 0, this.units() - 1));
        const t = u - i;
        const [p0, p1, p2, p3] = [this.#points[i]!, this.#points[i + 1]!, this.#points[i + 2]!, this.#points[i + 3]!];

        const k = (1 - this.#tightness) / 2;
        const t2 = t * t;
        const t3 = t2 * t;
        const h00 = 2 * t3 - 3 * t2 + 1;
        const h10 = t3 - 2 * t2 + t;
        const h01 = -2 * t3 + 3 * t2;
        const h11 = t3 - t2;
        const axis = (a: number, b: number, c: number, d: number): number => h00 * b + h10 * k * (c - a) + h01 * c + h11 * k * (d - b);
        return [
            axis(p0.x, p1.x, p2.x, p3.x),
            axis(p0.y, p1.y, p2.y, p3.y),
            axis(p0.z ?? 0, p1.z ?? 0, p2.z ?? 0, p3.z ?? 0),
        ];
    }
}

/** Paths played one after another at even speed; gaps between a path's end and the next start are jumped. */
export class Curve extends Path {
    readonly #paths: Path[];
    #t0 = 0;
    #t1 = 1;

    /** Plays paths in order; needs at least one. */
    constructor(...paths: Path[]) {
        super();
        if (paths.length === 0) {
            throw new RangeError('a curve needs at least one path');
        }
        paths.forEach((p, i) => {
            if (!(p instanceof Path)) throw new TypeError(`path ${i} is not a Path, was ${String(p)}`);
        });
        this.#paths = [...paths];
    }

    /** Returns a new curve; this one is unchanged. */
    override add(next: Path): Curve {
        if (this.#t0 !== 0 || this.#t1 !== 1) {
            return new Curve(this, next);
        }
        return new Curve(...this.#paths, next);
    }

    slice(t0: number, t1: number): Curve {
        const c = new Curve(...this.#paths);
        c.#t0 = constrain(t0, 0, 1);
        c.#t1 = constrain(t1, 0, 1);
        return c;
    }

    length(): number {
        return this.#fullLength() * Math.abs(this.#t1 - this.#t0);
    }

    value(d: number): p5.Vector {
        // Lengths are read on every call because paths can change through their setters.
        let dist = constrain(this.#t0 + d * (this.#t1 - this.#t0), 0, 1) * this.#fullLength();
        const last = this.#paths.length - 1;
        for (let i = 0; i < last; i++) {
            const path = this.#paths[i]!;
            const len = path.length();
            if (dist <= len) {
                return path.value(len > 0 ? dist / len : 0);
            }
            dist -= len;
        }
        const path = this.#paths[last]!;
        const len = path.length();
        return path.value(len > 0 ? constrain(dist / len, 0, 1) : 0);
    }

    #fullLength(): number {
        return this.#paths.reduce((total, p) => total + p.length(), 0);
    }
}
