import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
		const exists = true;

		$$renderer.push(`<button></button>`);
		$.bind_props($$props, { exists });
	});
}