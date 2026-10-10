import type p5 from 'p5';
/** The parts of the p5 constructor the library needs at runtime. */
export interface P5Runtime {
    Vector: new (x?: number, y?: number, z?: number) => p5.Vector;
    Color: new (values: number[] | string[], mode?: string) => p5.Color;
}
/** Connections to p5, filled in by the add-on when it registers. The core never imports p5 itself. */
export declare const env: {
    p5: P5Runtime | undefined;
    /** Called by Keyed.init(sketch) so a sketch in instance mode can take over the default ticker. */
    claim: ((sketch: unknown) => void) | undefined;
    /** The sketch that owns the default timeline: what Quaternion.apply() and ShapeMorph.vertices() draw on without an argument. */
    sketch: (() => unknown) | undefined;
};
/** The p5 constructor, for creating vectors and colors. */
export declare function p5Runtime(): P5Runtime;
/** Something that can draw: a p5 sketch (instance) or a p5.Graphics. */
export declare function drawTarget(g: unknown): Record<string, (...args: unknown[]) => unknown>;
