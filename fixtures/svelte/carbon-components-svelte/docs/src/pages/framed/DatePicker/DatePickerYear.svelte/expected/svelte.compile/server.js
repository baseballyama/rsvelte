import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerYear($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'year',
		dateFormat: 'Y',
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Fiscal year', placeholder: 'yyyy' });
		},
		$$slots: { default: true }
	});
}