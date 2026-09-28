import * as $ from 'svelte/internal/server';
import { Checkbox } from "@svar-ui/svelte-core";

export default function SelectionCheckboxBind($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { row, api } = $$props;
		const selectedRows = api.getReactiveState().selectedRows;

		function onChange(ev) {
			const { value } = ev;

			api.exec("select-row", { id: row.id, mode: value, toggle: true });
		}

		$$renderer.push(`<div data-action="ignore-click">`);

		Checkbox($$renderer, {
			onchange: onChange,
			value: $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows).indexOf(row.id) !== -1
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}