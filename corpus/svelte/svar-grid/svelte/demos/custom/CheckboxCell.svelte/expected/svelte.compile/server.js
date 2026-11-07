import * as $ from 'svelte/internal/server';
import { Checkbox } from "@svar-ui/svelte-core";

export default function CheckboxCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column, onaction, api } = $$props;

		function onChange(ev) {
			const { value } = ev;

			//execute update action
			api.exec("update-cell", { id: row.id, column: column.id, value });

			//trigger custom event
			onaction && onaction({
				action: "custom-check",
				data: { value, column: column.id, row: row.id }
			});
		}

		Checkbox($$renderer, { value: row[column.id], onchange: onChange });
	});
}