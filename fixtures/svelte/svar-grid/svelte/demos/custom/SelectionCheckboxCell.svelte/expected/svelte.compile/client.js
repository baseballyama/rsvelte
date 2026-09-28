import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "@svar-ui/svelte-core";

var root = $.from_html(`<div data-action="ignore-click"><!></div>`);

export default function SelectionCheckboxCell($$anchor, $$props) {
	$.push($$props, true);

	function onChange(ev) {
		const { value } = ev;

		$$props.api.exec("select-row", { id: $$props.row.id, mode: value, toggle: true });
	}

	var div = root();
	var node = $.child(div);

	Checkbox(node, { onchange: onChange });
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}