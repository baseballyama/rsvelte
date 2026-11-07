import * as $ from 'svelte/internal/server';
import { dragscroll } from '@svelte-put/dragscroll';

export default function Option_axis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// :::focus
		// :::highlight
		let axis = 'both';

		// :::
		// :::
		const classesForOddRows = 'odd:bg-white odd:text-black even:bg-black even:text-white';

		const classesForEvenRows = 'odd:bg-black odd:text-white even:bg-white even:text-black';

		$$renderer.push(`<div class="not-prose mx-auto grid max-w-4xl place-items-center"><div class="flex items-center space-x-4"><p>Select the scroll axis</p> <label class="flex cursor-pointer items-center gap-2"><input class="c-input" type="radio" name="axis" value="x" id="x"${$.attr('checked', axis === 'x', true)}/> x</label> <label class="flex cursor-pointer items-center gap-2"><input class="c-input" type="radio" name="axis" value="y" id="y"${$.attr('checked', axis === 'y', true)}/> y</label> <label class="flex cursor-pointer items-center gap-2"><input class="c-input" type="radio" name="axis" value="both" id="both"${$.attr('checked', axis === 'both', true)}/> both</label></div>  <div class="mt-4 max-h-[300px] max-w-[300px] overflow-x-auto border-2 border-violet-500 md:max-h-[400px] md:max-w-[400px]"><!--[-->`);

		const each_array = $.ensure_array_like(new Array(10));

		for (let row = 0, $$length = each_array.length; row < $$length; row++) {
			let _ = each_array[row];

			$$renderer.push(`<div class="grid grid-cols-[repeat(10,1fr)]"><!--[-->`);

			const each_array_1 = $.ensure_array_like(new Array(10));

			for (let col = 0, $$length = each_array_1.length; col < $$length; col++) {
				let _ = each_array_1[col];

				$$renderer.push(`<div${$.attr_class(` grid h-20 w-20 select-none place-items-center ${row % 2 === 0 ? classesForEvenRows : classesForOddRows} `)}>${$.escape(row * 10 + col + 1)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}