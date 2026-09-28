import * as $ from 'svelte/internal/server';
import ChartAreaExample from "./chart-area-example.svelte";
import ChartBarExample from "./chart-bar-example.svelte";
import ChartLineExample from "./chart-line-example.svelte";
import ChartRadarExample from "./chart-radar-example.svelte";
import ChartRadialExample from "./chart-radial-example.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Chart($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ChartAreaExample($$renderer, {});
			$$renderer.push(`<!----> `);
			ChartBarExample($$renderer, {});
			$$renderer.push(`<!----> `);
			ChartLineExample($$renderer, {});
			$$renderer.push(`<!----> `);
			ChartRadialExample($$renderer, {});
			$$renderer.push(`<!----> `);
			ChartRadarExample($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}