import { describe, expect, it, vi } from 'vitest';
import { Pin } from '../src/core';

describe('Pin', () => {
    it('starts at 0 or at the given time', () => {
        expect(new Pin().t()).toBe(0);
        expect(Pin.at(2.5).t()).toBe(2.5);
    });

    it('notifies listeners after every move', () => {
        const pin = Pin.at(1);
        const listener = vi.fn();
        pin.addListener(listener);
        pin.to(3);
        expect(pin.t()).toBe(3);
        expect(listener).toHaveBeenCalledExactlyOnceWith(pin);
    });

    it('lets a listener remove itself while being notified', () => {
        const pin = new Pin();
        const calls: string[] = [];
        const once = () => {
            calls.push('once');
            pin.removeListener(once);
        };
        pin.addListener(once).addListener(() => calls.push('always'));
        pin.to(1).to(2);
        expect(calls).toEqual(['once', 'always', 'always']);
    });

    it('compares by time', () => {
        expect(Pin.at(1).compareTo(Pin.at(2))).toBeLessThan(0);
        expect(Pin.at(2).compareTo(Pin.at(1))).toBeGreaterThan(0);
        expect(Pin.at(2).compareTo(Pin.at(2))).toBe(0);
    });

    it('only accepts numbers as times, so a typo cannot corrupt the order of keys', () => {
        expect(() => Pin.at(NaN)).toThrow(TypeError);
        expect(() => Pin.at('1' as never)).toThrow(TypeError);
        expect(() => Pin.at(null as never)).toThrow(TypeError);
        expect(() => Pin.at(0).to(NaN)).toThrow(TypeError);
        expect(Pin.at(Infinity).t()).toBe(Infinity);
        expect(Pin.at(-1).to(-0).t()).toBe(-0);
    });
});
