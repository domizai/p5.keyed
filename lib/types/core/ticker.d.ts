/** Something that advances once before every draw(). */
export interface Tickable {
    pre(): void;
}
/** Calls pre() on everything added to it; the p5 add-on ticks the default one before every draw(). */
export declare class Ticker {
    #private;
    add(item: Tickable): void;
    remove(item: Tickable): void;
    clear(): void;
    /** Calls pre() on a copy, so items may add or remove themselves while ticking. */
    tick(): void;
}
/** Used by every Timeline that isn't given another one. */
export declare const ticker: Ticker;
