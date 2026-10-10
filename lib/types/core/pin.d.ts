/** A point in time that several keys can share; moving it moves all of them. */
export declare class Pin {
    #private;
    /** Pin at time t, 0 by default. */
    constructor(t?: number);
    /** Pin at time t. */
    static at(t: number): Pin;
    /** Current time. */
    t(): number;
    /** Moves to time t and notifies listeners. */
    to(t: number): this;
    /** Adds a listener called after every to(), including moves made through a Key. */
    addListener(listener: (pin: Pin) => void): this;
    /** Removes a listener added with addListener(). */
    removeListener(listener: (pin: Pin) => void): this;
    compareTo(o: Pin): number;
}
