import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(async () => {
			const { is_even } = await import('./_is_even.js');

			console.log(is_even(5));
		});
	});
}