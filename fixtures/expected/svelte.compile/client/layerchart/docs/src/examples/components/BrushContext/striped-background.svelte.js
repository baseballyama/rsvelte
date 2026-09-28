import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Area, Chart, Layer } from 'layerchart';

const data = await getAppleStock();

export default function Striped_background($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		brush: { classes: { range: 'striped-background' } },
		height: 40,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Area($$anchor, {
						line: { class: 'stroke-2 stroke-primary' },
						class: 'fill-primary/20'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}