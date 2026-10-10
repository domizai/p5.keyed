import { ticker, type Tickable } from './ticker';

/** A Keyed value that can write itself to its target. */
export interface Bindable {
    apply(): unknown;
}

/** Writes all bound values to their targets before every draw(), after the timelines have advanced. */
export class Binder implements Tickable {
    readonly #bound = new Set<Bindable>();

    add(keyed: Bindable): void {
        this.#bound.add(keyed);
        // Runs after the timelines, so bound values are as current as value() inside draw().
        ticker.addLate(this);
    }

    remove(keyed: Bindable): void {
        this.#bound.delete(keyed);
    }

    clear(): void {
        this.#bound.clear();
    }

    /** Applies all bound values; copies the set so setters may bind or unbind while applying. */
    pre(): void {
        for (const keyed of [...this.#bound]) {
            keyed.apply();
        }
    }
}

/** Used by every bound Keyed value. */
export const binder = new Binder();

const describe = (target: object): string =>
    typeof window !== 'undefined' && target === window ? 'window' : (target.constructor?.name ?? 'the object');

/** A function that assigns to target[property]; throws if there is nothing to assign to. */
export function propertySetter<T>(target: object, property: string): (value: T) => void {
    if (target === null || (typeof target !== 'object' && typeof target !== 'function') || typeof property !== 'string') {
        throw new TypeError("bind() needs an object and the name of its property, e.g. Keyed.bind(obj, 'x')");
    }

    let owner: object | null = target;
    let descriptor: PropertyDescriptor | undefined;
    while (owner && !(descriptor = Object.getOwnPropertyDescriptor(owner, property))) {
        owner = Object.getPrototypeOf(owner);
    }

    if (!descriptor) {
        const hint =
            typeof window !== 'undefined' && target === window
                ? ' Top-level let and const variables are not properties of window; declare it with var, or bind a setter instead.'
                : '';
        throw new TypeError(`No property '${property}' on ${describe(target)}.${hint}`);
    }
    if (descriptor.get || descriptor.set ? !descriptor.set : !descriptor.writable) {
        throw new TypeError(`Property '${property}' of ${describe(target)} is read-only`);
    }

    return (value) => {
        (target as Record<string, unknown>)[property] = value;
    };
}
