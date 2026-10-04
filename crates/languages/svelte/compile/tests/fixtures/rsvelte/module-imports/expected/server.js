import * as $ from 'svelte/internal/server';

import { onMount } from 'svelte';

import { browser } from './environment.js';

export const label = browser ? 'browser' : 'server';

export default function Module_imports($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		onMount(() => count++);
		$$renderer.push(`<p>${$.escape(label)} ${$.escape(count)}</p>`);
	});
}
