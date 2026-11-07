import * as $ from 'svelte/internal/server';
import { dragscroll } from '@svelte-put/dragscroll';

export default function Limitation_scroll_snap($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<ul class="not-prose mx-auto flex max-w-4xl snap-x snap-mandatory overflow-x-auto border-2 border-violet-500 p-4 text-black"><!--[-->`);

		const each_array = $.ensure_array_like(new Array(10));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<li class="mx-[20%] grid h-20 w-2/3 shrink-0 snap-center place-items-center odd:bg-green-200 even:bg-blue-200">${$.escape(i + 1)}</li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}