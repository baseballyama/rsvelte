import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { dodge } from './Dodge.shared.svelte.js';

export { dodge } from './Dodge.shared.svelte.js';

export default function Dodge($$anchor, $$props) {
	$.push($$props, true);

	let axis = $.prop($$props, 'axis', 3, 'y'),
		padding = $.prop($$props, 'padding', 3, 1);

	const ctx = getChartContext();

	ctx.registerComponent({ name: 'Dodge', kind: 'composite-mark' });

	const resolvedAnchor = $.derived(() => $$props.anchor ?? (axis() === 'y' ? 'bottom' : 'left'));
	const data = $.derived(() => $$props.data ?? ctx.data ?? []);
	const positionFn = $.derived(() => $$props.position ?? (axis() === 'y' ? ctx.xGet : ctx.yGet));

	// Rectangular mode is opt-in by providing both `rx` and `ry`.
	const rectangular = $.derived(() => $$props.rx != null && $$props.ry != null);

	// Resolve `r` (circular fallback) — also serves as the default per-axis
	// half-extent in circular mode (rx === ry === r).
	const rFn = $.derived(() => {
		if (typeof $$props.r === 'function') return $$props.r;
		if ($$props.r != null) return () => $$props.r;
		if (ctx.config.r) return (d) => Number(ctx.rGet(d)) || 0;

		return () => 5;
	});

	function asFn(v, fallback) {
		if (typeof v === 'function') return v;
		if (v != null) return () => v;

		return fallback;
	}

	const rxFn = $.derived(() => asFn($$props.rx, $.get(rFn)));
	const ryFn = $.derived(() => asFn($$props.ry, $.get(rFn)));

	// Default baseline: the chart-coord position of the anchor edge / centerline.
	const baseline = $.derived(() => {
		if ($$props.baseline != null) return $$props.baseline;

		const dim = axis() === 'y' ? ctx.height : ctx.width;

		if ($.get(resolvedAnchor) === 'middle') return dim / 2;
		if (axis() === 'y') return $.get(resolvedAnchor // bottom
		) === 'top' ? 0 : dim;

		return $.get(resolvedAnchor // left
		) === 'right' ? dim : 0;
	});

	const items = $.derived(() => {
		const input = $.get(data).map((d, index) => ({
			x: Number($.get(positionFn)(d)) || 0,
			rx: Number($.get(rxFn)(d)) || 0,
			ry: Number($.get(ryFn)(d)) || 0,
			data: d,
			index
		}));

		return dodge(input, {
			axis: axis(),
			anchor: $.get(resolvedAnchor),
			padding: padding(),
			baseline: $.get(baseline),
			rectangular: $.get(rectangular)
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ items: $.get(items) }));
	$.append($$anchor, fragment);
	$.pop();
}