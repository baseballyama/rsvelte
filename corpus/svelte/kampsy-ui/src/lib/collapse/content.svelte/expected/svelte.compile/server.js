import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { slide } from "svelte/transition";

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...rest } = $$props;
		let { size, value } = getContext("collapseItem");
		let collapseItem = getContext("collapse");
		let isActive = false;
		const textObj = { small: "text-sm", large: "text-base" };

		let textClass = $.derived(() => {
			return textObj[size];
		});

		let content = void 0;

		if (isActive) {
			$$renderer.push(`<!--[0--><div${$.attributes({ class: 'pb-4', ...rest })}>`);

			if (children) {
				$$renderer.push(`<!--[0--><p${$.attr_class(` ${$.stringify(textClass())} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 leading-6 font-normal`)}>`);
				children($$renderer);
				$$renderer.push(`<!----></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}