import * as $ from 'svelte/internal/server';
import PivotData from "./PivotData";
import Plotly from "./UI/Plotly.svelte";

export default function ScatterRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			plotlyOptions = {},
			plotlyConfig = {},
			onRendererUpdate,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let pivotData;
		let rowKeys;
		let colKeys;
		let layout = {};
		let data = { type: "scatter", mode: "markers" };

		Plotly($$renderer, {
			data: /* eslint-disable no-magic-numbers */
			/* eslint-enable no-magic-numbers */
			[data],
			layout: Object.assign(layout ?? {}, plotlyOptions),
			config: plotlyConfig,
			onUpdate: onRendererUpdate
		});
	});
}