// Entry of the script tag files (p5.keyed.js, p5.keyed.min.js): everything a sketch needs is made global
// and the add-on registers itself with the p5 that was loaded before.
import { exposeGlobals, keyedAddon } from './p5.keyed';

export * from './p5.keyed';

declare const p5: { registerAddon?: (addon: typeof keyedAddon) => void } | undefined;

if (typeof window !== 'undefined') {
    exposeGlobals(window);
}
if (typeof p5 !== 'undefined') {
    if (typeof p5.registerAddon === 'function') {
        p5.registerAddon(keyedAddon);
    } else {
        console.warn('p5.keyed needs p5.js 2.x: this p5 has no registerAddon(), so Keyed will not run. Load p5.js 2.x before p5.keyed.js.');
    }
}
