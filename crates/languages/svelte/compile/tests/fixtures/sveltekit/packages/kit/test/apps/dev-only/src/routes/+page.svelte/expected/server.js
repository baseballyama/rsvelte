import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = '';

		onMount(() => {
			message = 'hello world!';
		});

		$$renderer.push(`<p>${$.escape(message)}</p> <a href="/optimize-deps">Go to /optimize-deps</a>`);
	});
}