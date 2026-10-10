import type p5 from 'p5';
import { Tween, TweenAt } from './tween';
/** Anything with x and y (and z): a p5.Vector, or a plain object like { x: 10, y: 20 }. */
export interface Point {
    x: number;
    y: number;
    z?: number;
    dimensions?: number;
}
type Coords = [number, number, number];
/**
 * A path in 2D or 3D with a known arc length, so paths can be chained into a Curve at even speed.
 * Keys follow it like any tween: key(0, path).key(3, path); path.tween() is the same as a plain function of d.
 */
export declare abstract class Path {
    #private;
    /** The point at d, from 0 (start) to 1 (end). */
    abstract value(d: number): p5.Vector;
    /** Arc length. */
    abstract length(): number;
    /** New path between normalized distances t0 and t1 (0..1) of the whole path; t1 < t0 reverses it. */
    abstract slice(t0: number, t1: number): Path;
    /** Curve playing this path, then next. */
    add(next: Path): Curve;
    /** Wraps this path so a key samples it at a fixed position: 0 is the start, 1 the end. */
    at(position: number): TweenAt<p5.Vector>;
    /** Applies f to each point. */
    map<R>(f: (point: p5.Vector) => R): Tween<R>;
    /** The x coordinate as a tween. */
    x(): Tween<number>;
    /** The y coordinate as a tween. */
    y(): Tween<number>;
    /** The z coordinate as a tween. */
    z(): Tween<number>;
    /** This path as a function of d. The same function every time, so keys sharing a path are recognized as one. */
    tween(): Tween<p5.Vector>;
}
declare abstract class SampledPath extends Path {
    #private;
    /** The curve parameter runs from 0 to units(). */
    protected abstract units(): number;
    protected abstract coords(u: number): Coords;
    protected abstract is3D(): boolean;
    protected invalidate(): void;
    protected windowOf(source: SampledPath, t0: number, t1: number): this;
    length(): number;
    value(d: number): p5.Vector;
}
/** Quadratic Bézier path, traveled at constant speed. */
export declare class QuadraticBezier extends SampledPath {
    #private;
    /** From p0 to p2 with control point p1. */
    constructor(p0: Point, p1: Point, p2: Point);
    /** Sets the start point. */
    setP0(p0: Point): this;
    /** Sets the control point. */
    setP1(p1: Point): this;
    /** Sets the end point. */
    setP2(p2: Point): this;
    /** Sets all three points. */
    setCurve(p0: Point, p1: Point, p2: Point): this;
    slice(t0: number, t1: number): QuadraticBezier;
    protected units(): number;
    protected is3D(): boolean;
    protected coords(t: number): Coords;
}
/** Cubic Bézier path, traveled at constant speed. */
export declare class CubicBezier extends SampledPath {
    #private;
    /** From p0 to p3 with control points p1 and p2, like p5's bezier(). */
    constructor(p0: Point, p1: Point, p2: Point, p3: Point);
    /** Sets the start point. */
    setP0(p0: Point): this;
    /** Sets the first control point. */
    setP1(p1: Point): this;
    /** Sets the second control point. */
    setP2(p2: Point): this;
    /** Sets the end point. */
    setP3(p3: Point): this;
    /** Sets all four points. */
    setCurve(p0: Point, p1: Point, p2: Point, p3: Point): this;
    slice(t0: number, t1: number): CubicBezier;
    protected units(): number;
    protected is3D(): boolean;
    protected coords(t: number): Coords;
}
/** Like p5's curveVertex(): passes through every point except the first and last, which only shape the ends. */
export declare class Spline extends SampledPath {
    #private;
    /** Needs at least 4 points, as arguments or as an array. */
    constructor(...points: Point[] | [Point[]]);
    /** Replaces the points; needs at least 4, as arguments or as an array. */
    setPoints(...points: Point[] | [Point[]]): this;
    /** Same as p5's curveTightness(): 0 is Catmull-Rom, 1 gives straight lines. */
    setTightness(tightness: number): this;
    slice(t0: number, t1: number): Spline;
    protected units(): number;
    protected is3D(): boolean;
    protected coords(u: number): Coords;
}
/** Paths played one after another at even speed; gaps between a path's end and the next start are jumped. */
export declare class Curve extends Path {
    #private;
    /** Plays paths in order; needs at least one. */
    constructor(...paths: Path[]);
    /** Returns a new curve; this one is unchanged. */
    add(next: Path): Curve;
    slice(t0: number, t1: number): Curve;
    length(): number;
    value(d: number): p5.Vector;
}
export {};
