import * as $ from 'svelte/internal/server';

export default function Loaderbox($$renderer) {
	const boxes = Array.from({ length: 24 * 60 }, (_, i) => i);

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(boxes);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let k = each_array[$$index];

		$$renderer.push(`<div class="today-sq animatebg m-px h-2.5 w-2.5"${$.attr_style(`animation-delay:${$.stringify(Math.random() * (k * 15))}ms;`)}></div>`);
	}

	$$renderer.push(`<!--]-->`);
}