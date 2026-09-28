import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartCore from '../Chart/ChartCore.svelte';

var root = $.from_html(`<div data-testid="children-content">ChartCore children</div>`);

export default function ChartCoreTestHarness($$anchor, $$props) {
	$.push($$props, true);

	let chartProps = $.prop($$props, 'chartProps', 19, () => ({}));
	let chartContext = $.state(void 0);

	$.user_effect(() => {
		if ($.get(chartContext)) {
			$$props.oncontext?.($.get(chartContext));
		}
	});

	const mergedChartProps = $.derived(() => ({ height: 200, ...chartProps() }));

	ChartCore($$anchor, $.spread_props(() => $.get(mergedChartProps), {
		get context() {
			return $.get(chartContext);
		},

		set context($$value) {
			$.set(chartContext, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	}));

	$.pop();
}