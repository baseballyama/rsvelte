import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';

export default function TooltipTestHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chartProps = {}, oncontext } = $$props;
		let chartContext = void 0;
		const mergedChartProps = $.derived(() => ({ width: 400, height: 200, ...chartProps }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="pointer-events: none">`);

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