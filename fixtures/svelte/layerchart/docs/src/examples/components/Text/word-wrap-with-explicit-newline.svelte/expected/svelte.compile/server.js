import * as $ from 'svelte/internal/server';
import { Chart, Layer, Text } from 'layerchart';

export default function Word_wrap_with_explicit_newline($$renderer, $$props) {
	const data = undefined;

	Chart($$renderer, {
		height: 100,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Text($$renderer, { value: 'March\n2025', verticalAnchor: 'start' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.bind_props($$props, { data });
}