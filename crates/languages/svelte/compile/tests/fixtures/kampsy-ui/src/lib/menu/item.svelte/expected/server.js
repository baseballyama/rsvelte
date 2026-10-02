import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			onClick = undefined,
			type = "tertiary",
			prefix = undefined,
			suffix = undefined,
			children
		} = $$props;

		const rootState = getContext("menu");

		const typeObj = {
			primary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`,

			secondary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`,

			tertiary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`,

			error: `text-kui-light-red-800 dark:text-kui-dark-red-800 
		hover:bg-kui-light-red-100 dark:hover:bg-kui-dark-red-100`,

			warning: `text-kui-light-amber-800 dark:text-kui-dark-amber-800 
		hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`
		};

		let typeClass = $.derived(() => {
			return typeObj[type];
		});

		let isSuffixClass = $.derived(() => {
			if (suffix) {
				return "justify-between";
			}

			return "";
		});

		function prefixSnip($$renderer) {
			if (prefix) {
				$$renderer.push('<!--[0-->');

				const Prefix = prefix;

				$$renderer.push(`<div class="flex h-4 w-4 items-center justify-center">`);

				if (Prefix) {
					$$renderer.push('<!--[-->');
					Prefix($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function suffixSnip($$renderer) {
			if (suffix) {
				$$renderer.push('<!--[0-->');

				const Suffix = suffix;

				$$renderer.push(`<div class="flex h-4 w-4 items-center justify-center">`);

				if (Suffix) {
					$$renderer.push('<!--[-->');
					Suffix($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<button${$.attr_class(`relative flex w-full cursor-pointer items-center gap-2 bg-transparent text-sm transition-colors ${$.stringify(isSuffixClass())} rounded-md px-2 py-3.5 lg:py-2.5 ${$.stringify(typeClass())}`)}>`);
		prefixSnip($$renderer);
		$$renderer.push(`<!----> <span class="first-letter:capitalize">`);
		children($$renderer);
		$$renderer.push(`<!----></span> `);
		suffixSnip($$renderer);
		$$renderer.push(`<!----></button>`);
	});
}