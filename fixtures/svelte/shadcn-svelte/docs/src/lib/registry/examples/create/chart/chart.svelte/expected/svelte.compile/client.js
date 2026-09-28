import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartAreaExample from "./chart-area-example.svelte";
import ChartBarExample from "./chart-bar-example.svelte";
import ChartLineExample from "./chart-line-example.svelte";
import ChartRadarExample from "./chart-radar-example.svelte";
import ChartRadialExample from "./chart-radial-example.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Chart($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ChartAreaExample(node, {});

			var node_1 = $.sibling(node, 2);

			ChartBarExample(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ChartLineExample(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ChartRadialExample(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ChartRadarExample(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}