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
} = { p5: undefined, claim: undefined };

/** The p5 constructor, for creating vectors and colors. */
export function p5Runtime(): P5Runtime {
    if (!env.p5) {
        throw new Error('p5.js was not found: load p5.js before p5.keyed.js, or register keyedAddon with p5.registerAddon()');
    }
    return env.p5;
}
