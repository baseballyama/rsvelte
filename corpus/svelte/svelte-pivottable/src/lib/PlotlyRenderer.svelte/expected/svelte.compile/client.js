import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PivotData from "./PivotData";
import Plotly from "./UI/Plotly.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'plotlyOptions',
	'plotlyConfig',
	'onRendererUpdate',
	'traceOptions',
	'layoutOptions',
	'transpose',
	'aggregatorName',
	'aggregators'
]);

export default function PlotlyRenderer($$anchor, $$props) {
	$.push($$props, true);

	let plotlyOptions = $.prop($$props, 'plotlyOptions', 19, () => ({})),
		plotlyConfig = $.prop($$props, 'plotlyConfig', 19, () => ({})),
		traceOptions = $.prop($$props, 'traceOptions', 19, () => ({})),
		layoutOptions = $.prop($$props, 'layoutOptions', 19, () => ({})),
		transpose = $.prop($$props, 'transpose', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let pivotData;
	let rowKeys;
	let colKeys;
	let traceKeys;
	let datumKeys;
	let numInputs;
	let data = $.state([]);
	let hAxisTitle;
	let groupByTitle;
	let layout = $.state({});

	$.user_effect(() => {
		pivotData = new PivotData(restProps);
		rowKeys = pivotData.getRowKeys();
		colKeys = pivotData.getColKeys();
		traceKeys = transpose() ? colKeys : rowKeys;

		if (traceKeys.length === 0) {
			traceKeys.push([]);
		}

		datumKeys = transpose() ? rowKeys : colKeys;

		if (datumKeys.length === 0) {
			datumKeys.push([]);
		}

		let fullAggregatorName = $$props.aggregatorName;

		numInputs = $$props.aggregators[$$props.aggregatorName]([])().numInputs || 0;

		if (numInputs !== 0) {
			fullAggregatorName += ` of ${pivotData.props.vals.slice(0, numInputs).join(", ")}`;
		}

		const dataTemp = traceKeys.map((traceKey) => {
			const values = [];
			const labels = [];

			for (const datumKey of datumKeys) {
				const val = parseFloat(pivotData.getAggregator(transpose() ? datumKey : traceKey, transpose() ? traceKey : datumKey).value());

				values.push(isFinite(val) ? val : null);
				labels.push(datumKey.join("-") || " ");
			}

			const trace = { name: traceKey.join("-") || fullAggregatorName };

			if (traceOptions().type === "pie") {
				trace.values = values;
				trace.labels = labels.length > 1 ? labels : [fullAggregatorName];
			} else {
				trace.x = transpose() ? values : labels;
				trace.y = transpose() ? labels : values;
			}

			return Object.assign(trace, traceOptions());
		});

		let titleText = fullAggregatorName;

		hAxisTitle = transpose()
			? pivotData.props.rows.join("-")
			: pivotData.props.cols.join("-");

		groupByTitle = transpose()
			? pivotData.props.cols.join("-")
			: pivotData.props.rows.join("-");

		if (hAxisTitle !== "") {
			titleText += ` vs ${hAxisTitle}`;
		}

		if (groupByTitle !== "") {
			titleText += ` by ${groupByTitle}`;
		}

		const layoutTemp = {
			title: { text: titleText },
			hovermode: "closest",
			/* eslint-disable no-magic-numbers */
			width: window.innerWidth / 1.5,
			height: window.innerHeight / 1.4 - 50

			/* eslint-enable no-magic-numbers */
		};

		if (traceOptions().type === "pie") {
			const columns = Math.ceil(Math.sqrt(dataTemp.length));
			const rows = Math.ceil(dataTemp.length / columns);

			layoutTemp.grid = { columns, rows };

			dataTemp.forEach((d, i) => {
				d.domain = {
					row: Math.floor(i / columns),
					column: i - columns * Math.floor(i / columns)
				};

				if (dataTemp.length > 1) {
					d.title = { text: d.name };
				}
			});

			if (dataTemp[0].labels?.length === 1) {
				layoutTemp.showlegend = false;
			}
		} else {
			layoutTemp.xaxis = {
				title: transpose() ? { text: $$props.aggregatorName } : undefined,
				automargin: true
			};

			layoutTemp.yaxis = {
				title: transpose() ? undefined : { text: $$props.aggregatorName },
				automargin: true
			};
		}

		$.set(data, dataTemp);
		$.set(layout, layoutTemp);
	});

	{
		let $0 = $.derived(() => ({ ...$.get(layout), ...layoutOptions(), ...plotlyOptions() }));

		Plotly($$anchor, {
			get layout() {
				return $.get($0);
			},

			get data() {
				return $.get(data);
			},

			get config() {
				return plotlyConfig();
			},

			get onUpdate() {
				return $$props.onRendererUpdate;
			}
		});
	}

	$.pop();
}