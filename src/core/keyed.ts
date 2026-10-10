import type p5 from 'p5';
import { binder, propertySetter } from './binder';
import { env, p5Runtime } from './env';
import { Key, segmentEasing } from './key';
import {
    BooleanLerp,
    ColorLerp,
    FloatLerp,
    IntLerp,
    StringLerp,
    VectorLerp,
    toLerpFunction,
    type Lerp,
    type LerpFunction,
} from './lerps';
import type { Lerpable } from './lerpable';
import type { Pin } from './pin';
import { settings } from './settings';
import { Timeline } from './timeline';
import { TweenAt, type Tween } from './tween';
import { Unit } from './unit';

interface KeyEntry<A> {
    readonly key: Key;
    tween: TweenAt<A>;
}

const constrain = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

/** A value animated between keys, plus the library-wide settings as static methods. */
export class Keyed<A> {
    static readonly SECOND = Unit.SECOND;
    static readonly FRAME = Unit.FRAME;

    static #defaultTimeline = new Timeline();

    readonly #lerp: LerpFunction<A>;
    readonly #defaultValue: A;
    #keys: Array<KeyEntry<A>> = [];
    // null means defaultTimeline(), looked up on use so values created before init() still pick it up.
    #tm: Timeline | null = null;
    // raw() wrapped by each added effect in order; the outermost wrapper is the final value.
    #output: Tween<A> = (t) => this.#raw(t);
    #target: ((value: A) => void) | null = null;

    /**
     * Call in setup() to start from a fresh default timeline, which every value without its own timeline follows.
     * Optional in global mode, where the library is hooked into p5 automatically; in instance mode pass the sketch.
     */
    static init(sketch?: unknown): Timeline {
        env.claim?.(sketch);
        Keyed.#defaultTimeline.dispose();
        Keyed.#defaultTimeline = new Timeline();
        return Keyed.#defaultTimeline;
    }

    /** Unit for the default timeline and new timelines. */
    static unit(): Unit {
        return settings.unit;
    }

    /** Sets the unit of the default timeline and of timelines created afterwards. */
    static setUnit(unit: Unit): void {
        if (unit !== Unit.SECOND && unit !== Unit.FRAME) {
            throw new RangeError(`unit must be Keyed.SECOND or Keyed.FRAME, was ${String(unit)}`);
        }
        settings.unit = unit;
        Keyed.#defaultTimeline.setUnit(unit);
    }

    /** Sync setting for new timelines. */
    static isSynced(): boolean {
        return settings.synced;
    }

    /** Sets sync for the default timeline and timelines created afterwards; see Timeline.sync(). */
    static sync(sync = true): void {
        settings.synced = sync;
        Keyed.#defaultTimeline.sync(sync);
    }

    /** Autoplay setting for new timelines. */
    static isAutoplay(): boolean {
        return settings.autoplay;
    }

    /** Sets autoplay for the default timeline and timelines created afterwards; see Timeline.autoplay(). */
    static autoplay(autoplay = true): void {
        settings.autoplay = autoplay;
        Keyed.#defaultTimeline.autoplay(autoplay);
    }

    /** Frame rate used to convert between frames and seconds. */
    static frameRate(): number {
        return settings.frameRate;
    }

    /** Must be > 0; pass the same value as p5's frameRate(). */
    static setFrameRate(fps: number): void {
        if (!(fps > 0)) {
            throw new RangeError(`frame rate must be > 0, was ${fps}`);
        }
        settings.frameRate = fps;
    }

    /** Used by Keyed values without their own timeline. */
    static defaultTimeline(): Timeline {
        return Keyed.#defaultTimeline;
    }

    /** Blends keys with lerp, a function (a, b, d) => value or an object with lerp(a, b, d); defaultValue is used while there are no keys. */
    constructor(lerp: Lerp<A>, defaultValue: A) {
        this.#lerp = toLerpFunction(lerp);
        this.#defaultValue = this.#copy(defaultValue);
    }

    /** Picks the type from the value: number, string, boolean, p5.Vector, p5.Color, or any object with lerp(b, d) that returns a new object. */
    static of(value: number): Keyed<number>;
    static of(value: string): Keyed<string>;
    static of(value: boolean): Keyed<boolean>;
    static of(value: p5.Vector): Keyed<p5.Vector>;
    static of(value: p5.Color): Keyed<p5.Color>;
    static of<A extends Lerpable<A>>(value: A): Keyed<A>;
    // Keyed<A> is invariant in A, so the implementation can't name one result type; the overloads above are the API.
    static of(value: unknown): Keyed<any> {
        switch (typeof value) {
            case 'number':
                return Keyed.ofFloat(value);
            case 'string':
                return Keyed.ofString(value);
            case 'boolean':
                return Keyed.ofBoolean(value);
        }
        if (typeof value === 'object' && value !== null) {
            const v = value as { isColor?: boolean; isVector?: boolean; lerp?: unknown };
            // Before the Lerpable check: p5.Color and p5.Vector have a lerp() too, but with another meaning.
            if (v.isColor === true) return Keyed.ofColor(value as p5.Color);
            if (v.isVector === true) return Keyed.ofVector(value as p5.Vector);
            if (typeof v.lerp === 'function') {
                return new Keyed<Lerpable<never>>((a, b, d) => a.lerp(b as never, d), value as Lerpable<never>);
            }
        }
        throw new TypeError(
            'Keyed.of() needs a number, string, boolean, p5.Vector, p5.Color or an object with lerp(b, d); use new Keyed(lerp, defaultValue) for anything else',
        );
    }

    // Named factories: the type is in the name, and the default value is only used while there are no keys.

    /** Animated number, 0 while there are no keys. */
    static ofFloat(defaultValue = 0): Keyed<number> {
        return new Keyed(new FloatLerp(), defaultValue);
    }

    /** Animated integer, rounded to the nearest one, 0 while there are no keys. */
    static ofInt(defaultValue = 0): Keyed<number> {
        return new Keyed(new IntLerp(), defaultValue);
    }

    /** Animated p5.Color, opaque black while there are no keys. See ColorLerp for how colors blend. */
    static ofColor(defaultValue?: p5.Color): Keyed<p5.Color> {
        return new Keyed(new ColorLerp(), defaultValue ?? new (p5Runtime().Color)([0, 0, 0, 1], 'rgb'));
    }

    /** Animated boolean, false while there are no keys. */
    static ofBoolean(defaultValue = false): Keyed<boolean> {
        return new Keyed(new BooleanLerp(), defaultValue);
    }

    /** Animated string, empty while there are no keys. */
    static ofString(defaultValue = ''): Keyed<string> {
        return new Keyed(new StringLerp(), defaultValue);
    }

    /** Animated p5.Vector, (0, 0, 0) while there are no keys. */
    static ofVector(defaultValue?: p5.Vector): Keyed<p5.Vector> {
        return new Keyed(new VectorLerp(), defaultValue ?? new (p5Runtime().Vector)(0, 0, 0));
    }

    /** The setter receives value() before every draw(), after the timelines have advanced. */
    static bind<A>(lerp: Lerp<A>, defaultValue: A, setter: (value: A) => void): Keyed<A>;
    /**
     * Binds a property by name, e.g. Keyed.bind(ball, 'x'). Its current value becomes the default and picks the type like
     * Keyed.of(); for integers use Keyed.ofInt().bind(obj, 'count'). Top-level let and const variables are not properties of
     * window (var is), so bind a setter for those.
     */
    static bind<T extends object, K extends keyof T & string>(target: T, property: K): Keyed<T[K]>;
    static bind(...args: unknown[]): Keyed<any> {
        if (args.length >= 3) {
            const [lerp, defaultValue, setter] = args as [Lerp<unknown>, unknown, (value: unknown) => void];
            return new Keyed(lerp, defaultValue).bind(setter);
        }
        const [target, property] = args as [object, string];
        // Checks that there is something to write to before reading the current value.
        const setter = propertySetter(target, property);
        // Keyed<A> is invariant in A, and the type of the property is only known at runtime.
        let keyed: Keyed<any>;
        try {
            keyed = Keyed.of((target as Record<string, any>)[property]);
        } catch {
            throw new TypeError(
                `Property '${property}' can't be bound by name: its value must be a number, string, boolean, p5.Vector, p5.Color or have lerp(b, d). Bind a setter instead.`,
            );
        }
        return keyed.bind(setter);
    }

    /**
     * Adds a key at time t, on a pin, or the key itself (adding the same Key again replaces its tween).
     * The value is a copy of what you pass; or a tween, a function of position 0..1, or a TweenAt to follow instead.
     * Functions and TweenAt objects are always read as tweens, so a Keyed can't hold those as its own values.
     */
    key(at: Key | Pin | number, value: A): this;
    key(at: Key | Pin | number, tween: Tween<A>): this;
    key(at: Key | Pin | number, tweenAt: TweenAt<A>): this;
    key(at: Key | Pin | number, v: A | Tween<A> | TweenAt<A>): this {
        const key = at instanceof Key ? at : Key.at(at);
        const tween = v instanceof TweenAt ? v : typeof v === 'function' ? new TweenAt(v as Tween<A>) : this.#constant(v);

        const existing = this.#keys.find((e) => e.key === key);
        if (existing) {
            existing.tween = tween;
        } else {
            this.#keys.push({ key, tween });
        }
        return this;
    }

    /** The setter receives value() before every draw(), after the timelines have advanced; replaces any previous one. */
    bind(setter: (value: A) => void): this;
    /** Writes value() to target[property] before every draw(), e.g. keyed.bind(ball, 'count') for an integer. */
    bind(target: object, property: string): this;
    bind(a: object | ((value: A) => void), property?: string): this {
        if (typeof a === 'function') {
            this.#target = a as (value: A) => void;
        } else if (property !== undefined) {
            this.#target = propertySetter<A>(a, property);
        } else {
            throw new TypeError('bind() needs a setter function, or an object and the name of its property');
        }
        binder.add(this);
        return this;
    }

    /** Stops updating the bound target, which keeps its last value. */
    unbind(): this {
        this.#target = null;
        binder.remove(this);
        return this;
    }

    /** Writes value() to the bound target now, e.g. in setup() before the first draw(). */
    apply(): this {
        this.#target?.(this.value());
        return this;
    }

    /** Removes a key, or every key placed on a pin. */
    removeKey(at: Key | Pin): this {
        this.#keys = this.#keys.filter((e) => (at instanceof Key ? e.key !== at : e.key.pin() !== at));
        return this;
    }

    /** Removes all keys. */
    clearKeys(): this {
        this.#keys = [];
        return this;
    }

    /** Follows tm instead of the default timeline; null reverts to the default. */
    setTimeline(tm: Timeline | null): this {
        this.#tm = tm;
        return this;
    }

    /** Value at time t, or at the timeline's current time, with effects applied. */
    value(t?: number): A {
        return this.#output(t ?? this.timeline().t());
    }

    /** Keys sorted by time. */
    keys(): Key[] {
        this.#sortKeys();
        return this.#keys.map((e) => e.key);
    }

    /** Timeline set with setTimeline(), otherwise the default timeline. */
    timeline(): Timeline {
        return this.#tm ?? Keyed.#defaultTimeline;
    }

    #raw(t: number): A {
        this.#sortKeys();
        const keys = this.#keys;
        const n = keys.length;

        if (n === 0) {
            return this.#copy(this.#defaultValue);
        }

        if (n === 1) {
            const k = keys[0]!.tween;
            return this.#copy(k.tween()(k.positionOr(0)));
        }

        // First key after t, limited to [1, n - 1] so t outside the keys uses the first or last segment.
        let lo = 1;
        let hi = n - 1;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (t < keys[mid]!.key.t()) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        const e1 = keys[lo - 1]!;
        const e2 = keys[lo]!;

        const from = e1.key.t();
        const to = e2.key.t();
        const d = to > from ? (constrain(t, from, to) - from) / (to - from) : t < to ? 0 : 1;
        const ease = segmentEasing(e1.key, e2.key)(d);
        const p1 = e1.tween.positionOr(0);
        const position = p1 + (e2.tween.positionOr(1) - p1) * ease;
        const w0 = e1.tween.tween();
        const w1 = e2.tween.tween();
        const v0 = w0(position);
        // Same tween at the same position gives the same value; blending it with itself is a copy.
        return w0 === w1 ? this.#copy(v0) : this.#lerp(v0, w1(position), ease);
    }

    // A key holding a copy of value, so changing the original afterwards doesn't change the key.
    #constant(value: A): TweenAt<A> {
        const v = this.#copy(value);
        return new TweenAt(() => v);
    }

    // lerp(v, v, 0) returns a new value, so callers can't mutate stored keys through it.
    #copy(value: A): A {
        return this.#lerp(value, value, 0);
    }

    // Keys are mutable (Key.to, shared Pins), so order is restored on read; stable for equal times.
    #sortKeys(): void {
        this.#keys.sort((a, b) => a.key.compareTo(b.key));
    }
}
