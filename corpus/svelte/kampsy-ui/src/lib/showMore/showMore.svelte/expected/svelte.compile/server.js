import * as $ from 'svelte/internal/server';
import { ChevronDownSmall } from "$lib/icons/index.js";

export default function ShowMore($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isActive = false } = $$props;

		const onclick = () => {
			isActive = !isActive;
		};

		let rotate = $.derived(() => {
			if (isActive) {
				return "rotate-180";
			}

			return "";
		});

		let ariaLabel = $.derived(() => {
			if (isActive) {
				return "Show less content";
			}

			return "Show more content";
		});

		let buttonText = $.derived(() => {
			if (isActive) {
				return "show less";
			}

			return "Show more";
		});

		function suffixSnip($$renderer) {
			$$renderer.push(`<div class="h-4 w-4"><div${$.attr_class(`h-4 w-4 rounded-full ${$.stringify(rotate())} flex transform-gpu items-center justify-center duration-200`)}>`);
			ChevronDownSmall($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		}

		$$renderer.push(`<div class="w-full"><div class="box-border flex items-center"><div class="border-kui-light-gray-400 dark:border-kui-dark-gray-400 grow border-t"></div> <div class="grow-0"><button${$.attr('aria-label', ariaLabel())} type="button" class="border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-500 dark:hover:border-kui-dark-gray-500 hover:bg-kui-light-gray-200 dark:hover:bg-kui-dark-gray-200 rounded-full border p-1.5 transition duration-300"><div class="flex w-full items-center justify-center gap-1 px-1.5"><div class="text-sm font-medium capitalize">${$.escape(buttonText())}</div> `);
		suffixSnip($$renderer);
		$$renderer.push(`<!----></div></button></div> <div class="border-kui-light-gray-400 dark:border-kui-dark-gray-400 grow border-t"></div></div></div>`);
		$.bind_props($$props, { isActive });
	});
}