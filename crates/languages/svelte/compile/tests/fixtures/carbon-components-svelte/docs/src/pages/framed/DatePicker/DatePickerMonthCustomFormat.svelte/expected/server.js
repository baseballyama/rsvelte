import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerMonthCustomFormat($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'month',
		dateFormat: 'Y-m',
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Billing month', placeholder: 'yyyy-mm' });
		},
		$$slots: { default: true }
	});
}