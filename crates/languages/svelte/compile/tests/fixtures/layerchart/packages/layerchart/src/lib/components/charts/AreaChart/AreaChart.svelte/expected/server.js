import * as $ from 'svelte/internal/server';
import AreaChartBase from './AreaChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Area from '../../Area/Area.svelte';

export default function AreaChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { context = void 0, $$slots, $$events, ...props } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AreaChartBase($$renderer, $.spread_props([
				{ Chart, Area },
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