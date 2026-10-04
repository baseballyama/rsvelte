import * as $ from 'svelte/internal/server';

export default function Assertions($$renderer) {
	const value = "a";
	const fn = (x) => x;
	$$renderer.push(`<p${$.attr_class($.clsx(fn(value)), 'svelte-k3c2fa')}></p>`);
}
