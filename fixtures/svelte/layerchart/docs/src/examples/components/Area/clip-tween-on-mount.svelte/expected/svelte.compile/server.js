import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, ChartClipPath, Layer } from 'layerchart';
import { cubicInOut } from 'svelte/easing';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
import { createDateSeries } from '$lib/utils/data.js';

export default function Clip_tween_on_mount($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = void 0;
		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControl($$renderer, {
				label: 'Show Area',
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
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: 20,
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							if (show) {
								$$renderer.push('<!--[0-->');

								ChartClipPath($$renderer, {
									initialWidth: 0,
									motion: { width: { type: 'tween', duration: 1000, easing: cubicInOut } },
									children: ($$renderer) => {
										Area($$renderer, {
											line: { class: 'stroke-2 stroke-primary' },
											class: 'fill-primary/30'
										});
									},
									$$slots: { default: true }
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