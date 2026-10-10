import { Keyed } from './keyed';
import type { Lerp } from './lerps';
import { Timeline } from './timeline';

/**
 * Reusable animation with its own non-looping timeline; key times are local, 0 is when the instance starts.
 * Extend it, create Keyed values with keyed() or add(), and dispose() once isFinished().
 */
export class Composition {
    readonly #timeline: Timeline;
    readonly #keyeds: Array<{ unbind(): unknown }> = [];

    /** Composition lasting duration, in the timeline's unit. */
    constructor(duration: number) {
        this.#timeline = new Timeline().setDuration(duration, false);
    }

    /** Creates a Keyed value on this composition's timeline. */
    protected keyed<A>(lerp: Lerp<A>, defaultValue: A): Keyed<A> {
        return this.add(new Keyed(lerp, defaultValue));
    }

    /** Moves the keyed value onto this composition's timeline and unbinds it on dispose(). */
    protected add<A>(keyed: Keyed<A>): Keyed<A> {
        keyed.setTimeline(this.#timeline);
        this.#keyeds.push(keyed);
        return keyed;
    }

    /** This composition's own timeline. */
    timeline(): Timeline {
        return this.#timeline;
    }

    /** Restarts from the beginning. */
    play(): this {
        this.#timeline.to(0).play(true);
        return this;
    }

    /** Whether playback reached the end. */
    isFinished(): boolean {
        return this.#timeline.isFinished();
    }

    /** Disposes the timeline and unbinds all keyed values. */
    dispose(): void {
        this.#timeline.dispose();
        for (const k of this.#keyeds) k.unbind();
        this.#keyeds.length = 0;
    }
}
