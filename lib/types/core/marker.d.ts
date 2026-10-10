import type { Pin } from './pin';
import type { Timeline } from './timeline';
/** A point on a Timeline that calls back when playback crosses it; create with Timeline.addMarker(). */
export declare class Marker {
    #private;
    constructor(timeline: Timeline, name: string | null, pin: Pin, callback: (marker: Marker) => void);
    /** Marker name; null if unnamed. */
    name(): string | null;
    /** Marker time; follows the pin, so moving the pin moves the marker. */
    t(): number;
    /** Pin holding this marker's time. */
    pin(): Pin;
    /** Timeline this marker belongs to. */
    timeline(): Timeline;
}
