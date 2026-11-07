import * as $ from 'svelte/internal/server';
import PivotData from "./PivotData";
import Plotly from "./UI/Plotly.svelte";

export default function PlotlyRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			plotlyOptions = {},
			plotlyConfig = {},
			onRendererUpdate,
			traceOptions = {},
			layoutOptions = {},
			transpose = false,
			aggregatorName,
			aggregators,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let pivotData;
		let rowKeys;
		let colKeys;
		let traceKeys;
		let datumKeys;
		let numInputs;
		let data = [];
		let hAxisTitle;
		let groupByTitle;
		let layout = {};

		Plotly($$renderer, {
			layout: /* eslint-disable no-magic-numbers */
			/* eslint-enable no-magic-numbers */
			{ ...layout, ...layoutOptions, ...plotlyOptions },
			data,
			config: plotlyConfig,
			onUpdate: onRendererUpdate
		});
	});
}