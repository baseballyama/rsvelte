import * as $ from 'svelte/internal/server';

export default function OnThisDaySkeleton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="animate-pulse" role="status" aria-label="Loading today in history"><div class="mb-8"><div class="mb-4 h-7 w-24 rounded bg-gray-200 dark:bg-gray-700"></div> <!--[-->`);

		const each_array = $.ensure_array_like([0, 1, 2, 3, 4]);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let _ = each_array[index];

			$$renderer.push(`<div${$.attr_class(`relative flex flex-col pb-6 before:absolute before:top-[14px] before:bottom-[-16px] before:left-[3px] before:w-[2px] before:bg-gray-200 before:content-[''] dark:before:bg-gray-700 ${index === 4 ? 'last-item' : ''} md:grid md:grid-cols-[auto_1fr] md:items-start md:gap-4`, 'svelte-1t00uz4', { 'last-item': index === 4 })}><div class="flex items-center"><span class="relative z-10 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></span> <div class="ml-2 pl-2 h-7 w-16 rounded bg-gray-200 dark:bg-gray-700"></div></div> <div class="mt-2 pl-6 md:mt-0 md:pl-0 space-y-1.5"><div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"${$.attr_style(`width: ${$.stringify([95, 80, 90, 70, 85][index])}%`)}></div> <div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"${$.attr_style(`width: ${$.stringify([60, 45, 55, 75, 50][index])}%`)}></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div><div class="mb-4 h-7 w-20 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="hidden md:flex justify-around"><!--[-->`);

		const each_array_1 = $.ensure_array_like([0, 1, 2]);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let _ = each_array_1[index];

			$$renderer.push(`<div class="relative flex w-1/3 flex-col items-center px-4 text-center">`);

			if (index < 2) {
				$$renderer.push(`<!--[0--><div class="absolute top-0 right-0 h-full w-[1px] bg-gray-200 dark:bg-gray-700"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="mr-auto mb-2 h-7 w-16 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="flex items-start gap-4 w-full"><div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div> <div class="flex-1 space-y-1.5"><div class="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"${$.attr_style(`width: ${$.stringify([70, 55, 65][index])}%`)}></div></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="block md:hidden space-y-4"><!--[-->`);

		const each_array_2 = $.ensure_array_like([0, 1, 2]);

		for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
			let _ = each_array_2[index];

			$$renderer.push(`<div class="flex items-start gap-4"><div class="h-7 w-16 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700"></div> <div class="flex-1 space-y-1.5"><div class="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700"></div> <div class="h-3.5 rounded bg-gray-200 dark:bg-gray-700"${$.attr_style(`width: ${$.stringify([60, 75, 50][index])}%`)}></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}