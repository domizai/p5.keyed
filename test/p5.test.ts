// @vitest-environment happy-dom
import p5 from 'p5';
import { beforeAll, describe, expect, it } from 'vitest';
import { ColorLerp, Keyed, VectorLerp, ticker } from '../src/core';
import { binder } from '../src/core/binder';
import { env } from '../src/core/env';

// p5's typings lag behind its runtime, so the constructor and the private color accessor are typed here.
const Color = p5.Color as unknown as new (values: unknown[], mode?: string, maxes?: number[]) => p5.Color;
const rgba = (c: p5.Color) => (c as unknown as { _getRGBA(maxes: number[]): number[] })._getRGBA([255, 255, 255, 1]);
const mode = (c: p5.Color) => (c as unknown as { mode: string }).mode;
const css = (s: string) => new Color([s]);
const red = () => css('#ff0000');
const blue = () => css('#0000ff');

beforeAll(() => {
    env.p5 = p5 as never;
});

describe('VectorLerp', () => {
    const f = new VectorLerp();

    it('blends 2D vectors and stays 2D', () => {
        const v = f.lerp(new p5.Vector(0, 0), new p5.Vector(10, 20), 0.5);
        expect([v.x, v.y, v.z, v.dimensions]).toEqual([5, 10, 0, 2]);
    });

    it('blends 3D vectors', () => {
        const v = f.lerp(new p5.Vector(0, 0, 0), new p5.Vector(10, 20, 30), 0.5);
        expect([v.x, v.y, v.z, v.dimensions]).toEqual([5, 10, 15, 3]);
    });

    it('keeps z when mixing 2D and 3D, which p5.Vector.lerp() would drop', () => {
        const v = f.lerp(new p5.Vector(0, 0), new p5.Vector(10, 10, 10), 0.5);
        expect([v.x, v.y, v.z, v.dimensions]).toEqual([5, 5, 5, 3]);
        const w = f.lerp(new p5.Vector(10, 10, 10), new p5.Vector(0, 0), 0.5);
        expect([w.x, w.y, w.z, w.dimensions]).toEqual([5, 5, 5, 3]);
    });

    it('extrapolates, returns a new vector and leaves its inputs alone', () => {
        const a = new p5.Vector(0, 0, 0);
        const b = new p5.Vector(10, 10, 10);
        const v = f.lerp(a, b, 1.5);
        expect([v.x, v.y, v.z]).toEqual([15, 15, 15]);
        expect(v).not.toBe(a);
        expect(v).not.toBe(b);
        expect([a.x, b.x]).toEqual([0, 10]);
        expect(f.lerp(a, a, 0)).not.toBe(a);
    });
});

describe('ColorLerp', () => {
    const f = new ColorLerp();

    it('blends RGB colors in RGB', () => {
        expect(rgba(f.lerp(red(), blue(), 0.5))).toEqual([127.5, 0, 127.5, 1]);
        expect(mode(f.lerp(red(), blue(), 0.5))).toBe('rgb');
    });

    it('blends alpha', () => {
        const a = new Color([255, 0, 0, 0]);
        const b = new Color([255, 0, 0, 1]);
        expect(rgba(f.lerp(a, b, 0.5))[3]).toBe(0.5);
    });

    it('clamps d so colors never leave the range', () => {
        expect(rgba(f.lerp(red(), blue(), 1.5))).toEqual([0, 0, 255, 1]);
        expect(rgba(f.lerp(red(), blue(), -0.5))).toEqual([255, 0, 0, 1]);
    });

    it('returns a new color, so stored colors cannot be changed through it', () => {
        const a = red();
        const copy = f.lerp(a, a, 0);
        expect(copy).not.toBe(a);
        copy.setRed(0);
        expect(rgba(a)).toEqual([255, 0, 0, 1]);
    });

    it("blends in the colors' own space: HSB colors take the short way round the hue circle", () => {
        const hsb = (h: number) => new Color([h, 100, 100], 'hsb', [360, 100, 100, 1]);
        const mid = f.lerp(hsb(0), hsb(240), 0.5);
        expect(mode(mid)).toBe('hsb');
        // Hue 0 to 240 passes through 300 (magenta), not 120 (green).
        const [r, g, b] = rgba(mid);
        expect([Math.round(r!), Math.round(g!), Math.round(b!)]).toEqual([255, 0, 255]);
        // The same two colors in RGB mix to a darker purple.
        expect(rgba(f.lerp(red(), blue(), 0.5))).toEqual([127.5, 0, 127.5, 1]);
    });
});

describe('Keyed with colors', () => {
    it('is opaque black without keys', () => {
        expect(rgba(Keyed.ofColor().value(0))).toEqual([0, 0, 0, 1]);
    });

    it('uses a given default color', () => {
        expect(rgba(Keyed.ofColor(blue()).value(0))).toEqual([0, 0, 255, 1]);
    });

    it('blends keys', () => {
        const c = Keyed.ofColor().key(0, red()).key(2, blue());
        expect(rgba(c.value(0))).toEqual([255, 0, 0, 1]);
        expect(rgba(c.value(1))).toEqual([127.5, 0, 127.5, 1]);
        expect(rgba(c.value(5))).toEqual([0, 0, 255, 1]);
    });

    it('hands out copies: changing a value or the original color does not change the keys', () => {
        const original = red();
        const c = Keyed.ofColor().key(0, original).key(2, blue());
        original.setRed(0);
        expect(rgba(c.value(0))).toEqual([255, 0, 0, 1]);
        c.value(0).setRed(0);
        expect(rgba(c.value(0))).toEqual([255, 0, 0, 1]);

        const single = Keyed.ofColor().key(0, red());
        single.value(0).setGreen(255);
        expect(rgba(single.value(0))).toEqual([255, 0, 0, 1]);
    });
});

describe('Keyed with vectors', () => {
    it('is (0, 0, 0) without keys', () => {
        const v = Keyed.ofVector().value(0);
        expect([v.x, v.y, v.z, v.dimensions]).toEqual([0, 0, 0, 3]);
    });

    it('blends keys, 2D or 3D', () => {
        const v2 = Keyed.ofVector().key(0, new p5.Vector(0, 0)).key(1, new p5.Vector(10, 20));
        const m2 = v2.value(0.5);
        expect([m2.x, m2.y, m2.dimensions]).toEqual([5, 10, 2]);
        const v3 = Keyed.ofVector().key(0, new p5.Vector(0, 0, 0)).key(1, new p5.Vector(10, 20, 30));
        const m3 = v3.value(0.5);
        expect([m3.x, m3.y, m3.z]).toEqual([5, 10, 15]);
    });

    it('stores copies of keys and hands out copies of values', () => {
        const corner = new p5.Vector(1, 2, 3);
        const v = Keyed.ofVector().key(0, corner).key(1, new p5.Vector(5, 5, 5));
        corner.x = 99;
        expect(v.value(0).x).toBe(1);
        v.value(0).x = 42;
        expect(v.value(0).x).toBe(1);

        const single = Keyed.ofVector().key(0, new p5.Vector(1, 2, 3));
        single.value(0).y = 42;
        expect(single.value(0).y).toBe(2);
    });

    it('closes a loop through the first corner like the Vectors example', () => {
        const corners = [new p5.Vector(0, 0), new p5.Vector(10, 0), new p5.Vector(10, 10)];
        const pos = Keyed.ofVector();
        for (let i = 0; i <= corners.length; i++) pos.key(i, corners[i % corners.length]!);
        expect(pos.value(0).x).toBe(pos.value(3).x);
        expect(pos.value(0.5).x).toBe(5);
        expect(pos.value(2.5).y).toBe(5);
    });
});

describe('Keyed.of', () => {
    it('recognizes p5.Color and p5.Vector before objects with a lerp method', () => {
        const c = Keyed.of(red()).key(0, red()).key(1, blue());
        expect(rgba(c.value(0.5))).toEqual([127.5, 0, 127.5, 1]);
        const v = Keyed.of(new p5.Vector(0, 0)).key(0, new p5.Vector(0, 0)).key(1, new p5.Vector(10, 10));
        expect(v.value(0.5).x).toBe(5);
        expect(v.value(0.5)).toBeInstanceOf(p5.Vector);
    });
});

describe('binding p5 types', () => {
    it('binds a vector property by name and a color through a setter', () => {
        ticker.clear();
        binder.clear();
        Keyed.init();
        const ball = { pos: new p5.Vector(0, 0), col: red() };
        Keyed.bind(ball, 'pos').key(0, new p5.Vector(0, 0)).key(1, new p5.Vector(10, 20));
        Keyed.bind(new ColorLerp(), red(), (c) => (ball.col = c)).key(0, red()).key(1, blue());
        Keyed.defaultTimeline().to(0.5);
        ticker.tick();
        expect([ball.pos.x, ball.pos.y]).toEqual([5, 10]);
        expect(rgba(ball.col)).toEqual([127.5, 0, 127.5, 1]);
        // Every frame gets its own objects, so keeping one does not alias the next.
        const first = ball.pos;
        ticker.tick();
        expect(ball.pos).not.toBe(first);
        ticker.clear();
        binder.clear();
    });
});
