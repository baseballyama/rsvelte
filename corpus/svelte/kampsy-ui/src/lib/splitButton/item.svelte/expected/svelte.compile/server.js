import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			onClick = undefined,
			type = "primary",
			title = undefined,
			description = undefined
		} = $$props;

		const rootState = getContext("split-button");

		const typeTitleObj = {
			primary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
			secondary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
			tertiary: "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
			error: "text-kui-light-red-800 dark:text-kui-dark-red-800",
			warning: "text-kui-light-amber-800 dark:text-kui-dark-amber-800"
		};

		let typeTitleClass = $.derived(() => {
			return typeTitleObj[type];
		});

		const typeDescriptionObj = {
			primary: "text-kui-light-gray-900 dark:text-kui-dark-gray-900",
			secondary: "text-kui-light-gray-900 dark:text-kui-dark-gray-900",
			tertiary: "text-kui-light-gray-900 dark:text-kui-dark-gray-900",
			error: "text-kui-light-red-700 dark:text-kui-dark-red-700",
			warning: "text-kui-light-amber-700 dark:text-kui-dark-amber-700"
		};

		let typeDescriptionClass = $.derived(() => {
			return typeDescriptionObj[type];
		});

		$$renderer.push(`<button class="hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 relative w-full cursor-pointer rounded-md bg-transparent px-2 py-3.5 text-left text-sm transition-colors lg:py-2.5"><div>`);

		if (title) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`text-sm ${$.stringify(typeTitleClass())} leading-5 font-medium`)}>${$.escape(title)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (description) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`text-sm ${$.stringify(typeDescriptionClass())} leading-5 font-normal`)}>${$.escape(description)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></button>`);
	});
}