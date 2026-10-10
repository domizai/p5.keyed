/** A value as a function of position, normally 0..1. */
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
