import * as $ from 'svelte/internal/server';
import ChevronLeft from "$lib/icons/chevron-left.svelte";
import ChevronRight from "$lib/icons/chevron-right.svelte";

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { previous = undefined, next = undefined } = $$props;

		let paginationStyle = $.derived(() => {
			if (previous && next) {
				return "justify-between";
			} else if (previous) {
				return "justify-start";
			} else if (next) {
				return "justify-end";
			} else {
				return "";
			}
		});

		function prevSnip($$renderer) {
			if (previous) {
				$$renderer.push(`<!--[0--><a${$.attr('aria-label', `go to previous page: ${$.stringify(previous.title)}`)}${$.attr('href', previous.href)} class="group"><div class="flex items-center gap-x-2"><div class="h-[20px] w-[20px]"></div> <div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 mb-[2px] text-[13px] leading-[13px] font-normal capitalize transition-colors">previous</div></div> <div class="flex items-center gap-x-2"><div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 flex h-[20px] w-[20px] items-center justify-center transition-colors"><div class="h-4 w-4">`);
				ChevronLeft($$renderer, {});
				$$renderer.push(`<!----></div></div> <span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[16px] leading-6 font-medium capitalize">${$.escape(previous.title)}</span></div></a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function nextSnip($$renderer) {
			if (next) {
				$$renderer.push(`<!--[0--><a${$.attr('aria-label', `go to next page: ${$.stringify(next.title)}`)}${$.attr('href', next.href)} class="group"><div class="flex items-center gap-x-2"><div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 mb-[2px] text-[13px] leading-[13px] font-normal capitalize transition-colors">next</div> <div class="h-[20px] w-[20px]"></div></div> <div class="flex items-center gap-x-2"><span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[16px] leading-6 font-medium capitalize">${$.escape(next.title)}</span> <div class="text-kui-light-gray-900 group-hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:group-hover:text-kui-dark-gray-1000 flex h-[20px] w-[20px] items-center justify-center transition-colors"><div class="h-4 w-4">`);
				ChevronRight($$renderer, {});
				$$renderer.push(`<!----></div></div></div></a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<section class="w-full"><nav${$.attr_class(`flex w-full items-center ${$.stringify(paginationStyle())} gap-x-4`)} aria-label="pagination">`);
		prevSnip($$renderer);
		$$renderer.push(`<!----> `);
		nextSnip($$renderer);
		$$renderer.push(`<!----></nav></section>`);
	});
}