import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

export default function MultiLineStrings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		getContext('toc')?.set('Multi-line strings', 'multiline');
		$$renderer.push(`<div class="flex col"><h3 id="multiline">Multi-line strings</h3> <p>Expandable view for multi-line strings</p> `);

		if (Inspect.Values) {
			$$renderer.push('<!--[-->');

			Inspect.Values($$renderer, {
				normal: 'normal boring string',
				multiLine: 'cool\n\tmulti-line\n\t\t\trender 😎'
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}