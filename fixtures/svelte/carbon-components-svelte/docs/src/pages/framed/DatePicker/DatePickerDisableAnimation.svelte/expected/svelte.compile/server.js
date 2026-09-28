import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerDisableAnimation($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'single',
		flatpickrProps: { animate: false },
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Date of birth', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}