import * as $ from 'svelte/internal/server';
import BarChartBase from './BarChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Bars from '../../Bars/Bars.svelte';

export default function BarChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { context = void 0, $$slots, $$events, ...props } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			BarChartBase($$renderer, $.spread_props([
				{ Chart, Bars },
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