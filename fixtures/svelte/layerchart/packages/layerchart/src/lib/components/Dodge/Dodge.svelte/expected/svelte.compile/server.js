import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { dodge } from './Dodge.shared.svelte.js';

export { dodge } from './Dodge.shared.svelte.js';

export default function Dodge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			data: dataProp,
			axis = 'y',
			anchor,
			padding = 1,
			r,
			rx,
			ry,
			position,
			baseline: baselineProp,
			children
		} = $$props;

		const ctx = getChartContext();

		ctx.registerComponent({ name: 'Dodge', kind: 'composite-mark' });

		const resolvedAnchor = $.derived(() => anchor ?? (axis === 'y' ? 'bottom' : 'left'));
		const data = $.derived(() => dataProp ?? ctx.data ?? []);
		const positionFn = $.derived(() => position ?? (axis === 'y' ? ctx.xGet : ctx.yGet));

		// Rectangular mode is opt-in by providing both `rx` and `ry`.
		const rectangular = $.derived(() => rx != null && ry != null);

		// Resolve `r` (circular fallback) — also serves as the default per-axis
		// half-extent in circular mode (rx === ry === r).
		const rFn = $.derived(() => {
			if (typeof r === 'function') return r;
			if (r != null) return () => r;
			if (ctx.config.r) return (d) => Number(ctx.rGet(d)) || 0;

			return () => 5;
		});

		function asFn(v, fallback) {
			if (typeof v === 'function') return v;
			if (v != null) return () => v;

			return fallback;
		}

		const rxFn = $.derived(() => asFn(rx, rFn()));
		const ryFn = $.derived(() => asFn(ry, rFn()));

		// Default baseline: the chart-coord position of the anchor edge / centerline.
		const baseline = $.derived(() => {
			if (baselineProp != null) return baselineProp;

			const dim = axis === 'y' ? ctx.height : ctx.width;

			if (resolvedAnchor() === 'middle') return dim / 2;
			if (axis === 'y') return resolvedAnchor() === 'top' ? 0 : dim; // bottom

			return resolvedAnchor() === 'right' ? dim : 0; // left
		});

		const items = $.derived(() => {
			const input = data().map((d, index) => ({
				x: Number(positionFn()(d)) || 0,
				rx: Number(rxFn()(d)) || 0,
				ry: Number(ryFn()(d)) || 0,
				data: d,
				index
			}));

			return dodge(input, {
				axis,
				anchor: resolvedAnchor(),
				padding,
				baseline: baseline(),
				rectangular: rectangular()
			});
		});

		children?.($$renderer, { items: items() });
		$$renderer.push(`<!---->`);
	});
}