import { Keyed } from './keyed.js';
import type { Lerp } from './lerps.js';
import { Timeline } from './timeline.js';
/**
 * Reusable animation with its own non-looping timeline; key times are local, 0 is when the instance starts.
 * Extend it, create Keyed values with keyed() or add(), and dispose() once isFinished().
 */
export declare class Composition {
    #private;
    /** Composition lasting duration, in the timeline's unit. */
    constructor(duration: number);
    /** Creates a Keyed value on this composition's timeline. */
    protected keyed<A>(lerp: Lerp<A>, defaultValue: A): Keyed<A>;
    /** Moves the keyed value onto this composition's timeline and unbinds it on dispose(). */
    protected add<A>(keyed: Keyed<A>): Keyed<A>;
    /** This composition's own timeline. */
    timeline(): Timeline;
    /** Restarts from the beginning. */
    play(): this;
    /** Whether playback reached the end. */
    isFinished(): boolean;
    /** Disposes the timeline and unbinds all keyed values. */
    dispose(): void;
}
