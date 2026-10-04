import * as $ from 'svelte/internal/server';

let value = "a";

export function set(next) {
	value = next;
}

export function get() {
	return value;
}

export default function Module_state($$renderer) {
	$$renderer.push(`<p${$.attr_class($.clsx(get()), 'svelte-1xipmll')}></p>`);
}
