import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = "", children } = $$props;
		const rootState = getContext("modal");

		let footerClass = $.derived(() => {
			if (rootState.sticky) {
				return ``;
			} else {
				return "";
			}
		});

		if (children) {
			$$renderer.push(`<!--[0--><footer aria-labelledby="modal-actions"${$.attr_class(`border-kui-light-gray-200 dark:border-kui-dark-gray-200 bg-kui-light-bg-secondary dark:bg-kui-dark-bg sticky inset-x-0 bottom-0 box-border flex items-center justify-between rounded-b-xl border-t p-4 drop-shadow-xs lg:absolute ${$.stringify(footerClass())} ${$.stringify(klass)}`)}>`);
			children($$renderer);
			$$renderer.push(`<!----></footer>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}