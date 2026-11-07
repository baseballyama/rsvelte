import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Text } from 'layerchart';

export default function Word_wrap_with_explicit_newline($$anchor, $$props) {
	$.push($$props, true);

	const data = undefined;
	var $$exports = { data };

	Chart($$anchor, {
		height: 100,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, { value: 'March\n2025', verticalAnchor: 'start' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}