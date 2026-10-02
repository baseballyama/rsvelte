import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'Rect', 'ref', 'full']);

export default function Frame_base($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		full = $.prop($$props, 'full', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const ctx = getChartContext();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => full() && ctx.padding?.left ? -ctx.padding.left : 0);
		let $1 = $.derived(() => full() && ctx.padding?.top ? -ctx.padding.top : 0);

		let $2 = $.derived(() => ctx.width + (full()
			? (ctx.padding?.left ?? 0) + (ctx.padding?.right ?? 0)
			: 0));

		let $3 = $.derived(() => ctx.height + (full()
			? (ctx.padding?.top ?? 0) + (ctx.padding?.bottom ?? 0)
			: 0));

		let $4 = $.derived(() => extractLayerProps(restProps, 'lc-frame'));

		$.component(node, () => $$props.Rect, ($$anchor, Rect_1) => {
			Rect_1($$anchor, $.spread_props(
				{
					get x() {
						return $.get($0);
					},

					get y() {
						return $.get($1);
					},

					get width() {
						return $.get($2);
					},

					get height() {
						return $.get($3);
					}
				},
				() => $.get($4),
				{
					get ref() {
						return $.get(ref);
					},

					set ref($$value) {
						$.set(ref, $$value, true);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}