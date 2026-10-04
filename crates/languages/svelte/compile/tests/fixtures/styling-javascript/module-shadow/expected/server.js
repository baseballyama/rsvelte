import * as $ from 'svelte/internal/server';

const value = "a";

export function get() {
	return value;
}

export default function Module_shadow($$renderer) {
	const value = "b";
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-si1omu')}></p>`);
}
