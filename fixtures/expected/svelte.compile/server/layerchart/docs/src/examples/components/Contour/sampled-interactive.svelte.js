import * as $ from 'svelte/internal/server';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { Axis, Chart, Contour, Layer } from 'layerchart';
import { RangeField } from 'svelte-ux';

export default function Sampled_interactive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let thresholds = 20;
		let blur = 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-2 gap-4 mb-4">`);

			RangeField($$renderer, {
				label: 'Thresholds',
				min: 2,
				max: 40,
				step: 1,
				get value() {
					return thresholds;
				},

				set value($$value) {
					thresholds = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Blur',
				min: 0,
				max: 10,
				step: 0.5,
				get value() {
					return blur;
				},

				set value($$value) {
					blur = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				cScale: scaleSequential(interpolateRdBu),
				xDomain: [0, 6 * Math.PI],
				yDomain: [0, 4 * Math.PI],
				padding: { left: 30, bottom: 24, top: 8, right: 8 },
				height: 400,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);
							Contour($$renderer, { value: (x, y) => Math.sin(x) * Math.cos(y), thresholds, blur });
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