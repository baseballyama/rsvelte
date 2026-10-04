import * as $ from 'svelte/internal/server';

export default function Bigint($$renderer) {
	const value = 123n;
	$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-h6i544')}></p>`);
}
