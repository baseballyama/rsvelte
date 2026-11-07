import * as $ from 'svelte/internal/server';
import ChevronDownSmall from "$lib/icons/chevron-down-small.svelte";
import { getContext } from "svelte";
import { Spinner, Text } from "$lib/index.js";

export default function Value($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { placeholder = "placeholder" } = $$props;
		const rootState = getContext("select");

		let spinnerSize = $.derived(() => {
			if (rootState.size === "tiny") return 14;
			if (rootState.size === "small") return 16;
			if (rootState.size === "medium") return 16;

			return 24;
		});

		// We are going to rotate the chevron icon when the select is active
		let rotate = $.derived(() => rootState.getIsActive() ? "rotate-180" : "");

		$$renderer.push(`<div class="flex items-center justify-between">`);

		if (!rootState.getLoading()) {
			$$renderer.push(`<!--[0--><span class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm first-letter:capitalize">${$.escape(rootState.getSelected() === "" ? placeholder : rootState.getSelected())}</span> <div class="flex h-4 w-4 items-center justify-center"><div${$.attr_class(`text-kui-light-gray-900 hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:hover:text-kui-dark-gray-1000 h-4 w-4 transform duration-300 ${rotate()}`)}>`);
			ChevronDownSmall($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (rootState.getLoading()) {
			$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);
			Spinner($$renderer, { size: spinnerSize() });
			$$renderer.push(`<!----> `);

			Text($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Loading...`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}