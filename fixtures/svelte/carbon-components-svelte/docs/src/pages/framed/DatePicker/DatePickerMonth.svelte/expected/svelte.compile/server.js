import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerMonth($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'month',
		dateFormat: 'F Y',
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Billing month', placeholder: 'Month Year' });
		},
		$$slots: { default: true }
	});
}