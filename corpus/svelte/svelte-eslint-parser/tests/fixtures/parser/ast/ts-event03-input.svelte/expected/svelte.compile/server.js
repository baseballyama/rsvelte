import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Ts_event03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const emit = createEventDispatcher();

		emit('foo', 1);
		$$renderer.push(`<button></button> <input/>`);
	});
}