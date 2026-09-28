import * as $ from 'svelte/internal/server';
import { P } from "$lib";

export default function _page($$renderer) {
	$$renderer.push(`<div class="h-[500px]">`);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Use Back button on your browser`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}