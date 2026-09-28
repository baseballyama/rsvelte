import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerSingle($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'single',
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}