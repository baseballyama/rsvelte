import * as $ from 'svelte/internal/server';

import { toDisplayString } from 'vue';

export default function Conditional_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		$$renderer.push(`<button class="toggle">${$.escape(toDisplayString(open ? 'Hide' : 'Show'))}</button>`);
		if (open) {
			$$renderer.push(`<!--[0--><p class="details">Details are visible.</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="hint">Nothing to see.</p>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
