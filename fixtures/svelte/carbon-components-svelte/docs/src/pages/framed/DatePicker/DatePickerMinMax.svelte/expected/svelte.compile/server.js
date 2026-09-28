import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerMinMax($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const start = new Date(2025, 0, 1);
		const end = new Date(2025, 11, 31);

		DatePicker($$renderer, {
			datePickerType: 'single',
			minDate: start,
			maxDate: end,
			children: ($$renderer) => {
				DatePickerInput($$renderer, { labelText: 'Date (2025 only)', placeholder: 'mm/dd/yyyy' });
			},
			$$slots: { default: true }
		});
	});
}