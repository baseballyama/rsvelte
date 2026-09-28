import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			console.log(42);
		});

		$$renderer.push(`<div></div>`);
	});
}