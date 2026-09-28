import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

export default function ChartClipPath_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			RectClipPath,
			full = false,
			disabled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getChartContext();

		if (RectClipPath) {
			$$renderer.push('<!--[-->');

			RectClipPath($$renderer, $.spread_props([
				{
					x: full && ctx.padding.left ? -ctx.padding.left : 0,
					y: full && ctx.padding.top ? -ctx.padding.top : 0,
					disabled,
					height: ctx.height + (full
						? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0)
						: 0),

					width: ctx.width + (full
						? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0)
						: 0)
				},
				extractLayerProps(restProps, 'lc-chart-clip-path')
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}