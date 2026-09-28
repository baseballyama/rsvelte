import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Axis, Bar, Chart, Layer } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { cubicInOut } from 'svelte/easing';
import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

export default function Vertical_stagger_tween_on_mount($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: 20, max: 100 });
		let show = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControls($$renderer, {
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
				x: 'date',
				xScale: scaleBand().padding(0.4),
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: { left: 24, bottom: 20, top: 8 },
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							if (show) {
								$$renderer.push(`<!--[0--><!--[-->`);

								const each_array = $.ensure_array_like(data);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let d = each_array[i];

									Bar($$renderer, {
										data: d,
										motion: {
											type: 'tween',
											duration: 500,
											easing: cubicInOut,
											delay: i * 30
										},
										strokeWidth: 1,
										class: 'fill-primary'
									});
								}

								$$renderer.push(`<!--]-->`);
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