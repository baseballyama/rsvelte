import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';

export default function TransformTestHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chartProps = {}, oncontext } = $$props;
		let chartContext = void 0;
		const mergedChartProps = $.derived(() => ({ height: 300, ...chartProps }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, $.spread_props([
				mergedChartProps(),
				{
					get context() {
						return chartContext;
					},

					set context($$value) {
						chartContext = $$value;
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
	});
}