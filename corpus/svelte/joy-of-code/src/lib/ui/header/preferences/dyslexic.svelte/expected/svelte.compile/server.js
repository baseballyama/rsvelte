import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { createSwitch, melt } from '@melt-ui/svelte';
import { preferences } from './preferences.svelte';

export default function Dyslexic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let enabled = false;

		if (browser) {
			localStorage.font ? enabled = true : enabled = false;
		}

		function handleChange() {
			const html = document.documentElement;

			enabled = !enabled;

			if (enabled) {
				localStorage.font = 'dyslexic';
				html.dataset.font = 'dyslexic';
			}

			if (!enabled) {
				localStorage.removeItem('font');
				delete html.dataset.font;
			}
		}

		const { elements: { root, input }, states: { checked } } = createSwitch();

		$$renderer.push(`<form><div class="container svelte-1whwdji"><label for="dyslexic-font">Use font for dyslexia</label> <button class="toggle svelte-1whwdji" aria-labelledby="dyslexic-font"><span class="thumb svelte-1whwdji"></span></button> <input id="dyslexic-font"/></div></form>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}