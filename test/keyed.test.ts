import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AngleLerp, Easing, Key, Keyed, Pin, Timeline, TweenAt, Unit, settings } from '../src/core';
import { env } from '../src/core/env';

beforeEach(() => {
    Object.assign(settings, { unit: Unit.SECOND, synced: true, autoplay: true, frameRate: 60 });
    env.claim = undefined;
    Keyed.init();
});

const manual = () => new Timeline(null);
const samples = (k: Keyed<number>, ts: number[]) => ts.map((t) => k.value(t));

describe('values between keys', () => {
    it('is the default value while there are no keys', () => {
        expect(Keyed.ofFloat().value(1)).toBe(0);
        expect(Keyed.ofFloat(5).value(1)).toBe(5);
        expect(Keyed.ofString().value(0)).toBe('');
        expect(Keyed.ofBoolean().value(0)).toBe(false);
        expect(Keyed.ofInt(3).value(0)).toBe(3);
    });

    it('is constant with a single key', () => {
        const x = Keyed.ofFloat().key(2, 7);
        expect(samples(x, [-5, 0, 2, 100])).toEqual([7, 7, 7, 7]);
    });

    it('blends linearly and holds the end values outside the keys', () => {
        const x = Keyed.ofFloat().key(0, 0).key(2, 10).key(4, 0);
        expect(samples(x, [-1, 0, 1, 2, 3, 4, 9])).toEqual([0, 0, 5, 10, 5, 0, 0]);
    });

    it('sorts keys added out of order', () => {
        const x = Keyed.ofFloat().key(4, 0).key(0, 0).key(2, 10);
        expect(samples(x, [1, 3])).toEqual([5, 5]);
        expect(x.keys().map((k) => k.t())).toEqual([0, 2, 4]);
    });

    it('jumps between two keys at the same time', () => {
        const x = Keyed.ofFloat().key(0, 0).key(1, 3).key(1, 7).key(2, 10);
        expect(x.value(0.5)).toBe(1.5);
        expect(x.value(0.999)).toBeCloseTo(2.997, 3);
        expect(x.value(1)).toBe(7);
        expect(x.value(1.5)).toBe(8.5);
    });

    it('reads the value at the timeline time', () => {
        const tm = manual();
        const x = Keyed.ofFloat().setTimeline(tm).key(0, 0).key(2, 10);
        expect(x.value()).toBe(0);
        tm.to(1);
        expect(x.value()).toBe(5);
        expect(x.timeline()).toBe(tm);
    });

    it('follows the default timeline until given another one', () => {
        const x = Keyed.ofFloat().key(0, 0).key(2, 10);
        Keyed.defaultTimeline().to(1);
        expect(x.value()).toBe(5);
        const tm = manual().to(2);
        x.setTimeline(tm);
        expect(x.value()).toBe(10);
        x.setTimeline(null);
        expect(x.timeline()).toBe(Keyed.defaultTimeline());
    });

    it('follows the default timeline created later by init()', () => {
        const x = Keyed.ofFloat().key(0, 0).key(2, 10);
        Keyed.init().to(1.5);
        expect(x.value()).toBe(7.5);
    });
});

describe('easing', () => {
    it('applies the leaving key curve', () => {
        const x = Keyed.ofFloat().key(Key.at(0).setEasing(Easing.QUAD_IN), 0).key(2, 10);
        expect(x.value(1)).toBe(2.5);
    });

    it('applies influence on both keys', () => {
        const x = Keyed.ofFloat()
            .key(Key.at(0).setEasing(1 / 3), 0)
            .key(Key.at(2).setEasing(1 / 3), 10);
        expect(x.value(1)).toBeCloseTo(5, 5);
        expect(x.value(0.2)).toBeLessThan(1);
        expect(x.value(1.8)).toBeGreaterThan(9);
    });

    it('holds a value until the next key', () => {
        const x = Keyed.ofInt().key(Key.at(0).hold(), 2).key(Key.at(2).hold(), 1).key(2.5, 0);
        expect(samples(x, [0, 1, 1.99, 2, 2.4, 2.5, 3])).toEqual([2, 2, 2, 1, 1, 0, 0]);
    });

    it('does not ease the last key', () => {
        const x = Keyed.ofFloat().key(0, 0).key(Key.at(2).setEasing(Easing.CUBIC_IN), 10);
        expect(x.value(1)).toBe(5);
    });
});

describe('pins and keys', () => {
    it('retimes every key sharing a pin', () => {
        const arrive = Pin.at(1);
        const x = Keyed.ofFloat().key(0, 0).key(arrive, 10).key(3, 0);
        const size = Keyed.ofFloat().key(0, 20).key(arrive, 80).key(3, 20);
        expect(x.value(0.5)).toBe(5);
        expect(size.value(0.5)).toBe(50);
        arrive.to(2);
        expect(x.value(0.5)).toBe(2.5);
        expect(size.value(0.5)).toBe(35);
        expect(x.value(2)).toBe(10);
    });

    it('keeps order when a key is moved past another', () => {
        const k = Key.at(1);
        const x = Keyed.ofFloat().key(0, 0).key(k, 10).key(2, 20);
        k.to(3);
        expect(x.keys().map((key) => key.t())).toEqual([0, 2, 3]);
        expect(x.value(2.5)).toBe(15);
    });

    it('replaces the tween when the same Key is added again', () => {
        const k = Key.at(1);
        const x = Keyed.ofFloat().key(0, 0).key(k, 10).key(k, 20);
        expect(x.keys()).toHaveLength(2);
        expect(x.value(1)).toBe(20);
    });

    it('removes keys by key or by pin and clears them all', () => {
        const pin = Pin.at(1);
        const a = Key.at(0);
        const x = Keyed.ofFloat().key(a, 0).key(pin, 10).key(pin, 11).key(3, 5);
        expect(x.keys()).toHaveLength(4);
        x.removeKey(pin);
        expect(x.keys()).toHaveLength(2);
        x.removeKey(a);
        expect(x.keys().map((k) => k.t())).toEqual([3]);
        x.clearKeys();
        expect(x.keys()).toEqual([]);
        expect(x.value(0)).toBe(0);
    });

    it('rejects times that are not numbers', () => {
        expect(() => Keyed.ofFloat().key(NaN, 1)).toThrow(TypeError);
        expect(() => Keyed.ofFloat().key('1' as never, 1)).toThrow(TypeError);
    });

    it('lists keys sorted without exposing the internal list', () => {
        const x = Keyed.ofFloat().key(2, 1).key(1, 1);
        x.keys().length = 0;
        expect(x.keys()).toHaveLength(2);
    });
});

describe('tweens', () => {
    it('follows a tween instead of a value', () => {
        const x = Keyed.ofFloat()
            .key(0, (d) => 100 * d)
            .key(1, (d) => 100 * d);
        // Different functions: both are sampled at the eased position and then blended.
        expect(x.value(0.25)).toBeCloseTo(25, 9);
    });

    it('samples a shared tween once, at the eased position', () => {
        const tween = vi.fn((d: number) => d * 10);
        const x = Keyed.ofFloat().key(0, tween).key(2, tween);
        expect(x.value(0.5)).toBeCloseTo(2.5, 9);
        expect(tween).toHaveBeenCalledOnce();
    });

    it('uses a TweenAt position at the key', () => {
        const path = (d: number) => d * 100;
        const x = Keyed.ofFloat().key(0, new TweenAt(path, 0.2)).key(1, new TweenAt(path, 0.8));
        expect(x.value(0)).toBe(20);
        expect(x.value(0.5)).toBeCloseTo(50, 9);
        expect(x.value(1)).toBe(80);
    });

    it('samples a single tween key at its position or 0', () => {
        expect(Keyed.ofFloat().key(0, (d) => d + 1).value(0)).toBe(1);
        expect(Keyed.ofFloat().key(0, new TweenAt((d) => d + 1, 0.5)).value(0)).toBe(1.5);
    });
});

describe('types', () => {
    it('rounds integers', () => {
        const x = Keyed.ofInt().key(0, 0).key(1, 10);
        expect(samples(x, [0.24, 0.25, 0.5]).map((v) => v)).toEqual([2, 3, 5]);
    });

    it('switches booleans at the next key', () => {
        const b = Keyed.ofBoolean().key(0, false).key(1, true);
        expect([b.value(0.5), b.value(0.999), b.value(1)]).toEqual([false, false, true]);
    });

    it('morphs strings', () => {
        const s = Keyed.ofString().key(0, 'keyed').key(2, 'animation');
        expect(s.value(0)).toBe('keyed');
        expect(s.value(2)).toBe('animation');
        expect(s.value(1)).not.toMatch(/^(keyed|animation)$/);
    });

    it('takes a lerp function or a lerp object', () => {
        const squared = new Keyed((a: number, b: number, d: number) => a + (b - a) * d * d, 0).key(0, 0).key(1, 10);
        expect(squared.value(0.5)).toBe(2.5);
        const angle = new Keyed(new AngleLerp(), 0).key(0, 6).key(1, 0.28);
        expect(angle.value(0.5)).toBeCloseTo((6 + 0.28 + 2 * Math.PI) / 2, 9);
        expect(() => new Keyed(undefined as never, 0)).toThrow(TypeError);
    });

    it('infers the type from the value', () => {
        expect(Keyed.of(5).key(0, 0).key(1, 10).value(0.5)).toBe(5);
        expect(Keyed.of('a').key(0, 'a').key(1, 'b').value(1)).toBe('b');
        expect(Keyed.of(false).key(0, false).key(1, true).value(0.5)).toBe(false);
        expect(Keyed.of(3).value(0)).toBe(3);
    });

    it('blends objects that know how to lerp themselves', () => {
        class Point {
            constructor(
                readonly x: number,
                readonly y: number,
            ) {}
            lerp(b: Point, d: number): Point {
                return new Point(this.x + (b.x - this.x) * d, this.y + (b.y - this.y) * d);
            }
        }
        const p = Keyed.of(new Point(0, 0)).key(0, new Point(0, 0)).key(2, new Point(10, 20));
        const mid = p.value(1);
        expect(mid).toBeInstanceOf(Point);
        expect([mid.x, mid.y]).toEqual([5, 10]);
    });

    it('rejects values it cannot infer a type from', () => {
        expect(() => Keyed.of(null as never)).toThrow(TypeError);
        expect(() => Keyed.of(undefined as never)).toThrow(TypeError);
        expect(() => Keyed.of({} as never)).toThrow(TypeError);
        expect(() => Keyed.of(Symbol('x') as never)).toThrow(TypeError);
    });

    it('needs p5 only for colors and vectors without a default', () => {
        expect(() => Keyed.ofColor()).toThrow(/p5\.js was not found/);
        expect(() => Keyed.ofVector()).toThrow(/p5\.js was not found/);
    });
});

describe('library settings', () => {
    it('start as seconds, synced, autoplay at 60 fps', () => {
        expect([Keyed.unit(), Keyed.isSynced(), Keyed.isAutoplay(), Keyed.frameRate()]).toEqual(['second', true, true, 60]);
        expect([Keyed.SECOND, Keyed.FRAME]).toEqual(['second', 'frame']);
    });

    it('apply to the default timeline and to timelines created afterwards', () => {
        Keyed.setUnit(Keyed.FRAME);
        Keyed.sync(false);
        Keyed.autoplay(false);
        const dt = Keyed.defaultTimeline();
        expect([dt.unit(), dt.isSynced(), dt.isAutoplay()]).toEqual(['frame', false, false]);
        const tm = new Timeline(null);
        expect([tm.unit(), tm.isSynced(), tm.isAutoplay()]).toEqual(['frame', false, false]);
        Keyed.sync(true);
        Keyed.autoplay(true);
        expect([Keyed.isSynced(), Keyed.isAutoplay()]).toEqual([true, true]);
    });

    it('are kept by init() for the new default timeline', () => {
        Keyed.setUnit(Keyed.FRAME);
        const tm = Keyed.init();
        expect(tm.unit()).toBe('frame');
        expect(tm).toBe(Keyed.defaultTimeline());
    });

    it('validate the unit and frame rate', () => {
        expect(() => Keyed.setUnit('minute' as never)).toThrow(RangeError);
        expect(() => Keyed.setFrameRate(0)).toThrow(RangeError);
        expect(() => Keyed.setFrameRate(NaN)).toThrow(RangeError);
        Keyed.setFrameRate(30);
        expect(Keyed.frameRate()).toBe(30);
    });
});

describe('init', () => {
    it('replaces the default timeline and stops the old one', () => {
        const old = Keyed.defaultTimeline();
        const fresh = Keyed.init();
        expect(fresh).not.toBe(old);
        expect(Keyed.defaultTimeline()).toBe(fresh);
    });

    it('hands the sketch to the add-on so it can drive the timelines', () => {
        const claim = vi.fn();
        env.claim = claim;
        const sketch = {};
        Keyed.init(sketch);
        expect(claim).toHaveBeenCalledWith(sketch);
    });

    it('works without a sketch', () => {
        const claim = vi.fn();
        env.claim = claim;
        expect(() => Keyed.init()).not.toThrow();
    });
});

describe('a Keyed without a default value', () => {
    const lerp2 = (a: { x: number; y: number }, b: { x: number; y: number }, d: number) => ({
        x: (1 - d) * a.x + d * b.x,
        y: (1 - d) * a.y + d * b.y,
    });

    it('blends plain objects with a lerp function, keys in any order', () => {
        const o = new Keyed(lerp2).key(400, { x: 10, y: 20 }).key(100, { x: 30, y: 40 });
        expect(o.value(100)).toEqual({ x: 30, y: 40 });
        expect(o.value(250)).toEqual({ x: 20, y: 30 });
        expect(o.value(400)).toEqual({ x: 10, y: 20 });
        expect(o.value(0)).toEqual({ x: 30, y: 40 });
    });

    it('is undefined until the first key, and a key works alone', () => {
        const o = new Keyed(lerp2);
        expect(o.value(0)).toBeUndefined();
        o.key(1, { x: 5, y: 6 });
        expect(o.value(0)).toEqual({ x: 5, y: 6 });
    });

    it('still copies keys, so stored values cannot be changed through the result', () => {
        const start = { x: 1, y: 1 };
        const o = new Keyed(lerp2).key(0, start).key(1, { x: 2, y: 2 });
        start.x = 99;
        expect(o.value(0).x).toBe(1);
        o.value(0).x = 77;
        expect(o.value(0).x).toBe(1);
    });
});
