import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

export default function Urls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		getContext('toc')?.set('URLs', 'urls');
		$$renderer.push(`<div class="flex col"><h3 id="urls">URLs</h3> `);

		if (Inspect.Values.Expand0) {
			$$renderer.push('<!--[-->');

			Inspect.Values.Expand0($$renderer, $.spread_props([
				{
					url: new URL('https://subdomain.example.org/about'),
					fullyFeaturedUrl: new URL('https://anon:hunter2@example.org:8080/pathname/index.html?q=query&p=123&buh#result'),
					search: new URLSearchParams([
						['a', '1'],
						['a', '2'],
						['b', '3'],
						['b', '4'],
						['c', '5'],
						['query', 'elephants']
					])
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}