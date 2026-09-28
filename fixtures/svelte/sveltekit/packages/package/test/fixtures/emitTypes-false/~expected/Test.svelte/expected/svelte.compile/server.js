import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @type {string}
		 */
		const astring = 'potato';

		const dispatch = createEventDispatcher();

		dispatch('event', true);
		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', { astring }, null);
		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { astring });
	});
}