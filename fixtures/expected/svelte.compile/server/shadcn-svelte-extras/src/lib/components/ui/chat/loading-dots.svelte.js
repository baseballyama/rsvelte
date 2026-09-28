import * as $ from 'svelte/internal/server';

export default function Loading_dots($$renderer, $$props) {
	let { size = 4 } = $$props;

	$$renderer.push(`<div class="inline-flex items-center gap-1 svelte-k2x6sv"${$.attr_style('', { '--loading-dots-size': `${$.stringify(size)}px` })}><!--[-->`);

	const each_array = $.ensure_array_like({ length: 3 });

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let _ = each_array[i];

		$$renderer.push(`<span class="bg-primary inline-block size-(--loading-dots-size) rounded-full svelte-k2x6sv"></span>`);
	}

	$$renderer.push(`<!--]--></div>`);
}