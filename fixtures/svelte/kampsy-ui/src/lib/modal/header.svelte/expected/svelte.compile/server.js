import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const rootState = getContext("modal");

		let headerClass = $.derived(() => {
			if (rootState.sticky) {
				return `absolute inset-x-0 top-0  w-full px-[24px] py-[20px]  bg-kui-light-bg-secondary dark:bg-kui-dark-bg
			rounded-t-[12px] border-b border-kui-light-gray-200 dark:border-kui-dark-gray-200 drop-shadow-xs`;
			} else {
				return "mb-6";
			}
		});

		if (children) {
			$$renderer.push(`<!--[0--><header aria-labelledby="modal-title"${$.attr_class($.clsx(headerClass()))}>`);
			children($$renderer);
			$$renderer.push(`<!----></header>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}