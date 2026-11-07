import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerAllowInput($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'single',
		flatpickrProps: { allowInput: false },
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Ship date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}