import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';

export default function No_types01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();
	});
}