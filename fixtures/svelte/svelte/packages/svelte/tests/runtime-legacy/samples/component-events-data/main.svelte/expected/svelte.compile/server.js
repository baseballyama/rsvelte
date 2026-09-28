import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import Widget from './Widget.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		$$renderer.push(`<div>`);
		Widget($$renderer, {});
		$$renderer.push(`<!----></div>`);
	});
}