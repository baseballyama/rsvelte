import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';

export default function Cell_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Rect,
			Circle,
			Group,
			shape = 'rect',
			r,
			x,
			y,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const chartCtx = getChartContext();
		const cellWidth = $.derived(() => isScaleBand(chartCtx.xScale) ? chartCtx.xScale.bandwidth() : 0);
		const cellHeight = $.derived(() => isScaleBand(chartCtx.yScale) ? chartCtx.yScale.bandwidth() : 0);
		const defaultR = $.derived(() => Math.min(cellWidth(), cellHeight()) / 2);

		if (shape === 'circle') {
			$$renderer.push('<!--[0-->');

			if (Group) {
				$$renderer.push('<!--[-->');

				Group($$renderer, {
					x: cellWidth() / 2,
					y: cellHeight() / 2,
					children: ($$renderer) => {
						if (Circle) {
							$$renderer.push('<!--[-->');
							Circle($$renderer, $.spread_props([{ cx: x, cy: y, r: r ?? defaultR() }, restProps]));
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');

			if (Rect) {
				$$renderer.push('<!--[-->');

				Rect($$renderer, $.spread_props([
					{ width: cellWidth(), height: cellHeight(), x, y },
					restProps
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}