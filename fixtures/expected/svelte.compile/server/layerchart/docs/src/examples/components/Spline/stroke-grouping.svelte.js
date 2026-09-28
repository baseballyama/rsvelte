import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateSpectral } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Spline } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Stroke_grouping($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const yearColor = scaleOrdinal(quantize(interpolateSpectral, 6));

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yNice: true,
			padding: 25,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Spline($$renderer, {
							stroke: (d) => yearColor(d.date.getFullYear()),
							class: 'stroke-2'
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