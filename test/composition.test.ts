import { beforeEach, describe, expect, it } from 'vitest';
import { Composition, Easing, FloatLerp, Key, Keyed, Timeline, Unit, settings, ticker } from '../src/core';
import { env } from '../src/core/env';

let defaultTimeline: Timeline;

const realNow = settings.now;

beforeEach(() => {
    settings.now = realNow;
    Object.assign(settings, { unit: Unit.SECOND, synced: true, autoplay: true, frameRate: 60 });
    env.claim = undefined;
    ticker.clear();
    defaultTimeline = Keyed.init();
});

class Fade extends Composition {
    readonly alpha: Keyed<number>;
    readonly size: Keyed<number>;

    constructor(duration: number) {
        super(duration);
        this.alpha = this.add(Keyed.ofFloat().key(0, 255).key(duration, 0));
        this.size = this.keyed(new FloatLerp(), 1).key(0, 10).key(duration, 20);
    }
}

// Advances the shared ticker by manual steps: timelines driven by the ticker use step().
const advance = (c: Composition, seconds: number) => c.timeline().step(seconds);

describe('Composition', () => {
    it('has a non-looping timeline of its own, separate from the default timeline', () => {
        const c = new Fade(2);
        expect(c.timeline()).toBeInstanceOf(Timeline);
        expect(c.timeline()).not.toBe(defaultTimeline);
        expect(c.timeline().duration()).toBe(2);
        expect(c.timeline().isLooping()).toBe(false);
        expect(c.alpha.timeline()).toBe(c.timeline());
        expect(c.size.timeline()).toBe(c.timeline());
    });

    it('uses local key times: 0 is when the composition starts', () => {
        defaultTimeline.to(100);
        const c = new Fade(2);
        expect(c.alpha.value()).toBe(255);
        advance(c, 0.5);
        expect(c.alpha.value()).toBeCloseTo(191.25);
        expect(c.size.value()).toBeCloseTo(12.5);
    });

    it('finishes after its duration and holds the end values', () => {
        const c = new Fade(1);
        expect(c.isFinished()).toBe(false);
        advance(c, 0.99);
        expect(c.isFinished()).toBe(false);
        advance(c, 0.5);
        expect(c.isFinished()).toBe(true);
        expect(c.alpha.value()).toBe(0);
    });

    it('instances play independently', () => {
        const a = new Fade(1);
        const b = new Fade(1);
        advance(a, 0.5);
        expect(a.alpha.value()).toBeCloseTo(127.5);
        expect(b.alpha.value()).toBe(255);
    });

    it('is advanced by the sketch ticker and removed from it by dispose()', () => {
        let now = 1000;
        settings.now = () => now;
        const c = new Fade(10);
        ticker.tick();
        now += 500;
        ticker.tick();
        expect(c.timeline().t()).toBeCloseTo(0.5);
        c.dispose();
        now += 500;
        ticker.tick();
        expect(c.timeline().t()).toBeCloseTo(0.5);
    });

    it('play() restarts from the beginning', () => {
        const c = new Fade(1);
        advance(c, 2);
        expect(c.isFinished()).toBe(true);
        expect(c.play()).toBe(c);
        expect(c.timeline().t()).toBe(0);
        expect(c.isFinished()).toBe(false);
        expect(c.timeline().isPlaying()).toBe(true);
    });

    it('dispose() unbinds bound values', () => {
        const target = { v: 0 };
        class Bound extends Composition {
            constructor() {
                super(1);
                this.add(Keyed.bind(target, 'v').key(0, 0).key(1, 10));
            }
        }
        const c = new Bound();
        c.timeline().step(0.5);
        ticker.tick();
        const during = target.v;
        expect(during).toBeGreaterThan(0);
        c.dispose();
        c.timeline().step(0.25);
        ticker.tick();
        expect(target.v).toBe(during);
    });

    it('works with Key objects and easing inside', () => {
        class Easy extends Composition {
            readonly v = this.add(Keyed.ofFloat().key(Key.at(0).setEasing(Easing.CUBIC_OUT), 0).key(1, 100));
            constructor() {
                super(1);
            }
        }
        const c = new Easy();
        advance(c, 0.5);
        expect(c.v.value()).toBeGreaterThan(50);
    });
});
