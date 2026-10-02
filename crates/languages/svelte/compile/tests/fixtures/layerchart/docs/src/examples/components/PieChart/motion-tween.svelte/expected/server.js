import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { longData } from '$lib/utils/data';

export default function Motion_tween($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);
		let show = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControl($$renderer, {
				label: 'Show Pie',
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

				PieChart($$renderer, {
					data,
					key: 'fruit',
					value: 'value',
					cRange: fruitColors,
					props: { pie: { motion: 'tween' } },
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