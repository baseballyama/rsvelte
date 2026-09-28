import * as $ from 'svelte/internal/server';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { slide } from 'svelte/transition';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

export default function Draw($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
		let show = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControls($$renderer, {
				label: 'Show Line',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="h-[300px]">`);

			if (show) {
				$$renderer.push('<!--[0-->');

				LineChart($$renderer, {
					data,
					x: 'date',
					y: 'value',
					padding: defaultChartPadding({ right: 10 }),
					props: { spline: { draw: true } },
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