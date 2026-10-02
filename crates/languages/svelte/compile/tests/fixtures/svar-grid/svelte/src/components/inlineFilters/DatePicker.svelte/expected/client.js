import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="width:100%;"><!></div>`);

export default function DatePicker_1($$anchor, $$props) {
	$.push($$props, true);

	function filterRows({ value }) {
		$$props.action({ value, key: $$props.column.id });
	}

	var div = root();
	var node = $.child(div);

	DatePicker(node, $.spread_props({ placeholder: "", clear: true }, () => $$props.filter.config ?? {}, {
		get value() {
			return $$props.filterValue;
		},
		onchange: filterRows
	}));

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}