import { Unit } from './unit';

/** Library-wide settings; timelines read them when they are created. The Keyed class exposes them as static methods. */
export const settings = {
    unit: Unit.SECOND as Unit,
    synced: true,
    autoplay: true,
    /** Converts between frames and seconds. */
    frameRate: 60,
    /** Real time in milliseconds; replaced in tests. */
    now: (): number => performance.now(),
};
