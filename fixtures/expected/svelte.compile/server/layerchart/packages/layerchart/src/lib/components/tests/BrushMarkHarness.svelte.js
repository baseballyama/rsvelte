import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Brush from '../Brush/Brush.svelte';

export default function BrushMarkHarness($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** A `Brush` inside a layer, as an example composes it — the `Brush` component, not `BrushContext`. */
		let {
			chartProps = {},
			brushProps = {},
			layer = 'svg',
			state = void 0
		} = $$props;

		const data = [
			{ date: new Date('2024-01-01'), value: 10 },
			{ date: new Date('2024-01-02'), value: 30 },
			{ date: new Date('2024-01-03'), value: 20 }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, $.spread_props([
				{ data, x: 'date', y: 'value', width: 400, height: 200 },
				chartProps,
				{
					children: ($$renderer) => {
						Layer($$renderer, {
							type: layer,
							children: ($$renderer) => {
								Brush($$renderer, $.spread_props([
									brushProps,
									{
										get state() {
											return state;
										},

										set state($$value) {
											state = $$value;
											$$settled = false;
										}
									}
								]));
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
		$.bind_props($$props, { state });
	});
}