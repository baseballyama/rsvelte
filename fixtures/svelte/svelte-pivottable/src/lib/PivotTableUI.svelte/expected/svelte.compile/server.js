import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import PivotData from "./PivotData";
import PivotTable from "./PivotTable.svelte";
import TableRenderers from "./TableRenderers";
import Aggregators from "./UI/Aggregators.svelte";
import DnDCell from "./UI/DnDCell.svelte";
import Dropdown from "./UI/Dropdown.svelte";
import MainTable from "./UI/MainTable.svelte";
import { aggregators as defaultAggregators, sortAs } from "./Utilities";

export default function PivotTableUI($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			rendererName = "Table",
			renderers = TableRenderers,
			aggregatorName = "Count",
			aggregators = defaultAggregators,
			hiddenAttributes = [],
			hiddenFromAggregators = [],
			hiddenFromDragDrop = [],
			unusedOrientationCutoff = 85,
			menuLimit = 500,
			// pivotData props managed by PivotTableUI
			derivedAttributes = PivotData.defaultProps.derivedAttributes,
			cols = PivotData.defaultProps.cols,
			rows = PivotData.defaultProps.rows,
			vals = PivotData.defaultProps.vals,
			sorters = PivotData.defaultProps.sorters,
			compactRows = true,
			// pivot data
			data,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let valueFilter = {};

		setContext("valueFilter", valueFilter);

		let unusedOrder = [];
		const notHidden = (e) => !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e);
		let colAttrs = $.derived(() => cols.filter(notHidden));
		let rowAttrs = $.derived(() => rows.filter(notHidden));

		let attrValues = $.derived(() => {
			let attrValues = {};
			let recordsProcessed = 0;

			PivotData.forEachRecord(data ?? [], derivedAttributes, function (record) {
				for (const attr of Object.keys(record)) {
					if (!(attr in attrValues)) {
						attrValues[attr] = {};

						if (recordsProcessed > 0) {
							attrValues[attr].null = recordsProcessed;
						}
					}
				}

				for (const attr in attrValues) {
					const value = attr in record ? record[attr] : "null";

					if (!(value in attrValues[attr])) {
						attrValues[attr][value] = 0;
					}

					attrValues[attr][value]++;
				}

				recordsProcessed++;
			});

			return attrValues;
		});

		let unusedAttrs = $.derived(() => Object.keys(attrValues()).filter((e) => !colAttrs().includes(e) && !rowAttrs().includes(e) && notHidden(e)).sort(sortAs(unusedOrder)));

		let horizUnused = $.derived(() => {
			const unusedLength = unusedAttrs().reduce((r, e) => r + e.length, 0);

			return unusedLength < unusedOrientationCutoff;
		});

		let valAttrs = $.derived(() => Object.keys(attrValues()).filter((e) => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e)));
		const firstKey = (x) => Object.keys(x)[0];
		let renderer = $.derived(() => renderers[rendererName in renderers ? rendererName : firstKey(renderers)]);
		let aggregator = $.derived(() => aggregators[aggregatorName in aggregators ? aggregatorName : firstKey(aggregators)]);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function rendererCell($$renderer) {
					Dropdown($$renderer, {
						values: Object.keys(renderers),
						get current() {
							return rendererName;
						},

						set current($$value) {
							rendererName = $$value;
							$$settled = false;
						}
					});
				}

				function aggregatorCell($$renderer) {
					Aggregators($$renderer, {
						aggregatorName,
						aggregators,
						valAttrs: valAttrs(),
						onChange: (v) => aggregatorName = v,
						onUpdate: (v) => vals = v,
						vals
					});
				}

				function unusedAttrsCell($$renderer) {
					DnDCell($$renderer, {
						sorters,
						attrValues: attrValues(),
						items: unusedAttrs(),
						onChange: (v) => unusedOrder = v,
						menuLimit
					});
				}

				function colAttrsCell($$renderer) {
					DnDCell($$renderer, {
						sorters,
						attrValues: attrValues(),
						items: colAttrs(),
						onChange: (v) => cols = v,
						menuLimit
					});
				}

				function rowAttrsCell($$renderer) {
					DnDCell($$renderer, {
						sorters,
						attrValues: attrValues(),
						items: rowAttrs(),
						onChange: (v) => rows = v,
						menuLimit
					});
				}

				function outputCell($$renderer) {
					PivotTable($$renderer, $.spread_props([
						{ renderer: renderer() },
						restProps,
						{
							cols,
							rows,
							vals,
							derivedAttributes,
							aggregator: aggregator(),
							data,
							sorters,
							compactRows,
							valueFilter,
							aggregatorName,
							aggregators
						}
					]));
				}

				MainTable($$renderer, {
					horizUnused: horizUnused(),
					rendererCell,
					aggregatorCell,
					unusedAttrsCell,
					colAttrsCell,
					rowAttrsCell,
					outputCell,
					$$slots: {
						rendererCell: true,
						aggregatorCell: true,
						unusedAttrsCell: true,
						colAttrsCell: true,
						rowAttrsCell: true,
						outputCell: true
					}
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}