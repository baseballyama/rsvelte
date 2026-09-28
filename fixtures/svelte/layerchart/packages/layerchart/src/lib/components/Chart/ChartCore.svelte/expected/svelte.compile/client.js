import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartBase from './Chart.base.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'context']);

export default function ChartCore($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		context = $.prop($$props, 'context', 15),
		props = $.rest_props($$props, rest_excludes);

	ChartBase($$anchor, $.spread_props(() => props, {
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
	}));

	$.pop();
}