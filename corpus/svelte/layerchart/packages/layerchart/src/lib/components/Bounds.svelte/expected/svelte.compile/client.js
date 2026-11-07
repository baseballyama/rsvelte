import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleLinear } from 'd3-scale';
import { getChartContext } from '$lib/contexts/chart.js';
import { createMotionScale } from '$lib/utils/scales.svelte.js';

export default function Bounds($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getChartContext();

	function getExtents(extents, axis, fallback) {
		const resolvedExtents = typeof extents === 'function'
			? extents({ width: ctx.width, height: ctx.height })
			: extents;

		return [
			// @ts-expect-error
			resolvedExtents?.[axis + '0'] ?? 0, // x0 or y0

			// @ts-expect-error
			resolvedExtents?.[axis + '1'] ?? fallback // x1 or y1, fallback as $width or $height
		];
	}

	const xScale = createMotionScale(scaleLinear, $$props.motion, {
		defaultDomain: getExtents($$props.domain, 'x', ctx.width),
		defaultRange: getExtents($$props.range, 'x', ctx.width)
	});

	$.user_effect(() => {
		xScale.domain(getExtents($$props.domain, 'x', ctx.width));
	});

	$.user_effect(() => {
		xScale.range(getExtents($$props.range, 'x', ctx.width));
	});

	const yScale = createMotionScale(scaleLinear, $$props.motion, {
		defaultDomain: getExtents($$props.domain, 'y', ctx.height),
		defaultRange: getExtents($$props.range, 'y', ctx.height)
	});

	$.user_effect(() => {
		yScale.domain(getExtents($$props.domain, 'y', ctx.height));
	});

	$.user_effect(() => {
		yScale.range(getExtents($$props.range, 'y', ctx.height));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ xScale: xScale.current, yScale: yScale.current }));
	$.append($$anchor, fragment);
	$.pop();
}