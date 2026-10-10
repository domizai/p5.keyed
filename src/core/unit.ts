/** Unit of a Timeline's t; keys, durations and effect times are all read in it. */
export type Unit = 'second' | 'frame';

export const Unit = {
    /** Real time, or the fixed step if set. */
    SECOND: 'second',
    /** Advances 1 per draw(), independent of real time. */
    FRAME: 'frame',
} as const;
