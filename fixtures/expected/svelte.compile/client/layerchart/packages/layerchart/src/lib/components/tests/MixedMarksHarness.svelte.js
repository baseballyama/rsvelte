import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '../Chart/Chart.svelte';
import Layer from '../layers/Layer.svelte';
import Bars from '../Bars/Bars.svelte';
import Spline from '../Spline/Spline.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function MixedMarksHarness($$anchor, $$props) {
	$.push($$props, true);

	let chartProps = $.prop($$props, 'chartProps', 19, () => ({})),
		splineProps = $.prop($$props, 'splineProps', 19, () => ({}));

	let context = $.state(void 0);

	$.user_effect(() => {
		if ($.get(context)) $$props.oncontext?.($.get(context));
	});

	Chart($$anchor, $.spread_props(chartProps, {
		get context() {
			return $.get(context);
		},

		set context($$value) {
			$.set(context, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Bars(node, {});

					var node_1 = $.sibling(node, 2);

					Spline(node_1, $.spread_props(splineProps));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	}));

	$.pop();
}