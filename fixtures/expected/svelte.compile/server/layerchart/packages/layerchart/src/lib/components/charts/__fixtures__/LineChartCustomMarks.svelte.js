import * as $ from 'svelte/internal/server';
import LineChart from '../LineChart/LineChart.svelte';

export default function LineChartCustomMarks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * A chart drawing its series by hand: the `marks` snippet replaces the default splines, so
		 * nothing inside registers as a mark.  Exposes the resolved context for assertions.
		 */
		let {
			component = LineChart,
			oncontext,
			$$slots,
			$$events,
			...props
		} = $$props;

		const Chart = $.derived(() => component);
		let context = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function marks($$renderer) {}

				if (Chart()) {
					$$renderer.push('<!--[-->');

					Chart()($$renderer, $.spread_props([
						props,
						{
							get context() {
								return context;
							},

							set context($$value) {
								context = $$value;
								$$settled = false;
							},
							marks,
							$$slots: { marks: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}