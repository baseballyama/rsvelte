import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import Line from '../../_components/Line.svelte';
import Area from '../../_components/Area.svelte';
import Brush from '../../_components/Brush.html.svelte';
import data from '../../_data/points.csv';

export default function Brush_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
		let brushExtents = [null, null];

		const xKey = 'myX';
		const yKey = 'myY';
		let brushedData = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="brushed-chart-container svelte-cst434">`);

			LayerCake($$renderer, {
				padding: { top: 20, bottom: 20 },
				x: xKey,
				y: yKey,
				yDomain: [0, null],
				data: brushedData,
				children: ($$renderer) => {
					Svg($$renderer, {
						children: ($$renderer) => {
							Line($$renderer, { stroke: '#00e047' });
							$$renderer.push(`<!----> `);
							Area($$renderer, { fill: '#00e04710' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="brush-container svelte-cst434">`);

			LayerCake($$renderer, {
				padding: { top: 5 },
				x: xKey,
				y: yKey,
				yDomain: [0, null],
				data,
				children: ($$renderer) => {
					Svg($$renderer, {
						children: ($$renderer) => {
							Line($$renderer, { stroke: '#00e047' });
							$$renderer.push(`<!----> `);
							Area($$renderer, { fill: '#00e04710' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Html($$renderer, {
						children: ($$renderer) => {
							Brush($$renderer, {
								get min() {
									return brushExtents[0];
								},

								set min($$value) {
									brushExtents[0] = $$value;
									$$settled = false;
								},

								get max() {
									return brushExtents[1];
								},

								set max($$value) {
									brushExtents[1] = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}