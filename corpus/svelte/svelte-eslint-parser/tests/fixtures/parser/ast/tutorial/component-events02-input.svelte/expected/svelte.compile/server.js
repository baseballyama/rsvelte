import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Component_events02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		function sayHello() {
			dispatch('message', { text: 'Hello!' });
		}

		$$renderer.push(`<button>Click to say hello</button>`);
	});
}