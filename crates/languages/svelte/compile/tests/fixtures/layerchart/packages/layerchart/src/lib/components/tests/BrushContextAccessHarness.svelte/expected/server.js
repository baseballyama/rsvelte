import * as $ from 'svelte/internal/server';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';

export default function BrushContextAccessHarness($$renderer, $$props) {
	let { chartProps = {} } = $$props;

	{
		function children($$renderer, { context }) {
			Layer($$renderer, {
				children: ($$renderer) => {
					if (context.brush.active) {
						$$renderer.push(`<!--[0--><rect${$.attr('x', context.brush.range.x)}${$.attr('width', context.brush.handleSize)}${$.attr('height', context.brush.range.height)}></rect>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		Chart($$renderer, $.spread_props([
			chartProps,
			{
				brush: true,
				height: 40,
				children,
				$$slots: { default: true }
			}
		]));
	}
}