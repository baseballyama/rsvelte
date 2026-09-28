import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Bar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		$$renderer.push(`<button>select bar</button>`);
	});
}