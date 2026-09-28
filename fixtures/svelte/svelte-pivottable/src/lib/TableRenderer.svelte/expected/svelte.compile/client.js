import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "./grouping.css";
import PivotData from "./PivotData";
import "./pivottable.css";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'tableColorScaleGenerator',
	'tableOptions',
	'compactRows',
	'opts'
]);

var root = $.from_html(`<th></th>`);
var root_1 = $.from_html(`<th> </th>`);
var root_2 = $.from_html(`<th class="pvtTotalLabel">Totals</th>`);
var root_3 = $.from_html(`<tr><!><th> </th><!><!></tr>`);
var root_4 = $.from_html(`<tr><!><th class="pvtTotalLabel"> </th></tr>`);
var root_5 = $.from_html(`<th class="pvtRowLabel"> </th>`);
var root_6 = $.from_html(`<td> </td>`);
var root_7 = $.from_html(`<tr><!><!><!><td class="pvtTotal"> </td></tr>`);
var root_8 = $.from_html(`<table><thead><!><!></thead><tbody><!><tr><th class="pvtTotalLabel">Totals</th><!><td class="pvtGrandTotal"> </td></tr></tbody></table>`);

export default function TableRenderer($$anchor, $$props) {
	$.push($$props, true);

	let tableColorScaleGenerator = $.prop($$props, 'tableColorScaleGenerator', 3, redColorScaleGenerator),
		tableOptions = $.prop($$props, 'tableOptions', 19, () => ({})),
		compactRows = $.prop($$props, 'compactRows', 3, true),
		opts = $.prop($$props, 'opts', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	let pivotData = $.state(new PivotData(restProps));

	$.user_effect(() => {
		// When this is $derived we experience issues
		$.set(pivotData, new PivotData(restProps));
	});

	// helper function for setting row/col-span in pivotTableRenderer
	const spanSize = function (arr, i, j, no_loop = false) {
		let x;

		if (i !== 0) {
			let asc, end;
			let noDraw = true;

			for ((x = 0, end = j, asc = end >= 0); asc ? x <= end : x >= end; asc ? x++ : x--) {
				if (arr[i - 1][x] !== arr[i][x]) {
					noDraw = false;
				}
			}

			if (noDraw) {
				return -1;
			}
		}

		let len = 0;

		while (i + len < arr.length) {
			let asc1, end1;
			let stop = false;

			for ((x = no_loop ? j : 0, end1 = j, asc1 = end1 >= 0); asc1 ? x <= end1 : x >= end1; asc1 ? x++ : x--) {
				if (arr[i][x] !== arr[i + len][x]) {
					stop = true;
				}
			}

			if (stop) {
				break;
			}

			len++;
		}

		return len;
	};

	function redColorScaleGenerator(values) {
		const min = Math.min(...values.map(Number).filter((x) => x));
		const max = Math.max(...values.map(Number).filter((x) => x));

		return (x) => {
			// eslint-disable-next-line no-magic-numbers
			const nonRed = 255 - Math.round(255 * (Number(x) - min) / (max - min));

			return `background-color: rgb(255,${nonRed},${nonRed})`;
		};
	}

	const flatKey = (arr) => arr.join(String.fromCharCode(0));
	const has = (set, arr) => arr.every(set.has, set);
	const add = (set, arr) => (arr.forEach(set.add, set), set);
	const remove = (set, arr) => (arr.forEach(set.delete, set), set);
	const toggle = (set, arr) => (has(set, arr) ? remove : add)(set, arr);
	let grandTotalAggregator = $.derived(() => $.get(pivotData).getAggregator([], []));
	let grouping = $.derived(() => $.get(pivotData).props.grouping);
	let folded = $.state(new Set());
	const isFolded = (keys) => has($.get(folded), keys.map(flatKey));
	const fold = (keys) => $.set(folded, toggle(new Set($.get(folded)), keys.map(flatKey)));
	let valueCellColors = $.state((r, c, v) => "");
	let rowTotalColors = $.state((v) => "");
	let colTotalColors = $.state((v) => "");

	let $$d = $.derived(() => {
			let rowKeys = $.get(pivotData).getRowKeys(true);
			let colKeys = $.get(pivotData).getColKeys(true);

			if ($.get(grouping)) {
				for (const key of $.get(folded)) {
					const keyEx = key + String.fromCharCode(0);

					colKeys = colKeys.filter((colKey) => !flatKey(colKey).startsWith(keyEx));
					rowKeys = rowKeys.filter((rowKey) => !flatKey(rowKey).startsWith(keyEx));
				}
			}

			return [rowKeys, colKeys];
		}),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		rowKeys = $.derived(() => $.get($$array)[0]),
		colKeys = $.derived(() => $.get($$array)[1]);

	$.user_effect(() => {
		if (opts().heatmapMode) {
			const dataRowKeys = $.get(pivotData).getRowKeys(false);
			const dataColKeys = $.get(pivotData).getColKeys(false);
			const colorScaleGenerator = tableColorScaleGenerator();
			const rowTotalValues = dataColKeys.map((x) => $.get(pivotData).getAggregator([], x).value());

			$.set(rowTotalColors, colorScaleGenerator(rowTotalValues), true);

			const colTotalValues = dataRowKeys.map((x) => $.get(pivotData).getAggregator(x, []).value());

			$.set(colTotalColors, colorScaleGenerator(colTotalValues), true);

			if (opts().heatmapMode === "full") {
				const allValues = [];

				dataRowKeys.forEach((r) => dataColKeys.forEach((c) => allValues.push($.get(pivotData).getAggregator(r, c).value())));

				const colorScale = colorScaleGenerator(allValues);

				$.set(valueCellColors, (r, c, v) => colorScale(v));
			} else if (opts().heatmapMode === "row") {
				const rowColorScales = {};

				dataRowKeys.forEach((r) => {
					const rowValues = dataColKeys.map((x) => $.get(pivotData).getAggregator(r, x).value());

					rowColorScales[flatKey(r)] = colorScaleGenerator(rowValues);
				});

				$.set(valueCellColors, (r, c, v) => rowColorScales[flatKey(r)](v));
			} else if (opts().heatmapMode === "col") {
				const colColorScales = {};

				dataColKeys.forEach((c) => {
					const colValues = dataRowKeys.map((x) => $.get(pivotData).getAggregator(x, c).value());

					colColorScales[flatKey(c)] = colorScaleGenerator(colValues);
				});

				$.set(valueCellColors, (r, c, v) => colColorScales[flatKey(c)](v));
			}
		}
	});

	const clickClass = (pred, closed) => pred ? " pvtClickable" + (closed ? " closed" : "") : "";

	let getClickHandler = $.derived(() => {
		if (tableOptions() && tableOptions().clickCallback) {
			return (value, rowValues, colValues) => {
				const filters = {};

				for (const i in $.get(pivotData).props.cols || []) {
					const attr = $.get(pivotData).props.cols[i];

					if (colValues[i] !== null) {
						filters[attr] = colValues[i];
					}
				}

				for (const i in $.get(pivotData).props.rows || []) {
					const attr = $.get(pivotData).props.rows[i];

					if (rowValues[i] !== null) {
						filters[attr] = rowValues[i];
					}
				}

				return (e) => tableOptions().clickCallback?.(e, value, filters, $.get(pivotData));
			};
		}
	});

	var table = root_8();
	var thead = $.child(table);
	var node = $.child(thead);

	$.each(node, 19, () => $.get(pivotData).props.cols, (c, j) => `col-Attr${j}`, ($$anchor, c, j) => {
		const clickable = $.derived(() => $.get(grouping) && $.get(pivotData).props.cols.length > $.get(j) + 1);
		const levelKeys = $.derived(() => $.get(colKeys).filter((x) => x.length === $.get(j) + 1));
		var tr = root_3();
		var node_1 = $.child(tr);

		{
			var consequent = ($$anchor) => {
				var th = root();

				$.template_effect(() => {
					$.set_attribute(th, 'colspan', $.get(pivotData).props.rows.length);
					$.set_attribute(th, 'rowspan', $.get(pivotData).props.cols.length);
				});

				$.append($$anchor, th);
			};

			$.if(node_1, ($$render) => {
				if ($.get(j) === 0 && $.get(pivotData).props.rows.length !== 0) $$render(consequent);
			});
		}

		var th_1 = $.sibling(node_1);
		var text = $.only_child(th_1, true);
		var node_2 = $.sibling(th_1);

		$.each(node_2, 19, () => $.get(colKeys), (colKey, i) => `colKey${i}`, ($$anchor, colKey, i) => {
			const xx = $.derived(() => spanSize($.get(colKeys), $.get(i), $.get(j)));
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			{
				var consequent_1 = ($$anchor) => {
					var th_2 = root_1();
					var text_1 = $.only_child(th_2, true);

					$.template_effect(
						($0) => {
							$.set_class(th_2, 1, $0);
							$.set_attribute(th_2, 'colspan', $.get(xx));
							$.set_attribute(th_2, 'rowspan', $.get(j) === $.get(pivotData).props.cols.length - 1 && $.get(pivotData).props.rows.length !== 0 ? 2 : 1);
							$.set_text(text_1, $.get(colKey)[$.get(j)] ?? "");
						},
						[
							() => "pvtColLabel" + clickClass($.get(clickable) && !!$.get(colKey)[$.get(j)], isFolded([$.get(colKey).slice(0, $.get(j) + 1)]))
						]
					);

					$.delegated('click', th_2, function (...$$args) {
						($.get(clickable) && $.get(colKey)[$.get(j)]
							? (_) => fold([$.get(colKey).slice(0, $.get(j) + 1)])
							: null)?.apply(this, $$args);
					});

					$.append($$anchor, th_2);
				};

				$.if(node_3, ($$render) => {
					if ($.get(xx) !== -1) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment);
		});

		var node_4 = $.sibling(node_2);

		{
			var consequent_2 = ($$anchor) => {
				var th_3 = root_2();

				$.template_effect(() => $.set_attribute(th_3, 'rowspan', $.get(pivotData).props.cols.length + ($.get(pivotData).props.rows.length === 0 ? 0 : 1)));
				$.append($$anchor, th_3);
			};

			$.if(node_4, ($$render) => {
				if ($.get(j) === 0) $$render(consequent_2);
			});
		}

		$.reset(tr);

		$.template_effect(
			($0) => {
				$.set_class(th_1, 1, $0);
				$.set_text(text, $.get(c));
			},
			[
				() => "pvtAxisLabel" + clickClass($.get(clickable), isFolded($.get(levelKeys)))
			]
		);

		$.delegated('click', th_1, function (...$$args) {
			($.get(clickable) ? (_) => fold($.get(levelKeys)) : null)?.apply(this, $$args);
		});

		$.append($$anchor, tr);
	});

	var node_5 = $.sibling(node);

	{
		var consequent_3 = ($$anchor) => {
			var tr_1 = root_4();
			var node_6 = $.child(tr_1);

			$.each(node_6, 19, () => $.get(pivotData).props.rows, (r, i) => `row-Attr${i}`, ($$anchor, r, i) => {
				const clickable = $.derived(() => $.get(grouping) && $.get(pivotData).props.rows.length > $.get(i) + 1);
				const levelKeys = $.derived(() => $.get(rowKeys).filter((x) => x.length === $.get(i) + 1));
				var th_4 = root_1();
				var text_2 = $.only_child(th_4, true);

				$.template_effect(
					($0) => {
						$.set_class(th_4, 1, $0);
						$.set_text(text_2, $.get(r));
					},
					[
						() => "pvtAxisLabel" + clickClass($.get(clickable), isFolded($.get(levelKeys)))
					]
				);

				$.delegated('click', th_4, function (...$$args) {
					($.get(clickable) ? (_) => fold($.get(levelKeys)) : null)?.apply(this, $$args);
				});

				$.append($$anchor, th_4);
			});

			var th_5 = $.sibling(node_6);
			var text_3 = $.only_child(th_5, true);

			$.reset(tr_1);
			$.template_effect(() => $.set_text(text_3, $.get(pivotData).props.cols.length === 0 ? "Totals" : ""));
			$.append($$anchor, tr_1);
		};

		$.if(node_5, ($$render) => {
			if ($.get(pivotData).props.rows.length !== 0) $$render(consequent_3);
		});
	}

	$.reset(thead);

	var tbody = $.sibling(thead);
	var node_7 = $.child(tbody);

	$.each(node_7, 19, () => $.get(rowKeys), (rowKey, i) => `rowKeyRow${i}`, ($$anchor, rowKey, i) => {
		const totalAggregator = $.derived(() => $.get(pivotData).getAggregator($.get(rowKey), []));
		const rowGap = $.derived(() => $.get(pivotData).props.rows.length - $.get(rowKey).length);
		const useCompactRows = $.derived(() => $.get(grouping) && compactRows());
		var tr_2 = root_7();
		var node_8 = $.child(tr_2);

		$.each(node_8, 19, () => $.get(rowKey), (txt, j) => `rowKeyLabel${$.get(i)}-${j}`, ($$anchor, txt, j) => {
			const clickable = $.derived(() => $.get(grouping) && $.get(pivotData).props.rows.length > $.get(j) + 1);
			const specialCase = $.derived(() => $.get(grouping) && !$.get(pivotData).props.rowGroupBefore);

			const xx = $.derived(() => $.get(useCompactRows)
				? 1
				: spanSize($.get(rowKeys), $.get(i), $.get(j), $.get(specialCase)));

			var fragment_1 = $.comment();
			var node_9 = $.first_child(fragment_1);

			{
				var consequent_4 = ($$anchor) => {
					var th_6 = root_1();
					let styles;
					var text_4 = $.only_child(th_6, true);

					$.template_effect(
						($0) => {
							$.set_class(th_6, 1, $0);
							$.set_attribute(th_6, 'rowspan', $.get(xx));

							$.set_attribute(th_6, 'colspan', $.get(useCompactRows)
								? $.get(pivotData).props.rows.length + 1
								: $.get(j) === $.get(pivotData).props.rows.length - 1 && $.get(pivotData).props.cols.length !== 0 ? 2 : 1);

							styles = $.set_style(th_6, '', styles, {
								'padding-left': $.get(useCompactRows)
									? `calc(var(--pvt-row-padding, 5px) + ${$.get(j)} * var(--pvt-row-indent, 20px))`
									: null
							});

							$.set_text(text_4, $.get(txt));
						},
						[
							() => "pvtRowLabel" + clickClass($.get(clickable) && !!$.get(rowKey)[$.get(j)], isFolded([$.get(rowKey).slice(0, $.get(j) + 1)]))
						]
					);

					$.delegated('click', th_6, function (...$$args) {
						($.get(clickable) && $.get(rowKey)[$.get(j)]
							? (_) => fold([$.get(rowKey).slice(0, $.get(j) + 1)])
							: null)?.apply(this, $$args);
					});

					$.append($$anchor, th_6);
				};

				$.if(node_9, ($$render) => {
					if (!($.get(useCompactRows) && $.get(j) < $.get(rowKey).length - 1 || $.get(xx) === -1)) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_1);
		});

		var node_10 = $.sibling(node_8);

		{
			var consequent_5 = ($$anchor) => {
				var th_7 = root_5();
				var text_5 = $.only_child(th_7, true);

				$.template_effect(() => {
					$.set_attribute(th_7, 'colspan', $.get(rowGap) + 1);
					$.set_text(text_5, "Total (" + $.get(rowKey)[$.get(rowKey).length - 1] + ")");
				});

				$.append($$anchor, th_7);
			};

			$.if(node_10, ($$render) => {
				if (!$.get(useCompactRows) && $.get(rowGap)) $$render(consequent_5);
			});
		}

		var node_11 = $.sibling(node_10);

		$.each(node_11, 19, () => $.get(colKeys), (colKey, j) => `pvtVal${$.get(i)}-${j}`, ($$anchor, colKey) => {
			const aggregator = $.derived(() => $.get(pivotData).getAggregator($.get(rowKey), $.get(colKey)));
			const colGap = $.derived(() => $.get(pivotData).props.cols.length - $.get(colKey).length);
			var td = root_6();
			var event_handler = $.derived(() => $.get(getClickHandler) && $.get(getClickHandler)($.get(aggregator).value(), $.get(rowKey), $.get(colKey)));
			var text_6 = $.only_child(td, true);

			$.template_effect(
				($0, $1) => {
					$.set_class(td, 1, "pvtVal" + ($.get(colGap) ? " pvtLevel" + $.get(colGap) : ""));
					$.set_style(td, $0);
					$.set_text(text_6, $1);
				},
				[
					() => $.get(colGap) || $.get(rowGap)
						? ""
						: $.get(valueCellColors)($.get(rowKey), $.get(colKey), $.get(aggregator).value()),
					() => $.get(aggregator).format($.get(aggregator).value())
				]
			);

			$.delegated('click', td, function (...$$args) {
				$.get(event_handler)?.apply(this, $$args);
			});

			$.append($$anchor, td);
		});

		var td_1 = $.sibling(node_11);
		var event_handler_1 = $.derived(() => $.get(getClickHandler) && $.get(getClickHandler)($.get(totalAggregator).value(), $.get(rowKey), [null]));
		var text_7 = $.only_child(td_1, true);

		$.reset(tr_2);

		$.template_effect(
			($0, $1) => {
				$.set_class(tr_2, 1, $.clsx($.get(rowGap) ? "pvtLevel" + $.get(rowGap) : "pvtData"));
				$.set_style(td_1, $0);
				$.set_text(text_7, $1);
			},
			[
				() => $.get(colTotalColors)($.get(totalAggregator).value()),
				() => $.get(totalAggregator).format($.get(totalAggregator).value())
			]
		);

		$.delegated('click', td_1, function (...$$args) {
			$.get(event_handler_1)?.apply(this, $$args);
		});

		$.append($$anchor, tr_2);
	});

	var tr_3 = $.sibling(node_7);
	var th_8 = $.child(tr_3);
	var node_12 = $.sibling(th_8);

	$.each(node_12, 19, () => $.get(colKeys), (colKey, i) => `total${i}`, ($$anchor, colKey) => {
		const totalAggregator = $.derived(() => $.get(pivotData).getAggregator([], $.get(colKey)));
		const colGap = $.derived(() => $.get(pivotData).props.cols.length - $.get(colKey).length);
		var td_2 = root_6();
		var event_handler_2 = $.derived(() => $.get(getClickHandler) && $.get(getClickHandler)($.get(totalAggregator).value(), [null], $.get(colKey)));
		var text_8 = $.only_child(td_2, true);

		$.template_effect(
			($0, $1) => {
				$.set_class(td_2, 1, "pvtTotal" + ($.get(colGap) ? " pvtLevel" + $.get(colGap) : ""));
				$.set_style(td_2, $0);
				$.set_text(text_8, $1);
			},
			[
				() => $.get(rowTotalColors)($.get(totalAggregator).value()),
				() => $.get(totalAggregator).format($.get(totalAggregator).value())
			]
		);

		$.delegated('click', td_2, function (...$$args) {
			$.get(event_handler_2)?.apply(this, $$args);
		});

		$.append($$anchor, td_2);
	});

	var td_3 = $.sibling(node_12);
	var event_handler_3 = $.derived(() => $.get(getClickHandler) && $.get(getClickHandler)($.get(grandTotalAggregator).value(), [null], [null]));
	var text_9 = $.only_child(td_3, true);

	$.reset(tr_3);
	$.reset(tbody);
	$.reset(table);

	$.template_effect(
		($0) => {
			$.set_class(table, 1, $.clsx([
				"pvtTable",
				$.get(grouping) && ($.get(pivotData).props.rowGroupBefore ? "rowGroupBefore" : "rowGroupAfter"),
				$.get(grouping) && ($.get(pivotData).props.colGroupBefore ? "colGroupBefore" : "colGroupAfter")
			]));

			$.set_attribute(th_8, 'colspan', $.get(pivotData).props.rows.length + ($.get(pivotData).props.cols.length === 0 ? 0 : 1));
			$.set_text(text_9, $0);
		},
		[
			() => $.get(grandTotalAggregator).format($.get(grandTotalAggregator).value())
		]
	);

	$.delegated('click', td_3, function (...$$args) {
		$.get(event_handler_3)?.apply(this, $$args);
	});

	$.append($$anchor, table);
	$.pop();
}

$.delegate(['click']);