import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'RectClipPath',
	'full',
	'disabled'
]);

export default function ChartClipPath_base($$anchor, $$props) {
	$.push($$props, true);

	let full = $.prop($$props, 'full', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getChartContext();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => full() && ctx.padding.left ? -ctx.padding.left : 0);
		let $1 = $.derived(() => full() && ctx.padding.top ? -ctx.padding.top : 0);

		let $2 = $.derived(() => ctx.height + (full()
			? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0)
			: 0));

		let $3 = $.derived(() => ctx.width + (full()
			? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0)
			: 0));

		let $4 = $.derived(() => extractLayerProps(restProps, 'lc-chart-clip-path'));

		$.component(node, () => $$props.RectClipPath, ($$anchor, RectClipPath_1) => {
			RectClipPath_1($$anchor, $.spread_props(
				{
					get x() {
						return $.get($0);
					},

					get y() {
						return $.get($1);
					},

					get disabled() {
						return disabled();
					},

					get height() {
						return $.get($2);
					},

					get width() {
						return $.get($3);
					}
				},
				() => $.get($4)
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}