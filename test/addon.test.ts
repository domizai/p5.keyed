// @vitest-environment happy-dom
import p5 from 'p5';
import { describe, expect, it, vi } from 'vitest';

// The entry file registers itself with the global p5 when it is loaded, like a <script> tag after p5.js.
(globalThis as unknown as { p5: unknown }).p5 = p5;
const lib = await import('../src/p5.keyed');
const { env } = await import('../src/core/env');

type Hook = (this: object) => void;
const hooks = p5 as unknown as {
    lifecycleHooks: Record<'presetup' | 'predraw' | 'remove', Hook[]>;
    _registeredAddons: Set<unknown>;
};
const ours = (name: 'presetup' | 'predraw' | 'remove') => hooks.lifecycleHooks[name].at(-1)!;

describe('registration', () => {
    it('registers the add-on with p5 and gives the core access to p5', () => {
        expect(hooks._registeredAddons.has(lib.keyedAddon)).toBe(true);
        expect(env.p5).toBe(p5);
    });

    it('adds its hooks after the ones p5 brings', () => {
        expect(ours('presetup')).toBeTypeOf('function');
        expect(ours('predraw')).toBeTypeOf('function');
        expect(ours('remove')).toBeTypeOf('function');
    });
});

describe('globals', () => {
    const w = window as unknown as Record<string, any>;

    it('exposes the classes with their static members intact', () => {
        for (const name of ['Keyed', 'Timeline', 'Key', 'Pin', 'Marker', 'Easing', 'TweenAt', 'FloatLerp', 'ColorLerp']) {
            expect(w[name], name).toBeDefined();
        }
        expect(w.Key.at(1).t()).toBe(1);
        expect(w.Easing.CUBIC_IN(0.5)).toBe(0.125);
        expect(w.Keyed.ofFloat().key(0, 0).key(1, 10).value(0.5)).toBe(5);
        expect(w.Keyed.SECOND).toBe('second');
    });

    it('shares classes with the module exports', () => {
        expect(w.Keyed).toBe(lib.Keyed);
        expect(w.Timeline).toBe(lib.Timeline);
    });
});

describe('driving the ticker', () => {
    it('only ticks for the sketch that owns it, and lets Keyed.init() hand it over', () => {
        const a = {};
        const b = {};
        const spy = { pre: vi.fn() };
        lib.ticker.add(spy);

        ours('predraw').call(a);
        expect(spy.pre).not.toHaveBeenCalled();

        ours('presetup').call(a);
        ours('presetup').call(b);
        ours('predraw').call(b);
        expect(spy.pre).not.toHaveBeenCalled();
        ours('predraw').call(a);
        expect(spy.pre).toHaveBeenCalledTimes(1);

        lib.Keyed.init(b);
        ours('predraw').call(a);
        expect(spy.pre).toHaveBeenCalledTimes(1);
        ours('predraw').call(b);
        expect(spy.pre).toHaveBeenCalledTimes(2);

        lib.Keyed.init();
        ours('predraw').call(b);
        expect(spy.pre).toHaveBeenCalledTimes(3);
    });

    it('lets go of the ticker and clears it when the owner is removed', () => {
        const owner = {};
        ours('presetup').call(owner);
        lib.Keyed.init(owner);
        const spy = { pre: vi.fn() };
        lib.ticker.add(spy);

        ours('remove').call({});
        ours('predraw').call(owner);
        expect(spy.pre).toHaveBeenCalledTimes(1);

        ours('remove').call(owner);
        ours('predraw').call(owner);
        expect(spy.pre).toHaveBeenCalledTimes(1);
    });

    it('advances a default timeline from the predraw hook', () => {
        const owner = {};
        lib.Keyed.init(owner);
        const now = vi.spyOn(performance, 'now');
        now.mockReturnValue(1000);
        const tm = lib.Keyed.defaultTimeline();
        ours('predraw').call(owner);
        now.mockReturnValue(1500);
        ours('predraw').call(owner);
        expect(tm.t()).toBeCloseTo(0.5);
        now.mockRestore();
    });

    it('gives the next sketch a working default timeline after the owner was removed', () => {
        const first = {};
        ours('presetup').call(first);
        lib.Keyed.init(first);
        const before = lib.Keyed.defaultTimeline();
        ours('remove').call(first);
        expect(lib.Keyed.defaultTimeline()).not.toBe(before);

        const second = {};
        ours('presetup').call(second);
        const now = vi.spyOn(performance, 'now');
        now.mockReturnValue(2000);
        ours('predraw').call(second);
        now.mockReturnValue(2250);
        ours('predraw').call(second);
        expect(lib.Keyed.defaultTimeline().t()).toBeCloseTo(0.25);
        now.mockRestore();
        ours('remove').call(second);
    });

    it('drops bound targets when the owner is removed', () => {
        const owner = {};
        ours('presetup').call(owner);
        lib.Keyed.init(owner);
        const setter = vi.fn();
        lib.Keyed.ofFloat(1).bind(setter);
        ours('predraw').call(owner);
        expect(setter).toHaveBeenCalledTimes(1);

        ours('remove').call(owner);
        const next = {};
        ours('presetup').call(next);
        ours('predraw').call(next);
        expect(setter).toHaveBeenCalledTimes(1);

        // The binder registers itself again with the next binding.
        const later = vi.fn();
        lib.Keyed.ofFloat(2).bind(later);
        ours('predraw').call(next);
        expect(later).toHaveBeenCalledExactlyOnceWith(2);
        ours('remove').call(next);
    });
});

describe('binding by name in global mode', () => {
    const w = window as unknown as Record<string, unknown>;

    it('binds var-style globals, which are properties of window', () => {
        w.bindTestX = 5;
        const x = lib.Keyed.bind(window as never, 'bindTestX' as never) as unknown as { value(): number };
        expect(x.value()).toBe(5);
        delete w.bindTestX;
    });

    it('explains that let and const variables are not properties of window', () => {
        expect(() => lib.Keyed.bind(window as never, 'notDeclaredAnywhere' as never)).toThrow(/declare it with var, or bind a setter/);
    });
});
