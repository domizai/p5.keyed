import { Unit } from './unit.js';
/** Library-wide settings; timelines read them when they are created. The Keyed class exposes them as static methods. */
export declare const settings: {
    unit: Unit;
    synced: boolean;
    autoplay: boolean;
    /** Converts between frames and seconds. */
    frameRate: number;
    /** Real time in milliseconds; replaced in tests. */
    now: () => number;
};
