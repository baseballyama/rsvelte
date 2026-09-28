import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { browser } from '$app/env';

if (browser) {
	window.mounted = window.mounted || 0;
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mounted = 0;

		onMount(() => {
			mounted = window.mounted += 1;
		});

		$$renderer.push(`<h1>mounted: ${$.escape(browser ? mounted : 0)}</h1> <button>click me</button> <span hidden="">PLACEHOLDER:0</span>`);
	});
}