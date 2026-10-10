import {
    AngleLerp,
    BooleanLerp,
    ColorLerp,
    Easing,
    FloatLerp,
    IntLerp,
    Key,
    Keyed,
    Marker,
    Pin,
    StepLerp,
    StringLerp,
    Timeline,
    TweenAt,
    VectorLerp,
    ticker,
} from './core';
import { binder } from './core/binder';
import { env, type P5Runtime } from './core/env';

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
export function keyedAddon(p5: unknown, _fn: unknown, lifecycles: Lifecycles): void {
    env.p5 = p5 as P5Runtime;
    env.claim = (sketch) => {
        if (sketch) owner = sketch as P5Sketch;
    };
    lifecycles.presetup = function () {
        owner ??= this;
    };
    lifecycles.predraw = function () {
        if (this === owner) ticker.tick();
    };
    lifecycles.remove = function () {
        if (this === owner) {
            owner = null;
            // Timelines and bound targets belong to the sketch that made them; the default timeline is replaced so the next sketch starts clean.
            binder.clear();
            ticker.clear();
            Keyed.init();
        }
    };
}

// Classes are assigned to window instead of p5's fn: in global mode p5 binds every function on fn, which
// would strip static members like Key.at(). Doing it here also makes them usable above setup().
const globals = {
    AngleLerp,
    BooleanLerp,
    ColorLerp,
    Easing,
    FloatLerp,
    IntLerp,
    Key,
    Keyed,
    Marker,
    Pin,
    StepLerp,
    StringLerp,
    Timeline,
    TweenAt,
    VectorLerp,
};

declare const p5: { registerAddon?: (addon: typeof keyedAddon) => void } | undefined;

if (typeof window !== 'undefined') {
    Object.assign(window, globals);
}
if (typeof p5 !== 'undefined' && typeof p5.registerAddon === 'function') {
    p5.registerAddon(keyedAddon);
}
