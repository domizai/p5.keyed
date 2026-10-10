/** A type that blends itself with another value; use with Keyed.of(value) instead of passing a separate lerp. */
export interface Lerpable<T extends Lerpable<T>> {
    /** Blends toward b by d in [0, 1]; must return a new object for mutable types, so stored keys can't be changed through the result. */
    lerp(b: T, d: number): T;
}
