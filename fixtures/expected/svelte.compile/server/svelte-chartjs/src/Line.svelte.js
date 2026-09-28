import * as $ from 'svelte/internal/server';
import { Chart as ChartJS, LineController } from 'chart.js';
import Chart from './Chart.svelte';

export default function Line($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(LineController);

		let { chart = null, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, $.spread_props([
				{ type: 'line' },
				restProps,
				{
					get chart() {
						return chart;
					},

					set chart($$value) {
						chart = $$value;
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
		$.bind_props($$props, { chart });
	});
}