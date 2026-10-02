import * as $ from 'svelte/internal/server';
import { Area, Axis, Brush, Chart, Layer, defaultChartPadding } from 'layerchart';
import { format, PeriodType } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let brush = void 0;
		const range = $.derived(() => brush?.active ? brush.x : null);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-sm text-surface-content/70 mb-2 h-5">`);

			if (range()) {
				$$renderer.push(`<!--[0-->${$.escape(format(range()[0], PeriodType.Day))} – ${$.escape(format(range()[1], PeriodType.Day))}`);
			} else {
				$$renderer.push(`<!--[-1-->Drag to select a range`);
			}

			$$renderer.push(`<!--]--></div> `);

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				padding: defaultChartPadding({ left: 25, bottom: 24 }),
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							Area($$renderer, {
								line: { class: 'stroke-2 stroke-primary' },
								class: 'fill-primary/20'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						type: 'html',
						children: ($$renderer) => {
							Brush($$renderer, {
								get state() {
									return brush;
								},

								set state($$value) {
									brush = $$value;
									$$settled = false;
								}
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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