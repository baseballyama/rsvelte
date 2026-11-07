import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { resolveStyleProp } from '$lib/utils/dataProp.js';
import { BarState } from './Bar.shared.svelte.js';

export default function Bar_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Rect,
			Arc,
			data,
			x: xProp,
			y: yProp,
			x1: x1Prop,
			y1: y1Prop,
			seriesKey,
			stackPadding = 0,
			fill,
			fillOpacity,
			stroke: strokeProp = 'black',
			strokeWidth = 0,
			opacity,
			radius = 0,
			rounded = 'all',
			motion,
			insets,
			initialX,
			initialY,
			initialHeight,
			initialWidth,
			width,
			height,
			tooltip,
			onpointerenter,
			onpointermove,
			onpointerleave,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const stroke = $.derived(() => strokeProp === null || strokeProp === undefined ? 'black' : strokeProp);

		/**
		 * A bar draws one row, so its style props take an accessor the same way `Rect` and `Circle` do.
		 * Resolved here rather than passed down, because the `Rect` below is handed computed dimensions
		 * and so never sees the row itself.
		 *
		 * `fill` / `stroke` are left alone — a bar's color comes from `c` / the series, which already
		 * resolves per row.
		 */
		const resolvedFillOpacity = $.derived(() => resolveStyleProp(fillOpacity, data));

		const resolvedStrokeWidth = $.derived(() => resolveStyleProp(strokeWidth, data));
		const resolvedOpacity = $.derived(() => resolveStyleProp(opacity, data));

		const c = new BarState(() => ({
			data,
			x: xProp,
			y: yProp,
			x1: x1Prop,
			y1: y1Prop,
			seriesKey,
			stackPadding,
			radius,
			rounded,
			motion,
			insets,
			initialX,
			initialY,
			initialHeight,
			initialWidth,
			width,
			height,
			tooltip
		}));

		const onPointerEnter = (e) => {
			onpointerenter?.(e);

			if (tooltip) c.ctx.tooltip.show(e, data);
		};

		const onPointerMove = (e) => {
			onpointermove?.(e);

			if (tooltip) c.ctx.tooltip.show(e, data);
		};

		const onPointerLeave = (e) => {
			onpointerleave?.(e);

			if (tooltip) c.ctx.tooltip.hide();
		};

		if (c.ctx.radial && Arc) {
			$$renderer.push('<!--[0-->');

			if (Arc) {
				$$renderer.push('<!--[-->');

				Arc($$renderer, $.spread_props([
					{
						innerRadius: c.dimensions.y,
						outerRadius: c.dimensions.y + c.dimensions.height,
						startAngle: c.dimensions.x,
						endAngle: c.dimensions.x + c.dimensions.width,
						fill,
						fillOpacity: resolvedFillOpacity(),
						stroke: stroke(),
						strokeWidth: resolvedStrokeWidth(),
						opacity: resolvedOpacity(),
						cornerRadius: radius,
						onpointerenter: onPointerEnter,
						onpointermove: onPointerMove,
						onpointerleave: onPointerLeave
					},
					extractLayerProps(restProps, 'lc-bar')
				]));

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
					{
						fill,
						fillOpacity: resolvedFillOpacity(),
						stroke: stroke(),
						strokeWidth: resolvedStrokeWidth(),
						opacity: resolvedOpacity(),
						corners: c.corners,
						motion,
						initialX: c.resolvedInitialX,
						initialY: c.resolvedInitialY,
						initialHeight: c.resolvedInitialHeight,
						initialWidth: c.resolvedInitialWidth
					},
					c.dimensions,
					{
						onpointerenter: onPointerEnter,
						onpointermove: onPointerMove,
						onpointerleave: onPointerLeave
					},
					extractLayerProps(restProps, 'lc-bar')
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