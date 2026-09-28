import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Text } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Segments($$anchor) {
	Chart($$anchor, {
		height: 50,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Text(node, {
						segments: [
							{
								value: 'Revenue',
								class: 'text-sm font-semibold text-primary'
							},

							{
								value: ' $1,200',
								class: 'text-xs font-light text-surface-content/75'
							}
						],
						x: 0,
						y: 20
					});

					var node_1 = $.sibling(node, 2);

					Text(node_1, {
						segments: [
							{ value: 'Growth', class: 'text-sm font-semibold text-primary' },
							{ value: ' +12%', class: 'text-xs font-light text-success' }
						],
						x: 0,
						y: 50
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}