import * as $ from 'svelte/internal/server';
import MagnifyingGlass from "$lib/icons/magnifying-glass.svelte";

export default function SearchInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// oxlint-disable-next-line svelte/no-unused-props -- false positive: quoted renamed prop is used in the template
		let {
			"aria-labelledby": araiLabelledBy = undefined,
			value = "",
			size = "medium",
			error = undefined,
			disabled = false,
			placeholder = undefined
		} = $$props;

		// The focus and blur state of the input
		let hasRing = false;

		const sizeObj = {
			small: "h-8 text-sm",
			medium: "h-[40px] text-sm",
			large: "h-[48px] text-base"
		};

		let sizeClass = $.derived(() => {
			return sizeObj[size];
		});

		// Show the ring when the input is focused
		let ringClass = $.derived(() => {
			if (disabled) {
				return `cursor-not-allowed border-kui-light-gray-200 dark:border-kui-dark-gray-400 
			bg-kui-light-gray-100 dark:bg-kui-dark-gray-100`;
			}

			if (error) {
				return `border-kui-light-red-700 dark:border-kui-dark-red-700 hover:border-kui-light-red-700 
			dark:hover:border-kui-dark-red-700 ring-4 ring-kui-light-red-400 dark:ring-kui-dark-red-400 
			hover:ring-kui-light-red-500 dark:hover:ring-kui-dark-red-500 `;
			}

			if (hasRing) {
				return `border-kui-light-gray-700 dark:border-kui-dark-gray-700 ring-4 ring-kui-light-gray-400 
            dark:ring-kui-dark-gray-400 hover:border-kui-light-gray-700 dark:hover:border-kui-dark-gray-700`;
			}

			return `border-kui-light-gray-200 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-700 dark:hover:border-kui-dark-gray-700`;
		});

		$$renderer.push(`<div${$.attr_class(`flex items-center ${$.stringify(sizeClass())} overflow-hidden border transition-all ${$.stringify(ringClass())} rounded-md`)}><span class="text-kui-light-gray-700 dark:text-kui-dark-gray-700 flex h-full items-center px-3"><div class="h-4 w-4">`);
		MagnifyingGlass($$renderer, {});
		$$renderer.push(`<!----></div></span> <div class="h-full w-full pr-3"><input type="search"${$.attr('aria-labelledby', araiLabelledBy)}${$.attr('value', value)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)} class="placeholder:text-kui-light-gray-600 dark:placeholder:text-kui-dark-gray-600 h-full w-full bg-transparent capitalize outline-hidden placeholder:text-sm"/></div></div>`);
		$.bind_props($$props, { value });
	});
}