import { describe, expect, it } from 'vitest';
import { AngleLerp, BooleanLerp, FloatLerp, IntLerp, StepLerp, StringLerp } from '../src/core';
import { toLerpFunction } from '../src/core/lerps';

describe('FloatLerp', () => {
    it('blends linearly and extrapolates', () => {
        const f = new FloatLerp();
        expect(f.lerp(10, 20, 0)).toBe(10);
        expect(f.lerp(10, 20, 0.25)).toBe(12.5);
        expect(f.lerp(10, 20, 1)).toBe(20);
        expect(f.lerp(10, 20, 1.5)).toBe(25);
    });
});

describe('IntLerp', () => {
    it('rounds to the nearest integer, halves up', () => {
        const f = new IntLerp();
        expect(f.lerp(0, 10, 0.24)).toBe(2);
        expect(f.lerp(0, 10, 0.25)).toBe(3);
        expect(f.lerp(0, -10, 0.25)).toBe(-2);
    });

    it('takes another rounding function', () => {
        const f = new IntLerp();
        expect(f.lerp(0, 10, 0.29, Math.floor)).toBe(2);
        expect(f.lerp(0, 10, 0.21, Math.ceil)).toBe(3);
    });
});

describe('AngleLerp', () => {
    const f = new AngleLerp();
    const rad = (deg: number) => (deg * Math.PI) / 180;

    it('turns the short way round', () => {
        expect(f.lerp(rad(350), rad(10), 0.5)).toBeCloseTo(rad(360), 9);
        expect(f.lerp(rad(10), rad(350), 0.5)).toBeCloseTo(rad(0), 9);
        expect(f.lerp(rad(0), rad(90), 0.5)).toBeCloseTo(rad(45), 9);
    });

    it('does not spin a full turn for equal angles', () => {
        expect(f.lerp(rad(30), rad(30), 0.7)).toBeCloseTo(rad(30), 9);
        expect(f.lerp(rad(30), rad(30 + 360), 0.7)).toBeCloseTo(rad(30), 9);
    });
});

describe('StepLerp and BooleanLerp', () => {
    it('hold a until the threshold, then jump to b', () => {
        const f = new StepLerp<string>();
        expect(f.lerp('a', 'b', 0)).toBe('a');
        expect(f.lerp('a', 'b', 0.99)).toBe('a');
        expect(f.lerp('a', 'b', 1)).toBe('b');
        expect(new StepLerp<string>(0.5).lerp('a', 'b', 0.5)).toBe('b');
        expect(new StepLerp<string>(0.5).lerp('a', 'b', 0.49)).toBe('a');
    });

    it('switch booleans', () => {
        const f = new BooleanLerp();
        expect(f.lerp(false, true, 0.5)).toBe(false);
        expect(f.lerp(false, true, 1)).toBe(true);
        expect(new BooleanLerp(0).lerp(false, true, 0)).toBe(true);
    });
});

describe('StringLerp', () => {
    const f = new StringLerp();

    it('returns the end strings at 0 and 1', () => {
        expect(f.lerp('keyed', 'animation', 0)).toBe('keyed');
        expect(f.lerp('keyed', 'animation', 1)).toBe('animation');
    });

    it('applies one edit at a time, so the length changes step by step', () => {
        const a = 'keyed';
        const b = 'animation';
        const steps = Array.from({ length: 41 }, (_, i) => f.lerp(a, b, i / 40));
        const distinct = [...new Set(steps)];
        // The strings share no characters, so the edit distance is 9 and there are 10 distinct strings.
        expect(distinct).toHaveLength(10);
        for (let i = 1; i < distinct.length; i++) {
            expect(Math.abs(distinct[i]!.length - distinct[i - 1]!.length)).toBeLessThanOrEqual(1);
        }
    });

    it('keeps the characters both strings share', () => {
        expect(f.lerp('cat', 'cart', 0.5)).toBe('cart');
        expect(f.lerp('abc', 'abd', 0.5)).toBe('abd');
        expect(f.lerp('abc', '', 1)).toBe('');
        expect(f.lerp('', 'abc', 1)).toBe('abc');
        expect(f.lerp('', '', 0.5)).toBe('');
    });

    it('clamps t and works with several pairs in turn', () => {
        expect(f.lerp('a', 'b', -3)).toBe('a');
        expect(f.lerp('a', 'b', 3)).toBe('b');
        for (let i = 0; i < 100; i++) {
            expect(f.lerp(`x${i}`, `y${i}`, 1)).toBe(`y${i}`);
        }
        expect(f.lerp('x1', 'y1', 1)).toBe('y1');
    });

    it('does not tear apart characters outside the BMP', () => {
        for (let i = 0; i <= 10; i++) {
            const s = f.lerp('a😀b', 'c🎉d😀', i / 10);
            expect(s).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
        }
    });
});

describe('toLerpFunction', () => {
    it('accepts functions and objects with lerp()', () => {
        const fn = (a: number, b: number, d: number) => a + (b - a) * d;
        expect(toLerpFunction(fn)).toBe(fn);
        expect(toLerpFunction(new FloatLerp())(0, 10, 0.5)).toBe(5);
        expect(toLerpFunction(new StepLerp<string>(0.5))('a', 'b', 0.7)).toBe('b');
    });

    it('rejects anything else', () => {
        expect(() => toLerpFunction(undefined as never)).toThrow(TypeError);
        expect(() => toLerpFunction({} as never)).toThrow(TypeError);
    });
});
