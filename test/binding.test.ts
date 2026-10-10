import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FloatLerp, Keyed, StepLerp, Ticker, Unit, settings, ticker } from '../src/core';
import { binder } from '../src/core/binder';
import { env } from '../src/core/env';

let ms = 1000;

beforeEach(() => {
    ms = 1000;
    Object.assign(settings, { unit: Unit.SECOND, synced: true, autoplay: true, frameRate: 60, now: () => ms });
    env.claim = undefined;
    ticker.clear();
    binder.clear();
    Keyed.init();
});

// One frame: advances the default timeline by dt ms and then applies bound values, like the add-on does before draw().
const frame = (dt = 0) => {
    ms += dt;
    ticker.tick();
};

describe('setter binding', () => {
    it('writes the value before every draw, using the time of this frame', () => {
        const seen: number[] = [];
        Keyed.ofFloat().key(0, 0).key(2, 10).bind((v) => seen.push(v));
        frame();
        frame(500);
        frame(500);
        // The first frame shows t = 0; later ones are not a frame behind the timeline.
        expect(seen).toEqual([0, 2.5, 5]);
    });

    it('still runs after timelines that were created after the binding', () => {
        const seen: number[] = [];
        Keyed.ofFloat().key(0, 0).key(2, 10).bind((v) => seen.push(v));
        Keyed.init();
        frame();
        frame(1000);
        expect(seen.at(-1)).toBe(5);
    });

    it('keeps applying while the timeline is paused', () => {
        const seen: number[] = [];
        const x = Keyed.ofFloat().key(0, 0).key(2, 10).bind((v) => seen.push(v));
        frame();
        Keyed.defaultTimeline().to(1).play(false);
        frame(100);
        frame(100);
        expect(seen).toEqual([0, 5, 5]);
        expect(x.value()).toBe(5);
    });

    it('takes a lerp, a default value and a setter', () => {
        const seen: number[] = [];
        const x = Keyed.bind(new FloatLerp(), 3, (v) => seen.push(v));
        expect(x.value()).toBe(3);
        x.key(0, 0).key(1, 10);
        frame();
        frame(500);
        expect(seen).toEqual([0, 5]);
    });

    it('accepts a lerp function and keeps non-numeric types', () => {
        let label = '';
        Keyed.bind(new StepLerp<string>(), 'a', (v) => (label = v))
            .key(0, 'a')
            .key(1, 'b');
        frame();
        expect(label).toBe('a');
        frame(1000);
        expect(label).toBe('b');
    });

    it('stops with unbind(), and starts again with bind()', () => {
        const setter = vi.fn();
        const x = Keyed.ofFloat().key(0, 0).key(2, 10).bind(setter);
        frame();
        x.unbind();
        frame(500);
        expect(setter).toHaveBeenCalledTimes(1);
        x.bind(setter);
        frame(500);
        expect(setter).toHaveBeenCalledTimes(2);
        expect(setter).toHaveBeenLastCalledWith(5);
    });

    it('replaces the previous setter and never applies a value twice per frame', () => {
        const first = vi.fn();
        const second = vi.fn();
        const x = Keyed.ofFloat(1).bind(first);
        x.bind(second);
        x.bind(second);
        frame();
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('apply() writes the value right away, and does nothing without a target', () => {
        const setter = vi.fn();
        const x = Keyed.ofFloat().key(0, 4).key(1, 8);
        expect(() => x.apply()).not.toThrow();
        x.bind(setter);
        x.apply();
        expect(setter).toHaveBeenCalledExactlyOnceWith(4);
        x.unbind().apply();
        expect(setter).toHaveBeenCalledOnce();
    });

    it('lets setters bind and unbind while the values are applied', () => {
        const calls: string[] = [];
        const a = Keyed.ofFloat(1);
        const b = Keyed.ofFloat(2);
        a.bind(() => {
            calls.push('a');
            a.unbind();
            b.bind(() => calls.push('b'));
        });
        frame();
        expect(calls).toEqual(['a']);
        frame();
        expect(calls).toEqual(['a', 'b']);
    });

    it('rejects things that are not setters', () => {
        expect(() => Keyed.ofFloat().bind(undefined as never)).toThrow(TypeError);
        expect(() => Keyed.ofFloat().bind({} as never)).toThrow(TypeError);
    });
});

describe('property binding', () => {
    it('animates a number property, its current value is the default', () => {
        const ball = { x: 60, y: 7 };
        const x = Keyed.bind(ball, 'x');
        expect(x.value()).toBe(60);
        x.key(0, 0).key(2, 10);
        frame();
        expect(ball.x).toBe(0);
        frame(1000);
        expect(ball.x).toBe(5);
        expect(ball.y).toBe(7);
    });

    it('binds class fields, getters and setters, also inherited ones', () => {
        class Ball {
            #y = 300;
            x = 1;
            get y() {
                return this.#y;
            }
            set y(v: number) {
                this.#y = v;
            }
        }
        class Big extends Ball {}
        const ball = new Big();
        Keyed.bind(ball, 'x').key(0, 0).key(1, 10);
        const y = Keyed.bind(ball, 'y');
        expect(y.value()).toBe(300);
        y.key(0, 100).key(1, 200);
        frame();
        frame(500);
        expect([ball.x, ball.y]).toEqual([5, 150]);
    });

    it('infers other types from the current value', () => {
        const o = { word: 'a', on: false };
        Keyed.bind(o, 'word').key(0, 'a').key(1, 'b');
        Keyed.bind(o, 'on').key(0, false).key(1, true);
        frame();
        frame(1000);
        expect(o).toEqual({ word: 'b', on: true });
    });

    it('binds an existing Keyed to a property, e.g. an integer', () => {
        const o = { count: 0 };
        Keyed.ofInt().key(0, 0).key(1, 10).bind(o, 'count');
        frame();
        frame(250);
        expect(o.count).toBe(3);
        frame(250);
        expect(o.count).toBe(5);
    });

    it('can be unbound like any other binding', () => {
        const o = { x: 0 };
        const x = Keyed.ofFloat().key(0, 0).key(1, 10).bind(o, 'x');
        frame();
        frame(500);
        x.unbind();
        frame(500);
        expect(o.x).toBe(5);
    });

    it('rejects properties that do not exist', () => {
        expect(() => Keyed.bind({ x: 1 }, 'y' as never)).toThrow(/No property 'y' on Object/);
        expect(() => Keyed.ofFloat().bind({}, 'x')).toThrow(TypeError);
    });

    it('rejects properties that cannot be written', () => {
        const frozen = Object.freeze({ x: 1 });
        const getterOnly = {
            get x() {
                return 1;
            },
        };
        expect(() => Keyed.bind(frozen, 'x')).toThrow(/read-only/);
        expect(() => Keyed.bind(getterOnly, 'x')).toThrow(/read-only/);
        expect(() => Keyed.ofFloat().bind(frozen, 'x')).toThrow(/read-only/);
    });

    it('rejects values whose type it cannot infer, and tells to use a setter', () => {
        expect(() => Keyed.bind({ x: undefined }, 'x' as never)).toThrow(/Bind a setter instead/);
        expect(() => Keyed.bind({ x: null }, 'x' as never)).toThrow(TypeError);
        expect(() => Keyed.bind({ x: {} }, 'x' as never)).toThrow(TypeError);
    });

    it('rejects calls that are neither a property nor a setter binding', () => {
        expect(() => (Keyed.bind as (...a: unknown[]) => unknown)(5)).toThrow(TypeError);
        expect(() => (Keyed.bind as (...a: unknown[]) => unknown)(null, 'x')).toThrow(TypeError);
        expect(() => (Keyed.bind as (...a: unknown[]) => unknown)({ x: 1 }, 5)).toThrow(TypeError);
    });
});

describe('Ticker phases', () => {
    it('ticks late items after regular ones, whatever the order of adding', () => {
        const t = new Ticker();
        const order: string[] = [];
        t.addLate({ pre: () => order.push('late') });
        t.add({ pre: () => order.push('a') });
        t.add({ pre: () => order.push('b') });
        t.tick();
        expect(order).toEqual(['a', 'b', 'late']);
    });

    it('removes and clears both kinds', () => {
        const t = new Ticker();
        const regular = { pre: vi.fn() };
        const late = { pre: vi.fn() };
        t.add(regular);
        t.addLate(late);
        t.remove(late);
        t.tick();
        expect(late.pre).not.toHaveBeenCalled();
        t.addLate(late);
        t.clear();
        t.tick();
        expect(regular.pre).toHaveBeenCalledTimes(1);
        expect(late.pre).not.toHaveBeenCalled();
    });
});
