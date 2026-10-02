import * as $ from 'svelte/internal/server';

export default function _8_passing_snippets_to_components_input($$renderer) {
	Table($$renderer, {
		data: fruits,
		children: ($$renderer) => {
			$$renderer.push(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`);
		},
		$$slots: { default: true }
	});
}