import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PivotData from "./PivotData";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<textarea></textarea>`);

export default function TSVExportRenderer($$anchor, $$props) {
	$.push($$props, true);

	let pivotData;
	let rowKeys;
	let colKeys;
	let headerRow;
	let value = $.state("");
	let options = $.rest_props($$props, rest_excludes);

	$.user_effect(() => {
		pivotData = new PivotData(options);
		rowKeys = pivotData.getRowKeys();
		colKeys = pivotData.getColKeys();

		if (rowKeys.length === 0) {
			rowKeys.push([]);
		}

		if (colKeys.length === 0) {
			colKeys.push([]);
		}

		headerRow = pivotData.props.rows.map((r) => r);

		if (colKeys.length === 1 && colKeys[0].length === 0) {
			headerRow.push($$props.aggregatorName);
		} else {
			colKeys.map((c) => headerRow.push(c.join("-")));
		}

		const result = rowKeys.map((r) => {
			const row = r.map((x) => x);

			colKeys.map((c) => {
				const v = pivotData.getAggregator(r, c).value();

				row.push(v ? v : "");
			});

			return row;
		});

		result.unshift(headerRow);
		$.set(value, result.map((r) => r.join("\t")).join("\n"), true);
	});

	// style={{ width: window.innerWidth / 2, height: window.innerHeight / 2 }}
	function resize(node) {
		node.style.width = node.parentElement?.clientWidth + "px";
		node.style.height = node.parentElement?.clientHeight + "px";
	}

	var textarea = root();

	$.remove_textarea_child(textarea);
	textarea.readOnly = true;
	$.action(textarea, ($$node) => resize?.($$node));
	$.template_effect(() => $.set_value(textarea, $.get(value)));
	$.append($$anchor, textarea);
	$.pop();
}