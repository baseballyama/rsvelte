import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerCloseOnSelect($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'single',
		flatpickrProps: { closeOnSelect: false },
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}