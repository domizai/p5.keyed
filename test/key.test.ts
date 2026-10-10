import { describe, expect, it, vi } from 'vitest';
import { Easing, Key, Pin } from '../src/core';
import { segmentEasing } from '../src/core/key';

describe('Key', () => {
    it('has its own pin when created from a time', () => {
        const a = Key.at(2);
        const b = new Key(3);
        expect(a.t()).toBe(2);
        expect(b.t()).toBe(3);
        expect(a.pin()).not.toBe(b.pin());
    });

    it('shares a pin: moving one key moves them all and notifies listeners', () => {
        const pin = Pin.at(1);
        const a = Key.at(pin);
        const b = Key.at(pin);
        const listener = vi.fn();
        pin.addListener(listener);
        a.to(2);
        expect(b.t()).toBe(2);
        expect(pin.t()).toBe(2);
        expect(listener).toHaveBeenCalledOnce();
        expect(a.pin()).toBe(b.pin());
    });

    it('sorts by time', () => {
        const keys = [Key.at(3), Key.at(1), Key.at(2)];
        keys.sort((a, b) => a.compareTo(b));
        expect(keys.map((k) => k.t())).toEqual([1, 2, 3]);
    });

    it('is linear by default', () => {
        const k = Key.at(0);
        expect(k.easingIn()).toBe(0);
        expect(k.easingOut()).toBe(0);
        expect(k.easing()).toBeNull();
    });
});

describe('Key easing', () => {
    it('setEasing(influence) sets both sides', () => {
        const k = Key.at(0).setEasing(1 / 3);
        expect(k.easingIn()).toBe(1 / 3);
        expect(k.easingOut()).toBe(1 / 3);
        expect(k.easing()).toBeNull();
    });

    it('setEasingIn and setEasingOut are independent', () => {
        const k = Key.at(0).setEasingIn(0.2).setEasingOut(0.8);
        expect(k.easingIn()).toBe(0.2);
        expect(k.easingOut()).toBe(0.8);
    });

    it('setEasing(curve) sets the leaving curve and leaves the influences alone', () => {
        const k = Key.at(0).setEasingIn(0.4).setEasing(Easing.CUBIC_IN_OUT);
        expect(k.easing()).toBe(Easing.CUBIC_IN_OUT);
        expect(k.easingIn()).toBe(0.4);
    });

    it('influence setters that touch the leaving side clear a curve', () => {
        expect(Key.at(0).setEasing(Easing.QUAD_OUT).setEasingOut(0.5).easing()).toBeNull();
        expect(Key.at(0).setEasing(Easing.QUAD_OUT).setEasing(0.5).easing()).toBeNull();
    });

    it('setEasingIn keeps a curve, since it only shapes the arriving side', () => {
        expect(Key.at(0).setEasing(Easing.QUAD_OUT).setEasingIn(0.5).easing()).toBe(Easing.QUAD_OUT);
    });

    it('hold() uses the HOLD curve', () => {
        expect(Key.at(0).hold().easing()).toBe(Easing.HOLD);
    });

    it('accepts any function as a curve', () => {
        const custom = (d: number) => d * d;
        expect(Key.at(0).setEasing(custom).easing()).toBe(custom);
    });

    it('rejects influences outside [0, 1] and wrong types', () => {
        expect(() => Key.at(0).setEasing(1.01)).toThrow(RangeError);
        expect(() => Key.at(0).setEasingIn(-0.01)).toThrow(RangeError);
        expect(() => Key.at(0).setEasingOut(NaN)).toThrow(RangeError);
        expect(() => Key.at(0).setEasing('ease' as never)).toThrow(TypeError);
        expect(() => Key.at(0).setEasing(undefined as never)).toThrow(TypeError);
    });
});

describe('segmentEasing', () => {
    const samples = Array.from({ length: 101 }, (_, i) => i / 100);

    it('is linear without influence', () => {
        const f = segmentEasing(Key.at(0), Key.at(1));
        for (const d of samples) expect(f(d)).toBeCloseTo(d, 4);
    });

    it('with 1/3 on both keys it eases in and out symmetrically (Easy Ease)', () => {
        const f = segmentEasing(Key.at(0).setEasing(1 / 3), Key.at(1).setEasing(1 / 3));
        expect(f(0.5)).toBeCloseTo(0.5, 6);
        expect(f(0.1)).toBeLessThan(0.1);
        expect(f(0.9)).toBeGreaterThan(0.9);
        for (const d of [0.1, 0.25, 0.4]) expect(f(d) + f(1 - d)).toBeCloseTo(1, 4);
    });

    it('higher influence slows down more near the keys', () => {
        const soft = segmentEasing(Key.at(0).setEasing(1 / 3), Key.at(1).setEasing(1 / 3));
        const strong = segmentEasing(Key.at(0).setEasing(1), Key.at(1).setEasing(1));
        expect(strong(0.1)).toBeLessThan(soft(0.1));
    });

    // Speed of the curve around d, over a small window.
    const slope = (f: (d: number) => number, d: number) => (f(d + 0.005) - f(d - 0.005)) / 0.01;

    it('easingOut alone gives a soft start and a hard stop', () => {
        const f = segmentEasing(Key.at(0).setEasingOut(0.8), Key.at(1));
        for (const d of samples.slice(1, -1)) expect(f(d)).toBeLessThan(d);
        expect(slope(f, 0.01)).toBeLessThan(0.1);
        expect(slope(f, 0.99)).toBeGreaterThan(2);
    });

    it('easingIn alone gives a hard start and a soft stop', () => {
        const f = segmentEasing(Key.at(0), Key.at(1).setEasingIn(0.8));
        for (const d of samples.slice(1, -1)) expect(f(d)).toBeGreaterThan(d);
        expect(slope(f, 0.01)).toBeGreaterThan(2);
        expect(slope(f, 0.99)).toBeLessThan(0.1);
    });

    it("uses the leaving key's curve and ignores the next key's easingIn", () => {
        const f = segmentEasing(Key.at(0).setEasing(Easing.CUBIC_IN), Key.at(1).setEasingIn(1));
        for (const d of samples) expect(f(d)).toBe(Easing.CUBIC_IN(d));
    });

    it('hold keeps the start value until the next key', () => {
        const f = segmentEasing(Key.at(0).hold(), Key.at(1));
        expect(f(0.99)).toBe(0);
        expect(f(1)).toBe(1);
    });
});
