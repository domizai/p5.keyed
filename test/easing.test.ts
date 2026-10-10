import { describe, expect, it } from 'vitest';
import { Easing } from '../src/core';

const presets = {
    QUAD_IN: Easing.QUAD_IN,
    QUAD_OUT: Easing.QUAD_OUT,
    QUAD_IN_OUT: Easing.QUAD_IN_OUT,
    CUBIC_IN: Easing.CUBIC_IN,
    CUBIC_OUT: Easing.CUBIC_OUT,
    CUBIC_IN_OUT: Easing.CUBIC_IN_OUT,
    QUART_IN: Easing.QUART_IN,
    QUART_OUT: Easing.QUART_OUT,
    QUART_IN_OUT: Easing.QUART_IN_OUT,
    QUINT_IN: Easing.QUINT_IN,
    QUINT_OUT: Easing.QUINT_OUT,
    QUINT_IN_OUT: Easing.QUINT_IN_OUT,
    SMOOTHSTEP: Easing.SMOOTHSTEP,
    QUADRATIC_BEZIER: Easing.QUADRATIC_BEZIER,
    CUBIC_BEZIER: Easing.CUBIC_BEZIER,
};

describe('presets', () => {
    for (const [name, f] of Object.entries(presets)) {
        it(`${name} goes from 0 to 1 and never decreases`, () => {
            expect(f(0)).toBeCloseTo(0, 9);
            expect(f(1)).toBeCloseTo(1, 9);
            let prev = f(0);
            for (let i = 1; i <= 200; i++) {
                const v = f(i / 200);
                expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
                prev = v;
            }
        });
    }

    it('powers: in accelerates, out decelerates, in-out is point symmetric', () => {
        expect(Easing.QUAD_IN(0.5)).toBe(0.25);
        expect(Easing.QUAD_OUT(0.5)).toBe(0.75);
        expect(Easing.CUBIC_IN(0.5)).toBe(0.125);
        expect(Easing.QUART_OUT(0.5)).toBe(0.9375);
        expect(Easing.QUAD_IN_OUT(0.25)).toBe(0.125);
        expect(Easing.QUAD_IN_OUT(0.75)).toBe(0.875);
        for (const f of [Easing.CUBIC_IN_OUT, Easing.QUART_IN_OUT, Easing.QUINT_IN_OUT, Easing.powerInOut(7)]) {
            expect(f(0.5)).toBeCloseTo(0.5, 12);
            for (const d of [0.1, 0.3, 0.45]) {
                expect(f(d) + f(1 - d)).toBeCloseTo(1, 12);
            }
        }
        expect(Easing.powerIn(3)(0.5)).toBe(Easing.CUBIC_IN(0.5));
        expect(Easing.powerOut(3)(0.3)).toBe(Easing.CUBIC_OUT(0.3));
    });

    it('can be called as plain functions for single numbers', () => {
        expect(Easing.quadIn(0.5)).toBe(0.25);
        expect(Easing.quadOut(0.5)).toBe(0.75);
        expect(Easing.quadInOut(0.25)).toBe(0.125);
    });

    it('HOLD stays at 0 until the very end', () => {
        expect(Easing.HOLD(0)).toBe(0);
        expect(Easing.HOLD(0.999)).toBe(0);
        expect(Easing.HOLD(1)).toBe(1);
    });
});

describe('steps', () => {
    it('jumps in n equal steps', () => {
        const f = Easing.steps(4);
        expect([0, 0.24, 0.25, 0.5, 0.99, 1].map(f)).toEqual([0, 0, 0.25, 0.5, 0.75, 1]);
    });

    it('steps(1) behaves like HOLD on [0, 1]', () => {
        for (const d of [0, 0.3, 0.999, 1]) {
            expect(Easing.steps(1)(d)).toBe(Easing.HOLD(d));
        }
    });

    it('needs at least one step', () => {
        expect(() => Easing.steps(0)).toThrow(RangeError);
        expect(() => Easing.steps(NaN)).toThrow(RangeError);
    });
});

describe('smoothstep', () => {
    it('is 0 before edge0, 1 after edge1, smootherstep in between', () => {
        const f = Easing.smoothstep(0.3, 0.7);
        expect(f(0)).toBe(0);
        expect(f(0.3)).toBe(0);
        expect(f(0.5)).toBeCloseTo(0.5, 12);
        expect(f(0.7)).toBe(1);
        expect(f(1)).toBe(1);
        // x = 0.25 of the way: 6x^5 - 15x^4 + 10x^3
        expect(f(0.4)).toBeCloseTo(0.103515625, 12);
    });
});

describe('quadraticBezier', () => {
    it('passes through p0 and p2 and is pulled towards p1', () => {
        const f = Easing.quadraticBezier(0, 1.4, 1);
        expect(f(0)).toBe(0);
        expect(f(1)).toBe(1);
        expect(f(0.5)).toBeCloseTo(0.95, 12);
        expect(Math.max(...Array.from({ length: 101 }, (_, i) => f(i / 100)))).toBeGreaterThan(1);
    });
});

// Independent reference: sample the parametric curve densely and interpolate y at x.
function referenceBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
    const bez = (a: number, b: number, s: number) => 3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (bez(x1, x2, mid) < x) lo = mid;
        else hi = mid;
    }
    return bez(y1, y2, (lo + hi) / 2);
}

describe('cubicBezier', () => {
    const curves: Array<[number, number, number, number]> = [
        [0.25, 0.1, 0.25, 1], // CSS ease
        [0.42, 0, 1, 1], // CSS ease-in
        [0.34, 1.56, 0.64, 1], // overshoots
        [0.36, 0, 0.66, -0.56], // pulls back first
        [0, 0, 1, 1],
        [1 / 3, 0, 2 / 3, 1],
        [1, 0, 0, 1], // steep middle, flat ends
        [0, 1, 1, 0],
    ];

    for (const c of curves) {
        it(`matches a brute-force solution for cubic-bezier(${c.join(', ')})`, () => {
            const f = Easing.cubicBezier(...c);
            for (let i = 0; i <= 100; i++) {
                const x = i / 100;
                expect(f(x)).toBeCloseTo(referenceBezier(...c, x), 4);
            }
        });
    }

    it('starts at 0 and ends at 1, also outside [0, 1]', () => {
        const f = Easing.cubicBezier(0.34, 1.56, 0.64, 1);
        expect(f(0)).toBe(0);
        expect(f(1)).toBeCloseTo(1, 12);
        expect(f(-0.5)).toBe(0);
        expect(f(1.5)).toBeCloseTo(1, 12);
    });

    it('overshoots with y above 1 and dips below 0 with negative y', () => {
        const over = Easing.cubicBezier(0.34, 1.56, 0.64, 1);
        const back = Easing.cubicBezier(0.36, 0, 0.66, -0.56);
        const samples = Array.from({ length: 101 }, (_, i) => i / 100);
        expect(Math.max(...samples.map(over))).toBeGreaterThan(1.05);
        expect(Math.min(...samples.map(back))).toBeLessThan(-0.05);
    });

    it('cubicBezier(0, 0, 1, 1) is linear', () => {
        const f = Easing.CUBIC_BEZIER;
        for (const d of [0.1, 0.25, 0.5, 0.8]) {
            expect(f(d)).toBeCloseTo(d, 4);
        }
    });

    it('converges where Newton alone would stall (flat start)', () => {
        const f = Easing.cubicBezier(0, 0, 1, 1);
        expect(f(1e-4)).toBeCloseTo(1e-4, 5);
        const flat = Easing.cubicBezier(1, 0, 0, 1);
        expect(flat(0.5)).toBeCloseTo(0.5, 4);
        expect(flat(1e-3)).toBeCloseTo(referenceBezier(1, 0, 0, 1, 1e-3), 4);
    });

    it('rejects x values outside [0, 1]', () => {
        expect(() => Easing.cubicBezier(-0.1, 0, 0.5, 1)).toThrow(RangeError);
        expect(() => Easing.cubicBezier(0.5, 0, 1.1, 1)).toThrow(RangeError);
        expect(() => Easing.cubicBezier(NaN, 0, 0.5, 1)).toThrow(RangeError);
    });
});

describe('custom easings', () => {
    it('are plain functions', () => {
        const bounce: Easing = (d) => 1 - Math.abs(Math.cos(d * 2.5 * Math.PI)) * (1 - d);
        expect(bounce(1)).toBe(1);
        expect(bounce(0)).toBe(0);
    });
});
