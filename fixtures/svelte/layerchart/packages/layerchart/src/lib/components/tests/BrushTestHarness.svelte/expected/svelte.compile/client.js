import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';

export default function BrushTestHarness($$anchor, $$props) {
	$.push($$props, true);

	let chartProps = $.prop($$props, 'chartProps', 19, () => ({}));
	let chartContext = $.state(void 0);

	$.user_effect(() => {
		if ($.get(chartContext)) {
			$$props.oncontext?.($.get(chartContext));
		}
	});

	const mergedChartProps = $.derived(() => ({ height: 200, ...chartProps() }));

	Chart($$anchor, $.spread_props(() => $.get(mergedChartProps), {
		get context() {
			return $.get(chartContext);
		},

		set context($$value) {
			$.set(chartContext, $$value, true);
		}
	}));

	$.pop();
}