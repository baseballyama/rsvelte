import * as $ from 'svelte/internal/server';
import ChartCore from '../Chart/ChartCore.svelte';

export default function ChartCoreTestHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chartProps = {}, oncontext } = $$props;
		let chartContext = void 0;
		const mergedChartProps = $.derived(() => ({ height: 200, ...chartProps }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ChartCore($$renderer, $.spread_props([
				mergedChartProps(),
				{
					get context() {
						return chartContext;
					},

					set context($$value) {
						chartContext = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div data-testid="children-content">ChartCore children</div>`);
					},
					$$slots: { default: true }
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