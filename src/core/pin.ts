/** A point in time that several keys can share; moving it moves all of them. */
export class Pin {
    #t: number;
    #listeners: Array<(pin: Pin) => void> | null = null;

    /** Pin at time t, 0 by default. */
    constructor(t = 0) {
        this.#t = t;
    }

    /** Pin at time t. */
    static at(t: number): Pin {
        return new Pin(t);
    }

    /** Current time. */
    t(): number {
        return this.#t;
    }

    /** Moves to time t and notifies listeners. */
    to(t: number): this {
        this.#t = t;
        if (this.#listeners) {
            // Copy so listeners may remove themselves.
            for (const listener of [...this.#listeners]) {
                listener(this);
            }
        }
        return this;
    }

    /** Adds a listener called after every to(), including moves made through a Key. */
    addListener(listener: (pin: Pin) => void): this {
        (this.#listeners ??= []).push(listener);
        return this;
    }

    /** Removes a listener added with addListener(). */
    removeListener(listener: (pin: Pin) => void): this {
        const i = this.#listeners?.indexOf(listener) ?? -1;
        if (i >= 0) this.#listeners!.splice(i, 1);
        return this;
    }

    compareTo(o: Pin): number {
        return this.#t < o.#t ? -1 : this.#t > o.#t ? 1 : 0;
    }
}
