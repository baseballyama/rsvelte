import * as $ from 'svelte/internal/server';
import { max } from 'd3-array';
import { interpolatePath } from 'd3-interpolate-path';
import { cls } from '@layerstack/tailwind';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { resolveDataProp } from '$lib/utils/dataProp.js';
import { accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import { computeTrailPath } from '$lib/utils/trail.js';
import { createMotion, extractTweenConfig } from '$lib/utils/motion.svelte.js';

export default function Trail_base($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();
		const markData = getMarkData();

		let {
			Path,
			data,
			x,
			y,
			seriesKey,
			defined,
			r,
			curve,
			cap,
			tension,
			resolution,
			fill,
			fillOpacity,
			opacity,
			motion,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let series = $.derived(() => ctx.series.series.find((s) => s.key === seriesKey));
		let seriesAccessor = $.derived(() => series()?.value ?? (series()?.data ? undefined : series()?.key));
		const xAccessor = $.derived(() => accessor(x ?? (ctx.valueAxis === 'x' ? seriesAccessor() : undefined) ?? ctx.x));
		const yAccessor = $.derived(() => accessor(y ?? (ctx.valueAxis === 'y' ? seriesAccessor() : undefined) ?? ctx.y));
		const xOffset = $.derived(() => isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
		const yOffset = $.derived(() => isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

		function getScaleValue(data, scale, accessorFn) {
			let value = accessorFn(data);

			if (Array.isArray(value)) value = max(value);
			if (scale.domain().length) return scale(value);

			return value;
		}

		const resolvedR = $.derived(() => r ?? ctx.config.r);

		const trailPath = $.derived(() => {
			const resolvedData = markData(data ?? series()?.data);
			const definedFn = defined ?? ((d) => xAccessor()(d) != null && yAccessor()(d) != null);

			const points = resolvedData.filter((d, i) => definedFn(d, i, resolvedData)).map((d) => ({
				x: getScaleValue(d, ctx.xScale, xAccessor()) + xOffset(),
				y: getScaleValue(d, ctx.yScale, yAccessor()) + yOffset(),
				r: resolvedR() != null
					? resolveDataProp(resolvedR(), d, ctx.rScale, typeof resolvedR() === 'number' ? resolvedR() : 4)
					: 4
			}));

			return computeTrailPath(points, { curve, cap, tension, resolution });
		});

		function defaultPathData() {
			if (!extractTweenConfig(motion)) return '';

			if (ctx.config.x) {
				const resolvedData = markData(data ?? series()?.data);
				const definedFn = defined ?? ((d) => xAccessor()(d) != null && yAccessor()(d) != null);
				const baseline = Math.min(ctx.yScale(0) ?? ctx.yRange[0], ctx.yRange[0]);

				const points = resolvedData.filter((d, i) => definedFn(d, i, resolvedData)).map((d) => ({
					x: getScaleValue(d, ctx.xScale, xAccessor()) + xOffset(),
					y: baseline,
					r: resolvedR() != null
						? resolveDataProp(resolvedR(), d, ctx.rScale, typeof resolvedR() === 'number' ? resolvedR() : 4)
						: 4
				}));

				return computeTrailPath(points, { curve, cap, tension, resolution });
			}

			return '';
		}

		// Only allocate the tween container when the user opts into a tween via
		// `motion`; otherwise the template reads `trailPath` directly.
		const tweenState = extractTweenConfig(motion) != null
			? createMotion(defaultPathData(), () => trailPath(), { type: 'tween', interpolate: interpolatePath })
			: null;

		ctx.registerComponent({
			name: 'Trail',
			kind: 'mark',
			markInfo: () => ({ data, x, y, seriesKey, curve })
		});

		if (Path) {
			$$renderer.push('<!--[-->');

			Path($$renderer, $.spread_props([
				{
					pathData: tweenState ? tweenState.current : trailPath(),
					fill,
					fillOpacity,
					opacity,
					stroke: 'none',
					class: cls('lc-trail', className)
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}