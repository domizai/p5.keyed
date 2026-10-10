/** Something that advances once before every draw(). */
export interface Tickable {
    pre(): void;
}

/** Calls pre() on everything added to it; the p5 add-on ticks the default one before every draw(). */
export class Ticker {
    readonly #items = new Set<Tickable>();
    readonly #late = new Set<Tickable>();

    add(item: Tickable): void {
        this.#items.add(item);
    }

    /** Like add(), but ticked after all regular items, e.g. to write values after the timelines have advanced. */
    addLate(item: Tickable): void {
        this.#late.add(item);
    }

    remove(item: Tickable): void {
        this.#items.delete(item);
        this.#late.delete(item);
    }

    clear(): void {
        this.#items.clear();
        this.#late.clear();
    }

    /** Calls pre() on a copy, so items may add or remove themselves while ticking. */
    tick(): void {
        for (const item of [...this.#items, ...this.#late]) {
            item.pre();
        }
    }
}

/** Used by every Timeline that isn't given another one. */
export const ticker = new Ticker();
