import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import { createCollapseState } from "./root.svelte.js";

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { multiple = false, children } = $$props;
		const collapseState = createCollapseState({ multiple, item: [] });

		setContext("collapse", collapseState);
		$$renderer.push(`<div class="*:border-kui-light-gray-200 dark:*:border-kui-dark-gray-400 last:border-kui-light-gray-200 dark:last:border-kui-dark-gray-400 w-full *:border-t last:border-b">`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}