import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { fly } from "svelte/transition";
import { cubicOut } from "svelte/easing";

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = "", children } = $$props;

		// Get the state of the select from the context
		const rootState = getContext("split-button");

		let alightmentClass = $.derived(() => {
			if (rootState.alignment === "left") {
				return "left-0";
			} else {
				return "right-0";
			}
		});

		function mobileSnip($$renderer) {
			if (rootState.getIsActive()) {
				$$renderer.push(`<!--[0--><div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-[1001] w-full rounded-t-[10px] lg:bg-transparent"><div class="hide-scrollbar bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-600 dark:border-kui-dark-gray-500 overflow-y-auto scroll-smooth rounded-t-[10px] border-t px-3">`);
				children($$renderer);
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function desktopSnip($$renderer) {
			if (rootState.getIsActive()) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`absolute ${$.stringify(rootState.getContentPosition())} ${$.stringify(alightmentClass())} z-[1000] ${$.stringify(klass)}`)}><div${$.attr_class(`hide-scrollbar bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-y-auto scroll-smooth rounded-[12px] border p-2 shadow-xs ${$.stringify(klass)}`)}>`);
				children($$renderer);
				$$renderer.push(`<!----></div></div>`);
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