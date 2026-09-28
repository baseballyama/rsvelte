import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function Motion_tween($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = void 0;
		const data = createDateSeries({ count: 10, min: 20, max: 100, value: 'integer' });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControl($$renderer, {
				label: 'Show Chart',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div${$.attr_style('', { height: '300px' })}>`);

			if (show) {
				$$renderer.push('<!--[0-->');

				BarChart($$renderer, {
					data,
					x: 'date',
					y: 'value',
					props: { bars: { motion: { type: 'tween', duration: 500 } } },
					height: 300
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}