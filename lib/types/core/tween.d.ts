/** A value as a function of position, normally 0..1. Paths are tweens too: see Path.tween(). */
export type Tween<T> = (d: number) => T;
/** A Tween with an optional fixed position at which a key samples it. */
export declare class TweenAt<T> {
    #private;
    /** Without a position the key samples the tween at 0 leaving it and at 1 arriving at it. */
    constructor(tween: Tween<T>, position?: number);
    /** The wrapped tween. */
    tween(): Tween<T>;
    /** The fixed position, or fallback if none. */
    positionOr(fallback: number): number;
}
/** Helpers for tweens that are plain functions; a Path has the same as methods: at(), map(), x(), y(). */
export declare const Tween: {
    /** Wraps tween so a key samples it at a fixed position. */
    readonly at: <T>(tween: Tween<T>, position: number) => TweenAt<T>;
    /** Applies f to each value. */
    readonly map: <T, R>(tween: Tween<T>, f: (value: T) => R) => Tween<R>;
};
