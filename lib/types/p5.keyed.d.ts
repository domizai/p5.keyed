export * from './core/index.js';
/** What the add-on needs from a p5 sketch. */
interface P5Sketch {
    _isGlobal?: boolean;
}
type Hook = (this: P5Sketch) => void | Promise<void>;
type Lifecycles = Partial<Record<'presetup' | 'postsetup' | 'predraw' | 'postdraw' | 'remove', Hook>>;
/** The p5.js add-on: advances timelines before every draw(). Register it with p5.registerAddon() when using ES modules. */
export declare function keyedAddon(p5: unknown, _fn: unknown, lifecycles: Lifecycles): void;
