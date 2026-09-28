import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';

export default function Empty($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onDestroy(() => {
			console.log('destroy');
		});
	});
}