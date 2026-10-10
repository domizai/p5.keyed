/**
 * Maps linear progress in [0, 1] to eased progress. Any function of d works; call it directly,
 * e.g. Easing.CUBIC_IN(0.5) (not .apply(), which is JavaScript's own Function.prototype.apply).
 */
export type Easing = (d: number) => number;

const constrain = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

/** Accelerating curve d^p. */
function powerIn(p: number): Easing {
    return (d) => Math.pow(d, p);
}

/** Decelerating curve 1 - (1 - d)^p. */
function powerOut(p: number): Easing {
    return (d) => 1 - Math.pow(1 - d, p);
}

/** Accelerates to the midpoint, then decelerates, with power p. */
function powerInOut(p: number): Easing {
    return (d) => (d < 0.5 ? 0.5 * Math.pow(2 * d, p) : 1 - 0.5 * Math.pow(2 - 2 * d, p));
}

/** Smootherstep between edge0 and edge1; 0 before edge0, 1 after edge1. */
function smoothstep(edge0: number, edge1: number): Easing {
    return (d) => {
        const x = constrain((d - edge0) / (edge1 - edge0), 0, 1);
        return x * x * x * (x * (6 * x - 15) + 10);
    };
}

/** n equal jumps like CSS steps(n): holds each level, reaching 1 at the end; steps(1) is HOLD. */
function steps(n: number): Easing {
    if (!(n >= 1)) {
        throw new RangeError(`steps must be >= 1, was ${n}`);
    }
    return (d) => Math.floor(d * n) / n;
}

/** CSS cubic-bezier(x1, y1, x2, y2) from (0, 0) to (1, 1); x must be in [0, 1], y outside [0, 1] overshoots like CSS "back" easings. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
    if (!(x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1)) {
        throw new RangeError(`x1 and x2 must be in [0, 1], were ${x1}, ${x2}`);
    }
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    return (d) => {
        const s = solveBezierX(d, ax, bx, cx);
        return ((ay * s + by) * s + cy) * s;
    };
}

// Curve parameter s in [0, 1] where ((ax*s + bx)*s + cx)*s == x: Newton's method, bisection if it stalls or leaves [0, 1].
function solveBezierX(x: number, ax: number, bx: number, cx: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let s = x;
    for (let i = 0; i < 8; i++) {
        const err = ((ax * s + bx) * s + cx) * s - x;
        if (Math.abs(err) < 1e-6) return s;
        const slope = (3 * ax * s + 2 * bx) * s + cx;
        if (Math.abs(slope) < 1e-6) break;
        s -= err / slope;
        if (s < 0 || s > 1) break;
    }

    let lo = 0;
    let hi = 1;
    s = x;
    for (let i = 0; i < 40; i++) {
        const xs = ((ax * s + bx) * s + cx) * s;
        if (Math.abs(xs - x) < 1e-6) break;
        if (xs < x) {
            lo = s;
        } else {
            hi = s;
        }
        s = (lo + hi) / 2;
    }
    return s;
}

/** Quadratic Bezier through values p0 (at d = 0), control p1, and p2 (at d = 1). */
function quadraticBezier(p0: number, p1: number, p2: number): Easing {
    return (d) => {
        const a = 1 - d;
        return a * a * p0 + 2 * a * d * p1 + d * d * p2;
    };
}

const QUAD_IN = powerIn(2);
const QUAD_OUT = powerOut(2);
const QUAD_IN_OUT = powerInOut(2);

/** Easing presets and factories; every preset is itself an Easing function. */
export const Easing = {
    QUADRATIC_BEZIER: quadraticBezier(0, 0, 1),
    CUBIC_BEZIER: cubicBezier(0, 0, 1, 1),
    SMOOTHSTEP: smoothstep(0, 1),
    /** Stays at the start value until the next key, then jumps. */
    HOLD: ((d) => (d < 1 ? 0 : 1)) as Easing,

    QUAD_IN,
    QUAD_OUT,
    QUAD_IN_OUT,

    CUBIC_IN: powerIn(3),
    CUBIC_OUT: powerOut(3),
    CUBIC_IN_OUT: powerInOut(3),

    QUART_IN: powerIn(4),
    QUART_OUT: powerOut(4),
    QUART_IN_OUT: powerInOut(4),

    QUINT_IN: powerIn(5),
    QUINT_OUT: powerOut(5),
    QUINT_IN_OUT: powerInOut(5),

    powerIn,
    powerOut,
    powerInOut,
    smoothstep,
    steps,
    cubicBezier,
    quadraticBezier,

    /** Applies QUAD_IN to a plain number, e.g. alpha = Easing.quadIn(t); for other powers use powerIn(p)(d). */
    quadIn: (d: number): number => QUAD_IN(d),
    /** Applies QUAD_OUT to a plain number. */
    quadOut: (d: number): number => QUAD_OUT(d),
    /** Applies QUAD_IN_OUT to a plain number. */
    quadInOut: (d: number): number => QUAD_IN_OUT(d),
} as const;
