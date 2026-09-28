import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';

var root = $.from_html(`<div style="pointer-events: none"><!></div>`);

export default function TooltipTestHarness($$anchor, $$props) {
	$.push($$props, true);

	let chartProps = $.prop($$props, 'chartProps', 19, () => ({}));
	let chartContext = $.state(void 0);

	$.user_effect(() => {
		if ($.get(chartContext)) {
			$$props.oncontext?.($.get(chartContext));
		}
	});

	const mergedChartProps = $.derived(() => ({ width: 400, height: 200, ...chartProps() }));
	var div = root();
	var node = $.child(div);

	Chart(node, $.spread_props(() => $.get(mergedChartProps), {
		get context() {
			return $.get(chartContext);
		},

		set context($$value) {
			$.set(chartContext, $$value, true);
		}
	}));

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}