import * as $ from 'svelte/internal/server';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { PointsState } from './Points.shared.svelte.js';

export default function Points_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			Circle,
			data,
			x,
			y,
			seriesKey,
			r = 5,
			offsetX,
			offsetY,
			fill,
			fillOpacity,
			stroke,
			strokeWidth,
			opacity,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const c = new PointsState(() => ({
			data,
			x,
			y,
			seriesKey,
			r,
			offsetX,
			offsetY,
			fill,
			fillOpacity,
			stroke,
			strokeWidth,
			opacity
		}));

		/**
		 * Faded when something else is highlighted — the row's `c` category when the legend names
		 * those, and the point's series otherwise.  A single series names nothing to tell apart, so it
		 * never fades on its own account.
		 */
		function highlightOpacity(d) {
			const category = c.ctx.cKey(d);

			if (category != null) {
				return c.ctx.series.isHighlighted(category, true) ? 1 : 0.1;
			}

			return c.series?.key == null || c.ctx.series.visibleSeries.length <= 1 || c.ctx.series.isHighlighted(c.series.key, true) ? 1 : 0.1;
		}

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer, { points: c.points });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(c.points);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let point = each_array[$$index];

				if (Circle) {
					$$renderer.push('<!--[-->');

					Circle($$renderer, $.spread_props([
						{
							cx: point.x,
							cy: point.y,
							r: point.r,
							fill: fill ?? c.series?.color ?? (c.ctx.config.c ? c.ctx.cGet(point.data) : null),
							fillOpacity,
							stroke,
							strokeWidth,
							opacity: opacity ?? highlightOpacity(point.data)
						},
						c.series?.props,
						extractLayerProps(restProps, 'lc-point')
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}