import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "@svar-ui/svelte-core";

var root = $.from_html(`<div data-action="ignore-click"><!></div>`);

export default function CheckboxCell($$anchor, $$props) {
	$.push($$props, true);

	const $selectedRows = () => $.store_get(selectedRows, '$selectedRows', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { selectedRows, data } = $$props.api.getReactiveState();
	let parentData = $.state(void 0);

	$.user_effect(() => {
		if ($.get(parentData) && $selectedRows().length) {
			const everyChildSelected = $.get(parentData).data.every((d) => $selectedRows().indexOf(d.id) !== -1);

			$$props.api.exec("select-row", {
				id: $.get(parentData).id,
				mode: everyChildSelected,
				toggle: true
			});

			$.set(parentData, null);
		}
	});

	function onChange(ev) {
		const { value } = ev;
		const parent = $$props.row.$parent;

		$$props.api.exec("select-row", { id: $$props.row.id, mode: value, toggle: true });

		if (parent !== 0) {
			$.set(parentData, $data().find((el) => el.id === parent), true);
		}

		$$props.row.data?.forEach((d) => {
			$$props.api.exec("select-row", { id: d.id, mode: value, toggle: true });
		});
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