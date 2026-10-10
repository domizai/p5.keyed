import { Easing } from './easing';
import { Pin } from './pin';

const checkInfluence = (influence: number): number => {
    if (!(influence >= 0 && influence <= 1)) {
        throw new RangeError(`easing must be in [0, 1], was ${influence}`);
    }
    return influence;
};

/** A keyframe time, with easing for the segments around it. */
export class Key {
    readonly #pin: Pin;
    // Handle influence in [0, 1] as a fraction of the segment, with zero speed at the key; 0 is linear, 1/3 is AE's Easy Ease.
    #easingIn = 0;
    #easingOut = 0;
    // Replaces the influence curve on the segment leaving this key when set.
    #easing: Easing | null = null;

    /** Key on a shared pin, or at time t with its own pin. */
    constructor(at: Pin | number) {
        this.#pin = at instanceof Pin ? at : new Pin(at);
    }

    /** Key on a shared pin, or at time t with its own pin. */
    static at(at: Pin | number): Key {
        return new Key(at);
    }

    /** Moves the pin, so every key sharing it moves too. */
    to(t: number): this {
        this.#pin.to(t);
        return this;
    }

    /** Pin holding this key's time. */
    pin(): Pin {
        return this.#pin;
    }

    /** Time of this key's pin. */
    t(): number {
        return this.#pin.t();
    }

    /**
     * Number: sets both easingIn and easingOut influence, in [0, 1]; 1 / 3 is After Effects' Easy Ease.
     * Easing: curve for the whole segment from this key to the next, e.g. Easing.QUAD_OUT; ignores the next key's easingIn.
     */
    setEasing(easing: number | Easing): this {
        if (typeof easing === 'function') {
            this.#easing = easing;
            return this;
        }
        if (typeof easing !== 'number') {
            throw new TypeError('setEasing() needs an influence in [0, 1] or an Easing function');
        }
        return this.setEasingIn(easing).setEasingOut(easing);
    }

    /** Keeps this key's value until the next key, for stepped or stop-motion animation. */
    hold(): this {
        return this.setEasing(Easing.HOLD);
    }

    /** Shapes the segment arriving at this key; influence in [0, 1]. */
    setEasingIn(influence: number): this {
        this.#easingIn = checkInfluence(influence);
        return this;
    }

    /** Shapes the segment leaving this key; clears an Easing set with setEasing(Easing). */
    setEasingOut(influence: number): this {
        this.#easingOut = checkInfluence(influence);
        this.#easing = null;
        return this;
    }

    /** Influence of the arriving segment, in [0, 1]. */
    easingIn(): number {
        return this.#easingIn;
    }

    /** Influence of the leaving segment, in [0, 1]. */
    easingOut(): number {
        return this.#easingOut;
    }

    /** Curve of the leaving segment; null when it uses the easingOut/easingIn influence curve. */
    easing(): Easing | null {
        return this.#easing;
    }

    compareTo(o: Key): number {
        return this.#pin.compareTo(o.#pin);
    }
}

/** @internal Curve of the segment from one key to the next: the leaving key's Easing, otherwise the influence curve of both keys. */
export function segmentEasing(from: Key, to: Key): Easing {
    return from.easing() ?? Easing.cubicBezier(from.easingOut(), 0, 1 - to.easingIn(), 1);
}
