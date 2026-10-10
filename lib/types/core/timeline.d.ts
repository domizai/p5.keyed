import { Marker } from './marker.js';
import { Pin } from './pin.js';
import { type Tickable, type Ticker } from './ticker.js';
import type { Unit } from './unit.js';
export type MarkerCallback = (marker: Marker) => void;
export type TimelineCallback = (timeline: Timeline) => void;
/**
 * Playback clock for Keyed values and markers, in its Unit (seconds by default).
 * Created without arguments it advances by itself before every draw(); pass null to only move via step() or to().
 */
export declare class Timeline implements Tickable {
    #private;
    /** Advances before every draw(); null only moves via step() or to(). */
    constructor(driver?: Ticker | null);
    /** Called by the ticker before each draw(). The first frame shows t = 0. */
    pre(): void;
    /**
     * Without amount: advances by the fixed step if set; otherwise by real time when synced, or by one frame when not; times speed.
     * With amount: advances by it while playing, firing markers, onLoop and onFinish callbacks passed on the way.
     */
    step(amount?: number): this;
    /** Whether the timeline is playing; see play(). */
    isPlaying(): boolean;
    /** Resumes or pauses; while paused step() does nothing. */
    play(playing?: boolean): this;
    /** Current time, or the time at offset from now (negative = past), wrapped or clamped like the timeline itself. */
    t(offset?: number): number;
    /** Unit of t, duration and step amounts. */
    unit(): Unit;
    /** Only changes how step() advances; t, keys and duration are not converted. */
    setUnit(unit: Unit): this;
    /** Whether step() follows the real clock; see sync(). */
    isSynced(): boolean;
    /** true follows the real clock; false advances exactly one frame (see Keyed.setFrameRate()) per step(), for deterministic exports. */
    sync(sync?: boolean): this;
    /** Whether step() runs automatically before each draw(); see autoplay(). */
    isAutoplay(): boolean;
    /** false stops the automatic step() before each draw(), so step() can be called manually; sync still applies. */
    autoplay(autoplay?: boolean): this;
    /** Duration; 0 means unbounded. */
    duration(): number;
    /** Multiplier for step(); see setSpeed(). */
    speed(): number;
    /** Multiplier for step(); negative plays backwards. */
    setSpeed(speed: number): this;
    /** Units per step() set with setFixedStep(); 0 when disabled. */
    fixedStep(): number;
    /** Units per step() regardless of real time, e.g. 1 / 30 seconds for frame-exact exports; 0 disables it. */
    setFixedStep(amount: number): this;
    /** Jumps to t; fire = true treats the jump like playback, e.g. when scrubbing with the mouse. By default nothing fires. */
    to(t: number, fire?: boolean): this;
    /** Calls callback whenever playback crosses pin or time t. */
    addMarker(at: Pin | number, callback: MarkerCallback): Marker;
    /** Named marker; name may be null. */
    addMarker(name: string | null, at: Pin | number, callback: MarkerCallback): Marker;
    /** Removes a marker; safe to call from a marker callback. */
    removeMarker(marker: Marker): this;
    /** First marker with this name, or null. */
    marker(name: string): Marker | null;
    /** Markers sorted by time. */
    markers(): Marker[];
    /** Called each time a looping timeline wraps around, in either direction. */
    onLoop(callback: TimelineCallback): this;
    /** Called once when a non-looping timeline reaches its duration. */
    onFinish(callback: TimelineCallback): this;
    /** Removes a callback added with onLoop() or onFinish(). */
    removeListener(callback: TimelineCallback): this;
    /** Sets the duration (0 = unbounded) and whether it loops; t is wrapped or clamped to fit. */
    setDuration(duration: number, loop?: boolean): this;
    /** Whether the timeline wraps at its duration; see loop(). */
    isLooping(): boolean;
    /** true wraps at the duration; false stops there. */
    loop(loop?: boolean): this;
    /** True once a non-looping timeline has reached its duration. */
    isFinished(): boolean;
    /** Stops advancing with the sketch; call when the timeline is no longer needed so it can be garbage collected. */
    dispose(): void;
}
