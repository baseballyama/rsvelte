import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'data',
	'x',
	'y',
	'seriesKey',
	'defined',
	'r',
	'curve',
	'cap',
	'tension',
	'resolution',
	'fill',
	'fillOpacity',
	'opacity',
	'motion',
	'class'
]);

export default function Trail_base($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();
	const markData = getMarkData();
	let restProps = $.rest_props($$props, rest_excludes);
	let series = $.derived(() => ctx.series.series.find((s) => s.key === $$props.seriesKey));
	let seriesAccessor = $.derived(() => $.get(series)?.value ?? ($.get(series)?.data ? undefined : $.get(series)?.key));
	const xAccessor = $.derived(() => accessor($$props.x ?? (ctx.valueAxis === 'x' ? $.get(seriesAccessor) : undefined) ?? ctx.x));
	const yAccessor = $.derived(() => accessor($$props.y ?? (ctx.valueAxis === 'y' ? $.get(seriesAccessor) : undefined) ?? ctx.y));
	const xOffset = $.derived(() => isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
	const yOffset = $.derived(() => isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

	function getScaleValue(data, scale, accessorFn) {
		let value = accessorFn(data);

		if (Array.isArray(value)) value = max(value);
		if (scale.domain().length) return scale(value);

		return value;
	}

	const resolvedR = $.derived(() => $$props.r ?? ctx.config.r);

	const trailPath = $.derived(() => {
		const resolvedData = markData($$props.data ?? $.get(series)?.data);
		const definedFn = $$props.defined ?? ((d) => $.get(xAccessor)(d) != null && $.get(yAccessor)(d) != null);

		const points = resolvedData.filter((d, i) => definedFn(d, i, resolvedData)).map((d) => ({
			x: getScaleValue(d, ctx.xScale, $.get(xAccessor)) + $.get(xOffset),
			y: getScaleValue(d, ctx.yScale, $.get(yAccessor)) + $.get(yOffset),
			r: $.get(resolvedR) != null
				? resolveDataProp($.get(resolvedR), d, ctx.rScale, typeof $.get(resolvedR) === 'number' ? $.get(resolvedR) : 4)
				: 4
		}));

		return computeTrailPath(points, {
			curve: $$props.curve,
			cap: $$props.cap,
			tension: $$props.tension,
			resolution: $$props.resolution
		});
	});

	function defaultPathData() {
		if (!extractTweenConfig($$props.motion)) return '';

		if (ctx.config.x) {
			const resolvedData = markData($$props.data ?? $.get(series)?.data);
			const definedFn = $$props.defined ?? ((d) => $.get(xAccessor)(d) != null && $.get(yAccessor)(d) != null);
			const baseline = Math.min(ctx.yScale(0) ?? ctx.yRange[0], ctx.yRange[0]);

			const points = resolvedData.filter((d, i) => definedFn(d, i, resolvedData)).map((d) => ({
				x: getScaleValue(d, ctx.xScale, $.get(xAccessor)) + $.get(xOffset),
				y: baseline,
				r: $.get(resolvedR) != null
					? resolveDataProp($.get(resolvedR), d, ctx.rScale, typeof $.get(resolvedR) === 'number' ? $.get(resolvedR) : 4)
					: 4
			}));

			return computeTrailPath(points, {
				curve: $$props.curve,
				cap: $$props.cap,
				tension: $$props.tension,
				resolution: $$props.resolution
			});
		}

		return '';
	}

	// Only allocate the tween container when the user opts into a tween via
	// `motion`; otherwise the template reads `trailPath` directly.
	const tweenState = extractTweenConfig($$props.motion) != null
		? createMotion(defaultPathData(), () => $.get(trailPath), { type: 'tween', interpolate: interpolatePath })
		: null;

	ctx.registerComponent({
		name: 'Trail',
		kind: 'mark',
		markInfo: () => ({
			data: $$props.data,
			x: $$props.x,
			y: $$props.y,
			seriesKey: $$props.seriesKey,
			curve: $$props.curve
		})
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => tweenState ? tweenState.current : $.get(trailPath));
		let $1 = $.derived(() => cls('lc-trail', $$props.class));

		$.component(node, () => $$props.Path, ($$anchor, Path_1) => {
			Path_1($$anchor, $.spread_props(
				{
					get pathData() {
						return $.get($0);
					},

					get fill() {
						return $$props.fill;
					},

					get fillOpacity() {
						return $$props.fillOpacity;
					},

					get opacity() {
						return $$props.opacity;
					},
					stroke: 'none',
					get class() {
						return $.get($1);
					}
				},
				() => restProps
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}