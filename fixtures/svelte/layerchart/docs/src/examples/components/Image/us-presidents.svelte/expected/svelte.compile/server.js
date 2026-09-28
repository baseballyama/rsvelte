import * as $ from 'svelte/internal/server';
import { Axis, Chart, Image, Layer } from 'layerchart';
import { getUsPresidents } from '$lib/data.remote';

const data = await getUsPresidents();

export default function Us_presidents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart($$renderer, {
			data,
			x: 'inaugurationDate',
			y: 'veryFavorable',
			yNice: true,
			padding: { top: 20, bottom: 30, left: 36, right: 20 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', label: 'Inauguration', rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', label: 'Very favorable %', rule: true });
						$$renderer.push(`<!----> `);

						Image($$renderer, {
							href: 'portraitUrl',
							x: 'inaugurationDate',
							y: 'veryFavorable',
							r: 18,
							preserveAspectRatio: 'xMidYMid slice'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}