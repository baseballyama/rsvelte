import * as $ from 'svelte/internal/server';
import ArcChartBase from './ArcChart.base.svelte';
import Chart from '../../Chart/Chart.svelte';
import Arc from '../../Arc/Arc.svelte';
import ArcLabel from '../../ArcLabel/ArcLabel.svelte';
import Group from '../../Group/Group.svelte';

export default function ArcChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { context = void 0, $$slots, $$events, ...props } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ArcChartBase($$renderer, $.spread_props([
				{ Chart, Arc, ArcLabel, Group },
				props,
				{
					get context() {
						return context;
					},

					set context($$value) {
						context = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { context });
	});
}