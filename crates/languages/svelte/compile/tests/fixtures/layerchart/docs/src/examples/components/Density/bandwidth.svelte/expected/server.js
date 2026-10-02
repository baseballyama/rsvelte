import * as $ from 'svelte/internal/server';
import { Axis, Chart, Density, Layer, Points } from 'layerchart';
import { RangeField } from 'svelte-ux';
import { getFaithful } from '$lib/data.remote.js';

const data = await getFaithful();

export default function Bandwidth($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let bandwidth = 20;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mb-4">`);

			RangeField($$renderer, {
				label: 'Bandwidth',
				min: 2,
				max: 50,
				step: 1,
				get value() {
					return bandwidth;
				},

				set value($$value) {
					bandwidth = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				data,
				x: 'eruptions',
				y: 'waiting',
				xDomain: [1, 6],
				yDomain: [40, 100],
				xNice: true,
				yNice: true,
				padding: { left: 30, bottom: 24, top: 8, right: 8 },
				height: 400,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);
							Density($$renderer, { bandwidth, thresholds: 20, fillOpacity: 0.8 });
							$$renderer.push(`<!----> `);
							Points($$renderer, { r: 1.5, class: 'fill-surface-content/50' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}