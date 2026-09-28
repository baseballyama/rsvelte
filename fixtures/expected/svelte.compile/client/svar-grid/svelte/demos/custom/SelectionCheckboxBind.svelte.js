import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "@svar-ui/svelte-core";

var root = $.from_html(`<div data-action="ignore-click"><!></div>`);

export default function SelectionCheckboxBind($$anchor, $$props) {
	$.push($$props, true);

	const $selectedRows = () => $.store_get(selectedRows, '$selectedRows', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const selectedRows = $$props.api.getReactiveState().selectedRows;

	function onChange(ev) {
		const { value } = ev;

		$$props.api.exec("select-row", { id: $$props.row.id, mode: value, toggle: true });
	}

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $selectedRows().indexOf($$props.row.id) !== -1);

		Checkbox(node, {
			onchange: onChange,
			get value() {
				return $.get($0);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}