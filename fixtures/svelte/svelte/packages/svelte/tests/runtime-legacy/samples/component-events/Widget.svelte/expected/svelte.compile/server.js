import * as $ from 'svelte/internal/server';
import { onDestroy, createEventDispatcher } from 'svelte';

export default function Widget($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		onDestroy(() => {
			dispatch('destroy');
		});

		$$renderer.push(`<p>i am a widget</p>`);
	});
}