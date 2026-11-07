import * as $ from 'svelte/internal/server';
import { intersect } from '@svelte-put/intersect';
import { fly } from 'svelte/transition';

export default function Event_intersectonce($$renderer) {
	let ulElement = void 0;

	let intersectionMap = {
		one: false,
		two: false,
		three: false,
		four: false,
		five: false,
		six: false,
		seven: false,
		eight: false
	};

	$$renderer.push(`<ul class="max-h-[400px] w-full space-y-20 overflow-hidden overflow-y-auto p-4"><!--[-->`);

	const each_array = $.ensure_array_like(Object.keys(intersectionMap));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let key = each_array[$$index];

		$$renderer.push(`<!---->`);

		{
			$$renderer.push(`<li${$.attr_class('odd:bg-success-fg even:bg-info-fg h-[300px] marker:content-none', void 0, { 'invisible': !intersectionMap[key] })}></li>`);
		}

		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]--></ul>`);
}