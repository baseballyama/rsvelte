import { isBox } from "$lib/box/box-extras.svelte.js";
import type { Getter, MaybeBoxOrGetter } from "$lib/types.js";
import { isFunction } from "$lib/utils/is.js";

export function unbox<T>(value: MaybeBoxOrGetter<T>): T {
	if (isBox(value)) return value.current;

	if (isFunction(value)) {
		const getter = value as Getter<T>;
		return getter();
	}

	return value;
}
