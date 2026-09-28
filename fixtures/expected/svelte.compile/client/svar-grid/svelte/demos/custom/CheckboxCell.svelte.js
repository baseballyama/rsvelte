import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "@svar-ui/svelte-core";

export default function CheckboxCell($$anchor, $$props) {
	$.push($$props, true);

	function onChange(ev) {
		const { value } = ev;

		//execute update action
		$$props.api.exec("update-cell", { id: $$props.row.id, column: $$props.column.id, value });

		//trigger custom event
		$$props.onaction && $$props.onaction({
			action: "custom-check",
			data: { value, column: $$props.column.id, row: $$props.row.id }
		});
	}

	Checkbox($$anchor, {
		get value() {
			return $$props.row[$$props.column.id];
		},
		onchange: onChange
	});

	$.pop();
}