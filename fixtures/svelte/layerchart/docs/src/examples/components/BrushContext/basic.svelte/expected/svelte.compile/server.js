import * as $ from 'svelte/internal/server';
import { Area, Chart, Layer } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			brush: true,
			height: 40,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}