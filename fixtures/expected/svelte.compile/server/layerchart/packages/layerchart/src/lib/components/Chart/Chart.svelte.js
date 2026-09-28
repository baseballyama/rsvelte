import * as $ from 'svelte/internal/server';
import ChartBase from './Chart.base.svelte';
import ChartChildren from '../ChartChildren/ChartChildren.svelte';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = void 0, context = void 0, $$slots, $$events, ...props } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ChartBase($$renderer, $.spread_props([
				{ ChartChildren },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

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
		$.bind_props($$props, { ref, context });
	});
}