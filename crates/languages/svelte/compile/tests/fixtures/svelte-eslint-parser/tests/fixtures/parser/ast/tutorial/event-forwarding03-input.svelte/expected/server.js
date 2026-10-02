import * as $ from 'svelte/internal/server';
import Inner from './Inner.svelte';
import { createEventDispatcher } from 'svelte';

export default function Event_forwarding03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		function forward(event) {
			dispatch('message', event.detail);
		}

		Inner($$renderer, {});
	});
}