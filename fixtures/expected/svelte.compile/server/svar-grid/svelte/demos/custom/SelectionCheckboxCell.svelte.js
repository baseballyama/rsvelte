import * as $ from 'svelte/internal/server';
import { Checkbox } from "@svar-ui/svelte-core";

export default function SelectionCheckboxCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, api } = $$props;

		function onChange(ev) {
			const { value } = ev;

			api.exec("select-row", { id: row.id, mode: value, toggle: true });
		}

		$$renderer.push(`<div data-action="ignore-click">`);
		Checkbox($$renderer, { onchange: onChange });
		$$renderer.push(`<!----></div>`);
	});
}