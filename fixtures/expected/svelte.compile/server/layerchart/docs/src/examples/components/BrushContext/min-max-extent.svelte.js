import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Min_max_extent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DAY = 24 * 60 * 60 * 1000;
		const minDays = 30;
		const maxDays = 180;
		let brushX = [null, null];
		const selectedDays = $.derived(() => brushX?.[0] != null && brushX?.[1] != null ? Math.round((+brushX[1] - +brushX[0]) / DAY) : null);

		$$renderer.push(`<div class="mb-2 text-sm">Selection: <span class="font-semibold">${$.escape(selectedDays() != null ? `${selectedDays()} days` : '—')}</span> <span class="text-surface-content/50">— try to drag smaller than 30 or larger than 180 days</span></div> `);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			padding: defaultChartPadding({ left: 25, bottom: 24 }),
			brush: {
				minExtent: { x: minDays * DAY },
				maxExtent: { x: maxDays * DAY },
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