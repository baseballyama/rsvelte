import * as $ from 'svelte/internal/server';
import { clickOutside } from "$lib/utils/event.js";
import { getContext } from "svelte";
import { cubicOut } from "svelte/easing";
import { fly, scale } from "svelte/transition";

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = "", children } = $$props;

		// Get the state of the select from the context
		const rootState = getContext("modal");

		function mobileSnip($$renderer) {
			if (rootState.getIsActive()) {
				$$renderer.push(`<!--[0--><div role="dialog" class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-1001 w-full rounded-t-[10px] lg:bg-transparent"><div class="bg-kui-light-bg dark:bg-kui-dark-bg-secondary border-kui-light-gray-600 dark:border-kui-dark-gray-500 max-h-[80vh] w-full rounded-[10px] rounded-t-[10px] border-t">`);
				children($$renderer);
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function desktopSnip($$renderer) {
			if (rootState.getIsActive()) {
				$$renderer.push(`<!--[0--><div role="dialog"${$.attr_class(`bg-kui-light-bg dark:bg-kui-dark-bg-secondary border-kui-light-gray-600 dark:border-kui-dark-gray-200 relative max-h-156.5 w-135 rounded-xl border ${$.stringify(klass)}`)}>`);
				children($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (rootState.getIsMobile()) {
			$$renderer.push('<!--[0-->');
			mobileSnip($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
			desktopSnip($$renderer);
		}

		$$renderer.push(`<!--]-->`);
	});
}