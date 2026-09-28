import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import container from './container.js';

export default function Top($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let element;

		onDestroy(() => {
			container.div = element;
		});

		$$renderer.push(`<div></div>`);
	});
}