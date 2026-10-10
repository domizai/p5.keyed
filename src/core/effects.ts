import type p5 from 'p5';
import { p5Runtime } from './env';
import { toLerpFunction, VectorLerp, type Lerp, type LerpFunction } from './lerps';
import type { Tween } from './tween';

/**
 * Changes a value on top of its keys. It gets the animation as a function of time and the time itself, so it can read
 * the value at any other time: `(source, t) => source(t - 0.5)` plays the animation half a second late.
 */
export type TimeEffect<T> = (source: Tween<T>, t: number) => T;

/** An effect as an object, like the classes below: anything with an apply(source, t) method. */
export interface TimeEffectObject<T> {
    apply(source: Tween<T>, t: number): T;
}

/** @internal */
export function toTimeEffect<T>(effect: TimeEffect<T> | TimeEffectObject<T>): TimeEffect<T> {
    if (typeof effect === 'function') return effect;
    if (effect && typeof effect.apply === 'function') return (source, t) => effect.apply(source, t);
    throw new TypeError('expected an effect: a function (source, t) => value, or an object with apply(source, t)');
}

// A vector in 3D only if it has to be, so 2D vectors stay 2D.
function vector(x: number, y: number, z: number, is3D: boolean): p5.Vector {
    const { Vector } = p5Runtime();
    return is3D ? new Vector(x, y, z) : new Vector(x, y);
}

/** Snaps x and y to a grid. */
export class GridSnap implements TimeEffectObject<p5.Vector> {
    readonly #sizeX: number;
    readonly #sizeY: number;

    /** Snaps x and y to multiples of size; z is untouched. With two sizes, 0 leaves that axis untouched. */
    constructor(size: number);
    constructor(sizeX: number, sizeY: number);
    constructor(sizeX: number, sizeY: number = sizeX) {
        const single = arguments.length < 2;
        const valid = (s: number) => single ? s > 0 : s >= 0;
        if (!valid(sizeX) || !valid(sizeY) || !Number.isFinite(sizeX) || !Number.isFinite(sizeY)) {
            throw new RangeError(`grid sizes must be ${single ? '> 0' : '>= 0'} and finite, were ${sizeX} and ${sizeY}`);
        }
        if (sizeX === 0 && sizeY === 0) throw new RangeError('at least one size must be > 0');
        this.#sizeX = sizeX;
        this.#sizeY = sizeY;
    }

    apply(source: Tween<p5.Vector>, t: number): p5.Vector {
        const p = source(t);
        return vector(snap(p.x, this.#sizeX), snap(p.y, this.#sizeY), p.z, p.dimensions > 2);
    }
}

// Rounds half up like Math.round, which also works for large v / size.
function snap(v: number, size: number): number {
    return size > 0 ? Math.floor(v / size + 0.5) * size : v;
}

/** Circular motion around the value. */
export class Orbit implements TimeEffectObject<p5.Vector> {
    readonly #radius: number;
    readonly #frequency: number;
    // Orthonormal basis of the orbit plane.
    readonly #u: [number, number, number];
    readonly #v: [number, number, number];

    /** Orbits in the XY plane, or in the plane perpendicular to axis, turning by the right-hand rule. frequency is in cycles per second. */
    constructor(radius: number, frequency: number, axis?: p5.Vector) {
        this.#radius = radius;
        this.#frequency = frequency;
        const [nx, ny, nz] = normalize(axis ? [axis.x, axis.y, axis.z] : [0, 0, 1]);
        const ref: [number, number, number] = Math.abs(ny) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        this.#u = normalize(cross(ref, [nx, ny, nz]));
        this.#v = cross([nx, ny, nz], this.#u);
    }

    apply(source: Tween<p5.Vector>, t: number): p5.Vector {
        const p = source(t);
        const a = t * this.#frequency * 2 * Math.PI;
        const c = Math.cos(a) * this.#radius;
        const s = Math.sin(a) * this.#radius;
        const [u, v] = [this.#u, this.#v];
        return vector(
            p.x + u[0] * c + v[0] * s,
            p.y + u[1] * c + v[1] * s,
            p.z + u[2] * c + v[2] * s,
            p.dimensions > 2 || u[2] !== 0 || v[2] !== 0,
        );
    }
}

type Vec3 = [number, number, number];

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(a: Vec3): Vec3 {
    const m = Math.hypot(a[0], a[1], a[2]);
    if (!(m > 0) || !Number.isFinite(m)) throw new RangeError('the axis must not be a zero vector');
    return [a[0] / m, a[1] / m, a[2] / m];
}

let nextSeed = 1;

/** Smooth random offset, like After Effects' wiggle(); the offset per axis stays within ±amplitude. */
export class Wiggle implements TimeEffectObject<p5.Vector> {
    readonly #amplitude: Vec3;
    readonly #frequency: number;
    readonly #seed: number;

    /**
     * amplitude is a number for x and y, or a vector per axis (set z to wiggle in 3D). frequency is in wiggles per second.
     * The same seed and settings always give the same motion; without a seed, each Wiggle gets its own.
     */
    constructor(amplitude: number | p5.Vector, frequency: number, seed: number = nextSeed++) {
        this.#amplitude = typeof amplitude === 'number' ? [amplitude, amplitude, 0] : [amplitude.x, amplitude.y, amplitude.z];
        this.#frequency = frequency;
        this.#seed = seed | 0;
    }

    apply(source: Tween<p5.Vector>, t: number): p5.Vector {
        const p = source(t);
        const s = t * this.#frequency;
        const a = this.#amplitude;
        return vector(
            p.x + this.#noise(s, 0) * a[0],
            p.y + this.#noise(s, 1) * a[1],
            p.z + this.#noise(s, 2) * a[2],
            p.dimensions > 2 || a[2] !== 0,
        );
    }

    // 1D gradient noise in [-1, 1].
    #noise(x: number, axis: number): number {
        const i = Math.floor(x);
        const f = x - i;
        const g0 = this.#gradient(i, axis) * f;
        const g1 = this.#gradient(i + 1, axis) * (f - 1);
        const u = f * f * f * (f * (f * 6 - 15) + 10);
        return 2 * (g0 + u * (g1 - g0));
    }

    // Pseudo-random slope in [-1, 1) for lattice point i, hashed with a 32-bit integer mixer.
    #gradient(i: number, axis: number): number {
        let h = (Math.imul(i | 0, 0x9e3779b9) + Math.imul(this.#seed, 0x7feb352d) + Math.imul(axis + 1, 0x846ca68b)) | 0;
        h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
        h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
        h ^= h >>> 16;
        return (h >>> 8) / (1 << 23) - 1;
    }
}

/** Holds each pose for step seconds; 2 / 24 animates "on twos" at 24 fps. */
export class StopMotion<T> implements TimeEffectObject<T> {
    readonly #step: number;

    constructor(step: number) {
        if (!(step > 0)) throw new RangeError(`step must be > 0, was ${step}`);
        this.#step = step;
    }

    apply(source: Tween<T>, t: number): T {
        return source(Math.floor(t / this.#step) * this.#step);
    }
}

/** Averages the value over the last duration seconds: trails behind and smooths out sharp moves, without overshoot. */
export class Lag<T> implements TimeEffectObject<T> {
    readonly #lerp: LerpFunction<T>;
    readonly #duration: number;
    readonly #samples: number;

    /** duration is in seconds; more samples is smoother but costs one source evaluation each. */
    constructor(lerp: Lerp<T>, duration: number, samples: number) {
        if (!(duration > 0) || !Number.isFinite(duration)) throw new RangeError(`duration must be > 0, was ${duration}`);
        if (!Number.isInteger(samples) || samples < 1) throw new RangeError(`samples must be a whole number >= 1, was ${samples}`);
        this.#lerp = toLerpFunction(lerp);
        this.#duration = duration;
        this.#samples = samples;
    }

    // Samples sit on a fixed grid of times and the output blends the averages at the grid points
    // before and after t, so it moves smoothly even when the source jumps (e.g. hold keys).
    apply(source: Tween<T>, t: number): T {
        const n = this.#samples;
        const step = this.#duration / n;
        const g = Math.floor(t / step);
        const f = t / step - g;
        const values: T[] = [];
        for (let k = 0; k <= n; k++) values.push(source((g - k) * step));
        return this.#lerp(this.#average(values, 1), this.#average(values, 0), f);
    }

    // Average of samples values, starting offset grid steps back.
    #average(values: T[], offset: number): T {
        let r = values[offset] as T;
        for (let i = 1; i < this.#samples; i++) {
            r = this.#lerp(r, values[i + offset] as T, 1 / (i + 1));
        }
        return r;
    }
}

const SAMPLES_PER_PERIOD = 16;
// The response is cut off once the oscillation envelope falls below this.
const CUTOFF = 1e-3;

/**
 * Damped spring following the value: lags while it moves, overshoots and settles when it stops.
 * Needs a lerp that extrapolates beyond [0, 1] (VectorLerp, FloatLerp); ColorLerp clamps, so there is no overshoot.
 */
export class Spring<T> implements TimeEffectObject<T> {
    readonly #lerp: LerpFunction<T>;
    readonly #dt: number;
    readonly #weights: number[];

    /**
     * frequency: oscillations per second; keep it below half the frame rate or the wobble can't be seen.
     * damping: ratio in (0, 1); lower wobbles longer and costs more samples.
     */
    constructor(lerp: Lerp<T>, frequency: number, damping: number) {
        if (!(frequency > 0) || !Number.isFinite(frequency)) throw new RangeError(`frequency must be > 0, was ${frequency}`);
        if (!(damping > 0 && damping < 1)) throw new RangeError(`damping must be in (0, 1), was ${damping}`);
        this.#lerp = toLerpFunction(lerp);

        const w = 2 * Math.PI * frequency;
        const wd = w * Math.sqrt(1 - damping * damping);
        const dt = (2 * Math.PI) / wd / SAMPLES_PER_PERIOD;
        const n = Math.ceil(Math.log(1 / CUTOFF) / (damping * w) / dt);

        // Impulse response of y'' + 2*damping*w*y' + w^2*y = w^2*x, sampled at interval midpoints.
        const h: number[] = [];
        let sum = 0;
        for (let i = 0; i < n; i++) {
            const tau = (i + 0.5) * dt;
            const v = Math.exp(-damping * w * tau) * Math.sin(wd * tau);
            h.push(v);
            sum += v;
        }
        this.#dt = dt;
        this.#weights = h.map((v) => v / sum);
    }

    // Sampling at fixed delays from t would make the output jump whenever a sample crosses a jump in
    // the source (e.g. hold keys), visibly stepping for slow springs. Instead the samples sit on a
    // fixed grid of times, and the output blends the responses at the grid points before and after t.
    // The newest sample is at or before t, so the spring never reacts before the source moves.
    apply(source: Tween<T>, t: number): T {
        const n = this.#weights.length;
        const g = Math.floor(t / this.#dt);
        const f = t / this.#dt - g;
        const samples: T[] = [];
        for (let k = 0; k <= n; k++) samples.push(source((g - k) * this.#dt));
        return this.#lerp(this.#respond(samples, 1), this.#respond(samples, 0), f);
    }

    // Weighted blend of the samples, starting offset grid steps back.
    #respond(samples: T[], offset: number): T {
        const weights = this.#weights;
        let r = samples[offset] as T;
        let total = weights[0]!;
        for (let i = 1; i < weights.length; i++) {
            total += weights[i]!;
            r = this.#lerp(r, samples[i + offset] as T, weights[i]! / total);
        }
        return r;
    }
}

/** Shortcuts for p5.Vector values: the same arguments as the constructors. */
export const Effect = {
    /** Smooth random offset in x and y within ±amplitude; frequency in wiggles per second. */
    wiggle(amplitude: number | p5.Vector, frequency: number, seed?: number): Wiggle {
        return new Wiggle(amplitude, frequency, seed);
    },

    /** Circles in the XY plane, or around axis; frequency in cycles per second. */
    orbit(radius: number, frequency: number, axis?: p5.Vector): Orbit {
        return new Orbit(radius, frequency, axis);
    },

    /** Snaps x and y to multiples of sizeX and sizeY (size alone: both); 0 leaves that axis untouched. */
    gridSnap(sizeX: number, sizeY?: number): GridSnap {
        return sizeY === undefined ? new GridSnap(sizeX) : new GridSnap(sizeX, sizeY);
    },

    /** Damped spring; frequency in oscillations per second, damping in (0, 1). */
    spring(frequency: number, damping: number): Spring<p5.Vector> {
        return new Spring(new VectorLerp(), frequency, damping);
    },

    /** Averages over the last duration seconds from samples evaluations. */
    lag(duration: number, samples: number): Lag<p5.Vector> {
        return new Lag(new VectorLerp(), duration, samples);
    },
} as const;
