/** A value as a function of position, normally 0..1. Paths are tweens too: see Path.tween(). */
export type Tween<T> = (d: number) => T;

/** A Tween with an optional fixed position at which a key samples it. */
export class TweenAt<T> {
    readonly #tween: Tween<T>;
    readonly #position: number | null;

    /** Without a position the key samples the tween at 0 leaving it and at 1 arriving at it. */
    constructor(tween: Tween<T>, position?: number) {
        this.#tween = tween;
        this.#position = position ?? null;
    }

    /** The wrapped tween. */
    tween(): Tween<T> {
        return this.#tween;
    }

    /** The fixed position, or fallback if none. */
    positionOr(fallback: number): number {
        return this.#position ?? fallback;
    }
}

/** Helpers for tweens that are plain functions; a Path has the same as methods: at(), map(), x(), y(). */
export const Tween = {
    /** Wraps tween so a key samples it at a fixed position. */
    at<T>(tween: Tween<T>, position: number): TweenAt<T> {
        return new TweenAt(tween, position);
    },

    /** Applies f to each value. */
    map<T, R>(tween: Tween<T>, f: (value: T) => R): Tween<R> {
        return (d) => f(tween(d));
    },
} as const;
