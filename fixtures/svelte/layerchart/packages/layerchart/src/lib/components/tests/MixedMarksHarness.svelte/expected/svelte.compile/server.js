import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';
import Spline from '../Spline/Spline.svelte';

export default function MixedMarksHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chartProps = {}, splineProps = {}, oncontext } = $$props;
		let context = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, $.spread_props([
				chartProps,
				{
					get context() {
						return context;
					},

					set context($$value) {
						context = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Layer($$renderer, {
							children: ($$renderer) => {
								Bars($$renderer, {});
								$$renderer.push(`<!----> `);
								Spline($$renderer, $.spread_props([splineProps]));
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
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