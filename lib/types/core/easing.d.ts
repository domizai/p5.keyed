/**
 * Maps linear progress in [0, 1] to eased progress. Any function of d works; call it directly,
 * e.g. Easing.CUBIC_IN(0.5) (not .apply(), which is JavaScript's own Function.prototype.apply).
 */
export type Easing = (d: number) => number;
/** Accelerating curve d^p. */
declare function powerIn(p: number): Easing;
/** Decelerating curve 1 - (1 - d)^p. */
declare function powerOut(p: number): Easing;
/** Accelerates to the midpoint, then decelerates, with power p. */
declare function powerInOut(p: number): Easing;
/** Smootherstep between edge0 and edge1; 0 before edge0, 1 after edge1. */
declare function smoothstep(edge0: number, edge1: number): Easing;
/** n equal jumps like CSS steps(n): holds each level, reaching 1 at the end; steps(1) is HOLD. */
declare function steps(n: number): Easing;
/** CSS cubic-bezier(x1, y1, x2, y2) from (0, 0) to (1, 1); x must be in [0, 1], y outside [0, 1] overshoots like CSS "back" easings. */
declare function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing;
/** Quadratic Bezier through values p0 (at d = 0), control p1, and p2 (at d = 1). */
declare function quadraticBezier(p0: number, p1: number, p2: number): Easing;
/** Easing presets and factories; every preset is itself an Easing function. */
export declare const Easing: {
    readonly QUADRATIC_BEZIER: Easing;
    readonly CUBIC_BEZIER: Easing;
    readonly SMOOTHSTEP: Easing;
    /** Stays at the start value until the next key, then jumps. */
    readonly HOLD: Easing;
    readonly QUAD_IN: Easing;
    readonly QUAD_OUT: Easing;
    readonly QUAD_IN_OUT: Easing;
    readonly CUBIC_IN: Easing;
    readonly CUBIC_OUT: Easing;
    readonly CUBIC_IN_OUT: Easing;
    readonly QUART_IN: Easing;
    readonly QUART_OUT: Easing;
    readonly QUART_IN_OUT: Easing;
    readonly QUINT_IN: Easing;
    readonly QUINT_OUT: Easing;
    readonly QUINT_IN_OUT: Easing;
    readonly powerIn: typeof powerIn;
    readonly powerOut: typeof powerOut;
    readonly powerInOut: typeof powerInOut;
    readonly smoothstep: typeof smoothstep;
    readonly steps: typeof steps;
    readonly cubicBezier: typeof cubicBezier;
    readonly quadraticBezier: typeof quadraticBezier;
    /** Applies QUAD_IN to a plain number, e.g. alpha = Easing.quadIn(t); for other powers use powerIn(p)(d). */
    readonly quadIn: (d: number) => number;
    /** Applies QUAD_OUT to a plain number. */
    readonly quadOut: (d: number) => number;
    /** Applies QUAD_IN_OUT to a plain number. */
    readonly quadInOut: (d: number) => number;
};
export {};
