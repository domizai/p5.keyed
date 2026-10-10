import type p5 from 'p5';
import { p5Runtime } from './env';

/** Blends two values of a type: a at d = 0, b at d = 1. */
export type LerpFunction<T> = (a: T, b: T, d: number) => T;

/** Blends two values of a type with a lerp() method, like the lerp classes below. */
export interface LerpObject<T> {
    lerp(a: T, b: T, d: number): T;
}

/** Anything that blends: a function (a, b, d) => value or an object with lerp(a, b, d). */
export type Lerp<T> = LerpFunction<T> | LerpObject<T>;

/** @internal */
export function toLerpFunction<T>(lerp: Lerp<T>): LerpFunction<T> {
    if (typeof lerp === 'function') return lerp;
    if (lerp && typeof lerp.lerp === 'function') return (a, b, d) => lerp.lerp(a, b, d);
    throw new TypeError('expected a lerp: a function (a, b, d) => value, or an object with lerp(a, b, d)');
}

const constrain = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

/** Linear blend for numbers. */
export class FloatLerp implements LerpObject<number> {
    lerp(a: number, b: number, d: number): number {
        return a + (b - a) * d;
    }
}

/** Linear blend for integers. */
export class IntLerp implements LerpObject<number> {
    /** Rounds to the nearest integer; pass round (e.g. Math.floor or Math.ceil) to convert the unrounded blend differently. */
    lerp(a: number, b: number, d: number, round: (v: number) => number = Math.round): number {
        return round(a + (b - a) * d);
    }
}

/** Blends angles in radians the short way round, e.g. 350° to 10° turns 20°, not 340°. */
export class AngleLerp implements LerpObject<number> {
    lerp(a: number, b: number, t: number): number {
        const twoPi = 2 * Math.PI;
        const diff = ((((b - a) % twoPi) + twoPi + Math.PI) % twoPi) - Math.PI;
        return a + diff * t;
    }
}

/**
 * Holds a until the blend reaches the threshold, then jumps to b; for values that can't blend.
 * Returns the keys themselves, so only use it with immutable values (strings, numbers, frozen objects, ...).
 */
export class StepLerp<T> implements LerpObject<T> {
    readonly #threshold: number;

    /** Switches exactly at the next key by default; e.g. 0.5 switches halfway between keys (easing shifts when that happens). */
    constructor(threshold = 1) {
        this.#threshold = threshold;
    }

    lerp(a: T, b: T, t: number): T {
        return t >= this.#threshold ? b : a;
    }
}

/** A StepLerp for booleans. */
export class BooleanLerp extends StepLerp<boolean> {}

/** Linear blend for p5.Vectors: x, y and z, in 3D if either vector is 3D. Always returns a new vector. */
export class VectorLerp implements LerpObject<p5.Vector> {
    lerp(a: p5.Vector, b: p5.Vector, d: number): p5.Vector {
        const { Vector } = p5Runtime();
        const x = a.x + (b.x - a.x) * d;
        const y = a.y + (b.y - a.y) * d;
        // p5.Vector.lerp() keeps only the first vector's dimensions, which would drop z when mixing 2D and 3D.
        if (Math.max(a.dimensions, b.dimensions) > 2) {
            return new Vector(x, y, a.z + (b.z - a.z) * d);
        }
        return new Vector(x, y);
    }
}

// Color.lerp() exists at runtime but is missing from p5's typings.
type LerpableColor = p5.Color & { lerp(color: p5.Color, amt: number, mode?: string): p5.Color };

/**
 * Blends p5.Colors like p5's lerpColor(): in the color space of the colors themselves, so colors made in RGB blend
 * in RGB and colors made in HSB blend in HSB. The result is in a's color mode. d is clamped to [0, 1].
 */
export class ColorLerp implements LerpObject<p5.Color> {
    lerp(a: p5.Color, b: p5.Color, d: number): p5.Color {
        return (a as LerpableColor).lerp(b, constrain(d, 0, 1));
    }
}

const MAX_CACHED_PAIRS = 32;

interface EditScript {
    ops: Uint8Array;
    from: string[];
    to: string[];
    edits: number;
}

const KEEP = 0;
const SUB = 1;
const INS = 2;
const DEL = 3;

/** Morphs a into b with the fewest single-character edits (Levenshtein), applied left to right. */
export class StringLerp implements LerpObject<string> {
    // Edit scripts of recent pairs; lerp is called every frame with the same keys.
    readonly #scripts = new Map<string, EditScript>();

    lerp(a: string, b: string, t: number): string {
        const { ops, from, to, edits } = this.#script(a, b);
        const applied = Math.round(constrain(t, 0, 1) * edits);

        let out = '';
        let done = 0;
        for (let i = 0; i < ops.length; i++) {
            if (ops[i] === KEEP) {
                out += from[i];
                continue;
            }
            const apply = done++ < applied;
            if (ops[i] === SUB) {
                out += apply ? to[i] : from[i];
            } else if (ops[i] === INS) {
                if (apply) out += to[i];
            } else if (!apply) {
                out += from[i];
            }
        }
        return out;
    }

    #script(a: string, b: string): EditScript {
        const id = `${a.length}:${a}${b}`;
        let script = this.#scripts.get(id);
        if (!script) {
            script = build(a, b);
            if (this.#scripts.size >= MAX_CACHED_PAIRS) {
                this.#scripts.delete(this.#scripts.keys().next().value!);
            }
            this.#scripts.set(id, script);
        }
        return script;
    }
}

// Works on code points, so emoji and other characters outside the BMP are not torn apart.
function build(aText: string, bText: string): EditScript {
    const a = Array.from(aText);
    const b = Array.from(bText);
    const n = a.length;
    const m = b.length;
    const d: number[][] = Array.from({ length: n + 1 }, (_, i) => {
        const row = new Array<number>(m + 1).fill(0);
        row[0] = i;
        return row;
    });
    for (let j = 0; j <= m; j++) d[0]![j] = j;
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i]![j] = Math.min(d[i - 1]![j - 1]! + cost, Math.min(d[i - 1]![j]!, d[i]![j - 1]!) + 1);
        }
    }

    // Backtrack from the end, filling the arrays from the back so they read left to right.
    const len = n + m;
    const ops = new Uint8Array(len);
    const from = new Array<string>(len).fill('');
    const to = new Array<string>(len).fill('');
    let k = len;
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        k--;
        if (i > 0 && j > 0 && d[i]![j] === d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)) {
            ops[k] = a[i - 1] === b[j - 1] ? KEEP : SUB;
            from[k] = a[--i]!;
            to[k] = b[--j]!;
        } else if (i > 0 && d[i]![j] === d[i - 1]![j]! + 1) {
            ops[k] = DEL;
            from[k] = a[--i]!;
        } else {
            ops[k] = INS;
            to[k] = b[--j]!;
        }
    }
    return { ops: ops.slice(k), from: from.slice(k), to: to.slice(k), edits: d[n]![m]! };
}
