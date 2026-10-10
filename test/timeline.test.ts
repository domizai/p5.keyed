import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Marker, Pin, Ticker, Timeline, Unit, settings } from '../src/core';

let ms = 0;
const advance = (ms_: number) => (ms += ms_);

beforeEach(() => {
    ms = 1000;
    Object.assign(settings, { unit: Unit.SECOND, synced: true, autoplay: true, frameRate: 60, now: () => ms });
});

// A timeline that only moves through step() and to().
const manual = () => new Timeline(null);

describe('stepping', () => {
    it('advances by the given amount', () => {
        const tm = manual();
        tm.step(0.5).step(0.25);
        expect(tm.t()).toBe(0.75);
    });

    it('does nothing while paused and resumes without jumping', () => {
        const tm = manual();
        tm.play(false).step(1);
        expect(tm.t()).toBe(0);
        tm.play(true).step(1);
        expect(tm.t()).toBe(1);
    });

    it('plays backwards with a negative speed', () => {
        const tm = manual().setDuration(4).to(1);
        tm.setSpeed(-0.5);
        tm.setFixedStep(1).step();
        expect(tm.t()).toBe(0.5);
    });

    it('rejects a negative fixed step', () => {
        expect(() => manual().setFixedStep(-1)).toThrow(RangeError);
    });
});

describe('duration and looping', () => {
    it('wraps when looping', () => {
        const tm = manual().setDuration(2);
        tm.step(2.5);
        expect(tm.t()).toBeCloseTo(0.5);
        tm.step(-1);
        expect(tm.t()).toBeCloseTo(1.5);
    });

    it('clamps and finishes when not looping', () => {
        const tm = manual().setDuration(2, false);
        tm.step(5);
        expect(tm.t()).toBe(2);
        expect(tm.isFinished()).toBe(true);
        tm.to(0);
        expect(tm.isFinished()).toBe(false);
    });

    it('is unbounded without a duration', () => {
        const tm = manual();
        tm.step(100);
        expect(tm.t()).toBe(100);
        expect(tm.isFinished()).toBe(false);
    });

    it('fits t into a new duration', () => {
        const tm = manual().to(5);
        tm.setDuration(2);
        expect(tm.t()).toBe(1);
        tm.setDuration(0.5, false);
        expect(tm.t()).toBe(0.5);
    });

    it('reads times relative to now, wrapped like the timeline', () => {
        const tm = manual().setDuration(3).to(1);
        expect(tm.t(-2)).toBe(2);
        expect(tm.t(0.5)).toBe(1.5);
        tm.loop(false);
        expect(tm.t(-2)).toBe(0);
        expect(tm.t(10)).toBe(3);
    });
});

describe('real time', () => {
    it('shows t = 0 on the first frame, then follows the clock', () => {
        const tm = manual();
        tm.pre();
        expect(tm.t()).toBe(0);
        advance(500);
        tm.pre();
        expect(tm.t()).toBeCloseTo(0.5);
    });

    it('scales by speed and counts frames in the frame unit', () => {
        const tm = manual().setUnit(Unit.FRAME).setSpeed(2);
        tm.pre();
        advance(500);
        tm.pre();
        expect(tm.t()).toBeCloseTo(60); // 0.5 s * 60 fps * 2
    });

    it('advances exactly one frame per step when not synced', () => {
        const seconds = manual().sync(false);
        const frames = manual().sync(false).setUnit(Unit.FRAME);
        for (let i = 0; i < 3; i++) {
            seconds.step();
            frames.step();
            advance(1234);
        }
        expect(seconds.t()).toBeCloseTo(3 / 60);
        expect(frames.t()).toBe(3);
    });

    it('does not jump after being paused or after autoplay was off', () => {
        const tm = manual();
        tm.pre();
        advance(100);
        tm.pre();
        expect(tm.t()).toBeCloseTo(0.1);

        tm.play(false);
        advance(5000);
        tm.pre();
        tm.play(true);
        // The first step after resuming starts a fresh clock, so it adds nothing.
        advance(100);
        tm.pre();
        expect(tm.t()).toBeCloseTo(0.1);
        advance(100);
        tm.pre();
        expect(tm.t()).toBeCloseTo(0.2);

        tm.autoplay(false);
        advance(5000);
        tm.pre();
        tm.autoplay(true);
        tm.pre();
        expect(tm.t()).toBeCloseTo(0.2);
        advance(100);
        tm.pre();
        expect(tm.t()).toBeCloseTo(0.3);
    });

    it('takes its defaults from the library settings', () => {
        Object.assign(settings, { unit: Unit.FRAME, synced: false, autoplay: false });
        const tm = manual();
        expect(tm.unit()).toBe(Unit.FRAME);
        expect(tm.isSynced()).toBe(false);
        expect(tm.isAutoplay()).toBe(false);
    });
});

describe('exact stepping', () => {
    it('lands on step multiples and wraps on the right step', () => {
        const tm = manual().setDuration(3).setFixedStep(1 / 30);
        const loops = vi.fn();
        tm.onLoop(loops);
        for (let i = 0; i < 45; i++) tm.step();
        expect(tm.t()).toBe(1.5);
        for (let i = 45; i < 89; i++) tm.step();
        expect(loops).not.toHaveBeenCalled();
        tm.step();
        expect(loops).toHaveBeenCalledTimes(1);
        expect(tm.t()).toBe(0);
    });

    it('also wraps exactly when running backwards', () => {
        const tm = manual().setDuration(1).setFixedStep(0.25).setSpeed(-1);
        const seen: number[] = [];
        for (let i = 0; i < 5; i++) {
            tm.step();
            seen.push(tm.t());
        }
        expect(seen).toEqual([0.75, 0.5, 0.25, 0, 0.75]);
    });
});

describe('ticker', () => {
    it('advances timelines on tick and stops after dispose', () => {
        const ticker = new Ticker();
        const tm = new Timeline(ticker);
        ticker.tick();
        advance(250);
        ticker.tick();
        expect(tm.t()).toBeCloseTo(0.25);

        tm.dispose();
        advance(250);
        ticker.tick();
        expect(tm.t()).toBeCloseTo(0.25);
    });

    it('lets items remove themselves while ticking', () => {
        const ticker = new Ticker();
        const a = new Timeline(ticker);
        const b = new Timeline(ticker);
        ticker.add({ pre: () => a.dispose() });
        expect(() => ticker.tick()).not.toThrow();
        ticker.tick();
        expect(b.t()).toBe(0);
    });
});

describe('markers', () => {
    it('fires markers crossed while playing, in order', () => {
        const tm = manual();
        const fired: string[] = [];
        tm.addMarker('b', 2, (m) => fired.push(m.name()!));
        tm.addMarker('a', 1, (m) => fired.push(m.name()!));
        tm.step(0.5);
        expect(fired).toEqual([]);
        tm.step(2);
        expect(fired).toEqual(['a', 'b']);
    });

    it('fires in reverse order when playing backwards', () => {
        const tm = manual().to(3);
        const fired: number[] = [];
        tm.addMarker(1, (m) => fired.push(m.t()));
        tm.addMarker(2, (m) => fired.push(m.t()));
        tm.step(-3);
        expect(fired).toEqual([2, 1]);
    });

    it('includes a marker at the arrival time but not at the departure time', () => {
        const tm = manual();
        const cb = vi.fn();
        tm.addMarker(1, cb);
        tm.step(1);
        expect(cb).toHaveBeenCalledTimes(1);
        tm.step(1);
        expect(cb).toHaveBeenCalledTimes(1);
        tm.step(-1);
        expect(cb).toHaveBeenCalledTimes(2);
    });

    it('fires a marker at t = 0 on the first step after a silent arrival', () => {
        const tm = manual();
        const cb = vi.fn();
        tm.addMarker(0, cb);
        tm.step(0.5);
        expect(cb).toHaveBeenCalledTimes(1);
    });

    it('fires nothing for a plain to(), but something for to(t, true)', () => {
        const tm = manual();
        const cb = vi.fn();
        tm.addMarker(1, cb);
        tm.to(2);
        expect(cb).not.toHaveBeenCalled();
        tm.to(0).to(2, true);
        expect(cb).toHaveBeenCalledTimes(1);
    });

    it('fires markers on every lap of a loop', () => {
        const tm = manual().setDuration(2);
        const cb = vi.fn();
        tm.addMarker(1.5, cb);
        tm.step(1);
        tm.step(1);
        expect(cb).toHaveBeenCalledTimes(1);
        tm.step(2);
        expect(cb).toHaveBeenCalledTimes(2);
        tm.step(6.5);
        expect(cb).toHaveBeenCalledTimes(5);
    });

    it('does not fire markers beyond the end of a non-looping timeline', () => {
        const tm = manual().setDuration(2, false);
        const cb = vi.fn();
        tm.addMarker(3, cb);
        tm.step(10);
        expect(cb).not.toHaveBeenCalled();
    });

    it('follows its pin', () => {
        const tm = manual();
        const pin = Pin.at(1);
        const marker = tm.addMarker('m', pin, () => {});
        expect(marker.t()).toBe(1);
        expect(marker.pin()).toBe(pin);
        expect(marker.timeline()).toBe(tm);
        pin.to(2);
        expect(marker.t()).toBe(2);
    });

    it('finds, lists and removes markers', () => {
        const tm = manual();
        const late = tm.addMarker('late', 2, () => {});
        const early = tm.addMarker(1, () => {});
        expect(tm.marker('late')).toBe(late);
        expect(tm.marker('missing')).toBeNull();
        expect(early.name()).toBeNull();
        expect(tm.markers()).toEqual([early, late]);
        tm.removeMarker(late);
        expect(tm.marker('late')).toBeNull();
    });

    it('skips markers removed by an earlier callback in the same step', () => {
        const tm = manual();
        const second = vi.fn();
        let marker: Marker;
        tm.addMarker(1, () => tm.removeMarker(marker));
        marker = tm.addMarker(2, second);
        tm.step(3);
        expect(second).not.toHaveBeenCalled();
    });

    it('stops the rest of a step when a callback moves the timeline', () => {
        const tm = manual().setDuration(10);
        const second = vi.fn();
        tm.addMarker(1, () => tm.to(0));
        tm.addMarker(2, second);
        tm.step(3);
        expect(second).not.toHaveBeenCalled();
        expect(tm.t()).toBe(0);
    });

    it('validates the callback', () => {
        expect(() => manual().addMarker(1, undefined as never)).toThrow(TypeError);
    });
});

describe('onLoop and onFinish', () => {
    it('calls onLoop for every wrap, in either direction', () => {
        const tm = manual().setDuration(1);
        const cb = vi.fn();
        tm.onLoop(cb);
        tm.step(3.5);
        expect(cb).toHaveBeenCalledTimes(3);
        tm.step(-0.75);
        expect(cb).toHaveBeenCalledTimes(4);
        expect(cb).toHaveBeenLastCalledWith(tm);
    });

    it('caps the callbacks of a jump spanning many loops', () => {
        const tm = manual().setDuration(1);
        const cb = vi.fn();
        tm.onLoop(cb);
        tm.step(100000);
        expect(cb).toHaveBeenCalledTimes(101);
    });

    it('calls onFinish once when a non-looping timeline ends', () => {
        const tm = manual().setDuration(2, false);
        const cb = vi.fn();
        tm.onFinish(cb);
        tm.step(1);
        expect(cb).not.toHaveBeenCalled();
        tm.step(1);
        expect(cb).toHaveBeenCalledTimes(1);
        tm.step(1);
        expect(cb).toHaveBeenCalledTimes(1);
        tm.to(0).step(5);
        expect(cb).toHaveBeenCalledTimes(2);
    });

    it('does not call onFinish when jumping silently', () => {
        const tm = manual().setDuration(2, false);
        const cb = vi.fn();
        tm.onFinish(cb);
        tm.to(2);
        expect(cb).not.toHaveBeenCalled();
    });

    it('removes listeners of either kind', () => {
        const tm = manual().setDuration(1);
        const loop = vi.fn();
        const finish = vi.fn();
        tm.onLoop(loop).onFinish(finish).removeListener(loop).removeListener(finish);
        tm.step(1.5);
        tm.loop(false).to(0).step(2);
        expect(loop).not.toHaveBeenCalled();
        expect(finish).not.toHaveBeenCalled();
    });
});
