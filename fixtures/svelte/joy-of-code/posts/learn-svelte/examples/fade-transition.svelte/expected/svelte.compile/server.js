import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Fade_transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let play = false;

		setInterval(() => play = !play, 2000);
		$$renderer.push(`<div class="container">`);

		if (play) {
			$$renderer.push(`<!--[0--><div class="message svelte-sb6kir"><span>Hello</span> <span>World</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}