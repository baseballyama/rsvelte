import * as $ from 'svelte/internal/server';
import "./grouping.css";
import PivotData from "./PivotData";
import "./pivottable.css";

export default function TableRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			tableColorScaleGenerator = redColorScaleGenerator,
			tableOptions = {},
			compactRows = true,
			opts = {},
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let pivotData = new PivotData(restProps);

		// When this is $derived we experience issues
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
		let grandTotalAggregator = $.derived(() => pivotData.getAggregator([], []));
		let grouping = $.derived(() => pivotData.props.grouping);
		let folded = new Set();
		const isFolded = (keys) => has(folded, keys.map(flatKey));
		const fold = (keys) => folded = toggle(new Set(folded), keys.map(flatKey));
		let valueCellColors = (r, c, v) => "";
		let rowTotalColors = (v) => "";
		let colTotalColors = (v) => "";

		let $$d = $.derived(() => {
				let rowKeys = pivotData.getRowKeys(true);
				let colKeys = pivotData.getColKeys(true);

				if (grouping()) {
					for (const key of folded) {
						const keyEx = key + String.fromCharCode(0);

						colKeys = colKeys.filter((colKey) => !flatKey(colKey).startsWith(keyEx));
						rowKeys = rowKeys.filter((rowKey) => !flatKey(rowKey).startsWith(keyEx));
					}
				}

				return [rowKeys, colKeys];
			}),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			rowKeys = $.derived(() => $$derived_array()[0]),
			colKeys = $.derived(() => $$derived_array()[1]);

		const clickClass = (pred, closed) => pred ? " pvtClickable" + (closed ? " closed" : "") : "";

		let getClickHandler = $.derived(() => {
			if (tableOptions && tableOptions.clickCallback) {
				return (value, rowValues, colValues) => {
					const filters = {};

					for (const i in pivotData.props.cols || []) {
						const attr = pivotData.props.cols[i];

						if (colValues[i] !== null) {
							filters[attr] = colValues[i];
						}
					}

					for (const i in pivotData.props.rows || []) {
						const attr = pivotData.props.rows[i];

						if (rowValues[i] !== null) {
							filters[attr] = rowValues[i];
						}
					}

					return (e) => tableOptions.clickCallback?.(e, value, filters, pivotData);
				};
			}
		});

		$$renderer.push(`<table${$.attr_class($.clsx([
			"pvtTable",
			grouping() && (pivotData.props.rowGroupBefore ? "rowGroupBefore" : "rowGroupAfter"),
			grouping() && (pivotData.props.colGroupBefore ? "colGroupBefore" : "colGroupAfter")
		]))}><thead><!--[-->`);

		const each_array = $.ensure_array_like(pivotData.props.cols);

		for (let j = 0, $$length = each_array.length; j < $$length; j++) {
			let c = each_array[j];
			const clickable = grouping() && pivotData.props.cols.length > j + 1;
			const levelKeys = colKeys().filter((x) => x.length === j + 1);

			$$renderer.push(`<tr>`);

			if (j === 0 && pivotData.props.rows.length !== 0) {
				$$renderer.push(`<!--[0--><th${$.attr('colspan', pivotData.props.rows.length)}${$.attr('rowspan', pivotData.props.cols.length)}></th>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><th${$.attr_class("pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys)))}>${$.escape(c)}</th><!--[-->`);

			const each_array_1 = $.ensure_array_like(colKeys());

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let colKey = each_array_1[i];
				const xx = spanSize(colKeys(), i, j);

				if (xx !== -1) {
					$$renderer.push(`<!--[0--><th${$.attr_class("pvtColLabel" + clickClass(clickable && !!colKey[j], isFolded([colKey.slice(0, j + 1)])))}${$.attr('colspan', xx)}${$.attr('rowspan', j === pivotData.props.cols.length - 1 && pivotData.props.rows.length !== 0 ? 2 : 1)}>${$.escape(colKey[j] ?? "")}</th>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);

			if (j === 0) {
				$$renderer.push(`<!--[0--><th class="pvtTotalLabel"${$.attr('rowspan', pivotData.props.cols.length + (pivotData.props.rows.length === 0 ? 0 : 1))}>Totals</th>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></tr>`);
		}

		$$renderer.push(`<!--]-->`);

		if (pivotData.props.rows.length !== 0) {
			$$renderer.push(`<!--[0--><tr><!--[-->`);

			const each_array_2 = $.ensure_array_like(pivotData.props.rows);

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let r = each_array_2[i];
				const clickable = grouping() && pivotData.props.rows.length > i + 1;
				const levelKeys = rowKeys().filter((x) => x.length === i + 1);

				$$renderer.push(`<th${$.attr_class("pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys)))}>${$.escape(r)}</th>`);
			}

			$$renderer.push(`<!--]--><th class="pvtTotalLabel">${$.escape(pivotData.props.cols.length === 0 ? "Totals" : "")}</th></tr>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></thead><tbody><!--[-->`);

		const each_array_3 = $.ensure_array_like(rowKeys());

		for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
			let rowKey = each_array_3[i];
			const totalAggregator = pivotData.getAggregator(rowKey, []);
			const rowGap = pivotData.props.rows.length - rowKey.length;
			const useCompactRows = grouping() && compactRows;

			$$renderer.push(`<tr${$.attr_class($.clsx(rowGap ? "pvtLevel" + rowGap : "pvtData"))}><!--[-->`);

			const each_array_4 = $.ensure_array_like(rowKey);

			for (let j = 0, $$length = each_array_4.length; j < $$length; j++) {
				let txt = each_array_4[j];
				const clickable = grouping() && pivotData.props.rows.length > j + 1;
				const specialCase = grouping() && !pivotData.props.rowGroupBefore;
				const xx = useCompactRows ? 1 : spanSize(rowKeys(), i, j, specialCase);

				if (!(useCompactRows && j < rowKey.length - 1 || xx === -1)) {
					$$renderer.push(`<!--[0--><th${$.attr_class("pvtRowLabel" + clickClass(clickable && !!rowKey[j], isFolded([rowKey.slice(0, j + 1)])))}${$.attr('rowspan', xx)}${$.attr('colspan', useCompactRows
						? pivotData.props.rows.length + 1
						: j === pivotData.props.rows.length - 1 && pivotData.props.cols.length !== 0 ? 2 : 1)}${$.attr_style('', {
						'padding-left': useCompactRows
							? `calc(var(--pvt-row-padding, 5px) + ${j} * var(--pvt-row-indent, 20px))`
							: null
					})}>${$.escape(txt)}</th>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);

			if (!useCompactRows && rowGap) {
				$$renderer.push(`<!--[0--><th class="pvtRowLabel"${$.attr('colspan', rowGap + 1)}>${$.escape("Total (" + rowKey[rowKey.length - 1] + ")")}</th>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--><!--[-->`);

			const each_array_5 = $.ensure_array_like(colKeys());

			for (let j = 0, $$length = each_array_5.length; j < $$length; j++) {
				let colKey = each_array_5[j];
				const aggregator = pivotData.getAggregator(rowKey, colKey);
				const colGap = pivotData.props.cols.length - colKey.length;

				$$renderer.push(`<td${$.attr_class("pvtVal" + (colGap ? " pvtLevel" + colGap : ""))}${$.attr_style(colGap || rowGap
					? ""
					: valueCellColors(rowKey, colKey, aggregator.value()))}>${$.escape(aggregator.format(aggregator.value()))}</td>`);
			}

			$$renderer.push(`<!--]--><td class="pvtTotal"${$.attr_style(colTotalColors(totalAggregator.value()))}>${$.escape(totalAggregator.format(totalAggregator.value()))}</td></tr>`);
		}

		$$renderer.push(`<!--]--><tr><th class="pvtTotalLabel"${$.attr('colspan', pivotData.props.rows.length + (pivotData.props.cols.length === 0 ? 0 : 1))}>Totals</th><!--[-->`);

		const each_array_6 = $.ensure_array_like(colKeys());

		for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
			let colKey = each_array_6[i];
			const totalAggregator = pivotData.getAggregator([], colKey);
			const colGap = pivotData.props.cols.length - colKey.length;

			$$renderer.push(`<td${$.attr_class("pvtTotal" + (colGap ? " pvtLevel" + colGap : ""))}${$.attr_style(rowTotalColors(totalAggregator.value()))}>${$.escape(totalAggregator.format(totalAggregator.value()))}</td>`);
		}

		$$renderer.push(`<!--]--><td class="pvtGrandTotal">${$.escape(grandTotalAggregator().format(grandTotalAggregator().value()))}</td></tr></tbody></table>`);
	});
}