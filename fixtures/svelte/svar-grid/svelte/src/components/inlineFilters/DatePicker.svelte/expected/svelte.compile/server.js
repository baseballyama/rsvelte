import * as $ from 'svelte/internal/server';
import { DatePicker } from "@svar-ui/svelte-core";

export default function DatePicker_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { filter, column, action, filterValue } = $$props;

		function filterRows({ value }) {
			action({ value, key: column.id });
		}

		$$renderer.push(`<div style="width:100%;">`);

		DatePicker($$renderer, $.spread_props([
			{ placeholder: "", clear: true },
			filter.config ?? {},
			{ value: filterValue, onchange: filterRows }
		]));

		$$renderer.push(`<!----></div>`);
	});
}