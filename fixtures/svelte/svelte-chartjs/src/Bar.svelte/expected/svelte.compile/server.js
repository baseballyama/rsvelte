import * as $ from 'svelte/internal/server';
import { Chart as ChartJS, BarController } from 'chart.js';
import Chart from './Chart.svelte';

export default function Bar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(BarController);

		let { chart = null, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, $.spread_props([
				{ type: 'bar' },
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