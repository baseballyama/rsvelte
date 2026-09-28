import * as $ from 'svelte/internal/server';
import ScatterChartBase from './ScatterChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Points from '../../Points/Points.svelte';

export default function ScatterChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { context = void 0, $$slots, $$events, ...props } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ScatterChartBase($$renderer, $.spread_props([
				{ Chart, Points },
				props,
				{
					get context() {
						return context;
					},

					set context($$value) {
						context = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { context });
	});
}