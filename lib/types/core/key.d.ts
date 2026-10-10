import { Easing } from './easing';
import { Pin } from './pin';
/** A keyframe time, with easing for the segments around it. */
export declare class Key {
    #private;
    /** Key on a shared pin, or at time t with its own pin. */
    constructor(at: Pin | number);
    /** Key on a shared pin, or at time t with its own pin. */
    static at(at: Pin | number): Key;
    /** Moves the pin, so every key sharing it moves too. */
    to(t: number): this;
    /** Pin holding this key's time. */
    pin(): Pin;
    /** Time of this key's pin. */
    t(): number;
    /**
     * Number: sets both easingIn and easingOut influence, in [0, 1]; 1 / 3 is After Effects' Easy Ease.
     * Easing: curve for the whole segment from this key to the next, e.g. Easing.QUAD_OUT; ignores the next key's easingIn.
     */
    setEasing(easing: number | Easing): this;
    /** Keeps this key's value until the next key, for stepped or stop-motion animation. */
    hold(): this;
    /** Shapes the segment arriving at this key; influence in [0, 1]. */
    setEasingIn(influence: number): this;
    /** Shapes the segment leaving this key; clears an Easing set with setEasing(Easing). */
    setEasingOut(influence: number): this;
    /** Influence of the arriving segment, in [0, 1]. */
    easingIn(): number;
    /** Influence of the leaving segment, in [0, 1]. */
    easingOut(): number;
    /** Curve of the leaving segment; null when it uses the easingOut/easingIn influence curve. */
    easing(): Easing | null;
    compareTo(o: Key): number;
}
