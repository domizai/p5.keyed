import { Marker } from './marker';
import { Pin } from './pin';
import { settings } from './settings';
import { ticker, type Tickable, type Ticker } from './ticker';
import type { Unit } from './unit';

// Caps callbacks when one jump spans many loops.
const MAX_WRAPS = 100;
const BY_TIME = (a: Marker, b: Marker): number => a.t() - b.t();

const constrain = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);
const remEuclid = (a: number, b: number): number => ((a % b) + b) % b;

export type MarkerCallback = (marker: Marker) => void;
export type TimelineCallback = (timeline: Timeline) => void;

/**
 * Playback clock for Keyed values and markers, in its Unit (seconds by default).
 * Created without arguments it advances by itself before every draw(); pass null to only move via step() or to().
 */
export class Timeline implements Tickable {
    #unit: Unit = settings.unit;
    #synced = settings.synced;
    #autoplay = settings.autoplay;
    #loop = true;
    #duration = 0;
    #t = 0;
    #speed = 1;
    #fixedStep = 0;
    #playing = true;
    #lastMs = -1;
    #started = false;
    #ticker: Ticker | null;
    readonly #markers: Marker[] = [];
    readonly #loopListeners: TimelineCallback[] = [];
    readonly #finishListeners: TimelineCallback[] = [];
    // Set by moves that fire nothing, so a marker exactly at the new t still fires on the next step.
    #arrivedSilently = true;
    // Bumped on every move; a change during a callback means it moved the timeline, so the rest is skipped.
    #moveId = 0;

    /** Advances before every draw(); null only moves via step() or to(). */
    constructor(driver: Ticker | null = ticker) {
        this.#ticker = driver;
        driver?.add(this);
    }

    /** @internal Called before each draw(). The first frame shows t = 0. */
    pre(): void {
        if (!this.#autoplay) {
            // Re-enabling autoplay starts a fresh clock instead of jumping by the paused gap.
            this.#started = false;
            return;
        }
        if (this.#started) {
            this.step();
        } else {
            this.#started = true;
            this.#lastMs = settings.now();
        }
    }

    /**
     * Without amount: advances by the fixed step if set; otherwise by real time when synced, or by one frame when not; times speed.
     * With amount: advances by it while playing, firing markers, onLoop and onFinish callbacks passed on the way.
     */
    step(amount?: number): this {
        if (amount !== undefined) {
            if (this.#playing) this.#move(this.#t + amount, true);
            return this;
        }

        const now = settings.now();
        const fps = settings.frameRate;
        const exact = this.#fixedStep > 0 || !this.#synced;
        let dt: number;
        if (this.#fixedStep > 0) {
            dt = this.#fixedStep;
        } else if (this.#synced) {
            const seconds = this.#lastMs < 0 ? 0 : (now - this.#lastMs) / 1000;
            dt = this.#unit === 'frame' ? seconds * fps : seconds;
        } else {
            dt = this.#unit === 'frame' ? 1 : 1 / fps;
        }
        this.#lastMs = now;
        return exact ? this.#stepExact(dt * this.#speed) : this.step(dt * this.#speed);
    }

    // Adding a step like 1/30 again and again drifts (90 steps don't give exactly 3), so a loop would wrap
    // one step late; snapping back onto the step grid and the loop boundaries keeps t exact.
    #stepExact(amount: number): this {
        if (!this.#playing || amount === 0) {
            return this.step(amount);
        }
        const grid = Math.abs(amount);
        let target = this.#t + amount;
        const tolerance = grid * 1e-3;
        const k = Math.round(target / grid);
        if (Math.abs(target - k * grid) < tolerance) {
            target = k * grid;
        }
        if (this.#duration > 0) {
            const m = Math.round(target / this.#duration);
            if (Math.abs(target - m * this.#duration) < tolerance) {
                target = m * this.#duration;
            }
        }
        this.#move(target, true);
        return this;
    }

    /** Whether the timeline is playing; see play(). */
    isPlaying(): boolean {
        return this.#playing;
    }

    /** Resumes or pauses; while paused step() does nothing. */
    play(playing = true): this {
        if (playing && !this.#playing) {
            this.#lastMs = -1;
        }
        this.#playing = playing;
        return this;
    }

    /** Current time, or the time at offset from now (negative = past), wrapped or clamped like the timeline itself. */
    t(offset?: number): number {
        return offset === undefined ? this.#t : this.#fit(this.#t + offset);
    }

    /** Unit of t, duration and step amounts. */
    unit(): Unit {
        return this.#unit;
    }

    /** Only changes how step() advances; t, keys and duration are not converted. */
    setUnit(unit: Unit): this {
        this.#unit = unit;
        return this;
    }

    /** Whether step() follows the real clock; see sync(). */
    isSynced(): boolean {
        return this.#synced;
    }

    /** true follows the real clock; false advances exactly one frame (see Keyed.setFrameRate()) per step(), for deterministic exports. */
    sync(sync = true): this {
        this.#synced = sync;
        return this;
    }

    /** Whether step() runs automatically before each draw(); see autoplay(). */
    isAutoplay(): boolean {
        return this.#autoplay;
    }

    /** false stops the automatic step() before each draw(), so step() can be called manually; sync still applies. */
    autoplay(autoplay = true): this {
        this.#autoplay = autoplay;
        return this;
    }

    /** Duration; 0 means unbounded. */
    duration(): number {
        return this.#duration;
    }

    /** Multiplier for step(); see setSpeed(). */
    speed(): number {
        return this.#speed;
    }

    /** Multiplier for step(); negative plays backwards. */
    setSpeed(speed: number): this {
        this.#speed = speed;
        return this;
    }

    /** Units per step() set with setFixedStep(); 0 when disabled. */
    fixedStep(): number {
        return this.#fixedStep;
    }

    /** Units per step() regardless of real time, e.g. 1 / 30 seconds for frame-exact exports; 0 disables it. */
    setFixedStep(amount: number): this {
        if (!(amount >= 0)) {
            throw new RangeError(`fixed step must be >= 0, was ${amount}`);
        }
        this.#fixedStep = amount;
        return this;
    }

    /** Jumps to t; fire = true treats the jump like playback, e.g. when scrubbing with the mouse. By default nothing fires. */
    to(t: number, fire = false): this {
        this.#move(t, fire);
        return this;
    }

    /** Calls callback whenever playback crosses pin or time t. */
    addMarker(at: Pin | number, callback: MarkerCallback): Marker;
    /** Named marker; name may be null. */
    addMarker(name: string | null, at: Pin | number, callback: MarkerCallback): Marker;
    addMarker(a: string | null | Pin | number, b: Pin | number | MarkerCallback, c?: MarkerCallback): Marker {
        const named = c !== undefined;
        const name = named ? (a as string | null) : null;
        const at = (named ? b : a) as Pin | number;
        const callback = named ? c : (b as MarkerCallback);
        if (typeof callback !== 'function') {
            throw new TypeError('addMarker() needs a callback function');
        }
        const marker = new Marker(this, name, at instanceof Pin ? at : Pin.at(at), callback);
        this.#markers.push(marker);
        return marker;
    }

    /** Removes a marker; safe to call from a marker callback. */
    removeMarker(marker: Marker): this {
        const i = this.#markers.indexOf(marker);
        if (i >= 0) this.#markers.splice(i, 1);
        return this;
    }

    /** First marker with this name, or null. */
    marker(name: string): Marker | null {
        return this.#markers.find((m) => m.name() === name) ?? null;
    }

    /** Markers sorted by time. */
    markers(): Marker[] {
        return [...this.#markers].sort(BY_TIME);
    }

    /** Called each time a looping timeline wraps around, in either direction. */
    onLoop(callback: TimelineCallback): this {
        this.#loopListeners.push(callback);
        return this;
    }

    /** Called once when a non-looping timeline reaches its duration. */
    onFinish(callback: TimelineCallback): this {
        this.#finishListeners.push(callback);
        return this;
    }

    /** Removes a callback added with onLoop() or onFinish(). */
    removeListener(callback: TimelineCallback): this {
        for (const listeners of [this.#loopListeners, this.#finishListeners]) {
            const i = listeners.indexOf(callback);
            if (i >= 0) listeners.splice(i, 1);
        }
        return this;
    }

    /** Sets the duration (0 = unbounded) and whether it loops; t is wrapped or clamped to fit. */
    setDuration(duration: number, loop = true): this {
        this.#duration = duration;
        this.#loop = loop;
        this.#t = this.#fit(this.#t);
        return this;
    }

    /** Whether the timeline wraps at its duration; see loop(). */
    isLooping(): boolean {
        return this.#loop;
    }

    /** true wraps at the duration; false stops there. */
    loop(loop = true): this {
        this.#loop = loop;
        return this;
    }

    /** True once a non-looping timeline has reached its duration. */
    isFinished(): boolean {
        return !this.#loop && this.#duration > 0 && this.#t >= this.#duration;
    }

    /** Stops advancing with the sketch; call when the timeline is no longer needed so it can be garbage collected. */
    dispose(): void {
        this.#ticker?.remove(this);
        this.#ticker = null;
    }

    #fit(t: number): number {
        if (this.#duration <= 0) return t;
        return this.#loop ? remEuclid(t, this.#duration) : constrain(t, 0, this.#duration);
    }

    #move(target: number, fire: boolean): void {
        const id = ++this.#moveId;
        const from = this.#t;
        const wasFinished = this.isFinished();
        const includeStart = this.#arrivedSilently;
        this.#t = this.#fit(target);
        this.#arrivedSilently = !fire;
        if (!fire) return;

        if (!this.#crossMarkers(from, target - from, includeStart, id)) return;
        if (!wasFinished && this.isFinished()) {
            this.#callListeners(this.#finishListeners, id);
        }
    }

    // Walks from `from` by delta, wrapping like fit(); false if a callback moved the timeline.
    #crossMarkers(from: number, delta: number, includeStart: boolean, id: number): boolean {
        const duration = this.#duration;
        const wraps = this.#loop && duration > 0;
        const forward = delta >= 0;
        let pos = from;
        let remaining = Math.abs(delta);
        let inclusive = includeStart;
        for (let i = 0; i <= MAX_WRAPS; i++) {
            if (forward) {
                const end = pos + remaining;
                if (!wraps || end < duration) {
                    return this.#fireMarkers(pos, wraps ? end : this.#t, inclusive, true, true, id);
                }
                if (!this.#fireMarkers(pos, duration, inclusive, true, true, id)) return false;
                remaining = end - duration;
                pos = 0;
            } else {
                const end = pos - remaining;
                if (!wraps || end >= 0) {
                    return this.#fireMarkers(wraps ? end : this.#t, pos, true, inclusive, false, id);
                }
                if (!this.#fireMarkers(0, pos, true, inclusive, false, id)) return false;
                remaining = -end;
                pos = duration;
            }
            inclusive = true;
            if (!this.#callListeners(this.#loopListeners, id)) return false;
        }
        return true;
    }

    // Fires markers in [lo, hi] (ends included as given) in playback order.
    #fireMarkers(lo: number, hi: number, includeLo: boolean, includeHi: boolean, forward: boolean, id: number): boolean {
        const crossed = this.#markers.filter((m) => {
            const mt = m.t();
            return (mt > lo || (includeLo && mt === lo)) && (mt < hi || (includeHi && mt === hi));
        });
        crossed.sort(forward ? BY_TIME : (a, b) => BY_TIME(b, a));
        for (const m of crossed) {
            // Skips markers removed by an earlier callback in this step.
            if (!this.#markers.includes(m)) continue;
            m.fire();
            if (this.#moveId !== id) return false;
        }
        return true;
    }

    #callListeners(listeners: TimelineCallback[], id: number): boolean {
        for (const listener of [...listeners]) {
            listener(this);
            if (this.#moveId !== id) return false;
        }
        return true;
    }
}
