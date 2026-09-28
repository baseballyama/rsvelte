import * as $ from 'svelte/internal/server';
import { curveStepAfter } from 'd3-shape';
import { AreaChart, Area, Spline, Threshold } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function With_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedCurve = curveStepAfter;

		const data = createDateSeries({
			count: 30,
			min: 50,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CurveMenuField($$renderer, {
				class: 'mb-8',
				get value() {
					return selectedCurve;
				},

				set value($$value) {
					selectedCurve = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function marks($$renderer) {
					{
						function above($$renderer, { curve }) {
							Area($$renderer, { y0: 'value', y1: 'baseline', curve, class: 'fill-success/30' });
						}

						function below($$renderer, { curve }) {
							Area($$renderer, { y0: 'value', y1: 'baseline', curve, class: 'fill-danger/30' });
						}

						function children($$renderer, { curve }) {
							Spline($$renderer, { y: 'baseline', curve, class: '[stroke-dasharray:4]' });
							$$renderer.push(`<!----> `);
							Spline($$renderer, { y: 'value', curve, class: 'stroke-[1.5]' });
							$$renderer.push(`<!---->`);
						}

						Threshold($$renderer, {
							curve: selectedCurve,
							above,
							below,
							children,
							$$slots: { above: true, below: true, default: true }
						});
					}
				}

				AreaChart($$renderer, {
					data,
					x: 'date',
					y: ['value', 'baseline'],
					padding: { left: 16, bottom: 24 },
					labels: true,
					tooltipContext: false,
					height: 300,
					marks,
					$$slots: { marks: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}