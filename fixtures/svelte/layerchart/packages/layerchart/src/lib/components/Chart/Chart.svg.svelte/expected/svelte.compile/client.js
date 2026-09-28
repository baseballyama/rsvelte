import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartBase from './Chart.base.svelte';
import ChartChildren from '../ChartChildren/ChartChildren.svg.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'context']);

export default function Chart_svg($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	ChartBase($$anchor, $.spread_props(
		{
			get ChartChildren() {
				return ChartChildren;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			get context() {
				return context();
			},

			set context($$value) {
				context($$value);
			}
		}
	));

	$.pop();
}