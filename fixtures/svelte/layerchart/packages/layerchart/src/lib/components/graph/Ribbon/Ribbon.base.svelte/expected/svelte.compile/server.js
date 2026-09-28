import * as $ from 'svelte/internal/server';
import { ribbon as d3ribbon, ribbonArrow as d3ribbonArrow } from 'd3-chord';
import { getChartContext } from '$lib/contexts/chart.js';
import { cls } from '@layerstack/tailwind';

export default function Ribbon_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Path,
			chord,
			radius,
			directed = false,
			headRadius,
			fill,
			fillOpacity,
			stroke,
			strokeWidth,
			opacity,
			data,
			onpointerenter,
			onpointermove,
			onpointerleave,
			ontouchmove,
			tooltip,
			motion,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getChartContext();

		const ribbonGenerator = $.derived(() => {
			if (directed) {
				const gen = d3ribbonArrow();

				if (radius != null) gen.radius(radius);
				if (headRadius != null) gen.headRadius(headRadius);

				return gen;
			} else {
				const gen = d3ribbon();

				if (radius != null) gen.radius(radius);

				return gen;
			}
		});

		// @ts-expect-error - Chord type is compatible with Ribbon at runtime; radius is set on the generator
		const pathData = $.derived(() => ribbonGenerator()(chord) ?? undefined);

		const onPointerEnter = (e) => {
			onpointerenter?.(e);

			if (tooltip) ctx.tooltip.show(e, data);
		};

		const onPointerMove = (e) => {
			onpointermove?.(e);

			if (tooltip) ctx.tooltip.show(e, data);
		};

		const onPointerLeave = (e) => {
			onpointerleave?.(e);

			if (tooltip) ctx.tooltip.hide();
		};

		if (Path) {
			$$renderer.push('<!--[-->');

			Path($$renderer, $.spread_props([
				{
					pathData: pathData(),
					fill,
					fillOpacity,
					stroke,
					strokeWidth,
					opacity,
					motion
				},
				restProps,
				{
					class: cls('lc-ribbon', className),
					onpointerenter: onPointerEnter,
					onpointermove: onPointerMove,
					onpointerleave: onPointerLeave,
					ontouchmove: (e) => {
						ontouchmove?.(e);

						if (tooltip) {
							e.preventDefault();
						}
					}
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}