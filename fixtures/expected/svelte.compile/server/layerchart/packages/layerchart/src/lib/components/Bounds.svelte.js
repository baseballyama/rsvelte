import * as $ from 'svelte/internal/server';
import { scaleLinear } from 'd3-scale';
import { getChartContext } from '$lib/contexts/chart.js';
import { createMotionScale } from '$lib/utils/scales.svelte.js';

export default function Bounds($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { domain, range, motion, children } = $$props;
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

		const xScale = createMotionScale(scaleLinear, motion, {
			defaultDomain: getExtents(domain, 'x', ctx.width),
			defaultRange: getExtents(range, 'x', ctx.width)
		});

		const yScale = createMotionScale(scaleLinear, motion, {
			defaultDomain: getExtents(domain, 'y', ctx.height),
			defaultRange: getExtents(range, 'y', ctx.height)
		});

		children?.($$renderer, { xScale: xScale.current, yScale: yScale.current });
		$$renderer.push(`<!---->`);
	});
}