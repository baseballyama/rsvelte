import {
	boxFrom,
	boxWith,
	boxFlatten,
	toReadonlyBox,
	isBox,
	isWritableBox,
	type WritableBox,
	BoxSymbol,
	isWritableSymbol
} from "./box-extras.svelte.js";

/**
 * Creates a writable box.
 *
 * @returns A box with a `current` property which can be set to a new value.
 * Useful to pass state to other functions.
 *
 * @see {@link https://runed.dev/docs/functions/box}
 */
export function box<T>(): WritableBox<T | undefined>;
/**
 * Creates a writable box with an initial value.
 *
 * @param initialValue The initial value of the box.
 * @returns A box with a `current` property which can be set to a new value.
 * Useful to pass state to other functions.
 *
 * @see {@link https://runed.dev/docs/functions/box}
 */
export function box<T>(initialValue: T): WritableBox<T>;
export function box(initialValue?: unknown) {
	let current = $state(initialValue);

	return {
		[BoxSymbol]: true,
		[isWritableSymbol]: true,
		get current() {
			return current as unknown;
		},
		set current(v: unknown) {
			current = v;
		}
	};
}

box.from = boxFrom;
box.with = boxWith;
box.flatten = boxFlatten;
box.readonly = toReadonlyBox;
box.isBox = isBox;
box.isWritableBox = isWritableBox;
