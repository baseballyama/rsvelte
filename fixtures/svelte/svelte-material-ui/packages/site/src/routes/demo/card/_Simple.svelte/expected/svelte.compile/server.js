import * as $ from 'svelte/internal/server';
import Card, { Content } from '@smui/card';

export default function _Simple($$renderer) {
	$$renderer.push(`<div class="card-display"><div class="card-container">`);

	Card($$renderer, {
		padded: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->A simple padded card.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container">`);

	Card($$renderer, {
		children: ($$renderer) => {
			Content($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->You can also use <code>Content</code>.`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="card-container">`);

	Card($$renderer, {
		variant: 'outlined',
		padded: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->An outlined, padded card.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}