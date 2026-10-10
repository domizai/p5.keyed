// @vitest-environment happy-dom
import p5 from 'p5';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
    Effect,
    FloatLerp,
    GridSnap,
    Key,
    Keyed,
    Lag,
    Orbit,
    Spring,
    StopMotion,
    Timeline,
    Unit,
    VectorLerp,
    Wiggle,
    settings,
} from '../src/core';
import { env } from '../src/core/env';

beforeAll(() => {
    env.p5 = p5 as never;
});

beforeEach(() => {
    Object.assign(settings, { unit: Unit.SECOND, synced: true, autoplay: true, frameRate: 60 });
    env.claim = undefined;
    Keyed.init();
});

const V = (x: number, y: number, z?: number) => (z === undefined ? new p5.Vector(x, y) : new p5.Vector(x, y, z));
const near = (a: number, b: number, digits = 6) => expect(a).toBeCloseTo(b, digits);
const stepAt = (at: number) => Keyed.ofFloat().key(at, 0).key(at + 1e-9, 1);
const range = (from: number, to: number, n: number) => Array.from({ length: n + 1 }, (_, i) => from + ((to - from) * i) / n);

describe('addEffect', () => {
    it('applies a function (source, t) => value and returns the same Keyed', () => {
        const k = Keyed.ofFloat().key(0, 0).key(2, 10);
        expect(k.addEffect((source, t) => source(t) + 100)).toBe(k);
        expect(k.value(1)).toBe(105);
    });

    it('applies an object with apply(source, t)', () => {
        const k = Keyed.ofFloat().key(0, 0).key(2, 10).addEffect({ apply: (source: (t: number) => number, t: number) => source(t - 1) });
        expect(k.value(1)).toBe(0);
        expect(k.value(2)).toBe(5);
    });

    it('rejects things that are not effects', () => {
        expect(() => Keyed.ofFloat().addEffect({} as never)).toThrow(TypeError);
        expect(() => Keyed.ofFloat().addEffect(null as never)).toThrow(TypeError);
    });

    it('works without keys: the effect starts from the default value', () => {
        const k = Keyed.ofFloat(7).addEffect((source, t) => source(t) + t);
        expect(k.value(3)).toBe(10);
    });

    it('stacks in the order added, each effect getting the result of the one before', () => {
        const a = Keyed.ofFloat(1)
            .addEffect((s, t) => s(t) + 1)
            .addEffect((s, t) => s(t) * 10);
        const b = Keyed.ofFloat(1)
            .addEffect((s, t) => s(t) * 10)
            .addEffect((s, t) => s(t) + 1);
        expect(a.value(0)).toBe(20);
        expect(b.value(0)).toBe(11);
    });

    it('lets a later effect sample earlier ones at other times', () => {
        const k = Keyed.ofFloat()
            .key(0, 0)
            .key(4, 4)
            .addEffect((s, t) => s(t) * 2)
            .addEffect((s, t) => s(t - 1));
        expect(k.value(3)).toBe(4);
    });

    it('is used by value() without a time, at the timeline time', () => {
        const tm = new Timeline(null).setDuration(10, false);
        tm.to(2);
        const k = Keyed.ofFloat().key(0, 0).key(10, 10).setTimeline(tm).addEffect((s, t) => s(t) + 1);
        expect(k.value()).toBe(3);
    });

    it('wraps sampled times on a looping timeline, not on a non-looping one', () => {
        const loop = new Timeline(null).setDuration(4, true);
        const looping = Keyed.ofFloat().key(0, 0).key(4, 4).setTimeline(loop).addEffect((s, t) => s(t - 1));
        expect(looping.value(0.5)).toBe(3.5);
        expect(looping.value(5.5)).toBe(0.5);

        const once = new Timeline(null).setDuration(4, false);
        const clamped = Keyed.ofFloat().key(0, 0).key(4, 4).setTimeline(once).addEffect((s, t) => s(t - 1));
        expect(clamped.value(0.5)).toBe(0);
    });

    it('does not wrap without a duration', () => {
        const k = Keyed.ofFloat().key(0, 0).key(4, 4).setTimeline(new Timeline(null)).addEffect((s, t) => s(t - 1));
        expect(k.value(0.5)).toBe(0);
    });
});

describe('echo', () => {
    it('returns the value now, delay ago, 2 * delay ago, ...', () => {
        const tm = new Timeline(null).setDuration(0);
        tm.to(3);
        const k = Keyed.ofFloat().key(0, 0).key(10, 10).setTimeline(tm);
        expect(k.echo(4, 0.5)).toEqual([3, 2.5, 2, 1.5]);
    });

    it('samples the future with a negative delay', () => {
        const tm = new Timeline(null);
        tm.to(3);
        const k = Keyed.ofFloat().key(0, 0).key(10, 10).setTimeline(tm);
        expect(k.echo(3, -1)).toEqual([3, 4, 5]);
    });

    it('rejects counts that are not whole numbers', () => {
        for (const n of [Infinity, 1.5, -1, NaN]) expect(() => Keyed.ofFloat().echo(n, 1)).toThrow(RangeError);
    });

    it('includes effects and wraps around a looping timeline', () => {
        const tm = new Timeline(null).setDuration(4, true);
        tm.to(1);
        const k = Keyed.ofFloat().key(0, 0).key(4, 4).setTimeline(tm).addEffect((s, t) => s(t) + 1);
        expect(k.echo(3, 1)).toEqual([2, 1, 4]);
        expect(Keyed.ofFloat().echo(0, 1)).toEqual([]);
    });
});

describe('StopMotion', () => {
    it('holds each pose for step seconds', () => {
        const k = Keyed.ofFloat().key(0, 0).key(10, 10).addEffect(new StopMotion<number>(2));
        expect([0, 1.9, 2, 3.9, 4, 9.99].map((t) => k.value(t))).toEqual([0, 0, 2, 2, 4, 8]);
    });

    it('rejects steps that are not positive', () => {
        expect(() => new StopMotion(0)).toThrow(RangeError);
        expect(() => new StopMotion(-1)).toThrow(RangeError);
        expect(() => new StopMotion(NaN)).toThrow(RangeError);
    });
});

describe('Lag', () => {
    it('leaves a constant alone and delays a ramp by half the duration plus half a sample', () => {
        const flat = Keyed.ofFloat(5).addEffect(new Lag(new FloatLerp(), 1, 10));
        near(flat.value(3), 5);
        const ramp = Keyed.ofFloat().key(-100, -100).key(100, 100).addEffect(new Lag(new FloatLerp(), 1, 10));
        for (const t of [0, 0.3, 1.234, 7]) near(ramp.value(t), t - 0.55, 6);
    });

    it('averages a step without overshoot and settles on the new value', () => {
        const lag = new Lag(new FloatLerp(), 1, 20);
        const k = stepAt(1).addEffect(lag);
        const values = range(0, 3, 300).map((t) => k.value(t));
        expect(Math.max(...values)).toBeLessThanOrEqual(1 + 1e-9);
        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        near(k.value(0.5), 0);
        near(k.value(2.5), 1);
        for (let i = 1; i < values.length; i++) expect(values[i]! + 1e-9).toBeGreaterThanOrEqual(values[i - 1]!);
    });

    it('moves smoothly across jumps in the source', () => {
        const k = stepAt(1).addEffect(new Lag(new FloatLerp(), 1, 10));
        let max = 0;
        const ts = range(0.8, 2.2, 2000);
        for (let i = 1; i < ts.length; i++) max = Math.max(max, Math.abs(k.value(ts[i]!) - k.value(ts[i - 1]!)));
        expect(max).toBeLessThan(0.01);
    });

    it('works on vectors through Effect.lag()', () => {
        const k = Keyed.ofVector(V(0, 0)).key(0, V(0, 0)).key(1e-9, V(10, 20)).addEffect(Effect.lag(1, 10));
        const v = k.value(5);
        near(v.x, 10);
        near(v.y, 20);
    });

    it('rejects bad arguments', () => {
        expect(() => new Lag(new FloatLerp(), 0, 5)).toThrow(RangeError);
        expect(() => new Lag(new FloatLerp(), 1, 0)).toThrow(RangeError);
        expect(() => new Lag(new FloatLerp(), Infinity, 5)).toThrow(RangeError);
        for (const n of [Infinity, 2.5, NaN]) expect(() => new Lag(new FloatLerp(), 1, n)).toThrow(RangeError);
        expect(() => new Lag({} as never, 1, 5)).toThrow(TypeError);
    });
});

describe('Spring', () => {
    it('leaves a constant alone', () => {
        const k = Keyed.ofFloat(3).addEffect(new Spring(new FloatLerp(), 2, 0.4));
        near(k.value(2.3), 3);
    });

    it('does not react before the source moves, then overshoots and settles', () => {
        const k = stepAt(1).addEffect(new Spring(new FloatLerp(), 2, 0.3));
        near(k.value(0.99), 0);
        near(k.value(1), 0);
        const values = range(1, 6, 1000).map((t) => k.value(t));
        expect(Math.max(...values)).toBeGreaterThan(1.1);
        near(k.value(8), 1, 3);
    });

    it('overshoots by the damped second-order amount and oscillates near the damped frequency', () => {
        const damping = 0.2;
        const frequency = 2;
        const k = stepAt(0).addEffect(new Spring(new FloatLerp(), frequency, damping));
        const ts = range(0.001, 3, 3000);
        const values = ts.map((t) => k.value(t));
        const peak = Math.max(...values);
        near(peak, 1 + Math.exp((-damping * Math.PI) / Math.sqrt(1 - damping * damping)), 1);
        const peakT = ts[values.indexOf(peak)]!;
        near(peakT, 1 / (2 * frequency * Math.sqrt(1 - damping * damping)), 1);
    });

    it('is smooth across jumps in the source', () => {
        const k = stepAt(1).addEffect(new Spring(new FloatLerp(), 1, 0.5));
        const ts = range(0.9, 4, 4000);
        let max = 0;
        for (let i = 1; i < ts.length; i++) max = Math.max(max, Math.abs(k.value(ts[i]!) - k.value(ts[i - 1]!)));
        expect(max).toBeLessThan(0.01);
    });

    it('carries on across the loop point of a looping timeline', () => {
        const make = (loop: boolean) =>
            Keyed.ofFloat().key(0, 1).key(3.9, 1).key(4, 0).setTimeline(new Timeline(null).setDuration(4, loop)).addEffect(new Spring(new FloatLerp(), 2, 0.5));
        expect(make(false).value(0.001)).toBeGreaterThan(0.99);
        expect(make(true).value(0.001)).toBeLessThan(0.95);
    });

    it('accepts a plain lerp function', () => {
        const k = stepAt(0).addEffect(new Spring((a: number, b: number, d: number) => a + (b - a) * d, 2, 0.3));
        near(k.value(8), 1, 3);
    });

    it('works on vectors through Effect.spring()', () => {
        const k = Keyed.ofVector(V(0, 0)).key(0, V(0, 0)).key(1e-9, V(10, 20)).addEffect(Effect.spring(2, 0.5));
        const v = k.value(10);
        near(v.x, 10, 3);
        near(v.y, 20, 3);
        expect(new Spring(new VectorLerp(), 2, 0.5)).toBeInstanceOf(Spring);
    });

    it('rejects bad arguments', () => {
        for (const d of [0, 1, -0.5, 2, NaN]) expect(() => new Spring(new FloatLerp(), 2, d)).toThrow(RangeError);
        for (const f of [0, -1, NaN, Infinity]) expect(() => new Spring(new FloatLerp(), f, 0.5)).toThrow(RangeError);
    });
});

describe('Orbit', () => {
    const at = (effect: Orbit, p: p5.Vector, t: number) => Keyed.ofVector(p).addEffect(effect).value(t);

    it('circles around the value in the XY plane, staying 2D', () => {
        const orbit = new Orbit(30, 2);
        const p = V(100, 50);
        for (const t of [0, 0.1, 0.37, 1.9]) {
            const v = at(orbit, p, t);
            near(Math.hypot(v.x - 100, v.y - 50), 30);
            expect(v.dimensions).toBe(2);
        }
        const start = at(orbit, p, 0);
        near(start.x, 130);
        near(start.y, 50);
        const quarter = at(orbit, p, 0.125);
        near(quarter.x, 100);
        near(quarter.y, 80);
    });

    it('completes cycle times frequency per second', () => {
        const a = at(new Orbit(10, 2), V(0, 0), 0.3);
        const b = at(new Orbit(10, 2), V(0, 0), 0.8);
        near(a.x, b.x);
        near(a.y, b.y);
    });

    it('turns by the right-hand rule around an axis and stays in the plane perpendicular to it', () => {
        for (const axis of [V(1, 0, 0), V(0, 1, 0), V(1, 2, 3), V(0, 0, -1), V(0, 0.95, 0.1)]) {
            const orbit = new Orbit(5, 1, axis);
            const n = axis.copy().normalize();
            const pts = range(0, 1, 8).map((t) => at(orbit, V(0, 0, 0), t));
            for (const v of pts) {
                near(v.mag(), 5);
                near(v.dot(n), 0);
            }
            // The orbit goes counter-clockwise around axis: successive offsets turn along +axis.
            const turn = p5.Vector.cross(pts[0]!, pts[1]!);
            expect(turn.dot(n)).toBeGreaterThan(0);
        }
    });

    it('goes 3D when the axis tilts out of the XY plane', () => {
        expect(at(new Orbit(5, 1, V(1, 0, 0)), V(0, 0), 0.1).dimensions).toBe(3);
        expect(at(new Orbit(5, 1, V(0, 0, 1)), V(0, 0), 0.1).dimensions).toBe(2);
        expect(at(new Orbit(5, 1), V(0, 0, 4), 0.1).z).toBe(4);
    });

    it('rejects a zero axis and does not touch the axis vector', () => {
        expect(() => new Orbit(1, 1, V(0, 0, 0))).toThrow(RangeError);
        const axis = V(0, 0, 5);
        new Orbit(1, 1, axis);
        expect(axis.z).toBe(5);
    });

    it('orbits around the animated value', () => {
        const k = Keyed.ofVector(V(0, 0)).key(0, V(0, 0)).key(2, V(200, 0)).addEffect(Effect.orbit(10, 1));
        const v = k.value(1);
        near(Math.hypot(v.x - 100, v.y), 10);
    });
});

describe('GridSnap', () => {
    const snapped = (effect: GridSnap, p: p5.Vector) => Keyed.ofVector(p).addEffect(effect).value(0);

    it('snaps x and y to multiples of size, rounding half up', () => {
        const g = new GridSnap(10);
        expect([snapped(g, V(14, 16)).x, snapped(g, V(14, 16)).y]).toEqual([10, 20]);
        expect(snapped(g, V(15, -15)).x).toBe(20);
        expect(snapped(g, V(15, -15)).y).toBe(-10);
        expect(snapped(g, V(-14, 0)).x).toBe(-10);
    });

    it('keeps z and the dimensions', () => {
        const g = new GridSnap(10);
        expect(snapped(g, V(14, 16, 7)).z).toBe(7);
        expect(snapped(g, V(14, 16, 7)).dimensions).toBe(3);
        expect(snapped(g, V(14, 16)).dimensions).toBe(2);
    });

    it('uses a size per axis and 0 leaves an axis alone', () => {
        const v = snapped(new GridSnap(10, 0), V(14.2, 16.3));
        expect([v.x, v.y]).toEqual([10, 16.3]);
        const w = snapped(new GridSnap(0, 5), V(14.2, 16.3));
        expect([w.x, w.y]).toEqual([14.2, 15]);
    });

    it('works with huge values', () => {
        expect(snapped(new GridSnap(0.001), V(1e12, 0)).x).toBeCloseTo(1e12, -2);
    });

    it('validates sizes', () => {
        for (const bad of [0, -1, NaN, Infinity]) expect(() => new GridSnap(bad)).toThrow(RangeError);
        expect(() => new GridSnap(0, 0)).toThrow(RangeError);
        expect(() => new GridSnap(-1, 5)).toThrow(RangeError);
        expect(() => new GridSnap(5, NaN)).toThrow(RangeError);
        expect(() => new GridSnap(10, 0)).not.toThrow();
        expect(() => Effect.gridSnap(10)).not.toThrow();
        expect(() => Effect.gridSnap(0)).toThrow(RangeError);
    });
});

describe('Wiggle', () => {
    const offsets = (w: Wiggle, ts: number[]) => ts.map((t) => Keyed.ofVector(V(0, 0)).addEffect(w).value(t));

    it('stays within ±amplitude per axis and is 2D by default', () => {
        const ts = range(-20, 20, 4000);
        const out = offsets(new Wiggle(10, 3, 1), ts);
        for (const v of out) {
            expect(Math.abs(v.x)).toBeLessThanOrEqual(10);
            expect(Math.abs(v.y)).toBeLessThanOrEqual(10);
            expect(v.dimensions).toBe(2);
        }
        expect(Math.max(...out.map((v) => v.x))).toBeGreaterThan(4);
        expect(Math.min(...out.map((v) => v.x))).toBeLessThan(-4);
    });

    it('has no bias: the average offset is about zero', () => {
        const out = offsets(new Wiggle(1, 1, 5), range(0, 2000, 20000));
        const mean = out.reduce((s, v) => s + v.x, 0) / out.length;
        expect(Math.abs(mean)).toBeLessThan(0.05);
    });

    it('is zero on whole wiggles with noise added to the value', () => {
        const k = Keyed.ofVector(V(100, 100)).addEffect(new Wiggle(10, 1, 2));
        const v = k.value(3);
        near(v.x, 100);
        near(v.y, 100);
    });

    it('uses a vector as amplitude per axis; z wiggles in 3D', () => {
        const out = offsets(new Wiggle(V(0, 30), 2, 1), range(0, 10, 500));
        for (const v of out) expect(v.x).toBe(0);
        expect(Math.max(...out.map((v) => Math.abs(v.y)))).toBeGreaterThan(5);

        const w3 = offsets(new Wiggle(V(0, 0, 8), 2, 1), range(0, 10, 500));
        for (const v of w3) expect(v.dimensions).toBe(3);
        expect(Math.max(...w3.map((v) => Math.abs(v.z)))).toBeGreaterThan(2);
    });

    it('is deterministic for a seed, and different for other seeds and axes', () => {
        const ts = range(0.05, 5, 50);
        const a = offsets(new Wiggle(10, 2, 7), ts).map((v) => [v.x, v.y]);
        const b = offsets(new Wiggle(10, 2, 7), ts).map((v) => [v.x, v.y]);
        const c = offsets(new Wiggle(10, 2, 8), ts).map((v) => [v.x, v.y]);
        expect(a).toEqual(b);
        expect(a).not.toEqual(c);
        expect(a.map((p) => p[0])).not.toEqual(a.map((p) => p[1]));
    });

    it('gives every Wiggle its own motion without a seed', () => {
        const [a, b] = [new Wiggle(10, 2), new Wiggle(10, 2)];
        expect(offsets(a, [0.3, 0.7])).not.toEqual(offsets(b, [0.3, 0.7]));
    });

    it('is continuous', () => {
        const ts = range(0, 5, 5000);
        const out = offsets(new Wiggle(10, 3, 3), ts);
        for (let i = 1; i < out.length; i++) expect(Math.abs(out[i]!.x - out[i - 1]!.x)).toBeLessThan(0.2);
    });

    it('loops seamlessly when duration times frequency is a whole number', () => {
        const tm = new Timeline(null).setDuration(2, true);
        const k = Keyed.ofVector(V(0, 0)).setTimeline(tm).addEffect(Effect.wiggle(10, 3, 4));
        near(k.value(0).x, 0);
        near(k.value(2 - 1e-9).x, 0, 5);
    });

    it('does not follow changes of the amplitude vector it was made with', () => {
        const amp = V(10, 10);
        const w = new Wiggle(amp, 1, 1);
        const before = offsets(w, [0.5])[0]!.x;
        amp.x = 100;
        expect(offsets(w, [0.5])[0]!.x).toBe(before);
    });
});
