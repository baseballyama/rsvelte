import * as $ from 'svelte/internal/server';

export const value = "a";

export function get() {
	return value;
}

export default function Module($$renderer) {
	const local = get();
	$$renderer.push(`<p${$.attr_class($.clsx(local), 'svelte-kckp2t')}></p>`);
}
