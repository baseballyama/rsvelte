import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function Widget($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		$$renderer.push(`<button>select foo</button> <button>select bar</button> <button>select baz</button>`);
	});
}