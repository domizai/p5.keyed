import { Easing, Key, Marker, Pin, Timeline, ticker } from './core';

export * from './core';

/** What the add-on needs from a p5 sketch. */
interface P5Sketch {
    _isGlobal?: boolean;
}

type Hook = (this: P5Sketch) => void | Promise<void>;
type Lifecycles = Partial<Record<'presetup' | 'postsetup' | 'predraw' | 'postdraw' | 'remove', Hook>>;

// Only one sketch drives the default ticker; with several (instance mode) the first one wins.
let owner: P5Sketch | null = null;

/** The p5.js add-on: advances timelines before every draw(). Register it with p5.registerAddon() when using ES modules. */
export function keyedAddon(_p5: unknown, _fn: unknown, lifecycles: Lifecycles): void {
    lifecycles.presetup = function () {
        owner ??= this;
    };
    lifecycles.predraw = function () {
        if (this === owner) ticker.tick();
    };
    lifecycles.remove = function () {
        if (this === owner) {
            owner = null;
            ticker.clear();
        }
    };
}

// Classes are assigned to window instead of p5's fn: in global mode p5 binds every function on fn, which
// would strip static members like Key.at(). Doing it here also makes them usable above setup().
const globals = { Easing, Key, Marker, Pin, Timeline };

declare const p5: { registerAddon?: (addon: typeof keyedAddon) => void } | undefined;

if (typeof window !== 'undefined') {
    Object.assign(window, globals);
}
if (typeof p5 !== 'undefined' && typeof p5.registerAddon === 'function') {
    p5.registerAddon(keyedAddon);
}
