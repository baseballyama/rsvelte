import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { increment, count } from '../state.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(increment);
		$$renderer.push(`<h2>source: ${$.escape(count)}</h2>`);
	});
}