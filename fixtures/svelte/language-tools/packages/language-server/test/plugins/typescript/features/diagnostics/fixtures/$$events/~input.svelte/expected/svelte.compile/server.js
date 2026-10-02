import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		// valid
		dispatch('foo', 'bar');

		// invalid
		dispatch('foo', true);

		dispatch('click', '');
		$$renderer.push(`<button>click</button>`);
	});
}