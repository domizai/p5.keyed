import type { Pin } from './pin';
import type { Timeline } from './timeline';

/** A point on a Timeline that calls back when playback crosses it; create with Timeline.addMarker(). */
export class Marker {
    readonly #timeline: Timeline;
    readonly #name: string | null;
    readonly #pin: Pin;
    readonly #callback: (marker: Marker) => void;

    constructor(timeline: Timeline, name: string | null, pin: Pin, callback: (marker: Marker) => void) {
        this.#timeline = timeline;
        this.#name = name;
        this.#pin = pin;
        this.#callback = callback;
    }

    /** Marker name; null if unnamed. */
    name(): string | null {
        return this.#name;
    }

    /** Marker time; follows the pin, so moving the pin moves the marker. */
    t(): number {
        return this.#pin.t();
    }

    /** Pin holding this marker's time. */
    pin(): Pin {
        return this.#pin;
    }

    /** Timeline this marker belongs to. */
    timeline(): Timeline {
        return this.#timeline;
    }

    /** @internal Called by the timeline when playback crosses this marker. */
    fire(): void {
        this.#callback(this);
    }
}
