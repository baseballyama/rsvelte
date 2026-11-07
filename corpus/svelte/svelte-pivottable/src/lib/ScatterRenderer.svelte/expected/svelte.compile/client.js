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
	'onRendererUpdate'
]);

export default function ScatterRenderer($$anchor, $$props) {
	$.push($$props, true);

	let plotlyOptions = $.prop($$props, 'plotlyOptions', 19, () => ({})),
		plotlyConfig = $.prop($$props, 'plotlyConfig', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	let pivotData;
	let rowKeys;
	let colKeys;
	let layout = $.state({});
	let data = { type: "scatter", mode: "markers" };

	$.user_effect(() => {
		pivotData = new PivotData(restProps);
		rowKeys = pivotData.getRowKeys();
		colKeys = pivotData.getColKeys();

		if (rowKeys.length === 0) {
			rowKeys.push([]);
		}

		if (colKeys.length === 0) {
			colKeys.push([]);
		}

		data.x = [];
		data.y = [];
		data.text = [];

		for (const rowKey of rowKeys) {
			for (const colKey of colKeys) {
				const v = pivotData.getAggregator(rowKey, colKey).value();

				if (v !== null) {
					data.x.push(colKey.join("-"));
					data.y.push(rowKey.join("-"));
					data.text.push(String(v));
				}
			}
		}

		$.set(layout, {
			title: {
				text: pivotData.props.rows.join("-") + " vs " + pivotData.props.cols.join("-")
			},
			hovermode: "closest",
			xaxis: {
				title: { text: pivotData.props.cols.join("-") },
				automargin: true
			},
			yaxis: {
				title: { text: pivotData.props.rows.join("-") },
				automargin: true
			},

			/* eslint-disable no-magic-numbers */
			width: window.innerWidth / 1.5,
			height: window.innerHeight / 1.4 - 50

			/* eslint-enable no-magic-numbers */
		});
	});

	{
		let $0 = $.derived(() => [data]);
		let $1 = $.derived(() => Object.assign($.get(layout) ?? {}, plotlyOptions()));

		Plotly($$anchor, {
			get data() {
				return $.get($0);
			},

			get layout() {
				return $.get($1);
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