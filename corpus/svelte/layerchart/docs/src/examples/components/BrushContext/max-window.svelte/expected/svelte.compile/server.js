import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, ChartClipPath, Layer, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Max_window($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DAY = 24 * 60 * 60 * 1000;
		const maxDays = 90;

		// Live brush selection — also drives the detail chart's visible range
		let brushX = [null, null];

		const selectedDays = $.derived(() => brushX?.[0] != null && brushX?.[1] != null ? Math.round((+brushX[1] - +brushX[0]) / DAY) : null);

		$$renderer.push(`<div class="mb-2 text-sm">Window: <span class="font-semibold">${$.escape(selectedDays() != null ? `${selectedDays()} days` : 'full range')}</span> <span class="text-surface-content/50">— drag the overview to brush; capped at 90 days</span></div> `);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			xDomain: brushX,
			yDomain: [0, null],
			padding: defaultChartPadding({ left: 25, bottom: 24 }),
			height: 220,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						ChartClipPath($$renderer, {
							children: ($$renderer) => {
								Area($$renderer, {
									line: { class: 'stroke-2 stroke-primary' },
									class: 'fill-primary/20'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			brush: {
				maxExtent: { x: maxDays * DAY },
				x: brushX,
				onChange: (e) => brushX = e.brush.x
			},
			padding: defaultChartPadding({ left: 25, bottom: 24 }),
			height: 60,
			class: 'mt-2',
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Area($$renderer, { class: 'fill-surface-content/10' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { data });
	});
}