import * as $ from 'svelte/internal/server';
import { dragscroll } from '@svelte-put/dragscroll';

export default function No_parameters($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// :::focus
		// :::highlight
		// :::
		// :::
		const classesForOddRows = 'odd:bg-white odd:text-black even:bg-black even:text-white';

		const classesForEvenRows = 'odd:bg-black odd:text-white even:bg-white even:text-black';

		$$renderer.push(`<div class="mx-auto max-w-4xl overflow-x-auto border-2 border-violet-500 p-4"><!--[-->`);

		const each_array = $.ensure_array_like(new Array(10));

		for (let row = 0, $$length = each_array.length; row < $$length; row++) {
			let _ = each_array[row];

			$$renderer.push(`<div class="grid grid-cols-[repeat(10,1fr)]"><!--[-->`);

			const each_array_1 = $.ensure_array_like(new Array(10));

			for (let col = 0, $$length = each_array_1.length; col < $$length; col++) {
				let _ = each_array_1[col];

				$$renderer.push(`<div${$.attr_class(` grid h-10 w-32 select-none place-items-center ${row % 2 === 0 ? classesForEvenRows : classesForOddRows} `)}>${$.escape(row * 10 + col + 1)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}