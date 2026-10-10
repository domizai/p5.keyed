// @vitest-environment happy-dom
import p5 from 'p5';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// A p5 that is already global, like with a <script> tag, must not make the module entry register or expose anything.
(globalThis as unknown as { p5: unknown }).p5 = p5;
const hooks = p5 as unknown as { lifecycleHooks: { predraw: unknown[] } };
const hooksBefore = hooks.lifecycleHooks.predraw.length;
const lib = await import('../src/p5.keyed');
const w = window as unknown as Record<string, unknown>;

describe('the module entry', () => {
    it('has no side effects: no globals and no registration', () => {
        expect(w.Keyed).toBeUndefined();
        expect(w.Key).toBeUndefined();
        expect(hooks.lifecycleHooks.predraw.length).toBe(hooksBefore);
    });

    it('exposeGlobals() puts the classes on a given object', () => {
        const target: Record<string, unknown> = {};
        lib.exposeGlobals(target);
        expect(target.Keyed).toBe(lib.Keyed);
        expect(target.Easing).toBe(lib.Easing);
        expect((target.Key as typeof lib.Key).at(2).t()).toBe(2);
        expect(w.Keyed).toBeUndefined();
    });

    it('exposeGlobals() without an argument uses the global object', () => {
        lib.exposeGlobals();
        expect(w.Keyed).toBe(lib.Keyed);
        expect(w.Wiggle).toBe(lib.Wiggle);
        for (const name of Object.keys(w).filter((k) => /^[A-Z]/.test(k) && k in lib)) {
            expect(w[name], name).toBe((lib as unknown as Record<string, unknown>)[name]);
        }
    });

    it('rejects a missing target', () => {
        expect(() => lib.exposeGlobals(null as never)).toThrow(TypeError);
    });
});

describe('types/global.d.ts', () => {
    const source = readFileSync(`${process.cwd()}/types/global.d.ts`, 'utf8');
    const declared = (re: RegExp) => [...source.matchAll(re)].map((m) => m[1]!).sort();

    it('declares exactly the names exposeGlobals() sets, as values', () => {
        const exposed: Record<string, unknown> = {};
        lib.exposeGlobals(exposed);
        expect(declared(/^\s*var (\w+):/gm)).toEqual(Object.keys(exposed).sort());
    });

    it('declares every class as a type too', () => {
        const exposed: Record<string, unknown> = {};
        lib.exposeGlobals(exposed);
        const classes = Object.entries(exposed)
            .filter(([, v]) => typeof v === 'function' || (v as { prototype?: unknown })?.prototype)
            .map(([k]) => k);
        const types = declared(/^\s*type (\w+)/gm);
        for (const name of classes) expect(types, name).toContain(name);
    });
});
