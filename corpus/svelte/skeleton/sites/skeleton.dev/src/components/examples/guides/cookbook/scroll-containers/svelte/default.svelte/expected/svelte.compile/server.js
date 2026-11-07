import * as $ from 'svelte/internal/server';

export default function Default($$renderer) {
	$$renderer.push(`<div class="w-full"><div class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-10"><!--[-->`);

	const each_array = $.ensure_array_like(Array.from({ length: 8 }));

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let _ = each_array[i];

		$$renderer.push(`<div class="snap-start shrink-0 card preset-filled py-20 w-40 md:w-80 text-center"><span>${$.escape(i + 1)}</span></div>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}