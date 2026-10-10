import type p5 from 'p5';

/** The parts of the p5 constructor the library needs at runtime. */
export interface P5Runtime {
    Vector: new (x?: number, y?: number, z?: number) => p5.Vector;
    Color: new (values: number[] | string[], mode?: string) => p5.Color;
}

/** Connections to p5, filled in by the add-on when it registers. The core never imports p5 itself. */
export const env: {
    p5: P5Runtime | undefined;
    /** Called by Keyed.init(sketch) so a sketch in instance mode can take over the default ticker. */
    claim: ((sketch: unknown) => void) | undefined;
    /** The sketch that owns the default timeline: what Quaternion.apply() and ShapeMorph.vertices() draw on without an argument. */
    sketch: (() => unknown) | undefined;
} = { p5: undefined, claim: undefined, sketch: undefined };

/** The p5 constructor, for creating vectors and colors. */
export function p5Runtime(): P5Runtime {
    if (!env.p5) {
        throw new Error('p5.js was not found: load p5.js before p5.keyed.js, or register keyedAddon with p5.registerAddon()');
    }
    return env.p5;
}

/** Something that can draw: a p5 sketch (instance) or a p5.Graphics. */
export function drawTarget(g: unknown): Record<string, (...args: unknown[]) => unknown> {
    const target = g ?? env.sketch?.();
    if (!target) {
        throw new Error('no sketch to draw on: pass the p5 instance or a p5.Graphics, or call Keyed.init() in setup()');
    }
    return target as Record<string, (...args: unknown[]) => unknown>;
}

// p5.Vector and p5.Color objects. Older p5 2.x versions don't mark them with isVector / isColor, so also ask the constructors.
/** @internal */
export function isP5Vector(value: unknown): boolean {
    return (value as { isVector?: boolean })?.isVector === true || (!!env.p5 && value instanceof env.p5.Vector);
}

/** @internal */
export function isP5Color(value: unknown): boolean {
    return (value as { isColor?: boolean })?.isColor === true || (!!env.p5 && value instanceof env.p5.Color);
}
