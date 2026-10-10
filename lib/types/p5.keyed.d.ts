export * from './core/index.js';
/** What the add-on needs from a p5 sketch. */
interface P5Sketch {
    _isGlobal?: boolean;
}
type Hook = (this: P5Sketch) => void | Promise<void>;
type Lifecycles = Partial<Record<'presetup' | 'postsetup' | 'predraw' | 'postdraw' | 'remove', Hook>>;
/** The p5.js add-on: advances timelines before every draw(). Register it with p5.registerAddon() when using ES modules. */
export declare function keyedAddon(p5: unknown, _fn: unknown, lifecycles: Lifecycles): void;
/**
 * Makes the classes (Keyed, Key, Easing, Timeline, ...) globals, like in a sketch with the script tag.
 * Needed for p5's global mode when the library is imported as a module; instance mode doesn't need it.
 * target is the global object unless given.
 */
export declare function exposeGlobals(target?: object): void;
