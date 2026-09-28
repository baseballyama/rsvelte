import * as $ from 'svelte/internal/server';
import { cubicInOut } from 'svelte/easing';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Layer } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal_tween_on_mount($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let show = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControl($$renderer, {
				label: 'Show Bars',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data,
				x: 'value',
				xDomain: [0, null],
				xNice: true,
				y: 'date',
				yScale: scaleBand().padding(0.4),
				padding: { left: 32, bottom: 20, right: 8 },
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'left', rule: true });
							$$renderer.push(`<!----> `);

							if (show) {
								$$renderer.push('<!--[0-->');

								Bars($$renderer, {
									motion: { type: 'tween', duration: 500, easing: cubicInOut },
									strokeWidth: 1,
									class: 'fill-primary'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
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