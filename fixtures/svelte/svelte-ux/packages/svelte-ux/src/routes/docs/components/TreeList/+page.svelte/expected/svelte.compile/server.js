import * as $ from 'svelte/internal/server';
import { TreeList } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> `);

	Blockquote($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->TODO`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}