import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { disableScrollHandling } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onMount(() => {
			disableScrollHandling();
			document.getElementById('abcde')?.scrollIntoView();
		});

		$$renderer.push(`<div style="height: 180vh; background-color: hotpink;">They (don't) see me...</div> <div style="height: 180vh; background-color: peru;"><p id="go-to-element">The browser scrolls to me</p></div> <p id="abcde" style="height: 180vh; background-color: hotpink;">I take precedence</p> <div></div>`);
	});
}