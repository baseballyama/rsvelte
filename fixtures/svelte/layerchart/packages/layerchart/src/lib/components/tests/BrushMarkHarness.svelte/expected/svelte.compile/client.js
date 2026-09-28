import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Brush from '../Brush/Brush.svelte';

export default function BrushMarkHarness($$anchor, $$props) {
	$.push($$props, true);

	/** A `Brush` inside a layer, as an example composes it — the `Brush` component, not `BrushContext`. */
	let chartProps = $.prop($$props, 'chartProps', 19, () => ({})),
		brushProps = $.prop($$props, 'brushProps', 19, () => ({})),
		layer = $.prop($$props, 'layer', 3, 'svg'),
		state = $.prop($$props, 'state', 15);

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-01-02'), value: 30 },
		{ date: new Date('2024-01-03'), value: 20 }
	];

	Chart($$anchor, $.spread_props(
		{
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			width: 400,
			height: 200
		},
		chartProps,
		{
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					get type() {
						return layer();
					},

					children: ($$anchor, $$slotProps) => {
						Brush($$anchor, $.spread_props(brushProps, {
							get state() {
								return state();
							},

							set state($$value) {
								state($$value);
							}
						}));
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}