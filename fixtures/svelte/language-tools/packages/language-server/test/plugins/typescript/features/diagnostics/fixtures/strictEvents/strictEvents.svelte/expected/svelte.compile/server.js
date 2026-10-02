import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function StrictEvents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		dispatch('foo', 'bar');
		$$renderer.push(`<button>click</button>`);
	});
}