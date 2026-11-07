import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LineChart from '../LineChart/LineChart.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'component', 'oncontext']);

export default function LineChartCustomMarks($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * A chart drawing its series by hand: the `marks` snippet replaces the default splines, so
	 * nothing inside registers as a mark.  Exposes the resolved context for assertions.
	 */
	let component = $.prop($$props, 'component', 3, LineChart),
		props = $.rest_props($$props, rest_excludes);

	const Chart = $.derived(component);
	let context = $.state(void 0);

	$.user_effect(() => {
		if ($.get(context)) $$props.oncontext?.($.get(context));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const marks = ($$anchor) => {};

		$.component(node, () => $.get(Chart), ($$anchor, Chart_1) => {
			Chart_1($$anchor, $.spread_props(() => props, {
				get context() {
					return $.get(context);
				},

				set context($$value) {
					$.set(context, $$value, true);
				},
				marks,
				$$slots: { marks: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}