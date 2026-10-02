import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerDisableAnimation($$anchor) {
	DatePicker($$anchor, {
		datePickerType: 'single',
		flatpickrProps: { animate: false },
		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Date of birth', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}