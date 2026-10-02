import * as $ from 'svelte/internal/server';
import * as d3shapes from 'd3-shape';
import { MenuField } from 'svelte-ux';
import { entries } from '@layerstack/utils';

export default function CurveMenuField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			showOpenClosed = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (value === undefined) {
			value = d3shapes['curveLinear'];
		}

		const options = entries(d3shapes).filter(([key]) => {
			return key.startsWith('curve') && (showOpenClosed
				? true
				: !key.endsWith('Open') && !key.endsWith('Closed')) && !key.includes('Bundle');
			// Not compatibile with area
		}).map(([key, value]) => {
			return { label: key.replace('curve', ''), value };
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="screenshot-hidden">`);

			MenuField($$renderer, $.spread_props([
				{
					label: 'Curve',
					options,
					stepper: true,
					classes: { menuIcon: 'hidden' }
				},
				restProps,
				{
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
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
		$.bind_props($$props, { value });
	});
}