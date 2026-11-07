import * as $ from 'svelte/internal/server';

function figure($$renderer) {
	$$renderer.push(`<div class="flex h-24 items-center justify-center rounded bg-gray-50 dark:bg-gray-800"><p class="text-2xl text-gray-400 dark:text-gray-500"><svg class="h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"></path></svg></p></div>`);
}

export default function PlusPlaceholder($$renderer, $$props) {
	let { colnum = 1, rownum = 1 } = $$props;

	function calculateGridItems() {
		return colnum * rownum;
	}

	const colclass = $.derived(() => `grid-cols-${colnum}`);

	$$renderer.push(`<div${$.attr_class(`mb-4 grid ${colclass()} gap-4`)}><!--[-->`);

	const each_array = $.ensure_array_like(Array(calculateGridItems()));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let _ = each_array[$$index];

		figure($$renderer);
	}

	$$renderer.push(`<!--]--></div>`);
}