import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerFlatpickrProps($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'single',
		flatpickrProps: { showMonths: 2 },
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}