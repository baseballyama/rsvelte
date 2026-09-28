import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like({ length: 2 });

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<div>${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}