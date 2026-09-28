import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let answer = 0;

		onMount(async () => {
			const res = await fetch(`${page.url.origin}/load/window-fetch/data.json`);

			({ answer } = await res.json());
		});

		$$renderer.push(`<h1>${$.escape(answer)}</h1>`);
	});
}