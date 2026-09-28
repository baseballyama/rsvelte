import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { timeDay } from 'd3-time';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	Layer,
	LinearGradient,
	Rule
} from 'layerchart';

import { randomWalk } from '$lib/utils/data.js';

export default function Synced_brushes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const now = new Date();
		let xDomain = [timeDay.offset(now, -60), timeDay.offset(now, -30)];

		const seriesData = [
			randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })),
			randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })),
			randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value })),
			randomWalk({ count: 100 }).map((value, i) => ({ date: timeDay.offset(now, -i), value: 10 + value }))
		];

		const colorScale = scaleOrdinal([
			'var(--color-success-500)',
			'var(--color-info-500)',
			'var(--color-warning-500)',
			'var(--color-danger-500)'
		]);

		$$renderer.push(`<div class="grid grid-cols-2 gap-4"><!--[-->`);

		const each_array = $.ensure_array_like(seriesData);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let data = each_array[i];

			$$renderer.push(`<div class="border rounded-sm p-4 grid gap-1"${$.attr_style('', { '--chart-color': colorScale(String(i)) })}>`);

			Chart($$renderer, {
				data,
				x: 'date',
				xDomain,
				y: 'value',
				yBaseline: 0,
				padding: { left: 16, bottom: 24 },
				height: 100,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom' });
							$$renderer.push(`<!----> `);
							Rule($$renderer, { y: 0 });
							$$renderer.push(`<!----> `);

							ChartClipPath($$renderer, {
								children: ($$renderer) => {
									{
										function children($$renderer, { gradient }) {
											Area($$renderer, {
												line: { class: 'stroke-2 stroke-(--chart-color)' },
												fill: gradient
											});
										}

										LinearGradient($$renderer, {
											class: 'from-[color-mix(in_lch,var(--chart-color)_50%,_transparent)] to-transparent',
											vertical: true,
											children,
											$$slots: { default: true }
										});
									}
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
				padding: { left: 16 },
				brush: { x: xDomain, onChange: (e) => xDomain = e.brush.x },
				height: 20,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Area($$renderer, {
								line: { class: 'stroke-2 stroke-(--chart-color)' },
								class: 'fill-(--chart-color) opacity-20'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { data });
	});
}