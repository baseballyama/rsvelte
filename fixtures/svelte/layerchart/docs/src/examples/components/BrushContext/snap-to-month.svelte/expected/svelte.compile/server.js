import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeMonth } from 'd3-time';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Snap_to_month($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let brushX = [null, null];

		function monthLabel(value) {
			return value instanceof Date
				? value.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
				: '';
		}

		$$renderer.push(`<div class="mb-2 text-sm">`);

		if (brushX?.[0] != null && brushX?.[1] != null) {
			$$renderer.push(`<!--[0-->Snapped: <span class="font-semibold">${$.escape(monthLabel(brushX[0]))} – ${$.escape(monthLabel(brushX[1]))}</span>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="text-surface-content/50">Drag to brush — edges snap to whole months</span>`);
		}

		$$renderer.push(`<!--]--></div> `);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			padding: defaultChartPadding({ left: 25, bottom: 24 }),
			brush: {
				constrain: ({ x, y }) => ({
					x: x[0] != null && x[1] != null ? [timeMonth.floor(x[0]), timeMonth.ceil(x[1])] : x,
					y
				}),
				x: brushX,
				onChange: (e) => brushX = e.brush.x
			},
			height: 260,
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { data });
	});
}