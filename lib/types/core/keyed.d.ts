import type p5 from 'p5';
import { type TimeEffect, type TimeEffectObject } from './effects.js';
import { Key } from './key.js';
import { type Lerp } from './lerps.js';
import type { Lerpable } from './lerpable.js';
import { Path } from './paths.js';
import type { Pin } from './pin.js';
import { Timeline } from './timeline.js';
import { TweenAt, type Tween } from './tween.js';
import { Unit } from './unit.js';
/** A value animated between keys, plus the library-wide settings as static methods. */
export declare class Keyed<A> {
    #private;
    static readonly SECOND: "second";
    static readonly FRAME: "frame";
    /**
     * Call in setup() to start from a fresh default timeline, which every value without its own timeline follows.
     * Optional in global mode, where the library is hooked into p5 automatically; in instance mode pass the sketch.
     */
    static init(sketch?: unknown): Timeline;
    /** Unit for the default timeline and new timelines. */
    static unit(): Unit;
    /** Sets the unit of the default timeline and of timelines created afterwards. */
    static setUnit(unit: Unit): void;
    /** Sync setting for new timelines. */
    static isSynced(): boolean;
    /** Sets sync for the default timeline and timelines created afterwards; see Timeline.sync(). */
    static sync(sync?: boolean): void;
    /** Autoplay setting for new timelines. */
    static isAutoplay(): boolean;
    /** Sets autoplay for the default timeline and timelines created afterwards; see Timeline.autoplay(). */
    static autoplay(autoplay?: boolean): void;
    /** Frame rate used to convert between frames and seconds. */
    static frameRate(): number;
    /** Must be > 0; pass the same value as p5's frameRate(). */
    static setFrameRate(fps: number): void;
    /** Used by Keyed values without their own timeline. */
    static defaultTimeline(): Timeline;
    /**
     * Blends keys with lerp, a function (a, b, d) => value or an object with lerp(a, b, d).
     * defaultValue is used while there are no keys; without one, value() is undefined until the first key.
     */
    constructor(lerp: Lerp<A>, defaultValue?: A);
    /** Picks the type from the value: number, string, boolean, p5.Vector, p5.Color, or any object with lerp(b, d) that returns a new object. */
    static of(value: number): Keyed<number>;
    static of(value: string): Keyed<string>;
    static of(value: boolean): Keyed<boolean>;
    static of(value: p5.Vector): Keyed<p5.Vector>;
    static of(value: p5.Color): Keyed<p5.Color>;
    static of<A extends Lerpable<A>>(value: A): Keyed<A>;
    /** Animated number, 0 while there are no keys. */
    static ofFloat(defaultValue?: number): Keyed<number>;
    /** Animated integer, rounded to the nearest one, 0 while there are no keys. */
    static ofInt(defaultValue?: number): Keyed<number>;
    /** Animated p5.Color, opaque black while there are no keys. See ColorLerp for how colors blend. */
    static ofColor(defaultValue?: p5.Color): Keyed<p5.Color>;
    /** Animated boolean, false while there are no keys. */
    static ofBoolean(defaultValue?: boolean): Keyed<boolean>;
    /** Animated string, empty while there are no keys. */
    static ofString(defaultValue?: string): Keyed<string>;
    /** Animated p5.Vector, (0, 0, 0) while there are no keys. */
    static ofVector(defaultValue?: p5.Vector): Keyed<p5.Vector>;
    /** The setter receives value() before every draw(), after the timelines have advanced. */
    static bind<A>(lerp: Lerp<A>, defaultValue: A, setter: (value: A) => void): Keyed<A>;
    /**
     * Binds a property by name, e.g. Keyed.bind(ball, 'x'). Its current value becomes the default and picks the type like
     * Keyed.of(); for integers use Keyed.ofInt().bind(obj, 'count'). Top-level let and const variables are not properties of
     * window (var is), so bind a setter for those.
     */
    static bind<T extends object, K extends keyof T & string>(target: T, property: K): Keyed<T[K]>;
    /**
     * Adds a key at time t, on a pin, or the key itself (adding the same Key again replaces its tween).
     * The value is a copy of what you pass; or a tween, a function of position 0..1, or a TweenAt to follow instead.
     * Functions, TweenAt and Path objects are always read as tweens, so a Keyed can't hold those as its own values.
     */
    key(at: Key | Pin | number, value: A): this;
    key(at: Key | Pin | number, tween: Tween<A>): this;
    key(at: Key | Pin | number, tweenAt: TweenAt<A>): this;
    /** A path travels all of it from key to key; path.at(position) pins a key to one position on it. */
    key(at: Key | Pin | number, path: A extends p5.Vector ? Path : never): this;
    /** The setter receives value() before every draw(), after the timelines have advanced; replaces any previous one. */
    bind(setter: (value: A) => void): this;
    /** Writes value() to target[property] before every draw(), e.g. keyed.bind(ball, 'count') for an integer. */
    bind(target: object, property: string): this;
    /** Stops updating the bound target, which keeps its last value. */
    unbind(): this;
    /** Writes value() to the bound target now, e.g. in setup() before the first draw(). */
    apply(): this;
    /** Removes a key, or every key placed on a pin. */
    removeKey(at: Key | Pin): this;
    /** Removes all keys. */
    clearKeys(): this;
    /** Follows tm instead of the default timeline; null reverts to the default. */
    setTimeline(tm: Timeline | null): this;
    /** Value at time t, or at the timeline's current time, with effects applied. */
    value(t?: number): A;
    /** Keys sorted by time. */
    keys(): Key[];
    /** Timeline set with setTimeline(), otherwise the default timeline. */
    timeline(): Timeline;
    /**
     * Wraps the current output; effects apply in the order added. On a looping timeline, times they sample outside the
     * duration wrap around. Takes a function (source, t) => value or an object with apply(source, t), like Wiggle.
     */
    addEffect(effect: TimeEffect<A> | TimeEffectObject<A>): this;
    /** Values at now, now - delay, now - 2 * delay, ...; a negative delay samples the future. */
    echo(samples: number, delay: number): A[];
}
