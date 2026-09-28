import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import PivotData from "./PivotData";
import PivotTable from "./PivotTable.svelte";
import TableRenderers from "./TableRenderers";
import Aggregators from "./UI/Aggregators.svelte";
import DnDCell from "./UI/DnDCell.svelte";
import Dropdown from "./UI/Dropdown.svelte";
import MainTable from "./UI/MainTable.svelte";
import { aggregators as defaultAggregators, sortAs } from "./Utilities";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'rendererName',
	'renderers',
	'aggregatorName',
	'aggregators',
	'hiddenAttributes',
	'hiddenFromAggregators',
	'hiddenFromDragDrop',
	'unusedOrientationCutoff',
	'menuLimit',
	'derivedAttributes',
	'cols',
	'rows',
	'vals',
	'sorters',
	'compactRows',
	'data'
]);

export default function PivotTableUI($$anchor, $$props) {
	$.push($$props, true);

	let rendererName = $.prop($$props, 'rendererName', 7, "Table"),
		renderers = $.prop($$props, 'renderers', 3, TableRenderers),
		aggregatorName = $.prop($$props, 'aggregatorName', 7, "Count"),
		aggregators = $.prop($$props, 'aggregators', 3, defaultAggregators),
		hiddenAttributes = $.prop($$props, 'hiddenAttributes', 19, () => []),
		hiddenFromAggregators = $.prop($$props, 'hiddenFromAggregators', 19, () => []),
		hiddenFromDragDrop = $.prop($$props, 'hiddenFromDragDrop', 19, () => []),
		unusedOrientationCutoff = $.prop($$props, 'unusedOrientationCutoff', 3, 85),
		menuLimit = $.prop($$props, 'menuLimit', 3, 500),
		// pivotData props managed by PivotTableUI
		derivedAttributes = $.prop($$props, 'derivedAttributes', 19, () => PivotData.defaultProps.derivedAttributes),
		cols = $.prop($$props, 'cols', 23, () => PivotData.defaultProps.cols),
		rows = $.prop($$props, 'rows', 23, () => PivotData.defaultProps.rows),
		vals = $.prop($$props, 'vals', 23, () => PivotData.defaultProps.vals),
		sorters = $.prop($$props, 'sorters', 19, () => PivotData.defaultProps.sorters),
		compactRows = $.prop($$props, 'compactRows', 3, true),
		// pivot data
		restProps = $.rest_props($$props, rest_excludes);

	let valueFilter = $.proxy({});

	setContext("valueFilter", valueFilter);

	let unusedOrder = $.state([]);
	const notHidden = (e) => !hiddenAttributes().includes(e) && !hiddenFromDragDrop().includes(e);
	let colAttrs = $.derived(() => cols().filter(notHidden));
	let rowAttrs = $.derived(() => rows().filter(notHidden));

	let attrValues = $.derived(() => {
		let attrValues = {};
		let recordsProcessed = 0;

		PivotData.forEachRecord($$props.data ?? [], derivedAttributes(), function (record) {
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

	let unusedAttrs = $.derived(() => Object.keys($.get(attrValues)).filter((e) => !$.get(colAttrs).includes(e) && !$.get(rowAttrs).includes(e) && notHidden(e)).sort(sortAs($.get(unusedOrder))));

	let horizUnused = $.derived(() => {
		const unusedLength = $.get(unusedAttrs).reduce((r, e) => r + e.length, 0);

		return unusedLength < unusedOrientationCutoff();
	});

	let valAttrs = $.derived(() => Object.keys($.get(attrValues)).filter((e) => !hiddenAttributes().includes(e) && !hiddenFromAggregators().includes(e)));
	const firstKey = (x) => Object.keys(x)[0];
	let renderer = $.derived(() => renderers()[rendererName() in renderers() ? rendererName() : firstKey(renderers())]);
	let aggregator = $.derived(() => aggregators()[aggregatorName() in aggregators() ? aggregatorName() : firstKey(aggregators())]);

	{
		const rendererCell = ($$anchor) => {
			{
				let $0 = $.derived(() => Object.keys(renderers()));

				Dropdown($$anchor, {
					get values() {
						return $.get($0);
					},

					get current() {
						return rendererName();
					},

					set current($$value) {
						rendererName($$value);
					}
				});
			}
		};

		const aggregatorCell = ($$anchor) => {
			Aggregators($$anchor, {
				get aggregatorName() {
					return aggregatorName();
				},

				get aggregators() {
					return aggregators();
				},

				get valAttrs() {
					return $.get(valAttrs);
				},
				onChange: (v) => aggregatorName(v),
				onUpdate: (v) => vals(v),
				get vals() {
					return vals();
				}
			});
		};

		const unusedAttrsCell = ($$anchor) => {
			DnDCell($$anchor, {
				get sorters() {
					return sorters();
				},

				get attrValues() {
					return $.get(attrValues);
				},

				get items() {
					return $.get(unusedAttrs);
				},
				onChange: (v) => $.set(unusedOrder, v),
				get menuLimit() {
					return menuLimit();
				}
			});
		};

		const colAttrsCell = ($$anchor) => {
			DnDCell($$anchor, {
				get sorters() {
					return sorters();
				},

				get attrValues() {
					return $.get(attrValues);
				},

				get items() {
					return $.get(colAttrs);
				},
				onChange: (v) => cols(v),
				get menuLimit() {
					return menuLimit();
				}
			});
		};

		const rowAttrsCell = ($$anchor) => {
			DnDCell($$anchor, {
				get sorters() {
					return sorters();
				},

				get attrValues() {
					return $.get(attrValues);
				},

				get items() {
					return $.get(rowAttrs);
				},
				onChange: (v) => rows(v),
				get menuLimit() {
					return menuLimit();
				}
			});
		};

		const outputCell = ($$anchor) => {
			PivotTable($$anchor, $.spread_props(
				{
					get renderer() {
						return $.get(renderer);
					}
				},
				() => restProps,
				{
					get cols() {
						return cols();
					},

					get rows() {
						return rows();
					},

					get vals() {
						return vals();
					},

					get derivedAttributes() {
						return derivedAttributes();
					},

					get aggregator() {
						return $.get(aggregator);
					},

					get data() {
						return $$props.data;
					},

					get sorters() {
						return sorters();
					},

					get compactRows() {
						return compactRows();
					},

					get valueFilter() {
						return valueFilter;
					},

					get aggregatorName() {
						return aggregatorName();
					},

					get aggregators() {
						return aggregators();
					}
				}
			));
		};

		MainTable($$anchor, {
			get horizUnused() {
				return $.get(horizUnused);
			},
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

	$.pop();
}