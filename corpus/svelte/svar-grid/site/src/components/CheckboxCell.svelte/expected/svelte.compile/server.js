import * as $ from 'svelte/internal/server';
import { Checkbox } from "@svar-ui/svelte-core";

export default function CheckboxCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { row, api } = $$props;
		const { selectedRows, data } = api.getReactiveState();
		let parentData = void 0;

		function onChange(ev) {
			const { value } = ev;
			const parent = row.$parent;

			api.exec("select-row", { id: row.id, mode: value, toggle: true });

			if (parent !== 0) {
				parentData = $.store_get($$store_subs ??= {}, '$data', data).find((el) => el.id === parent);
			}

			row.data?.forEach((d) => {
				api.exec("select-row", { id: d.id, mode: value, toggle: true });
			});
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