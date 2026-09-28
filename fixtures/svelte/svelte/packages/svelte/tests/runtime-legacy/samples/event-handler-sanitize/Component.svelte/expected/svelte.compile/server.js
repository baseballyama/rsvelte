import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from "svelte";

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		$$renderer.push(`<button>toggle</button>`);
	});
}