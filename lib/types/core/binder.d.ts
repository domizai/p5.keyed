import { type Tickable } from './ticker';
/** A Keyed value that can write itself to its target. */
export interface Bindable {
    apply(): unknown;
}
/** Writes all bound values to their targets before every draw(), after the timelines have advanced. */
export declare class Binder implements Tickable {
    #private;
    add(keyed: Bindable): void;
    remove(keyed: Bindable): void;
    clear(): void;
    /** Applies all bound values; copies the set so setters may bind or unbind while applying. */
    pre(): void;
}
/** Used by every bound Keyed value. */
export declare const binder: Binder;
/** A function that assigns to target[property]; throws if there is nothing to assign to. */
export declare function propertySetter<T>(target: object, property: string): (value: T) => void;
